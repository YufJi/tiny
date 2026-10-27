import { BridgeConnection } from '@tiny/bridge'
import { CANVAS_CONTROL, QUERY_CONTROL, RUNTIME_CONTROL, TREE_PROTOCOL } from '../tree/protocol'
import type { RuntimeHostOptions } from '../types'
import { createHostApiRegistry, registerHostApiHandlers } from './api'
import type { HostApiRegistry } from './api'
import { createHostDiagnosticStore, registerHostDiagnosticHandlers } from './diagnostics'
import type { RuntimeDiagnostic } from '../diagnostics'
import type { MiniProgramComponentSchema } from '../types'

export type TinyRuntimeHost = {
  service: BridgeConnection
  /** The render connection of the active page (or the sole render thread). */
  render: BridgeConnection
  bootstrap(): Promise<{ service: unknown; render: unknown }>
  close(): Promise<void>
  /** Inspect one page; defaults to the active page. */
  inspectTree(pageId?: string): Promise<unknown>
  /** Update the host window snapshot and deliver `onResize` to the active page. */
  setWindowSize(width: number, height: number): Promise<void>
  /** Hide/show every render page view when the app enters the background. */
  setAppVisible(visible: boolean): void
  /** Trigger the active page's pull-down lifecycle (host gesture or API). */
  pullDownRefresh(): Promise<unknown>
  /** Ask the active page for share information. */
  share(type?: 'appMessage' | 'timeline' | 'favorites'): Promise<unknown>
  /** Invoke the active page's `onSaveExitState` and return its state. */
  saveExitState(): Promise<unknown>
  /** Deliver a host theme change to the app and `wx.onThemeChange`. */
  setTheme(theme: 'light' | 'dark'): Promise<unknown>
  apiRegistry: HostApiRegistry
  diagnostics: RuntimeDiagnostic[]
}

type RenderPageResult = {
  pageId: string
  components?: unknown[]
  status?: string
  currentPath?: string
}

type PendingRenderEvent = {
  domain: 'data' | 'event' | 'canvas' | 'tree'
  method: string
  payload: unknown
  pageId?: string
}

/**
 * Owns the host side of the bridge.
 *
 * In `renderTransport` mode a single render connection serves the whole page
 * stack (in-memory tests and simple hosts). In `renderConnector` mode every
 * page gets its own render thread, so hidden pages keep their DOM, scroll
 * position and timers exactly like a WebView stack. All page-scoped messages
 * are routed through the page ID.
 */
