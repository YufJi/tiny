import { BridgeConnection } from '@tiny/bridge'
import { QUERY_CONTROL, RUNTIME_CONTROL, TREE_PROTOCOL } from '../tree'
import {
  DIAGNOSTIC_CODES,
  runtimeCompatibilityFromManifest,
  TINY_ENGINE_NAMING,
} from '@tiny/manifest'
import { buildComponentSchemas, ComponentTree } from '../component'
import { cloneJsonSafe } from '../data'
import type { ServiceThreadOptions } from '../types'
import type {
  MiniProgramComponentSchema,
  StorageSnapshot,
  SystemInfoSnapshot,
} from '../types'
import { createRuntimeStateDiagnostic } from '../diagnostics'
import type { RuntimePageState, RuntimeTabBarState } from '../diagnostics'
import { MiniProgramPageRegistry } from './page-registry'
import { MiniProgramPageInstance, type PageLifecycleName } from './page-instance'
import { createServiceApiHost, installMiniProgramGlobals } from './api-host'
import { installWxsEventHost } from './wxs-host'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/wxs-runtime'
import { LogicTreeAdapter, type ViewEventPayload, type ViewIntersectionEntry } from '../tree/logic'
import { findPageArtifact, normalizeRoutePath, requireActivePage, resolveComponentReference } from './route'
import type { ServiceApiContext, ServiceThreadRuntime, TabBarApi } from './types'

