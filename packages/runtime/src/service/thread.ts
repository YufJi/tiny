import { BridgeConnection } from '@tiny/bridge'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  runtimeCompatibilityFromManifest,
} from '@tiny/manifest'
import { ComponentTree } from './component-tree'
import { cloneJsonSafe } from '../data'
import type { StorageSnapshot, SystemInfoSnapshot } from '../types'
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
  ServiceApiContext,
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

  let systemInfoSnapshot: SystemInfoSnapshot = {
    pixelRatio: 1,
    windowWidth: 0,
    windowHeight: 0,
  }
  const storageSnapshot: StorageSnapshot = {}
  const themeListeners = new Set<(value: unknown) => void>()
  const supportedApiNames = new Set<string>()

  const connection = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'service' },
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
    ...(options.canvas ? { canvas: options.canvas } : {}),
    ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
  })
  resolvePage = (pageId) => pages.pageInstances.get(pageId)
  onTabBarChange = () => pages.sendRuntimeState()

  const apiContext: ServiceApiContext = {
    connection: null as unknown as BridgeConnection,
    apiName: compatibility.api.global,
    apiNamespaces: [compatibility.api.global, ...compatibility.api.aliases],
    getSystemInfoSnapshot: () => systemInfoSnapshot,
    getStorageSnapshot: () => storageSnapshot,
    setStorageSnapshot: (key, value) => {
      storageSnapshot[key] = value
    },
    apiNames: supportedApiNames,
    getCurrentPagePath: () => pages.activePage?.path,
    getActivePage: () => pages.activePage,
    canvas: options.canvas,
    resolveAssetUrl: options.resolveAssetUrl,
    tabBar: tabBar.api,
    themeListeners,
    setNextPageEventChannel: (channel) => pages.setNextPageEventChannel(channel),
    get pageId() {
      return pages.activePage?.pageId
    },
  }
  apiContext.connection = connection
  // The kernel does not own the mini-program API set: the host injects a
  // factory and the runtime only installs what it returns. Names the factory
  // omits fall through to the unsupported-API diagnostic.
  const apiHost = options.apiHost(apiContext)
  for (const name of Object.keys(apiHost)) supportedApiNames.add(name)
  apiTable = installMiniProgramGlobals(
    registry,
    apiHost,
    (name) => connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
      message: `${compatibility.api.global}.${name} is not supported in the P0 runtime.`,
    }, pages.activePage?.pageId),
    () => pages.pageStack,
  )

  // Artifacts are evaluated lazily by bootstrap, after the host state
  // (systemInfo/storage) has been applied. Top-level app/component code often
  // reads getSystemInfoSync().SDKVersion or getStorageSync() during evaluation.
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
        systemInfo?: SystemInfoSnapshot
        storage?: StorageSnapshot
        maxPageStack?: number
      }
      pages.setInitialPath(payload.initialPath ?? pages.currentPath)
      if (payload.maxPageStack !== undefined) {
        pages.setMaxPageStack(Number(payload.maxPageStack))
      }
      // Apply host state before artifacts run: top-level component/app code
      // reads `wx.getSystemInfoSync().SDKVersion` and `getStorageSync`.
      if (payload.systemInfo) systemInfoSnapshot = cloneJsonSafe(payload.systemInfo)
      if (payload.storage) Object.assign(storageSnapshot, cloneJsonSafe(payload.storage))
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
    const payload = message.payload as { windowWidth?: number; windowHeight?: number }
    const windowWidth = Number(payload.windowWidth ?? systemInfoSnapshot.windowWidth)
    const windowHeight = Number(payload.windowHeight ?? systemInfoSnapshot.windowHeight)
    systemInfoSnapshot = {
      ...systemInfoSnapshot,
      windowWidth: Number.isFinite(windowWidth) ? windowWidth : systemInfoSnapshot.windowWidth,
      windowHeight: Number.isFinite(windowHeight) ? windowHeight : systemInfoSnapshot.windowHeight,
    }
    pages.resize(systemInfoSnapshot.windowWidth, systemInfoSnapshot.windowHeight)
    return { status: 'resized', ...systemInfoSnapshot }
  })

  connection.onControl(RUNTIME_CONTROL.domain, 'themeChange', async (message) => {
    const theme = (message.payload as { theme?: string }).theme === 'dark' ? 'dark' : 'light'
    registry.reportThemeChange(theme)
    for (const listener of themeListeners) {
      try {
        listener({ theme })
      } catch (error) {
        connection.sendDiagnostic('warn', {
          code: DIAGNOSTIC_CODES.THEME_LISTENER_ERROR,
          message: error instanceof Error ? error.message : String(error),
        }, pages.activePage?.pageId)
      }
    }
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
    notifyUnhandledRejection(reason, promise) {
      registry.reportUnhandledRejection(reason, promise)
    },
  }
}
