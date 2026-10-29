import { BridgeConnection } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import { CANVAS_CONTROL, QUERY_CONTROL, RUNTIME_CONTROL, TREE_PROTOCOL } from '../tree/protocol'
import type { RuntimeHostOptions } from '../types'
import { createHostApiRegistry, registerHostApiHandlers } from './api'
import type { HostApiRegistry } from './api'
import { createHostDiagnosticStore, registerHostDiagnosticHandlers } from './diagnostics'
import type { RuntimeDiagnostic } from '../diagnostics'
import type { RenderHostAction } from '../tree/protocol'

export type TinyRuntimeHost = {
  service: BridgeConnection
  bootstrap(): Promise<{ service: unknown; render: unknown }>
  close(): Promise<void>
  /** Inspect one page. */
  inspectTree(pageId: string): Promise<unknown>
  /** Update the host window snapshot and deliver `onResize` to the active page. */
  setWindowSize(width: number, height: number): Promise<void>
  /** Hide/show every render page view when the app enters the background. */
  setAppVisible(visible: boolean): void
  /** Trigger one page's pull-down lifecycle (host gesture or API). */
  pullDownRefresh(pageId: string): Promise<unknown>
  /** Ask one page for share information. */
  share(pageId: string, type?: 'appMessage' | 'timeline' | 'favorites'): Promise<unknown>
  /** Invoke one page's `onSaveExitState` and return its state. */
  saveExitState(pageId: string): Promise<unknown>
  /** Deliver a host theme change; the service routes it to `wx.onThemeChange`. */
  setTheme(theme: 'light' | 'dark', pageId: string): Promise<unknown>
  apiRegistry: HostApiRegistry
  diagnostics: RuntimeDiagnostic[]
}

type PendingRenderEvent = {
  domain: 'tree'
  method: string
  payload: unknown
}

type RenderPageResult = {
  pageId: string
  status?: string
  currentPath?: string
}

/** Page lifecycle facts that only the render document (the page's WebView) can observe. */
const RENDER_PAGE_EVENTS = ['scroll', 'reachBottom', 'pullDownRefresh'] as const

/**
 * Owns the host side of the bridge.
 *
 * The two ports are deliberately asymmetric because the threads they attach
 * have different lifetimes:
 *
 * - `serviceTransport` is one long-lived connection: an app has exactly one
 *   service thread, alive for as long as the app runs.
 * - `renderConnector` is a factory because a page stack needs one render thread
 *   per page. The runtime decides *when* a page thread is created, shown or
 *   torn down (it is the only party that sees the service route result), while
 *   the host implements *how* (`connect` / `activate` / `disconnect` /
 *   `setAppVisible` are iframe or surface operations).
 *
 * Hidden pages keep their DOM, scroll position and timers exactly like a
 * WebView stack. All page-scoped messages are routed through the page ID; there
 * is no second "single render connection" mode.
 */