export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
  // The generated template bundle resolves WXS modules through the host
  // runtime. One instance per service thread keeps module state local to the
  // app while sharing the kernel implementation with the render thread.
  const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
  ;(globalThis as unknown as { __tinyWxsRuntime?: unknown }).__tinyWxsRuntime = wxsRuntime

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
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  let componentSchemas: MiniProgramComponentSchema[] = []
  let logicTree: LogicTreeAdapter | null = null
  let wxsModules: import('@tiny/wxs-runtime').WxsModuleTable | undefined
  const mountedTreePages = new Set<string>()
  const pendingTreePages = new Set<string>()
  let treeUpdateScheduled = false
  const pageStack: MiniProgramPageInstance[] = []
  const readyPages = new Set<string>()
  let activePage: MiniProgramPageInstance | null = null
  let appVisible = true
  let lifecycleSequence = 0
  let maxPageStack = 10
  let pageIdCounter = 0
  const tabBarModel = normalizeTabBar(options.manifest)
  const tabBarPagePaths = new Set((tabBarModel?.items ?? []).map((item) => item.pagePath))
  const tabPageCache = new Map<string, MiniProgramPageInstance>()
  let tabBarVisiblePreference = true
  let notifyTabBarChange: () => void = () => {}
  const getTabBarState = (): RuntimeTabBarState | null => {
    if (!tabBarModel) return null
    const selectedIndex = activePage
      ? tabBarModel.items.findIndex((item) => item.pagePath === activePage!.path)
      : -1
    return {
      visible: tabBarVisiblePreference
        && !tabBarModel.custom
        && selectedIndex >= 0,
      custom: tabBarModel.custom,
      position: tabBarModel.position,
      color: tabBarModel.color,
      selectedColor: tabBarModel.selectedColor,
      backgroundColor: tabBarModel.backgroundColor,
      borderStyle: tabBarModel.borderStyle,
      selectedIndex,
      items: tabBarModel.items.map((item, index) => ({ ...item, index })),
    }
  }
  const requireTabBar = () => {
    if (!tabBarModel) throw new Error('tabBar is not configured')
    return tabBarModel
  }
  const readTabBarIndex = (params: Record<string, unknown>) => {
    const model = requireTabBar()
    const index = Number(params.index)
    if (!Number.isInteger(index) || index < 0 || index >= model.items.length) {
      throw new Error(`invalid tabBar index: ${String(params.index)}`)
    }
    return index
  }
  const tabBarApi: TabBarApi = {
    setStyle(params) {
      const model = requireTabBar()
      if (typeof params.color === 'string') model.color = params.color
      if (typeof params.selectedColor === 'string') model.selectedColor = params.selectedColor
      if (typeof params.backgroundColor === 'string') model.backgroundColor = params.backgroundColor
      if (params.borderStyle === 'white' || params.borderStyle === 'black') {
        model.borderStyle = params.borderStyle
      }
      notifyTabBarChange()
    },
    setItem(params) {
      const model = requireTabBar()
      const item = model.items[readTabBarIndex(params)]
      if (typeof params.text === 'string') item.text = params.text
      if (typeof params.iconPath === 'string') {
        if (params.iconPath) item.iconPath = params.iconPath
        else delete item.iconPath
      }
      if (typeof params.selectedIconPath === 'string') {
        if (params.selectedIconPath) item.selectedIconPath = params.selectedIconPath
        else delete item.selectedIconPath
      }
      notifyTabBarChange()
    },
    setBadge(params) {
      const model = requireTabBar()
      const item = model.items[readTabBarIndex(params)]
      const text = String(params.text ?? '').slice(0, 4)
      if (text) item.badge = text
      else delete item.badge
      notifyTabBarChange()
    },
    removeBadge(params) {
      const model = requireTabBar()
      delete model.items[readTabBarIndex(params)].badge
      notifyTabBarChange()
    },
    showRedDot(params) {
      const model = requireTabBar()
      model.items[readTabBarIndex(params)].redDot = true
      notifyTabBarChange()
    },
    hideRedDot(params) {
      const model = requireTabBar()
      model.items[readTabBarIndex(params)].redDot = false
      notifyTabBarChange()
    },
    setVisible(visible) {
      requireTabBar()
      tabBarVisiblePreference = visible
      notifyTabBarChange()
    },
  }
  let systemInfoSnapshot: SystemInfoSnapshot = {
    pixelRatio: 1,
    windowWidth: 0,
    windowHeight: 0,
  }
  const storageSnapshot: StorageSnapshot = {}
  const themeListeners = new Set<(value: unknown) => void>()
  const supportedApiNames = new Set<string>()
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
    getCurrentPagePath: () => activePage?.path,
    getActivePage: () => activePage,
    canvas: options.canvas,
    resolveAssetUrl: options.resolveAssetUrl,
    tabBar: tabBarApi,
    themeListeners,
    get pageId() {
      return activePage?.pageId
    },
  }
  const connection = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'service' },
  })
  apiContext.connection = connection
  const apiHost = {
    ...createServiceApiHost(apiContext),
    ...(options.apiExtensions ?? {}),
  }
  for (const name of Object.keys(apiHost)) supportedApiNames.add(name)
  installMiniProgramGlobals(
    registry,
    apiHost,
    (name) => connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
      message: `${compatibility.api.global}.${name} is not supported in the P0 runtime.`,
    }, activePage?.pageId),
    () => pageStack,
  )
  const componentTree = new ComponentTree()
  connection.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
    const payload = (message.payload ?? {}) as {
      observerId?: string
      entries?: ViewIntersectionEntry[]
    }
    if (!logicTree || !payload.observerId || !payload.entries) return
    logicTree.handleViewIntersection(payload.observerId, payload.entries)
  })

  const artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()
  const emitPageLifecycle = (
    page: MiniProgramPageInstance,
    phase: string,
    extra?: Record<string, unknown>,
  ) => {
    lifecycleSequence += 1
    const hiddenPhase = phase === 'onLoad' || phase === 'onHide' || phase === 'onUnload'
    connection.sendDiagnostic('log', {
      code: DIAGNOSTIC_CODES.PAGE_LIFECYCLE,
      message: `${phase} ${page.path}`,
      details: {
        pageId: page.pageId,
        path: page.path,
        phase,
        sequence: lifecycleSequence,
        visible: !hiddenPhase && appVisible && page === activePage,
        ...(extra ? { extra } : {}),
      },
    }, page.pageId)
  }
  const triggerPageLifecycle = (
    page: MiniProgramPageInstance,
    phase: PageLifecycleName,
    args: unknown[] = [],
    extra?: Record<string, unknown>,
    emitDiagnostic = true,
  ): unknown => {
    const result = page.triggerLifecycle(phase, args)
    if (emitDiagnostic) emitPageLifecycle(page, phase, extra)
    return result
  }
  const sendRuntimeState = () => {
    const pageStackIds = pageStack.map((page) => page.pageId)
    const pages: RuntimePageState[] = pageStack.map((page) => ({
      pageId: page.pageId,
      path: page.path,
      visible: appVisible && page === activePage,
    }))
    const livePageIds = new Set(pageStackIds)
    for (const cachedPage of tabPageCache.values()) {
      if (livePageIds.has(cachedPage.pageId)) continue
      pages.push({
        pageId: cachedPage.pageId,
        path: cachedPage.path,
        visible: false,
        cached: true,
      })
    }
    const tabBar = getTabBarState()
    connection.sendDiagnostic('state', createRuntimeStateDiagnostic(
      'service',
      {
        pageStack: pageStackIds,
        currentPage: activePage?.path ?? '',
        pages,
        appVisible,
        ...(tabBar ? { tabBar } : {}),
        maxPageStack,
        transport: 'connected',
      },
      activePage?.pageId,
    ))
  }
  notifyTabBarChange = sendRuntimeState
  if (tabBarModel?.custom) {
    connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.TABBAR_CUSTOM_UNSUPPORTED,
      message: 'Custom tabBar rendering is not implemented; the page owns its tab bar.',
    })
  }
  const triggerComponentsPageLifetime = (pageId: string, phase: 'show' | 'hide') => {
    logicTree?.triggerPageLifetime(pageId, phase)
  }
  const saveExitState = (page: MiniProgramPageInstance): unknown => {
    const state = triggerPageLifecycle(page, 'onSaveExitState')
    if (state !== undefined) {
      page.savedExitState = cloneJsonSafe(state)
    }
    return state
  }
  const destroyPage = (page: MiniProgramPageInstance, unloadedPageIds?: string[]) => {
    page.triggerPageLifetime('hide')
    triggerComponentsPageLifetime(page.pageId, 'hide')
    triggerPageLifecycle(page, 'onUnload')
    if (page.getComponentDefinition()) page.triggerComponentLifecycle('detached')
    options.canvas?.releaseCanvasNode?.({ pageId: page.pageId })
    componentTree.removePage(page.pageId)
    logicTree?.unmountPage(page.pageId)
    mountedTreePages.delete(page.pageId)
    pendingTreePages.delete(page.pageId)
    pageInstances.delete(page.pageId)
    readyPages.delete(page.pageId)
    tabPageCache.delete(page.path)
    unloadedPageIds?.push(page.pageId)
  }

  const treeStyles = (pageId: string): { styles: string[]; fallbackAppStyles?: string[] } => {
    const styles = logicTree?.styleTexts(pageId) ?? []
    if (logicTree?.hasAppPageScope(pageId)) return { styles }
    const appStylePath = options.manifest.app?.style?.outputPath
    const appCss = appStylePath ? options.loadStyle?.(appStylePath) : undefined
    return {
      styles,
      ...(appCss && appCss.trim().length > 0 ? { fallbackAppStyles: [appCss] } : {}),
    }
  }

  const treeFlow = (root: import('../tree/protocol').RenderNode): import('../tree/protocol').ComponentFlow[] => {
    const messages: import('../tree/protocol').ComponentFlow[] = componentSchemas.map((schema) => ({
      type: 'define' as const,
      path: schema.path,
      definition: {
        componentId: schema.componentId,
        options: schema.options,
        properties: schema.properties,
      },
    }))
    const visit = (
      node: import('../tree/protocol').RenderNode,
      parentId: string | undefined,
      index: number,
    ): void => {
      if (node.type === 'text') {
        messages.push({
          type: 'create-node',
          id: node.id,
          tag: '#text',
          parentId,
          index,
          text: node.text,
        })
        return
      }
      messages.push({
        type: 'create-node',
        id: node.id,
        tag: node.tag,
        parentId,
        index,
        dataset: node.dataset,
        scopes: node.scopes,
        scopeChain: node.scopeChain,
        externalClasses: node.externalClasses,
        events: node.events,
        key: node.key,
      })
      if (node.props && Object.keys(node.props).length > 0) {
        messages.push({ type: 'props', id: node.id, props: node.props })
      }
      const childIds: string[] = []
      for (const [childIndex, child] of (node.children ?? []).entries()) {
        childIds.push(child.id)
        visit(child, node.id, childIndex)
      }
      if (childIds.length > 0) {
        messages.push({ type: 'children', id: node.id, inserts: childIds })
      }
    }
    visit(root, undefined, 0)
    messages.push({ type: 'ready' })
    return messages
  }

  const sendTreeSnapshot = (pageId: string): void => {
    if (!logicTree) return
    const root = logicTree.snapshotRenderTree(pageId)
    if (!root) return
    connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.flow,
      {
        pageId,
        pagePath: logicTree.pagePathFor(pageId),
        messages: cloneJsonSafe(treeFlow(root)),
        ...(wxsModules ? { wxsModules: cloneJsonSafe(wxsModules) } : {}),
        ...treeStyles(pageId),
      },
      { pageId },
    )
  }

  const mountTreePage = (page: MiniProgramPageInstance): void => {
    if (!logicTree || mountedTreePages.has(page.pageId)) return
    logicTree.mountPage(page.path, page.data, page.pageId)
    mountedTreePages.add(page.pageId)
    sendTreeSnapshot(page.pageId)
  }

  const scheduleTreeUpdate = (pageId: string): void => {
    if (!logicTree || !mountedTreePages.has(pageId)) return
    pendingTreePages.add(pageId)
    if (treeUpdateScheduled) return
    treeUpdateScheduled = true
    queueMicrotask(() => {
      treeUpdateScheduled = false
      const pages = [...pendingTreePages]
      pendingTreePages.clear()
      for (const id of pages) {
        if (!logicTree || !mountedTreePages.has(id)) continue
        try {
          const { patches } = logicTree.updateRenderTree(id)
          if (patches.length > 0) {
            connection.sendEvent(
              TREE_PROTOCOL.domain, TREE_PROTOCOL.patch,
              { pageId: id, patches: cloneJsonSafe(patches) },
              { pageId: id },
            )
          }
        } catch (error) {
          connection.sendDiagnostic('warn', {
            code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
            message: error instanceof Error ? error.message : String(error),
          }, id)
        }
      }
    })
  }

  const syncTreePatch = (pageId: string, patch: Record<string, unknown>): void => {
    if (!logicTree || !mountedTreePages.has(pageId)) return
    try {
      logicTree.applyPageData(pageId, patch)
      scheduleTreeUpdate(pageId)
    } catch (error) {
      connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
        message: error instanceof Error ? error.message : String(error),
      }, pageId)
    }
  }

  const createPageInstance = (path: string, query: Record<string, string> = {}) => {
    const pageArtifact = findPageArtifact(options.manifest, path)
    const isComponentPage = pageArtifact?.bodyType === 'component'
    const definition = registry.pages.get(path) ?? registry.components.get(path)
    if (!definition) throw new Error(`page is not registered: ${path}`)
    const componentDefinition = isComponentPage
      ? registry.normalizedComponents.get(path)
      : undefined
    pageIdCounter += 1
    const pageId = `${TINY_ENGINE_NAMING.pageIdPrefix}${pageIdCounter}`
    componentTree.ensurePage(pageId, path)
    const page = new MiniProgramPageInstance(
      pageId,
      path,
      definition,
      query,
      (id, patch) => {
        syncTreePatch(id, patch)
      },
      (code, message, details) => connection.sendDiagnostic('warn', {
        code,
        message,
        details,
      }, pageId),
      componentDefinition,
      (selector, all) => logicTree?.selectComponents(pageId, selector, all) ?? [],
      (relationKey) => logicTree?.relationNodes(pageId, relationKey) ?? [],
      () => logicTree?.pageSelectorQuery(pageId) ?? {},
      (observerOptions) => logicTree?.pageIntersectionObserver(pageId, observerOptions) ?? {},
      {
        animate: (selector, keyframes, duration, animateOptions) => (
          logicTree?.pageAnimate(pageId, selector, keyframes, duration, animateOptions) ?? false
        ),
        clear: (selector, clearOptions, callback) => (
          logicTree?.pageClearAnimate(pageId, selector, clearOptions, callback) ?? false
        ),
      },
    )
    if (componentDefinition) page.triggerComponentLifecycle('created')
    pageInstances.set(page.pageId, page)
    pageStack.push(page)
    activePage = page
    if (tabBarPagePaths.has(path)) tabPageCache.set(path, page)
    mountTreePage(page)
    return page
  }
  const assertRouteTarget = (
    path: string,
    query: Record<string, string>,
    optionsForTarget: { allowTabBar: boolean; isEntryPage?: boolean } = { allowTabBar: true },
  ): void => {
    if (!findPageArtifact(options.manifest, path)) {
      registry.reportPageNotFound({
        path,
        query,
        isEntryPage: optionsForTarget.isEntryPage === true,
      })
      throw new Error(`page is not declared: ${path}`)
    }
    if (!registry.pages.get(path) && !registry.components.get(path)) {
      registry.reportPageNotFound({
        path,
        query,
        isEntryPage: optionsForTarget.isEntryPage === true,
      })
      throw new Error(`page is not registered: ${path}`)
    }
    if (!optionsForTarget.allowTabBar && tabBarPagePaths.has(path)) {
      throw new Error(`can not navigateTo a tabbar page: ${path}`)
    }
  }
  const resolveRoute = (fromPath: string, url: string) => {
    const [rawPath, queryString] = url.split('?', 2)
    const path = rawPath!.startsWith('/')
      ? normalizeRoutePath(rawPath!.slice(1))
      : resolveComponentReference(fromPath, rawPath!)
    const query = Object.fromEntries(new URLSearchParams(queryString ?? ''))
    return { path, query }
  }

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, (message) => {
    if (!logicTree) return
    const payload = (message.payload ?? {}) as {
      id?: string
      name?: string
      detail?: unknown
      native?: Record<string, unknown>
      touches?: unknown[]
      changedTouches?: unknown[]
      target?: ViewEventPayload['target']
      currentTarget?: ViewEventPayload['currentTarget']
    }
    if (!payload.id || !payload.name) return
    try {
      logicTree.dispatchViewEvent({
        viewId: payload.id,
        name: payload.name,
        pageId: message.pageId,
        detail: payload.detail,
        native: payload.native,
        touches: payload.touches,
        changedTouches: payload.changedTouches,
        ...(payload.target ? { target: payload.target } : {}),
        ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
      })
    } catch (error) {
      const description = error instanceof Error ? error.message : String(error)
      registry.reportError(
        error instanceof Error && error.stack ? `${description}\n${error.stack}` : description,
      )
      connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
        message: description,
        handler: payload.name,
        stack: error instanceof Error ? error.stack : undefined,
      }, message.pageId)
    }
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.ready, (message) => {
    if (!logicTree || !message.pageId || !mountedTreePages.has(message.pageId)) return
    sendTreeSnapshot(message.pageId)
  })

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, async (message) => {
    try {
      const payload = message.payload as {
        manifest?: ServiceThreadOptions['manifest']
        initialPath?: string
        systemInfo?: SystemInfoSnapshot
        storage?: StorageSnapshot
        maxPageStack?: number
      }
      currentPath = payload.initialPath ?? currentPath
      if (payload.maxPageStack !== undefined) {
        const configuredLimit = Number(payload.maxPageStack)
        if (Number.isInteger(configuredLimit) && configuredLimit > 0) {
          maxPageStack = configuredLimit
        }
      }
      // Apply host state before artifacts run: top-level component/app code
      // reads `wx.getSystemInfoSync().SDKVersion` and `getStorageSync`.
      if (payload.systemInfo) systemInfoSnapshot = cloneJsonSafe(payload.systemInfo)
      if (payload.storage) Object.assign(storageSnapshot, cloneJsonSafe(payload.storage))
      await artifactsReady
      componentSchemas = buildComponentSchemas(
        options.manifest.components,
        registry.normalizedComponents,
      )
      const templates = await options.loadTemplates()
      wxsModules = templates.wxsModules
      logicTree = new LogicTreeAdapter({
        manifest: options.manifest,
        templates,
        loadStyle: options.loadStyle,
        pageOptions: registry.pages,
        componentDefinitions: registry.normalizedComponents,
        onDataChange: scheduleTreeUpdate,
        onDiagnostic: (diagnostic) => connection.sendDiagnostic('warn', diagnostic),
        onError: (pageId, message, details) => {
          registry.reportError(message)
          connection.sendDiagnostic('error', {
            code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
            message,
            details,
          }, pageId)
        },
        viewIntersection: {
          observe: (request) => {
            void connection.call(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, {
              action: 'observe',
              observerId: request.observerId,
              viewIds: request.viewIds,
              ...(request.rootViewId ? { rootViewId: request.rootViewId } : {}),
              ...(request.thresholds ? { thresholds: request.thresholds } : {}),
              ...(request.rootMargin ? { rootMargin: request.rootMargin } : {}),
            }, { pageId: request.pageId }).catch(() => undefined)
          },
          unobserve: (observerId, pageId) => {
            void connection.call(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, {
              action: 'disconnect',
              observerId,
            }, { pageId }).catch(() => undefined)
          },
        },
        viewAnimation: {
          // Fire-and-forget: playback is render-owned, the service keeps only
          // the completion callback it scheduled for the caller.
          play: (request) => {
            connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.animate, {
              viewIds: request.viewIds,
              keyframes: request.keyframes,
              duration: request.duration,
              ...(request.delay !== undefined ? { delay: request.delay } : {}),
              ...(request.easing !== undefined ? { easing: request.easing } : {}),
              ...(request.iterations !== undefined ? { iterations: request.iterations } : {}),
              ...(request.fill !== undefined ? { fill: request.fill } : {}),
            }, { pageId: request.pageId })
          },
          clear: (request) => {
            connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.clearAnimate, {
              viewIds: request.viewIds,
              ...(request.properties ? { properties: request.properties } : {}),
            }, { pageId: request.pageId })
          },
        },
      })
      logicTree.registerComponentSchemas(componentSchemas)
      // WXS event handlers resolve their `ins` descriptor through this global
      // hook. Install before the first page mounts so the first event already
      // has one; a new service thread simply replaces the previous hook.
      installWxsEventHost({
        getLogicTree: () => logicTree ?? undefined,
        getPage: (pageId) => pageInstances.get(pageId),
        requestRenderUpdate: (pageId) => scheduleTreeUpdate(pageId),
        onDiagnostic: (pageId, code, message, details) => {
          connection.sendDiagnostic('warn', { code, message, details }, pageId)
        },
      })
      options.onLogicTreeCreated?.(logicTree)
      if (pageStack.length === 0) {
        const pageArtifact = findPageArtifact(options.manifest, currentPath)
        const currentPage = createPageInstance(currentPath, {})
        triggerPageLifecycle(currentPage, 'onLoad', [currentPage.query])
        triggerPageLifecycle(currentPage, 'onShow')
        if (pageArtifact?.bodyType === 'component') {
          currentPage.triggerComponentLifecycle('attached')
          currentPage.triggerComponentLifecycle('ready')
        }
        sendRuntimeState()
      }
      const currentPage = pageStack.at(-1)!
      const pageComponents = options.manifest.pages.flatMap((page) => {
        if (page.bodyType !== 'component' || !registry.normalizedComponents.has(page.path)) return []
        const [schema] = buildComponentSchemas([page], registry.normalizedComponents)
        return schema ? [{ path: page.path, options: schema.options }] : []
      })
      return {
        status: 'ready',
        registeredPages: [...registry.pages.keys()],
        currentPath,
        pageId: currentPage.pageId,
        initialData: cloneJsonSafe(currentPage.data),
        componentSchemas: cloneJsonSafe(componentSchemas),
        pageComponents,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      registry.reportError(
        error instanceof Error && error.stack ? `${message}\n${error.stack}` : message,
      )
      if (!findPageArtifact(options.manifest, currentPath)) {
        registry.reportPageNotFound({ path: currentPath, query: {}, isEntryPage: true })
      }
      connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.BOOTSTRAP_ERROR,
        message,
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl('page', 'ready', async (message) => {
    try {
      const payload = message.payload as {
        pageId?: string
        components?: Array<{
          componentId: string
          path: string
          parentComponentId?: string | null
          tag?: string
          id?: string
          class?: string
          data?: Record<string, unknown>
        }>
      }
      const page = requireActivePage(pageInstances, payload.pageId, activePage)
      if (!readyPages.has(page.pageId)) {
        readyPages.add(page.pageId)
        // Components attached during this render pass missed the page's
        // earlier onShow; deliver their pageLifetimes.show once now.
        if (appVisible) triggerComponentsPageLifetime(page.pageId, 'show')
        triggerPageLifecycle(page, 'onReady')
      }
      sendRuntimeState()
      return { status: 'ready', pageId: page.pageId }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      registry.reportError(
        error instanceof Error && error.stack ? `${message}\n${error.stack}` : message,
      )
      connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.PAGE_READY_ERROR,
        message,
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl('page', 'navigateTo', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('navigateTo requires a url')
    const route = resolveRoute(currentPath, payload.url)
    // Resolve the target before hiding the current page: a typo in a URL must
    // not leave the app with an onHide that is never followed by onShow.
    assertRouteTarget(route.path, route.query, { allowTabBar: false })
    if (pageStack.length >= maxPageStack) {
      throw new Error(`navigateTo:fail page stack limit ${maxPageStack}`)
    }
    const previousPage = activePage
    if (previousPage) {
      triggerPageLifecycle(previousPage, 'onHide')
      previousPage.triggerPageLifetime('hide')
      triggerComponentsPageLifetime(previousPage.pageId, 'hide')
    }
    let page: MiniProgramPageInstance
    try {
      page = createPageInstance(route.path, route.query)
    } catch (error) {
      if (previousPage) {
        activePage = previousPage
        currentPath = previousPage.path
        triggerPageLifecycle(previousPage, 'onShow')
        previousPage.triggerPageLifetime('show')
        triggerComponentsPageLifetime(previousPage.pageId, 'show')
      }
      throw error
    }
    triggerPageLifecycle(page, 'onLoad', [page.query])
    triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    currentPath = page.path
    sendRuntimeState()
    return {
      status: 'navigated',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      initialData: cloneJsonSafe(page.data),
    }
  })

  connection.onControl('page', 'redirectTo', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('redirectTo requires a url')
    const route = resolveRoute(currentPath, payload.url)
    assertRouteTarget(route.path, route.query, { allowTabBar: false })
    const previousPage = activePage
    const previousPageId = previousPage?.pageId
    const unloadedPageIds: string[] = []
    if (previousPage) {
      const stackIndex = pageStack.lastIndexOf(previousPage)
      if (stackIndex >= 0) pageStack.splice(stackIndex, 1)
      destroyPage(previousPage, unloadedPageIds)
      activePage = pageStack.at(-1) ?? null
    }
    const page = createPageInstance(route.path, route.query)
    triggerPageLifecycle(page, 'onLoad', [page.query])
    triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    currentPath = page.path
    sendRuntimeState()
    return {
      status: 'redirected',
      errMsg: 'redirectTo:ok',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  })

  connection.onControl('page', 'reLaunch', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('reLaunch requires a url')
    const route = resolveRoute(currentPath, payload.url)
    assertRouteTarget(route.path, route.query, { allowTabBar: true })
    const previousPageId = activePage?.pageId
    const unloadedPageIds: string[] = []
    const pages = new Set<MiniProgramPageInstance>([...pageStack].reverse())
    for (const cachedPage of tabPageCache.values()) pages.add(cachedPage)
    pageStack.length = 0
    activePage = null
    for (const oldPage of pages) destroyPage(oldPage, unloadedPageIds)
    const page = createPageInstance(route.path, route.query)
    triggerPageLifecycle(page, 'onLoad', [page.query])
    triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    currentPath = page.path
    sendRuntimeState()
    return {
      status: 'relaunched',
      errMsg: 'reLaunch:ok',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  })

  connection.onControl('page', 'switchTab', async (message) => {
    const model = requireTabBar()
    const payload = message.payload as { url?: string; index?: number }
    let index = Number.NaN
    if (payload.index !== undefined) {
      index = Number(payload.index)
    } else if (payload.url) {
      const rawPath = normalizeRoutePath((payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''))
      index = model.items.findIndex((item) => item.pagePath === rawPath)
      if (index < 0) {
        const route = resolveRoute(currentPath, payload.url)
        index = model.items.findIndex((item) => item.pagePath === route.path)
      }
    }
    if (!Number.isInteger(index) || index < 0 || index >= model.items.length) {
      throw new Error(`switchTab target is not a tabBar page: ${String(payload.url ?? payload.index)}`)
    }
    const item = model.items[index]!
    if (payload.url) {
      const requested = normalizeRoutePath((payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''))
      if (requested !== item.pagePath) {
        // Relative URLs resolve against the current page; validate the result
        // instead of rejecting a legitimate relative switchTab target.
        const route = resolveRoute(currentPath, payload.url)
        if (route.path !== item.pagePath) {
          throw new Error(`switchTab index ${index} does not match ${payload.url}`)
        }
      }
    }
    const tapEvent = { index, pagePath: item.pagePath, text: item.text }
    if (!tabPageCache.has(item.pagePath)) {
      assertRouteTarget(item.pagePath, {}, { allowTabBar: true })
    }
    const previousPage = activePage
    if (previousPage && previousPage.path === item.pagePath) {
      triggerPageLifecycle(previousPage, 'onTabItemTap', [tapEvent])
      sendRuntimeState()
      return {
        status: 'switched',
        errMsg: 'switchTab:ok',
        path: previousPage.path,
        pageId: previousPage.pageId,
        index,
        created: false,
        previousPageId: previousPage.pageId,
        initialData: cloneJsonSafe(previousPage.data),
        unloadedPageIds: [],
      }
    }

    const previousPageId = previousPage?.pageId
    const previousTab = previousPage && tabBarPagePaths.has(previousPage.path) ? previousPage : null
    const unloadedPageIds: string[] = []
    const oldStack = [...pageStack]
    if (previousTab) {
      triggerPageLifecycle(previousTab, 'onHide')
      previousTab.triggerPageLifetime('hide')
      triggerComponentsPageLifetime(previousTab.pageId, 'hide')
    }
    pageStack.length = 0
    activePage = null
    for (const oldPage of oldStack) {
      if (oldPage === previousTab) continue
      // Tab pages stay cached between switches; only non-tab pages unload.
      if (tabBarPagePaths.has(oldPage.path)) continue
      destroyPage(oldPage, unloadedPageIds)
    }

    let target = tabPageCache.get(item.pagePath)
    let created = false
    if (!target) {
      target = createPageInstance(item.pagePath, {})
      created = true
      triggerPageLifecycle(target, 'onLoad', [target.query])
      triggerPageLifecycle(target, 'onShow')
      target.triggerPageLifetime('show')
      if (findPageArtifact(options.manifest, target.path)?.bodyType === 'component') {
        target.triggerComponentLifecycle('attached')
        target.triggerComponentLifecycle('ready')
      }
      currentPath = target.path
    } else {
      pageStack.push(target)
      activePage = target
      currentPath = target.path
      triggerPageLifecycle(target, 'onShow')
      target.triggerPageLifetime('show')
      triggerComponentsPageLifetime(target.pageId, 'show')
    }
    triggerPageLifecycle(target, 'onTabItemTap', [tapEvent])
    sendRuntimeState()
    return {
      status: 'switched',
      errMsg: 'switchTab:ok',
      path: target.path,
      pageId: target.pageId,
      index,
      created,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(target.data),
      unloadedPageIds,
    }
  })

  connection.onControl('page', 'navigateBack', async (message) => {
    const payload = message.payload as { delta?: number }
    const delta = Math.max(1, Number(payload.delta ?? 1))
    if (delta >= pageStack.length) throw new Error('Cannot navigate back beyond the first page')
    const removed = pageStack.splice(-delta)
    const unloadedPageIds: string[] = []
    for (const page of removed.reverse()) {
      // A popped page is destroyed, not hidden. The component page lifetime
      // still ends so components can pause resources before detaching.
      destroyPage(page, unloadedPageIds)
    }
    const page = pageStack.at(-1)!
    activePage = page
    currentPath = page.path
    triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    triggerComponentsPageLifetime(page.pageId, 'show')
    sendRuntimeState()
    return {
      status: 'navigated-back',
      path: page.path,
      pageId: page.pageId,
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  })

  connection.onControl('page', 'hide', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    if (!appVisible) return { status: 'hidden', pageId: page.pageId }
    appVisible = false
    saveExitState(page)
    registry.hideApp()
    triggerPageLifecycle(page, 'onHide')
    page.triggerPageLifetime('hide')
    triggerComponentsPageLifetime(page.pageId, 'hide')
    sendRuntimeState()
    return { status: 'hidden', pageId: page.pageId }
  })

  connection.onControl('page', 'show', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    if (appVisible) return { status: 'shown', pageId: page.pageId }
    appVisible = true
    registry.showApp()
    triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    triggerComponentsPageLifetime(page.pageId, 'show')
    sendRuntimeState()
    return { status: 'shown', pageId: page.pageId }
  })

  connection.onControl('page', 'pullDownRefresh', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    if (!appVisible) return { status: 'ignored', pageId: page.pageId }
    triggerPageLifecycle(page, 'onPullDownRefresh')
    return { status: 'refreshed', pageId: page.pageId }
  })

  connection.onControl('page', 'share', async (message) => {
    const payload = message.payload as {
      pageId?: string
      type?: 'appMessage' | 'timeline' | 'favorites'
      from?: 'button' | 'menu'
      target?: unknown
      webViewUrl?: string
    }
    const page = requireActivePage(pageInstances, payload.pageId, activePage)
    const type = payload.type === 'timeline' || payload.type === 'favorites'
      ? payload.type
      : 'appMessage'
    const phase: PageLifecycleName = type === 'timeline'
      ? 'onShareTimeline'
      : type === 'favorites'
        ? 'onAddToFavorites'
        : 'onShareAppMessage'
    const args = type === 'appMessage'
      ? [{
          from: payload.from === 'button' ? 'button' : 'menu',
          ...(payload.target !== undefined ? { target: payload.target } : {}),
          ...(payload.webViewUrl ? { webViewUrl: payload.webViewUrl } : {}),
        }]
      : type === 'favorites'
        ? [{ ...(payload.webViewUrl ? { webViewUrl: payload.webViewUrl } : {}) }]
        : []
    const result = triggerPageLifecycle(page, phase, args)
    // onShareAppMessage may return `{ promise }` or a Promise; resolve it before
    // crossing the bridge so the host receives the final share object.
    const resolved = result && typeof (result as PromiseLike<unknown>).then === 'function'
      ? await (result as PromiseLike<unknown>)
      : result
    return {
      status: 'shared',
      type,
      handled: resolved !== undefined,
      share: cloneJsonSafe(resolved ?? null),
    }
  })

  connection.onControl('page', 'saveExitState', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    const state = saveExitState(page)
    return { status: 'saved', state: cloneJsonSafe(state ?? null) }
  })

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.resize, async (message) => {
    const payload = message.payload as { windowWidth?: number; windowHeight?: number }
    const windowWidth = Number(payload.windowWidth ?? systemInfoSnapshot.windowWidth)
    const windowHeight = Number(payload.windowHeight ?? systemInfoSnapshot.windowHeight)
    systemInfoSnapshot = {
      ...systemInfoSnapshot,
      windowWidth: Number.isFinite(windowWidth) ? windowWidth : systemInfoSnapshot.windowWidth,
      windowHeight: Number.isFinite(windowHeight) ? windowHeight : systemInfoSnapshot.windowHeight,
    }
    if (activePage) {
      triggerPageLifecycle(activePage, 'onResize', [{
        size: {
          windowWidth: systemInfoSnapshot.windowWidth,
          windowHeight: systemInfoSnapshot.windowHeight,
        },
      }])
    }
    sendRuntimeState()
    return { status: 'resized', ...systemInfoSnapshot }
  })

  connection.onControl('runtime', 'themeChange', async (message) => {
    const theme = (message.payload as { theme?: string }).theme === 'dark' ? 'dark' : 'light'
    registry.reportThemeChange(theme)
    for (const listener of themeListeners) {
      try {
        listener({ theme })
      } catch (error) {
        connection.sendDiagnostic('warn', {
          code: DIAGNOSTIC_CODES.THEME_LISTENER_ERROR,
          message: error instanceof Error ? error.message : String(error),
        }, activePage?.pageId)
      }
    }
    return { status: 'theme-changed', theme }
  })

  connection.onEvent('page', 'pullDownRefresh', (message) => {
    const pageId = message.pageId
    const page = pageId ? pageInstances.get(pageId) : activePage
    if (!page || !appVisible || page !== activePage) return
    triggerPageLifecycle(page, 'onPullDownRefresh')
  })

  connection.onEvent('page', 'scroll', (message) => {
    const pageId = message.pageId
    const page = pageId ? pageInstances.get(pageId) : activePage
    if (!page || !appVisible || page !== activePage) return
    const payload = message.payload as { scrollTop?: number; scrollLeft?: number } | undefined
    triggerPageLifecycle(page, 'onPageScroll', [{
      scrollTop: Number(payload?.scrollTop ?? 0),
      scrollLeft: Number(payload?.scrollLeft ?? 0),
    }], undefined, false)
  })

  connection.onEvent('page', 'reachBottom', (message) => {
    const pageId = message.pageId
    const page = pageId ? pageInstances.get(pageId) : activePage
    if (!page || !appVisible || page !== activePage) return
    triggerPageLifecycle(page, 'onReachBottom')
  })

  connection.onControl('page', 'unload', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    const stackIndex = pageStack.indexOf(page)
    if (stackIndex >= 0) pageStack.splice(stackIndex, 1)
    destroyPage(page)
    if (activePage === page) activePage = pageStack.at(-1) ?? null
    if (activePage) currentPath = activePage.path
    sendRuntimeState()
    return { status: 'unloaded', pageId: page.pageId }
  })

  return {
    connection,
    registry,
    manifest: options.manifest,
    initialPath: options.initialPath,
    get activePage() {
      return activePage
    },
    get pageStack() {
      return pageStack
    },
    pageInstances,
    componentTree,
    notifyUnhandledRejection(reason, promise) {
      registry.reportUnhandledRejection(reason, promise)
    },
  }
}

