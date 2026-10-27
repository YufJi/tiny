import { BridgeConnection } from '@tiny/bridge'
import {
  runtimeCompatibilityFromManifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from './component-schema'
import type { ComponentLifecycleName, NormalizedComponentDefinition } from './component-definition'
import { invokeObserver } from './observers'
import { cloneJsonSafe, readDataPath } from './data'
import { ComponentTree } from './component-tree'
import { RelationManager } from './relation-manager'
import type { ServiceThreadOptions } from './types'
import type { MiniProgramComponentSchema, StorageSnapshot, SystemInfoSnapshot } from './types'
import { createRuntimeStateDiagnostic } from './diagnostics'
import type { RuntimePageState, RuntimeTabBarState } from './diagnostics'
import { MiniProgramPageRegistry } from './service/page-registry'
import { MiniProgramComponentInstance } from './service/component-instance'
import { MiniProgramPageInstance, type PageLifecycleName } from './service/page-instance'
import { createServiceApiHost, installMiniProgramGlobals } from './service/api-host'
import { findPageArtifact, normalizeRoutePath, requireActivePage, resolveComponentReference } from './service/route'
import type { ComponentRuntimeContext, MiniProgramApiHost, ServiceApiContext, ServiceThreadRuntime, TabBarApi } from './service/types'

export type { MiniProgramPageOptions, MiniProgramComponentOptions, MiniProgramAppOptions, ComponentRuntimeContext, MiniProgramApiHost, ServiceApiContext, ServiceThreadRuntime } from './service/types'
export { MiniProgramPageRegistry } from './service/page-registry'
export { MiniProgramComponentInstance } from './service/component-instance'
export { MiniProgramPageInstance } from './service/page-instance'
export { createServiceApiHost, installMiniProgramGlobals } from './service/api-host'

export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
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
  const registry = new MiniProgramPageRegistry(
    expectedPagePaths,
    expectedComponentPaths,
    compatibility,
  )
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  const componentInstances = new Map<string, MiniProgramComponentInstance>()
  let componentSchemas: MiniProgramComponentSchema[] = []
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
    canvas: options.canvas,
    resolveAssetUrl: options.resolveAssetUrl,
    tabBar: tabBarApi,
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
      code: 'UNSUPPORTED_API',
      message: `${compatibility.api.global}.${name} is not supported in the P0 runtime.`,
    }, activePage?.pageId),
    () => pageStack,
  )
  const componentTree = new ComponentTree()
  const getPageByRootId = (componentId: string): MiniProgramPageInstance | undefined => {
    if (!componentId.startsWith('page:')) return undefined
    return pageInstances.get(componentId.slice('page:'.length))
  }
  const relationManager = new RelationManager({
    tree: componentTree,
    getInstance: (componentId) => componentInstances.get(componentId) ?? getPageByRootId(componentId),
    getRelations: (componentId) => (
      componentInstances.get(componentId)?.getComponentOptions().relations
      ?? getPageByRootId(componentId)?.getComponentDefinition()?.relations
      ?? []
    ),
    onError: (code, message, details) => connection.sendDiagnostic('warn', {
      code,
      message,
      details,
    }, activePage?.pageId),
  })
  const createRuntimeContext = (pageId: string): ComponentRuntimeContext => ({
    pageId,
    tree: componentTree,
    relations: relationManager,
    getInstance: (componentId) => componentInstances.get(componentId),
    onDiagnostic: (code, message, details) => connection.sendDiagnostic('warn', {
      code,
      message,
      details,
    }, pageId),
  })
  const createComponentInstance = (
    componentId: string,
    componentPath: string,
    definition: NormalizedComponentDefinition,
    initialData: Record<string, unknown>,
    pageId: string,
  ) => new MiniProgramComponentInstance(
    componentId,
    componentPath,
    definition,
    initialData,
    createRuntimeContext(pageId),
    {
      onDataPatch: (instanceId, patch) => {
        connection.sendEvent('data', 'setData', { componentId: instanceId, patch }, { pageId })
      },
      onTriggerEvent: (instanceId, name, detail, triggerOptions) => {
        connection.sendEvent('event', 'trigger', {
          componentId: instanceId,
          name,
          detail,
          options: triggerOptions,
        }, { pageId })
      },
    },
  )
  const ensureComponentInstance = (
    componentId: string,
    componentPath?: string,
    data?: Record<string, unknown>,
    pageId?: string,
  ): MiniProgramComponentInstance | undefined => {
    const existing = componentInstances.get(componentId)
    if (existing) return existing
    if (!componentPath) return undefined
    const schema = componentSchemas.find((component) => component.path === componentPath)
    const definition = registry.normalizedComponents.get(componentPath)
    if (!schema || !definition) return undefined
    const component = createComponentInstance(
      componentId,
      componentPath,
      definition,
      data ?? schema.data,
      pageId ?? activePage?.pageId ?? '',
    )
    componentInstances.set(componentId, component)
    for (const issue of definition.diagnostics) {
      connection.sendDiagnostic('warn', issue, pageId ?? activePage?.pageId)
    }
    return component
  }
  const artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()
  const emitPageLifecycle = (
    page: MiniProgramPageInstance,
    phase: string,
    extra?: Record<string, unknown>,
  ) => {
    lifecycleSequence += 1
    const hiddenPhase = phase === 'onLoad' || phase === 'onHide' || phase === 'onUnload'
    connection.sendDiagnostic('log', {
      code: 'PAGE_LIFECYCLE',
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
  ) => {
    page.triggerLifecycle(phase, args)
    if (emitDiagnostic) emitPageLifecycle(page, phase, extra)
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
      code: 'TABBAR_CUSTOM_UNSUPPORTED',
      message: 'Custom tabBar rendering is not implemented; the page owns its tab bar.',
    })
  }
  const triggerComponentsPageLifetime = (pageId: string, phase: 'show' | 'hide') => {
    for (const [componentId, component] of componentInstances) {
      if (componentTree.get(componentId)?.pageId === pageId) component.triggerPageLifetime(phase)
    }
  }
  const destroyPage = (page: MiniProgramPageInstance, unloadedPageIds?: string[]) => {
    page.triggerPageLifetime('hide')
    triggerComponentsPageLifetime(page.pageId, 'hide')
    triggerPageLifecycle(page, 'onUnload')
    if (page.getComponentDefinition()) page.triggerComponentLifecycle('detached')
    relationManager.handleDetach(page.componentId)
    options.canvas?.releaseCanvasNode?.({ pageId: page.pageId })
    for (const componentId of componentTree.removePage(page.pageId)) {
      const component = componentInstances.get(componentId)
      if (!component) continue
      component.triggerLifecycle('detached')
      relationManager.handleDetach(componentId)
      componentInstances.delete(componentId)
      createdComponents.delete(componentId)
      pendingComponentEvents.delete(componentId)
      previousComponentData.delete(componentId)
    }
    pageInstances.delete(page.pageId)
    readyPages.delete(page.pageId)
    tabPageCache.delete(page.path)
    unloadedPageIds?.push(page.pageId)
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
    const pageId = `page-${pageIdCounter}`
    componentTree.ensurePage(pageId, path)
    const page = new MiniProgramPageInstance(
      pageId,
      path,
      definition,
      query,
      (id, patch) => {
        connection.sendEvent('data', 'setData', { pageId: id, patch }, { pageId: id })
      },
      createRuntimeContext(pageId),
      componentDefinition,
    )
    if (componentDefinition) {
      page.triggerComponentLifecycle('created')
      relationManager.handleAttach(page.componentId, false)
    }
    pageInstances.set(page.pageId, page)
    pageStack.push(page)
    activePage = page
    if (tabBarPagePaths.has(path)) tabPageCache.set(path, page)
    return page
  }
  const resolveRoute = (fromPath: string, url: string) => {
    const [rawPath, queryString] = url.split('?', 2)
    const path = rawPath!.startsWith('/')
      ? normalizeRoutePath(rawPath!.slice(1))
      : resolveComponentReference(fromPath, rawPath!)
    const query = Object.fromEntries(new URLSearchParams(queryString ?? ''))
    return { path, query }
  }

  connection.onControl('runtime', 'bootstrap', async (message) => {
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
      await artifactsReady
      if (payload.systemInfo) systemInfoSnapshot = cloneJsonSafe(payload.systemInfo)
      if (payload.storage) Object.assign(storageSnapshot, cloneJsonSafe(payload.storage))
      componentSchemas = buildComponentSchemas(
        options.manifest.components,
        registry.normalizedComponents,
      )
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
        componentSchemas,
        pageComponents,
      }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'BOOTSTRAP_ERROR',
        message: error instanceof Error ? error.message : String(error),
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
      for (const item of payload.components ?? []) {
        const component = ensureComponentInstance(
          item.componentId,
          item.path,
          item.data,
          page.pageId,
        )
        if (!component) continue
        component.syncData(item.data)
        componentTree.add({
          componentId: item.componentId,
          pageId: page.pageId,
          path: item.path,
          tag: item.tag,
          id: item.id,
          className: item.class,
          parentId: item.parentComponentId,
        })
      }
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
      connection.sendDiagnostic('error', {
        code: 'PAGE_READY_ERROR',
        message: error instanceof Error ? error.message : String(error),
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
    if (!findPageArtifact(options.manifest, route.path)) {
      throw new Error(`page is not declared: ${route.path}`)
    }
    if (!registry.pages.get(route.path) && !registry.components.get(route.path)) {
      throw new Error(`page is not registered: ${route.path}`)
    }
    if (tabBarPagePaths.has(route.path)) {
      throw new Error(`can not navigateTo a tabbar page: ${route.path}`)
    }
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
      if (!findPageArtifact(options.manifest, item.pagePath)) {
        throw new Error(`tabBar page is not declared: ${item.pagePath}`)
      }
      if (!registry.pages.get(item.pagePath) && !registry.components.get(item.pagePath)) {
        throw new Error(`tabBar page is not registered: ${item.pagePath}`)
      }
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

  connection.onControl('runtime', 'resize', async (message) => {
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

  connection.onCall('page', 'getInitialData', async (message) => {
    const path = (message.payload as { path?: string }).path ?? currentPath
    const page = findPageArtifact(options.manifest, path)
    if (!page) throw new Error(`page is not declared: ${path}`)
    const definition = registry.pages.get(path) ?? registry.normalizedComponents.get(path)
    return {
      path,
      data: definition?.data ?? {},
    }
  })

  const createdComponents = new Set<string>()
  const previousComponentData = new Map<string, Record<string, unknown>>()
  const pendingComponentEvents = new Map<string, Array<
    | { kind: 'data'; data?: Record<string, unknown> }
    | { kind: 'observed'; key: string; data?: Record<string, unknown>; origin?: 'service' | 'render' }
  >>()
  const applyComponentObserved = (
    component: MiniProgramComponentInstance,
    payload: { key: string; data?: Record<string, unknown>; origin?: 'service' | 'render' },
  ) => {
    const oldData = previousComponentData.get(component.componentId) ?? cloneJsonSafe(component.data)
    previousComponentData.delete(component.componentId)
    component.syncData(payload.data)
    if (payload.origin === 'service') return
    const observer = component.getComponentOptions().observers.find(
      (item) => item.key === payload.key,
    )
    if (observer) invokeObserver(component, observer, oldData)
  }
  const drainPendingEvents = (component: MiniProgramComponentInstance) => {
    const pending = pendingComponentEvents.get(component.componentId)
    if (!pending) return
    pendingComponentEvents.delete(component.componentId)
    for (const event of pending) {
      if (event.kind === 'observed') {
        applyComponentObserved(component, event)
      } else {
        previousComponentData.set(component.componentId, cloneJsonSafe(component.data))
        component.syncData(event.data)
      }
    }
  }

  connection.onEvent('runtime', 'componentLifecycle', (message) => {
    const payload = message.payload as {
      componentId: string
      path?: string
      phase: ComponentLifecycleName
      data?: Record<string, unknown>
      pageId?: string
      parentComponentId?: string | null
      tag?: string
      id?: string
      class?: string
    }
    const pageId = payload.pageId ?? activePage?.pageId ?? ''
    const component = payload.phase === 'detached'
      ? componentInstances.get(payload.componentId)
      : ensureComponentInstance(payload.componentId, payload.path, payload.data, pageId)
    if (!component) return
    component.syncData(payload.data)
    switch (payload.phase) {
      case 'created':
        component.triggerLifecycle('created')
        createdComponents.add(payload.componentId)
        drainPendingEvents(component)
        break
      case 'attached':
        componentTree.add({
          componentId: payload.componentId,
          pageId,
          path: payload.path ?? component.path,
          tag: payload.tag,
          id: payload.id,
          className: payload.class,
          parentId: payload.parentComponentId,
        })
        relationManager.handleAttach(payload.componentId, false)
        component.triggerLifecycle('attached')
        relationManager.flushLinked()
        break
      case 'ready':
        component.triggerLifecycle('ready')
        break
      case 'moved':
        component.triggerLifecycle('moved')
        componentTree.move(payload.componentId, payload.parentComponentId)
        relationManager.handleMove(payload.componentId)
        break
      case 'detached':
        component.triggerLifecycle('detached')
        relationManager.handleDetach(payload.componentId)
        componentTree.remove(payload.componentId)
        componentInstances.delete(payload.componentId)
        createdComponents.delete(payload.componentId)
        pendingComponentEvents.delete(payload.componentId)
        previousComponentData.delete(payload.componentId)
        break
    }
  })

  connection.onEvent('runtime', 'componentData', (message) => {
    const payload = message.payload as {
      componentId: string
      path?: string
      pageId?: string
      data?: Record<string, unknown>
      origin?: 'service' | 'render'
    }
    const component = ensureComponentInstance(
      payload.componentId,
      payload.path,
      payload.data,
      payload.pageId ?? activePage?.pageId,
    )
    if (!component) return
    if (!createdComponents.has(payload.componentId)) {
      const pending = pendingComponentEvents.get(payload.componentId) ?? []
      pending.push({ kind: 'data', data: payload.data })
      pendingComponentEvents.set(payload.componentId, pending)
      return
    }
    previousComponentData.set(payload.componentId, cloneJsonSafe(component.data))
    component.syncData(payload.data)
  })

  connection.onEvent('runtime', 'componentObserved', (message) => {
    const payload = message.payload as {
      componentId: string
      path?: string
      pageId?: string
      key: string
      data?: Record<string, unknown>
      origin?: 'service' | 'render'
    }
    const component = ensureComponentInstance(
      payload.componentId,
      payload.path,
      payload.data,
      payload.pageId ?? activePage?.pageId,
    )
    if (!component) return
    if (!createdComponents.has(payload.componentId)) {
      const pending = pendingComponentEvents.get(payload.componentId) ?? []
      pending.push({
        kind: 'observed',
        key: payload.key,
        data: payload.data,
        origin: payload.origin,
      })
      pendingComponentEvents.set(payload.componentId, pending)
      return
    }
    applyComponentObserved(component, payload)
  })

  // Component page lifetimes are driven by the page show/hide controls below,
  // which iterate every service-side instance exactly once.
  connection.onEvent('runtime', 'componentPageLifetime', () => {})

  connection.onEvent('event', 'dispatch', (message) => {
    const pageId = message.pageId
    const page = pageId ? pageInstances.get(pageId) : activePage
    if (!page) {
      connection.sendDiagnostic('warn', {
        code: 'EVENT_PAGE_NOT_FOUND',
        message: `No page found for event: ${pageId ?? 'unknown'}`,
      }, pageId)
      return
    }
    const event = message.payload as {
      componentId?: string
      componentPath?: string
      handler?: string
      type?: string
      [key: string]: unknown
    }
    const handler = event.handler
    if (!handler) {
      connection.sendDiagnostic('warn', {
        code: 'EVENT_HANDLER_MISSING',
        message: 'Event payload does not contain a handler name.',
      }, page?.pageId)
      return
    }
    try {
      if (event.componentId) {
        const component = ensureComponentInstance(
          event.componentId,
          event.componentPath,
          event.componentData as Record<string, unknown> | undefined,
          pageId,
        )
        if (!component) throw new Error(`Component not found for event: ${event.componentId}`)
        component.syncData(event.componentData as Record<string, unknown> | undefined)
        component.invokeMethod(handler, [event])
      } else {
        page.invokeMethod(handler, [event])
      }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'EVENT_HANDLER_ERROR',
        message: error instanceof Error ? error.message : String(error),
        handler,
        eventType: event.type,
      }, page.pageId)
    }
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
    componentInstances,
    componentTree,
    relationManager,
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
