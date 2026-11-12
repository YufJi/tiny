import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  runtimeCompatibilityFromManifest,
} from '@tiny/manifest'
import type { BridgeConnection } from '@tiny/bridge'
import type { RuntimeManifest } from '../shared/manifest'
import type { StyleLoader, TemplateRegistry } from '../shared/template'
import type { AssetUrlResolver, ProtocolRelativeUrlResolver } from '../shared/assets'
import { cloneJsonSafe } from '../shared/data'
import { PAGE_CONTROL, RUNTIME_CONTROL } from '../tree-protocol/controls'
import { MiniProgramPageRegistry } from './page/registry'
import type { MiniProgramPageInstance } from './page/instance'
import { installMiniProgramGlobals } from './api/globals'
import { ServiceRenderBridge } from './render-bridge/bridge'
import { ServicePageStack } from './page/stack'
import { createServiceRouter } from './page/router'
import { ServiceTabBar } from './app/tab-bar'
import { SubpackageLoader } from './app/subpackages'
import { createDefaultWxsCompiler, createPageScopedWxsRuntime } from '@tiny/wxs-runtime'
import { findPageArtifact } from './page/route'
import type { GlobalEventSink, MiniProgramApiHost, TabBarApi } from './api/types'

export type ServiceThreadOptions = {
  connection: BridgeConnection
  manifest: RuntimeManifest
  initialPath: string
  /** Already-composed `wx` table; the runtime installs it verbatim. */
  apiHost: MiniProgramApiHost
  loadArtifacts?: () => Promise<unknown>
  /**
   * Load one subpackage service chunk on demand. Hosts that pass it opt into
   * lazy subpackages; without it the runtime expects the main service entry to
   * contain every package (the pre-split behaviour).
   */
  loadSubPackage?: (root: string) => Promise<unknown>
  /**
   * Host network fact used by `preloadRule.network: "wifi"`. Omitted means the
   * host has no network information, so Wi-Fi-only rules are not preloaded.
   */
  preloadNetwork?: 'wifi' | 'other'
  /** Maximum pages in the runtime page stack. Defaults to 10. */
  maxPageStack?: number
  /** Templates for the service-side logic tree. */
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Test/host hook fired when the service logic tree is created. */
  onLogicTreeCreated?: (tree: unknown) => void
  /** Stylesheet text for logic-tree style scoping. */
  loadStyle?: StyleLoader
  /**
   * Host hook for compiler-normalized WXSS `url(...)` assets. The service maps
   * app-root paths to loadable URLs before sending CSS to the render thread, so
   * the render document's base URL never participates in resolution.
   */
  resolveAssetUrl?: AssetUrlResolver
  /** Host policy for protocol-relative stylesheet URLs. */
  resolveProtocolRelativeUrl?: ProtocolRelativeUrlResolver
  /**
   * Sink shared with the host-composed API table. Runtime-originated events
   * and host `event.global` frames reach the global `wx.onXXX` listeners.
   */
  events?: GlobalEventSink
  /** Initial host visibility; defaults to true. */
  appVisible?: boolean
  /** Host-owned launch options passed to App.onLaunch / initial onShow. */
  launchOptions?: unknown
  /** State persisted by the previous launch's page `onSaveExitState`. */
  initialExitState?: unknown
  /**
   * A page was destroyed. The host releases per-page resources here (canvas
   * nodes, …); the runtime does not own canvas semantics.
   */
  onPageRelease?: (pageId: string) => void
}

export type ServiceThreadRuntime = {
  connection: BridgeConnection
  registry: MiniProgramPageRegistry
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  activePage: MiniProgramPageInstance | null
  pageStack: MiniProgramPageInstance[]
  pageInstances: Map<string, MiniProgramPageInstance>
  /** Runtime tabBar actions, late-bound into the host-composed API context. */
  tabBar: TabBarApi
  /** Late-bound `wx.navigateTo` EventChannel hand-off. */
  setNextPageEventChannel(channel: unknown): () => void
  /** Report a rejected promise that escaped page/component code. */
  notifyUnhandledRejection(reason: unknown, promise?: unknown): void
}