export function createTinyRuntime(options: RuntimeHostOptions): TinyRuntimeHost {
  const service = new BridgeConnection({
    localRole: 'host',
    peerRole: 'service',
    transport: options.serviceTransport,
    respondToHello: false,
  })
  const renderConnector = options.renderConnector
  const primaryRender = renderConnector
    ? null
    : new BridgeConnection({
        localRole: 'host',
        peerRole: 'render',
        transport: requireRenderTransport(options),
        respondToHello: false,
      })
  const diagnosticStore = createHostDiagnosticStore(options)
  registerHostDiagnosticHandlers(service, 'service', diagnosticStore)
  const apiRegistry = createHostApiRegistry(options)
  const renderSessions = new Map<string, BridgeConnection>()
  const pendingRenderEvents = new Map<string, PendingRenderEvent[]>()
  let activePageId: string | undefined
  let componentSchemas: MiniProgramComponentSchema[] = []
  let pageComponents: Array<{ path: string; options?: unknown }> = []

  const getRenderConnection = (pageId?: string): BridgeConnection | null => {
    if (!renderConnector) return primaryRender
    const id = pageId ?? activePageId
    if (id) return renderSessions.get(id) ?? null
    return [...renderSessions.values()].at(-1) ?? null
  }

  const requireRenderConnection = (pageId?: string): BridgeConnection => {
    const connection = getRenderConnection(pageId)
    if (!connection) throw new Error('render thread is not connected')
    return connection
  }

  const queueRenderEvent = (pageId: string | undefined, event: PendingRenderEvent) => {
    if (!pageId) return
    const pending = pendingRenderEvents.get(pageId) ?? []
    pending.push(event)
    pendingRenderEvents.set(pageId, pending)
  }

  const flushRenderEvents = (pageId: string, connection: BridgeConnection) => {
    const pending = pendingRenderEvents.get(pageId)
    if (!pending) return
    pendingRenderEvents.delete(pageId)
    for (const event of pending) {
      if (event.domain === 'canvas') {
        connection.sendEvent('canvas', event.method, event.payload, { pageId })
      } else {
        connection.sendEvent(event.domain, event.method, event.payload, { pageId })
      }
    }
  }

  const wireRenderConnection = (connection: BridgeConnection, pageId: string) => {
    registerHostDiagnosticHandlers(connection, 'render', diagnosticStore)
    connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, (message) => {
      service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, message.payload, { pageId: message.pageId ?? pageId })
    })
    connection.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
      service.sendEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, message.payload, {
        pageId: message.pageId ?? pageId,
      })
    })
  }

  if (primaryRender) {
    registerHostDiagnosticHandlers(primaryRender, 'render', diagnosticStore)
    primaryRender.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, (message) => {
      service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, message.payload, { pageId: message.pageId })
    })
    primaryRender.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
      service.sendEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, message.payload, {
        pageId: message.pageId,
      })
    })
  }

  const closeRenderPage = async (pageId: string) => {
    const connection = renderSessions.get(pageId)
    renderSessions.delete(pageId)
    pendingRenderEvents.delete(pageId)
    if (activePageId === pageId) activePageId = undefined
    if (connection) {
      try {
        await connection.close()
      } catch {
        // The render document may already be gone.
      }
    }
    try {
      await renderConnector?.disconnect(pageId)
    } catch {
      // Frame teardown is best effort.
    }
  }

  const openRenderPage = async (
    pageId: string,
    path: string,
    initialData?: Record<string, unknown>,
  ): Promise<RenderPageResult> => {
    if (!renderConnector) throw new Error('per-page render connector is not configured')
    const transport = await renderConnector.connect(pageId)
    const connection = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport,
      respondToHello: false,
    })
    wireRenderConnection(connection, pageId)
    try {
      await connection.handshake()
      renderSessions.set(pageId, connection)
      const result = await connection.control<RenderPageResult>(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, {
        manifest: options.manifest,
        initialPath: path,
        initialData,
        pageId,
        styleMode: 'page',
        componentSchemas,
        pageComponents,
      })
      activePageId = pageId
      renderConnector.activate?.(pageId)
      flushRenderEvents(pageId, connection)
      service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.ready, { pageId }, { pageId })
      return { ...result, pageId }
    } catch (error) {
      await closeRenderPage(pageId)
      throw error
    }
  }

  const routeServiceEvent = (
    domain: 'data' | 'event' | 'canvas' | 'tree',
    method: string,
    payload: unknown,
    pageId?: string,
  ) => {
    const connection = getRenderConnection(pageId)
    if (connection) {
      connection.sendEvent(domain, method, payload, { pageId })
      return
    }
    queueRenderEvent(pageId, { domain, method, payload, pageId })
  }

  if (!options.apiHandlers?.['navigate.to']) {
    apiRegistry.handlers['navigate.to'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'navigateTo', {
        url: params.url,
      }, { pageId: context.pageId })
      if (renderConnector) {
        const pageId = serviceResult.pageId as string | undefined
        const path = serviceResult.path as string | undefined
        if (!pageId || !path) throw new Error('navigateTo did not create a renderable page')
        try {
          const renderResult = await openRenderPage(
            pageId,
            path,
            serviceResult.initialData as Record<string, unknown> | undefined,
          )
          await service.control('page', 'ready', {
            pageId: renderResult.pageId,
            components: renderResult.components,
          })
        } catch (error) {
          // Keep the service stack consistent when the new page cannot render.
          await service.control('page', 'navigateBack', { delta: 1 }).catch(() => {})
          throw error
        }
        return serviceResult
      }
      const renderResult = await requireRenderConnection().control<{
        pageId?: string
        components?: unknown[]
      }>('page', 'navigateTo', {
        path: serviceResult.path,
        pageId: serviceResult.pageId,
        initialData: serviceResult.initialData,
        previousPageId: context.pageId,
      })
      if (renderResult.pageId) {
        await service.control('page', 'ready', {
          pageId: renderResult.pageId,
          components: renderResult.components,
        })
      }
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['navigate.switchTab']) {
    apiRegistry.handlers['navigate.switchTab'] = async (params, context) => {
      const switchPayload: Record<string, unknown> = {}
      if (params.url !== undefined) switchPayload.url = params.url
      if (params.index !== undefined) switchPayload.index = params.index
      const serviceResult = await service.control<Record<string, unknown>>(
        'page',
        'switchTab',
        switchPayload,
        { pageId: context.pageId },
      )
      const pageId = serviceResult.pageId as string | undefined
      const path = serviceResult.path as string | undefined
      const previousPageId = serviceResult.previousPageId as string | undefined
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      const created = serviceResult.created === true
      if (!pageId || !path) throw new Error('switchTab did not create a renderable page')
      if (renderConnector) {
        for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
        if (created) {
          const renderResult = await openRenderPage(
            pageId,
            path,
            serviceResult.initialData as Record<string, unknown> | undefined,
          )
          await service.control('page', 'ready', {
            pageId,
            components: renderResult.components,
          })
        } else if (previousPageId !== pageId) {
          activePageId = pageId
          renderConnector.activate?.(pageId)
        }
        return serviceResult
      }
      if (previousPageId !== pageId) {
        const rendered = await requireRenderConnection().control<{
          components?: unknown[]
        }>('page', 'switchTab', {
          path,
          pageId,
          initialData: serviceResult.initialData,
          ...(previousPageId ? { previousPageId } : {}),
          unloadedPageIds,
        })
        // A cached tab page is mounted again in single-frame mode; re-register
        // its components without emitting a second onReady.
        await service.control('page', 'ready', {
          pageId,
          components: rendered.components,
        })
      }
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['navigate.back']) {
    apiRegistry.handlers['navigate.back'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'navigateBack', {
        delta: params.delta ?? 1,
      }, { pageId: context.pageId })
      if (renderConnector) {
        const pageId = serviceResult.pageId as string | undefined
        const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
        for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
        if (pageId) {
          activePageId = pageId
          renderConnector.activate?.(pageId)
        }
        return serviceResult
      }
      await requireRenderConnection().control('page', 'navigateBack', {
        path: serviceResult.path,
        pageId: serviceResult.pageId,
        initialData: serviceResult.initialData,
        unloadedPageIds: serviceResult.unloadedPageIds,
      })
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['navigate.redirectTo']) {
    apiRegistry.handlers['navigate.redirectTo'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'redirectTo', {
        url: params.url,
      }, { pageId: context.pageId })
      const pageId = serviceResult.pageId as string | undefined
      const path = serviceResult.path as string | undefined
      const initialData = serviceResult.initialData as Record<string, unknown> | undefined
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      if (!pageId || !path) throw new Error('redirectTo did not create a renderable page')
      if (renderConnector) {
        for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
        const renderResult = await openRenderPage(pageId, path, initialData)
        await service.control('page', 'ready', {
          pageId,
          components: renderResult.components,
        })
      } else {
        const renderResult = await requireRenderConnection().control<{
          pageId?: string
          components?: unknown[]
        }>('page', 'redirectTo', {
          path,
          pageId,
          initialData,
          previousPageId: context.pageId,
          unloadedPageIds,
        })
        await service.control('page', 'ready', {
          pageId,
          components: renderResult.components,
        })
      }
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['navigate.reLaunch']) {
    apiRegistry.handlers['navigate.reLaunch'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'reLaunch', {
        url: params.url,
      }, { pageId: context.pageId })
      const pageId = serviceResult.pageId as string | undefined
      const path = serviceResult.path as string | undefined
      const initialData = serviceResult.initialData as Record<string, unknown> | undefined
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      if (!pageId || !path) throw new Error('reLaunch did not create a renderable page')
      if (renderConnector) {
        for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
        const renderResult = await openRenderPage(pageId, path, initialData)
        await service.control('page', 'ready', {
          pageId,
          components: renderResult.components,
        })
      } else {
        const renderResult = await requireRenderConnection().control<{
          pageId?: string
          components?: unknown[]
        }>('page', 'reLaunch', {
          path,
          pageId,
          initialData,
          previousPageId: context.pageId,
          unloadedPageIds,
        })
        await service.control('page', 'ready', {
          pageId,
          components: renderResult.components,
        })
      }
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['page.pullDownRefresh']) {
    apiRegistry.handlers['page.pullDownRefresh'] = async (_params, context) => (
      service.control('page', 'pullDownRefresh', {}, { pageId: context.pageId })
    )
  }
  if (!options.apiHandlers?.['page.stopPullDownRefresh']) {
    apiRegistry.handlers['page.stopPullDownRefresh'] = () => ({ status: 'stopped' })
  }
  registerHostApiHandlers(service, apiRegistry)
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.flow, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.flow, message.payload, message.pageId)
  })
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.snapshot, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.snapshot, message.payload, message.pageId)
  })
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.patch, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.patch, message.payload, message.pageId)
  })
  service.onCall(CANVAS_CONTROL.domain, CANVAS_CONTROL.measure, (message) => {
    const connection = getRenderConnection(message.pageId)
    if (!connection) return { width: 0, height: 0 }
    return connection.control(CANVAS_CONTROL.domain, CANVAS_CONTROL.measure, message.payload, { pageId: message.pageId })
  })
  service.onCall(QUERY_CONTROL.domain, QUERY_CONTROL.select, (message) => {
    const connection = getRenderConnection(message.pageId)
    if (!connection) return { nodes: [] }
    return connection.control(QUERY_CONTROL.domain, QUERY_CONTROL.select, message.payload, { pageId: message.pageId })
  })
  service.onCall(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
    const connection = getRenderConnection(message.pageId)
    if (!connection) return { status: 'missing-render' }
    return connection.control(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, message.payload, { pageId: message.pageId })
  })

  return {
    service,
    get render() {
      return requireRenderConnection()
    },
    apiRegistry,
    get diagnostics() {
      return diagnosticStore.diagnostics
    },
    pullDownRefresh() {
      return service.control('page', 'pullDownRefresh', {}, { pageId: activePageId })
    },
    share(type: 'appMessage' | 'timeline' | 'favorites' = 'appMessage') {
      return service.control('page', 'share', { type }, { pageId: activePageId })
    },
    saveExitState() {
      return service.control('page', 'saveExitState', {}, { pageId: activePageId })
    },
    setTheme(theme: 'light' | 'dark') {
      return service.control('runtime', 'themeChange', { theme }, { pageId: activePageId })
    },
    async bootstrap() {
      const serviceResult = await service.control<Record<string, unknown>>(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, {
        manifest: options.manifest,
        initialPath: options.initialPath,
        systemInfo: apiRegistry.systemInfo,
        storage: apiRegistry.storage,
        ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
      })
      const initialData = (serviceResult.initialData as Record<string, unknown> | undefined) ?? options.initialData
      const pageId = serviceResult.pageId as string | undefined
      componentSchemas = (serviceResult.componentSchemas as MiniProgramComponentSchema[] | undefined) ?? []
      pageComponents = (serviceResult.pageComponents as Array<{ path: string; options?: unknown }> | undefined) ?? []
      let renderResult: RenderPageResult
      if (renderConnector) {
        if (!pageId) throw new Error('service bootstrap did not create a page')
        renderResult = await openRenderPage(
          pageId,
          (serviceResult.currentPath as string | undefined) ?? options.initialPath,
          initialData,
        )
      } else {
        renderResult = await requireRenderConnection().control<RenderPageResult>(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, {
          manifest: options.manifest,
          initialPath: options.initialPath,
          initialData,
          pageId,
          componentSchemas,
          pageComponents,
        })
      }
      if (pageId) {
        await service.control('page', 'ready', {
          pageId,
          components: renderResult.components,
        })
      }
      return { service: serviceResult, render: renderResult }
    },
    async inspectTree(pageId?: string) {
      const connection = requireRenderConnection(pageId)
      return connection.control(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.inspectTree, { pageId })
    },
    async setWindowSize(width: number, height: number) {
      await service.control(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.resize, {
        windowWidth: width,
        windowHeight: height,
      })
    },
    setAppVisible(visible: boolean) {
      renderConnector?.setAppVisible?.(visible)
    },
    async close() {
      const sessions = [...renderSessions.entries()]
      renderSessions.clear()
      pendingRenderEvents.clear()
      await Promise.all(sessions.map(async ([pageId, connection]) => {
        try {
          await connection.close()
        } catch {
          // Ignore already-closed transports.
        }
        try {
          await renderConnector?.disconnect(pageId)
        } catch {
          // Frame teardown is best effort.
        }
      }))
      if (primaryRender) await primaryRender.close()
      await service.close()
    },
  }
}

function requireRenderTransport(options: RuntimeHostOptions): import('@tiny/bridge').Transport {
  if (!options.renderTransport) {
    throw new Error('createTinyRuntime requires renderTransport or renderConnector')
  }
  return options.renderTransport
}
