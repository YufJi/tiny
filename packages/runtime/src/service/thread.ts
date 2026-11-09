import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  runtimeCompatibilityFromManifest,
} from '@tiny/manifest'
import { ComponentTree } from './component-tree'
import { cloneJsonSafe } from '../data'
import { RUNTIME_CONTROL } from '../protocol-controls'
import { MiniProgramPageRegistry } from './page-registry'
import type { MiniProgramPageInstance } from './page-instance'
import { installMiniProgramGlobals } from './api-globals'
import { ServiceRenderBridge } from './render'
import { ServicePageStack } from './page-stack'
import { createServiceRouter } from './router'
import { ServiceTabBar } from './tab-bar'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/wxs-runtime'
import { findPageArtifact } from './route'
import type {
  MiniProgramApiHost,
  ServiceThreadOptions,
  ServiceThreadRuntime,
} from './types'

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
  const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
  ;(globalThis as unknown as Record<string, unknown>)[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = wxsRuntime

  const expectedPagePaths = options.manifest.pages
    .filter((page) => page.bodyType !== 'component')
    .map((page) => page.path)
  const expectedComponentPaths = [
    ...options.manifest.pages
      .filter((page) => page.bodyType === 'component')
      .map((page) => page.path),
    ...options.manifest.components.map((component) => component.path),
  ]
  const compatibility = runtimeCompatibilityFromManifest(options.manifest)
  const componentConfigurations = new Map<string, Record<string, unknown>>()
  for (const artifact of [
    ...options.manifest.components,
    ...options.manifest.pages.filter((page) => page.bodyType === 'component'),
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
      registry.showApp()
    } else if (payload.name === 'appHide') {
      registry.hideApp()
    }
    // App hooks and wx.onXXX listeners are separate consumers: always fan out
    // the event, including appShow/appHide.
    events?.emit(payload.name, payload.payload)
  })

  const componentTree = new ComponentTree()
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
    behaviorScheme: compatibility.behaviorScheme,
    loadTemplates: options.loadTemplates,
    ...(options.loadStyle ? { loadStyle: options.loadStyle } : {}),
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
    componentTree,
    connection,
    tabBar,
    createRouter,
    ...(options.onPageRelease ? { onPageRelease: options.onPageRelease } : {}),
    ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
  })
  resolvePage = (pageId) => pages.pageInstances.get(pageId)
  onTabBarChange = () => pages.sendRuntimeState()

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
      }
      pages.setInitialPath(payload.initialPath ?? pages.currentPath)
      if (payload.maxPageStack !== undefined) {
        pages.setMaxPageStack(Number(payload.maxPageStack))
      }
      await ensureArtifacts()
      const componentSchemas = await render.start()
      pages.start()
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

  connection.onControl('page', 'ready', async (message) => {
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

  connection.onControl('page', 'navigateTo', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('navigateTo requires a url')
    return pages.navigateTo(payload.url)
  })

  connection.onControl('page', 'redirectTo', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('redirectTo requires a url')
    return pages.redirectTo(payload.url)
  })

  connection.onControl('page', 'reLaunch', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('reLaunch requires a url')
    return pages.reLaunch(payload.url)
  })

  connection.onControl('page', 'switchTab', async (message) => (
    pages.switchTab(message.payload as { url?: string; index?: number })
  ))

  connection.onControl('page', 'navigateBack', async (message) => (
    pages.navigateBack((message.payload as { delta?: number }).delta)
  ))

  connection.onControl('page', 'hide', async (message) => (
    pages.hide((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl('page', 'show', async (message) => (
    pages.show((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl('page', 'pullDownRefresh', async (message) => (
    pages.pullDownRefresh((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl('page', 'share', async (message) => pages.share(
    message.payload as {
      pageId?: string
      type?: 'appMessage' | 'timeline' | 'favorites'
      from?: 'button' | 'menu'
      target?: unknown
      webViewUrl?: string
    },
  ))

  connection.onControl('page', 'saveExitState', async (message) => (
    pages.saveExitStateOf((message.payload as { pageId?: string }).pageId)
  ))

  connection.onControl('page', 'unload', async (message) => (
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

  connection.onControl(RUNTIME_CONTROL.domain, 'themeChange', async (message) => {
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
    componentTree,
    tabBar: tabBar.api,
    setNextPageEventChannel(channel: unknown) {
      return pages.setNextPageEventChannel(channel)
    },
    notifyUnhandledRejection(reason, promise) {
      registry.reportUnhandledRejection(reason, promise)
    },
  }
}