/**
 * Assemble one service thread.
 *
 * This entry is deliberately only wiring: it builds the compatibility
 * registry, bridge connection, page stack and service-render bridge, installs
 * the mini-program globals and forwards host controls. Page/stack semantics
 * live in `page-stack.ts`; logic-tree and tree-protocol behavior lives in
 * `render/`.
 */
export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
  // The generated template bundle resolves WXS modules through the host
  // runtime. One instance per service thread keeps module state local to the
  // app while sharing the kernel implementation with the render thread.
  const wxsRuntime = createPageScopedWxsRuntime({ compile: createDefaultWxsCompiler() })
  ;(globalThis as unknown as Record<string, unknown>)[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = wxsRuntime

  const expectedPagePaths = options.manifest.pages.map((page) => page.path)
  const expectedComponentPaths = options.manifest.components.map((component) => component.path)
  const compatibility = runtimeCompatibilityFromManifest(options.manifest)
  const componentConfigurations = new Map<string, Record<string, unknown>>()
  for (const artifact of [
    ...options.manifest.components,
    ...options.manifest.pages,
  ]) {
    componentConfigurations.set(artifact.path, artifact.configuration?.effective ?? {})
  }
  const registry = new MiniProgramPageRegistry(
    expectedPagePaths,
    expectedComponentPaths,
    compatibility,
    componentConfigurations,
  )

  // The host entry owns the connection (and the API table built on top of it).
  const connection = options.connection
  const events = options.events
  registry.setEventSink(events)

  // Host-originated global events use one envelope so adding an event never
  // changes the bridge protocol: { name, payload }.
  connection.onEvent('event', 'global', (message) => {
    const payload = (message.payload ?? {}) as { name?: unknown; payload?: unknown }
    if (typeof payload.name !== 'string') return
    // App foreground/background is host-owned: never infer it from page
    // navigation. The host sends appShow/appHide as global events.
    if (payload.name === 'appShow') {
      registry.showApp(payload.payload)
    } else if (payload.name === 'appHide') {
      registry.hideApp()
    }
    // App hooks and wx.onXXX listeners are separate consumers: always fan out
    // the event, including appShow/appHide.
    events?.emit(payload.name, payload.payload)
  })

  let onTabBarChange: () => void = () => {}
  const tabBar = new ServiceTabBar(options.manifest, () => onTabBarChange())
  let resolvePage: (pageId: string) => MiniProgramPageInstance | undefined = () => undefined
  // `this.router` keeps a stable base path and then calls the installed `wx.*`
  // table; that table only exists after the host API factory runs (below), so
  // the router reads it lazily through this indirection.
  let apiTable: MiniProgramApiHost = {}
  const createRouter = (basePath: string) => createServiceRouter(() => apiTable, basePath)
  const render = new ServiceRenderBridge({
    connection,
    manifest: options.manifest,
    componentDefinitions: registry.normalizedComponents,
    pageOptions: registry.pages,
    isComponentPage: (path) => registry.isComponentPage(path),
    behaviorScheme: compatibility.behaviorScheme,
    loadTemplates: options.loadTemplates,
    ...(options.loadStyle ? { loadStyle: options.loadStyle } : {}),
    ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
    ...(options.resolveProtocolRelativeUrl
      ? { resolveProtocolRelativeUrl: options.resolveProtocolRelativeUrl }
      : {}),
    wxsRuntime,
    getPage: (pageId) => resolvePage(pageId),
    frameworkContext: {
      createRouter,
      pageMeta: (pageId) => {
        const page = resolvePage(pageId)
        if (!page) return undefined
        return {
          route: page.path,
          query: page.query,
          router: page.router,
          eventChannel: page.eventChannel,
        }
      },
    },
    ...(options.onLogicTreeCreated ? { onLogicTreeCreated: options.onLogicTreeCreated } : {}),
    onError: (message) => registry.reportError(message),
  })
  const pages = new ServicePageStack({
    manifest: options.manifest,
    initialPath: options.initialPath,
    registry,
    render,
    connection,
    tabBar,
    createRouter,
    ...(options.onPageRelease ? { onPageRelease: options.onPageRelease } : {}),
    ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
    ...(Object.prototype.hasOwnProperty.call(options, 'initialExitState')
      ? { initialExitState: options.initialExitState }
      : {}),
  })
  resolvePage = (pageId) => pages.pageInstances.get(pageId)
  onTabBarChange = () => pages.sendRuntimeState()

  const subpackages = new SubpackageLoader({
    manifest: options.manifest,
    ...(options.loadSubPackage ? { loadSubPackage: options.loadSubPackage } : {}),
    ...(options.preloadNetwork ? { preloadNetwork: options.preloadNetwork } : {}),
    refreshComponentDefinitions: () => render.refreshComponentDefinitions(),
    getCurrentPath: () => pages.currentPath,
    getTabBarPagePath: (index) => tabBar.model?.items[index]?.pagePath,
  })

  // The kernel does not own the mini-program API set: the host entry composes
  // the table (including host extensions) and the runtime installs it verbatim.
  // Names it omits fall through to the unsupported-API diagnostic.
  apiTable = installMiniProgramGlobals(
    registry,
    options.apiHost,
    (name) => connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
      message: `${compatibility.api.global}.${name} is not supported in the P0 runtime.`,
    }, pages.activePage?.pageId),
    () => pages.pageStack,
  )

  // Artifacts are evaluated lazily by bootstrap. Top-level app/component code
  // often reads getSystemInfoSync().SDKVersion or getStorageSync() during
  // evaluation; those calls reach the host directly (sync channel).
  let artifactsReady: Promise<unknown> | undefined
  const ensureArtifacts = (): Promise<unknown> => {
    if (!artifactsReady) {
      artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()
    }
    return artifactsReady
  }

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, async (message) => {
    try {
      const payload = message.payload as {
        manifest?: ServiceThreadOptions['manifest']
        initialPath?: string
        maxPageStack?: number
        initialExitState?: unknown
      }
      pages.setInitialPath(payload.initialPath ?? pages.currentPath)
      if (payload.maxPageStack !== undefined) {
        pages.setMaxPageStack(Number(payload.maxPageStack))
      }
      if (Object.prototype.hasOwnProperty.call(payload, 'initialExitState')) {
        pages.setInitialExitState(payload.initialExitState)
      }
      if (subpackages.independentRootFor(pages.currentPath)) {
        // An independent package boots without the main package: no app.js,
        // no App lifecycle, and getApp() stays null (WeChat's documented
        // "App may not be registered" behaviour).
        await subpackages.ensurePath(pages.currentPath)
      } else {
        await ensureArtifacts()
        registry.launchApp(options.launchOptions)
        if (options.appVisible !== false) {
          registry.showApp(options.launchOptions)
        }
        await subpackages.ensurePath(pages.currentPath)
      }
      const componentSchemas = await render.start()
      pages.start()
      subpackages.loadAsyncComponentsForPage(pages.activePage?.path)
      subpackages.preloadForPage(pages.activePage?.path)
      const currentPage = pages.pageStack.at(-1)!
      return {
        status: 'ready',
        registeredPages: [...registry.pages.keys()],
        currentPath: pages.currentPath,
        pageId: currentPage.pageId,
        initialData: cloneJsonSafe(currentPage.data),
        componentSchemas: cloneJsonSafe(componentSchemas),
        pageComponents: render.pageComponents(),
      }
    } catch (error) {
      const description = error instanceof Error ? error.message : String(error)
      registry.reportError(
        error instanceof Error && error.stack
          ? `${description}\n${error.stack}`
          : description,
      )
      if (!findPageArtifact(options.manifest, pages.currentPath)) {
        registry.reportPageNotFound({
          path: pages.currentPath,
          query: {},
          isEntryPage: true,
        })
      }
      connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.BOOTSTRAP_ERROR,
        message: description,
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.ready, async (message) => {
    try {
      return pages.ready((message.payload as { pageId?: string }).pageId)
    } catch (error) {
      const description = error instanceof Error ? error.message : String(error)
      registry.reportError(
        error instanceof Error && error.stack
          ? `${description}\n${error.stack}`
          : description,
      )
      connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.PAGE_READY_ERROR,
        message: description,
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.navigateTo, async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('navigateTo requires a url')
    await subpackages.ensureRoute(payload.url)
    const result = pages.navigateTo(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    subpackages.loadAsyncComponentsForPage(resultPath)
    subpackages.preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.redirectTo, async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('redirectTo requires a url')
    await subpackages.ensureRoute(payload.url)
    const result = pages.redirectTo(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    subpackages.loadAsyncComponentsForPage(resultPath)
    subpackages.preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.reLaunch, async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('reLaunch requires a url')
    await subpackages.ensureRoute(payload.url)
    const result = pages.reLaunch(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    subpackages.loadAsyncComponentsForPage(resultPath)
    subpackages.preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.switchTab, async (message) => {
    const payload = message.payload as { url?: string; index?: number }
    await subpackages.ensureRoute(payload.url, payload.index)
    const result = pages.switchTab(payload)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    subpackages.loadAsyncComponentsForPage(resultPath)
    subpackages.preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.navigateBack, async (message) => (
    pages.navigateBack((message.payload as { delta?: number }).delta)
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.hide, async (message) => (
    pages.hide((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.show, async (message) => (
    pages.show((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.pullDownRefresh, async (message) => (
    pages.pullDownRefresh((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.share, async (message) => pages.share(
    message.payload as {
      pageId?: string
      type?: 'appMessage' | 'timeline' | 'favorites'
      from?: 'button' | 'menu'
      target?: unknown
      webViewUrl?: string
    },
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.saveExitState, async (message) => (
    pages.saveExitStateOf((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.snapshotState, async () => (
    pages.snapshotState()
  ))

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.restoreState, async (message) => {
    const payload = message.payload as {
      pageId?: unknown
      data?: unknown
      savedExitState?: unknown
      exitState?: unknown
    }
    const pageId = typeof payload.pageId === 'string' ? payload.pageId : ''
    const data = payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
      ? payload.data as Record<string, unknown>
      : {}
    return pages.restoreState(pageId, data, payload.savedExitState, payload.exitState)
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.unload, async (message) => (
    pages.unload((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.resize, async (message) => {
    // The host owns the size; the runtime only forwards the report to the page.
    const payload = message.payload as { windowWidth?: number; windowHeight?: number }
    const windowWidth = Number(payload.windowWidth)
    const windowHeight = Number(payload.windowHeight)
    if (Number.isFinite(windowWidth) && Number.isFinite(windowHeight)) {
      pages.resize(windowWidth, windowHeight)
      events?.emit('windowResize', {
        size: { windowWidth, windowHeight },
      })
    }
    return { status: 'resized', windowWidth, windowHeight }
  })

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.themeChange, async (message) => {
    const theme = (message.payload as { theme?: string }).theme === 'dark' ? 'dark' : 'light'
    registry.reportThemeChange(theme)
    return { status: 'theme-changed', theme }
  })

  connection.onEvent('page', 'pullDownRefresh', (message) => {
    pages.pageEvent('pullDownRefresh', message.pageId)
  })

  connection.onEvent('page', 'scroll', (message) => {
    pages.pageEvent(
      'scroll',
      message.pageId,
      message.payload as { scrollTop?: number; scrollLeft?: number } | undefined,
    )
  })

  connection.onEvent('page', 'reachBottom', (message) => {
    pages.pageEvent('reachBottom', message.pageId)
  })

  return {
    connection,
    registry,
    manifest: options.manifest,
    initialPath: options.initialPath,
    get activePage() {
      return pages.activePage
    },
    get pageStack() {
      return pages.pageStack
    },
    pageInstances: pages.pageInstances,
    tabBar: tabBar.api,
    setNextPageEventChannel(channel: unknown) {
      return pages.setNextPageEventChannel(channel)
    },
    notifyUnhandledRejection(reason, promise) {
      registry.reportUnhandledRejection(reason, promise)
    },
  }
}