type TabBarItemModel = {
  pagePath: string
  text: string
  iconPath?: string
  selectedIconPath?: string
  badge?: string
  redDot: boolean
}

type TabBarModel = {
  custom: boolean
  position: 'bottom' | 'top'
  color: string
  selectedColor: string
  backgroundColor: string
  borderStyle: 'black' | 'white'
  items: TabBarItemModel[]
}

function normalizeTabBar(manifest: ServiceThreadOptions['manifest']): TabBarModel | null {
  const raw = manifest.app?.configuration?.effective?.tabBar
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const value = raw as Record<string, unknown>
  const list = Array.isArray(value.list) ? value.list : []
  const items: TabBarItemModel[] = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as Record<string, unknown>
    const pagePath = normalizeRoutePath(String(item.pagePath ?? '').replace(/^\//, ''))
    if (!pagePath) continue
    items.push({
      pagePath,
      text: typeof item.text === 'string' ? item.text : '',
      ...(typeof item.iconPath === 'string' && item.iconPath
        ? { iconPath: item.iconPath }
        : {}),
      ...(typeof item.selectedIconPath === 'string' && item.selectedIconPath
        ? { selectedIconPath: item.selectedIconPath }
        : {}),
      redDot: false,
    })
  }
  if (items.length === 0) return null
  return {
    custom: value.custom === true,
    position: value.position === 'top' ? 'top' : 'bottom',
    color: typeof value.color === 'string' ? value.color : '#7A7E83',
    selectedColor: typeof value.selectedColor === 'string' ? value.selectedColor : '#3CC51F',
    backgroundColor: typeof value.backgroundColor === 'string'
      ? value.backgroundColor
      : '#FFFFFF',
    borderStyle: value.borderStyle === 'white' ? 'white' : 'black',
    items,
  }
}
