import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  runtimeCompatibilityFromManifest,
} from '@tiny/manifest'
import { ComponentTree } from './component-tree'
import { cloneJsonSafe } from '../data'
import { PAGE_CONTROL, RUNTIME_CONTROL } from '../protocol-controls'
import { MiniProgramPageRegistry } from './page-registry'
import type { MiniProgramPageInstance } from './page-instance'
import { installMiniProgramGlobals } from './api-globals'
import { ServiceRenderBridge } from './render'
import { ServicePageStack } from './page-stack'
import { createServiceRouter } from './router'
import { ServiceTabBar } from './tab-bar'
import { createDefaultWxsCompiler, createPageScopedWxsRuntime } from '@tiny/wxs-runtime'
import { findPageArtifact, normalizeRoutePath, resolveRoutePath } from './route'
import { shouldPreloadRule } from './preload'
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
    isComponentPage: (path) => registry.isComponentPage(path),
    behaviorScheme: compatibility.behaviorScheme,
    loadTemplates: options.loadTemplates,
    ...(options.loadStyle ? { loadStyle: options.loadStyle } : {}),
    ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
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
    componentTree,
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

  // Subpackage chunks register pages/components by their compiler-injected path.
  // Hosts opt into lazy loading by passing `loadSubPackage`; the runtime only
  // needs to know which package owns a page and to refresh render schemas once.
  const loadedSubPackages = new Set<string>()
  const pendingSubPackages = new Map<string, Promise<void>>()
  const subPackageByPage = new Map<string, string>()
  for (const pkg of options.manifest.subPackages ?? []) {
    for (const page of pkg.pages) subPackageByPage.set(page, pkg.root)
  }
  const ensureSubPackageRoot = (root: string): Promise<void> => {
    if (loadedSubPackages.has(root)) return Promise.resolve()
    const pending = pendingSubPackages.get(root)
    if (pending) return pending
    const pkg = options.manifest.subPackages?.find((item) => item.root === root)
    if (!pkg?.service) {
      loadedSubPackages.add(root)
      return Promise.resolve()
    }
    if (!options.loadSubPackage) {
      return Promise.reject(new Error(
        `subpackage "${root}" has a service chunk but the host provides no loadSubPackage hook`,
      ))
    }
    const task = Promise.resolve(options.loadSubPackage(root)).then(() => {
      loadedSubPackages.add(root)
      render.refreshComponentDefinitions()
    }).finally(() => {
      pendingSubPackages.delete(root)
    })
    pendingSubPackages.set(root, task)
    return task
  }
  const ensureSubPackage = async (path: string | undefined): Promise<void> => {
    if (!path) return
    const root = subPackageByPage.get(path)
    if (!root) return
    await ensureSubPackageRoot(root)
  }
  /** Root of the independent package owning `path`, if any. */
  const independentRootFor = (path: string | undefined): string | undefined => {
    if (!path) return undefined
    const root = subPackageByPage.get(path)
    if (!root) return undefined
    const pkg = options.manifest.subPackages?.find((item) => item.root === root)
    return pkg?.independent === true ? root : undefined
  }
  const ensureRoutePackage = async (url?: string, index?: number): Promise<void> => {
    let path = ''
    if (typeof url === 'string' && url.length > 0) {
      const raw = url.split('?')[0] ?? ''
      path = raw.startsWith('/') ? normalizeRoutePath(raw) : resolveRoutePath(pages.currentPath, raw)
    } else if (typeof index === 'number' && Number.isInteger(index)) {
      path = tabBar.model?.items[index]?.pagePath ?? ''
    }
    const currentIndependent = independentRootFor(pages.currentPath)
    if (currentIndependent && independentRootFor(path) !== currentIndependent) {
      throw new Error(
        `independent package "${currentIndependent}" cannot navigate to "${path}"`,
      )
    }
    await ensureSubPackage(path)
  }
  // `preloadRule` warms the packages listed for the page being entered. It is
  // best-effort and never delays the page; network selection stays host-side.
  const preloadRulesByPage = new Map(
    (options.manifest.preloadRules ?? []).map((rule) => [rule.page, rule]),
  )
  const preloadForPage = (path: string | undefined): void => {
    if (!path) return
    const rule = preloadRulesByPage.get(path)
    if (!rule || !shouldPreloadRule(rule, options.preloadNetwork)) return
    for (const root of rule.packages) {
      void ensureSubPackageRoot(root).catch(() => {})
    }
  }
  // Async components mount as placeholders first; the package chunk is fetched
  // afterwards and glass-easel replaces the placeholder once the definition is
  // registered.
  const loadAsyncComponentsForPage = (path: string | undefined): void => {
    if (!path) return
    const artifact = findPageArtifact(options.manifest, path)
    for (const root of artifact?.asyncSubPackages ?? []) {
      void ensureSubPackageRoot(root).catch(() => {})
    }
  }

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
      if (independentRootFor(pages.currentPath)) {
        // An independent package boots without the main package: no app.js,
        // no App lifecycle, and getApp() stays null (WeChat's documented
        // "App may not be registered" behaviour).
        await ensureSubPackage(pages.currentPath)
      } else {
        await ensureArtifacts()
        registry.launchApp(options.launchOptions)
        if (options.appVisible !== false) {
          registry.showApp(options.launchOptions)
        }
        await ensureSubPackage(pages.currentPath)
      }
      const componentSchemas = await render.start()
      pages.start()
      loadAsyncComponentsForPage(pages.activePage?.path)
      preloadForPage(pages.activePage?.path)
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
    await ensureRoutePackage(payload.url)
    const result = pages.navigateTo(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    loadAsyncComponentsForPage(resultPath)
    preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.redirectTo, async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('redirectTo requires a url')
    await ensureRoutePackage(payload.url)
    const result = pages.redirectTo(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    loadAsyncComponentsForPage(resultPath)
    preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.reLaunch, async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('reLaunch requires a url')
    await ensureRoutePackage(payload.url)
    const result = pages.reLaunch(payload.url)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    loadAsyncComponentsForPage(resultPath)
    preloadForPage(resultPath)
    return result
  })

  connection.onControl(PAGE_CONTROL.domain, PAGE_CONTROL.switchTab, async (message) => {
    const payload = message.payload as { url?: string; index?: number }
    await ensureRoutePackage(payload.url, payload.index)
    const result = pages.switchTab(payload)
    const resultPath = typeof result.path === 'string' ? result.path : undefined
    loadAsyncComponentsForPage(resultPath)
    preloadForPage(resultPath)
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
