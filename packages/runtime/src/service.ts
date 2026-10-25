import { BridgeConnection } from '@tiny/bridge'
import { namingFromManifest, type PageArtifact } from '@tiny/manifest'
import { buildComponentSchemas } from './component-schema'
import type { ComponentLifecycleName, NormalizedComponentDefinition } from './component-definition'
import { invokeObserver } from './observers'
import { cloneJsonSafe, readDataPath } from './data'
import { ComponentTree } from './component-tree'
import { RelationManager } from './relation-manager'
import type { ServiceThreadOptions } from './types'
import type { MiniProgramComponentSchema, StorageSnapshot, SystemInfoSnapshot } from './types'
import { createRuntimeStateDiagnostic } from './diagnostics'
import { MiniProgramPageRegistry } from './service/page-registry'
import { MiniProgramComponentInstance } from './service/component-instance'
import { MiniProgramPageInstance } from './service/page-instance'
import { createServiceApiHost, installMiniProgramGlobals } from './service/api-host'
import { findPageArtifact, normalizeRoutePath, requireActivePage, resolveComponentReference } from './service/route'
import type { ComponentRuntimeContext, MiniProgramApiHost, ServiceApiContext, ServiceThreadRuntime } from './service/types'

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
  const naming = namingFromManifest(options.manifest)
  const registry = new MiniProgramPageRegistry(
    expectedPagePaths,
    expectedComponentPaths,
    options.manifest.naming,
  )
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  const componentInstances = new Map<string, MiniProgramComponentInstance>()
  let componentSchemas: MiniProgramComponentSchema[] = []
  const pageStack: MiniProgramPageInstance[] = []
  let activePage: MiniProgramPageInstance | null = null
  let pageIdCounter = 0
  let systemInfoSnapshot: SystemInfoSnapshot = {
    pixelRatio: 1,
    windowWidth: 0,
    windowHeight: 0,
  }
  const storageSnapshot: StorageSnapshot = {}
  const supportedApiNames = new Set<string>()
  const apiContext: ServiceApiContext = {
    connection: null as unknown as BridgeConnection,
    apiName: naming.api,
    getSystemInfoSnapshot: () => systemInfoSnapshot,
    getStorageSnapshot: () => storageSnapshot,
    setStorageSnapshot: (key, value) => {
      storageSnapshot[key] = value
    },
    apiNames: supportedApiNames,
    getCurrentPagePath: () => activePage?.path,
    canvas: options.canvas,
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
      message: `${naming.api}.${name} is not supported in the P0 runtime.`,
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
        })
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
  const sendRuntimeState = () => {
    connection.sendDiagnostic('state', createRuntimeStateDiagnostic(
      'service',
      {
        pageStack: pageStack.map((page) => page.pageId),
        currentPage: activePage?.path ?? '',
        transport: 'connected',
      },
      activePage?.pageId,
    ))
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
      }
      currentPath = payload.initialPath ?? currentPath
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
        currentPage.triggerLifecycle('onLoad', [currentPage.query])
        currentPage.triggerLifecycle('onShow')
        if (pageArtifact?.bodyType === 'component') {
          currentPage.triggerComponentLifecycle('attached')
          currentPage.triggerComponentLifecycle('ready')
        }
        sendRuntimeState()
      }
      const currentPage = pageStack.at(-1)!
      const pageComponents = options.manifest.pages
        .filter((page) => page.bodyType === 'component')
        .map((page) => ({
          path: page.path,
          options: registry.normalizedComponents.get(page.path)?.options,
        }))
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
      page.triggerLifecycle('onReady')
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
    activePage?.triggerLifecycle('onHide')
    activePage?.triggerPageLifetime('hide')
    const route = resolveRoute(currentPath, payload.url)
    const page = createPageInstance(route.path, route.query)
    page.triggerLifecycle('onLoad', [page.query])
    page.triggerLifecycle('onShow')
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

  connection.onControl('page', 'navigateBack', async (message) => {
    const payload = message.payload as { delta?: number }
    const delta = Math.max(1, Number(payload.delta ?? 1))
    if (delta >= pageStack.length) throw new Error('Cannot navigate back beyond the first page')
    const removed = pageStack.splice(-delta)
    const unloadedPageIds: string[] = []
    for (const page of removed.reverse()) {
      page.triggerLifecycle('onHide')
      page.triggerPageLifetime('hide')
      page.triggerLifecycle('onUnload')
      if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
        page.triggerComponentLifecycle('detached')
      }
      relationManager.handleDetach(page.componentId)
      componentTree.removePage(page.pageId)
      pageInstances.delete(page.pageId)
      unloadedPageIds.push(page.pageId)
    }
    const page = pageStack.at(-1)!
    activePage = page
    currentPath = page.path
    page.triggerLifecycle('onShow')
    page.triggerPageLifetime('show')
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
    page.triggerLifecycle('onHide')
    registry.hideApp()
    for (const page of pageStack) page.triggerPageLifetime('hide')
    for (const component of componentInstances.values()) component.triggerPageLifetime('hide')
    sendRuntimeState()
    return { status: 'hidden', pageId: page.pageId }
  })

  connection.onControl('page', 'show', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    registry.showApp()
    page.triggerLifecycle('onShow')
    for (const page of pageStack) page.triggerPageLifetime('show')
    for (const component of componentInstances.values()) component.triggerPageLifetime('show')
    sendRuntimeState()
    return { status: 'shown', pageId: page.pageId }
  })

  connection.onControl('page', 'unload', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onUnload')
    if (page.getComponentDefinition()) page.triggerComponentLifecycle('detached')
    relationManager.removePage(page.pageId)
    for (const componentId of componentTree.removePage(page.pageId)) {
      componentInstances.delete(componentId)
      createdComponents.delete(componentId)
      pendingComponentEvents.delete(componentId)
    }
    pageInstances.delete(page.pageId)
    if (activePage === page) activePage = null
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