export function createTinyRuntime(options: RuntimeHostOptions): TinyRuntimeHost {
  const service = new BridgeConnection({
    localRole: 'host',
    peerRole: 'service',
    transport: options.serviceTransport,
    respondToHello: false,
  })
  const renderConnector = options.renderConnector
  const diagnosticStore = createHostDiagnosticStore(options)
  registerHostDiagnosticHandlers(service, 'service', diagnosticStore)
  const apiRegistry = createHostApiRegistry(options)
  const renderSessions = new Map<string, BridgeConnection>()
  /**
   * Tree messages for a page whose render thread does not exist yet. The
   * service mounts a page and emits its first flow *inside* its bootstrap
   * control, which the host only answers by opening the page afterwards, so a
   * short-lived parking lot is part of the protocol. Entries are flushed when
   * the page opens and dropped when it closes.
   */
  const pendingRenderEvents = new Map<string, PendingRenderEvent[]>()
  const PENDING_PAGE_LIMIT = 16

  const getRenderConnection = (pageId: string | undefined): BridgeConnection | null => {
    if (!pageId) return null
    return renderSessions.get(pageId) ?? null
  }

  const requireRenderConnection = (pageId: string): BridgeConnection => {
    const connection = getRenderConnection(pageId)
    if (!connection) throw new Error(`render thread is not connected for page ${pageId}`)
    return connection
  }

  /** A page-scoped message that can never be delivered is a routing bug. */
  const reportMissingRender = (
    pageId: string | undefined,
    method: string,
    reason: 'missing-page-id' | 'queue-overflow',
  ): void => {
    diagnosticStore.record({
      severity: 'warning',
      code: DIAGNOSTIC_CODES.RENDER_SESSION_MISSING,
      message: reason === 'missing-page-id'
        ? `page-scoped message without a page id (${method})`
        : `dropped ${method} for page ${pageId}: more than ${PENDING_PAGE_LIMIT} pages are waiting for a render thread`,
      source: 'host',
      timestamp: Date.now(),
      ...(pageId ? { pageId } : {}),
      details: { method, pageId: pageId ?? null, reason },
    })
  }

  const flushRenderEvents = (pageId: string, connection: BridgeConnection): void => {
    const pending = pendingRenderEvents.get(pageId)
    if (!pending) return
    pendingRenderEvents.delete(pageId)
    for (const event of pending) {
      connection.sendEvent(event.domain, event.method, event.payload, { pageId })
    }
  }

  /**
   * Built-in tags that navigate on their own (`<navigator>`) send a host action
   * from the render thread; run it through the same handlers `wx.*` uses so the
   * page stack, render page lifecycle and diagnostics stay identical.
   */
  const runRenderHostAction = (pageId: string | undefined, raw: unknown): unknown => {
    const payload = (raw ?? {}) as Partial<RenderHostAction> & { action?: string }
    const context = { pageId }
    switch (payload.action) {
      case 'navigateTo':
        return apiRegistry.handlers['navigate.to']?.({ url: payload.url ?? '' }, context)
      case 'redirectTo':
        return apiRegistry.handlers['navigate.redirectTo']?.({ url: payload.url ?? '' }, context)
      case 'switchTab':
        return apiRegistry.handlers['navigate.switchTab']?.({ url: payload.url ?? '' }, context)
      case 'reLaunch':
        return apiRegistry.handlers['navigate.reLaunch']?.({ url: payload.url ?? '' }, context)
      case 'navigateBack':
        return apiRegistry.handlers['navigate.back']?.(
          { delta: (payload as { delta?: number }).delta ?? 1 },
          context,
        )
      case 'exit':
        // A browser host has nothing to exit; keeping the app mounted is the
        // honest behaviour and matches `wx.exitMiniProgram` diagnostics.
        return { errMsg: 'exitMiniProgram:fail not supported by the browser host' }
      default:
        return undefined
    }
  }

  const wireRenderConnection = (connection: BridgeConnection, pageId: string) => {
    registerHostDiagnosticHandlers(connection, 'render', diagnosticStore)
    connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, (message) => {
      service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, message.payload, { pageId: message.pageId ?? pageId })
    })
    connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.hostAction, (message) => {
      void runRenderHostAction(message.pageId ?? pageId, message.payload)
    })
    connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsEffect, (message) => {
      service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsEffect, message.payload, {
        pageId: message.pageId ?? pageId,
      })
    })
    connection.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
      service.sendEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, message.payload, {
        pageId: message.pageId ?? pageId,
      })
    })
    // The render document owns the page's scroll container, so it is the only
    // thread that can report page scroll, reach-bottom and pull-down gestures.
    for (const method of RENDER_PAGE_EVENTS) {
      connection.onEvent('page', method, (message) => {
        service.sendEvent('page', method, message.payload, { pageId: message.pageId ?? pageId })
      })
    }
  }

  const closeRenderPage = async (pageId: string) => {
    const connection = renderSessions.get(pageId)
    renderSessions.delete(pageId)
    pendingRenderEvents.delete(pageId)
    if (connection) {
      try {
        await connection.close()
      } catch {
        // The render document may already be gone.
      }
    }
    try {
      await renderConnector.disconnect(pageId)
    } catch {
      // Frame teardown is best effort.
    }
  }

  const openRenderPage = async (
    pageId: string,
    path: string,
    initialData?: Record<string, unknown>,
  ): Promise<RenderPageResult> => {
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
        initialPath: path,
        pageId,
      })
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
    domain: 'tree',
    method: string,
    payload: unknown,
    pageId?: string,
  ) => {
    if (!pageId) {
      reportMissingRender(undefined, `tree.${method}`, 'missing-page-id')
      return
    }
    const connection = getRenderConnection(pageId)
    if (connection) {
      connection.sendEvent(domain, method, payload, { pageId })
      return
    }
    const pending = pendingRenderEvents.get(pageId)
    if (!pending && pendingRenderEvents.size >= PENDING_PAGE_LIMIT) {
      reportMissingRender(pageId, `tree.${method}`, 'queue-overflow')
      return
    }
    const queue = pending ?? []
    queue.push({ domain, method, payload })
    pendingRenderEvents.set(pageId, queue)
  }

  if (!options.apiHandlers?.['navigate.to']) {
    apiRegistry.handlers['navigate.to'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'navigateTo', {
        url: params.url,
      }, { pageId: context.pageId })
      const pageId = serviceResult.pageId as string | undefined
      const path = serviceResult.path as string | undefined
      if (!pageId || !path) throw new Error('navigateTo did not create a renderable page')
      try {
        await openRenderPage(
          pageId,
          path,
          serviceResult.initialData as Record<string, unknown> | undefined,
        )
        await service.control('page', 'ready', { pageId })
      } catch (error) {
        // Keep the service stack consistent when the new page cannot render.
        await service.control('page', 'navigateBack', { delta: 1 }).catch(() => {})
        throw error
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
      if (!pageId || !path) throw new Error('switchTab did not create a renderable page')
      for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
      if (serviceResult.created === true) {
        await openRenderPage(
          pageId,
          path,
          serviceResult.initialData as Record<string, unknown> | undefined,
        )
        await service.control('page', 'ready', { pageId })
        return serviceResult
      }
      // A cached tab page keeps its render thread; only visibility moves.
      if (previousPageId !== pageId) renderConnector.activate?.(pageId)
      return serviceResult
    }
  }
  if (!options.apiHandlers?.['navigate.back']) {
    apiRegistry.handlers['navigate.back'] = async (params, context) => {
      const serviceResult = await service.control<Record<string, unknown>>('page', 'navigateBack', {
        delta: params.delta ?? 1,
      }, { pageId: context.pageId })
      const pageId = serviceResult.pageId as string | undefined
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
      if (pageId) renderConnector.activate?.(pageId)
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
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      if (!pageId || !path) throw new Error('redirectTo did not create a renderable page')
      for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
      await openRenderPage(
        pageId,
        path,
        serviceResult.initialData as Record<string, unknown> | undefined,
      )
      await service.control('page', 'ready', { pageId })
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
      const unloadedPageIds = (serviceResult.unloadedPageIds as string[] | undefined) ?? []
      if (!pageId || !path) throw new Error('reLaunch did not create a renderable page')
      for (const unloadedPageId of unloadedPageIds) await closeRenderPage(unloadedPageId)
      await openRenderPage(
        pageId,
        path,
        serviceResult.initialData as Record<string, unknown> | undefined,
      )
      await service.control('page', 'ready', { pageId })
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
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsBinding, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsBinding, message.payload, message.pageId)
  })
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.animate, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.animate, message.payload, message.pageId)
  })
  service.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.clearAnimate, (message) => {
    routeServiceEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.clearAnimate, message.payload, message.pageId)
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
    apiRegistry,
    get diagnostics() {
      return diagnosticStore.diagnostics
    },
    pullDownRefresh(pageId: string) {
      return service.control('page', 'pullDownRefresh', {}, { pageId })
    },
    share(pageId: string, type: 'appMessage' | 'timeline' | 'favorites' = 'appMessage') {
      return service.control('page', 'share', { type }, { pageId })
    },
    saveExitState(pageId: string) {
      return service.control('page', 'saveExitState', {}, { pageId })
    },
    setTheme(theme: 'light' | 'dark', pageId: string) {
      return service.control('runtime', 'themeChange', { theme }, { pageId })
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
      if (!pageId) throw new Error('service bootstrap did not create a page')
      const renderResult = await openRenderPage(
        pageId,
        (serviceResult.currentPath as string | undefined) ?? options.initialPath,
        initialData,
      )
      await service.control('page', 'ready', { pageId })
      return { service: serviceResult, render: renderResult }
    },
    async inspectTree(pageId: string) {
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
      renderConnector.setAppVisible?.(visible)
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
          await renderConnector.disconnect(pageId)
        } catch {
          // Frame teardown is best effort.
        }
      }))
      await service.close()
    },
  }
}
