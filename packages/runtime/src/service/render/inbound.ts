import type { BridgeConnection, ProtocolMessage } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { LogicTreeAdapter, ViewEventPayload, ViewIntersectionEntry } from '../../tree/logic'
import { QUERY_CONTROL, TREE_PROTOCOL } from '../../tree/protocol'

export type RenderWxsEffect = {
  kind: 'callMethod' | 'triggerEvent'
  viewId: string
  method?: string
  args?: unknown[]
  name?: string
  detail?: unknown
  options?: Record<string, unknown>
}

/**
 * Host surface the inbound router needs from the service render bridge.
 *
 * Keeping it callback-based means the router owns protocol parsing and
 * diagnostics while the bridge keeps the logic-tree and WXS state.
 */
export type RenderInboundHost = {
  getLogicTree: () => LogicTreeAdapter | null
  isMounted: (pageId: string) => boolean
  sendSnapshot: (pageId: string) => void
  reportError: (message: string) => void
  dispatchWxsEffect: (pageId: string, effect: RenderWxsEffect) => void
}

/**
 * Route render-thread events back into the service logic tree.
 *
 * This module is deliberately outbound-free: all messages here originate from
 * the render thread (`tree.event`, `tree.templateEvent`, `tree.wxsEffect`,
 * `tree.ready`, `query.intersection`). The bridge keeps the outbound flow/patch
 * projection; this file keeps the inbound protocol details.
 */
export function attachRenderInbound(
  connection: BridgeConnection,
  host: RenderInboundHost,
): void {
  connection.onEvent(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
    const payload = (message.payload ?? {}) as {
      observerId?: string
      entries?: ViewIntersectionEntry[]
    }
    const tree = host.getLogicTree()
    if (!tree || !payload.observerId || !payload.entries) return
    tree.handleViewIntersection(payload.observerId, payload.entries)
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.templateEvent, (message) => {
    handleTemplateEvent(connection, host, message)
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, (message) => {
    handleViewEvent(connection, host, message)
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsEffect, (message) => {
    handleWxsEffect(connection, host, message)
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.ready, (message) => {
    if (!host.getLogicTree() || !message.pageId || !host.isMounted(message.pageId)) return
    host.sendSnapshot(message.pageId)
  })
}

function handleTemplateEvent(
  connection: BridgeConnection,
  host: RenderInboundHost,
  message: ProtocolMessage,
): void {
  const tree = host.getLogicTree()
  if (!tree) return
  const payload = (message.payload ?? {}) as {
    pageId?: string
    componentId?: string
    handler?: string
    name?: string
    detail?: unknown
    touches?: unknown[]
    changedTouches?: unknown[]
    id?: string
    dataset?: Record<string, unknown>
    currentTarget?: {
      offsetLeft?: number
      offsetTop?: number
      offsetWidth?: number
      offsetHeight?: number
    }
  }
  if (!payload.componentId || !payload.handler) return
  try {
    tree.dispatchTemplateHandler({
      pageId: message.pageId ?? payload.pageId,
      componentId: payload.componentId,
      handler: payload.handler,
      name: payload.name ?? '',
      ...(payload.detail !== undefined ? { detail: payload.detail } : {}),
      ...(payload.touches ? { touches: payload.touches } : {}),
      ...(payload.changedTouches ? { changedTouches: payload.changedTouches } : {}),
      ...(payload.id ? { id: payload.id } : {}),
      ...(payload.dataset ? { dataset: payload.dataset } : {}),
      ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
    })
  } catch (error) {
    connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
      message: error instanceof Error ? error.message : String(error),
      details: { handler: payload.handler, componentId: payload.componentId },
    }, message.pageId)
  }
}

function handleViewEvent(
  connection: BridgeConnection,
  host: RenderInboundHost,
  message: ProtocolMessage,
): void {
  const tree = host.getLogicTree()
  if (!tree) return
  const payload = (message.payload ?? {}) as {
    id?: string
    name?: string
    detail?: unknown
    native?: Record<string, unknown>
    touches?: unknown[]
    changedTouches?: unknown[]
    target?: ViewEventPayload['target']
    currentTarget?: ViewEventPayload['currentTarget']
    wxsHandled?: boolean
  }
  if (!payload.id || !payload.name) return
  try {
    tree.dispatchViewEvent({
      viewId: payload.id,
      name: payload.name,
      pageId: message.pageId,
      detail: payload.detail,
      native: payload.native,
      touches: payload.touches,
      changedTouches: payload.changedTouches,
      ...(payload.target ? { target: payload.target } : {}),
      ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
      ...(payload.wxsHandled ? { wxsHandled: true } : {}),
    })
  } catch (error) {
    const description = error instanceof Error ? error.message : String(error)
    host.reportError(
      error instanceof Error && error.stack
        ? `${description}\n${error.stack}`
        : description,
    )
    connection.sendDiagnostic('error', {
      code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
      message: description,
      handler: payload.name,
      stack: error instanceof Error ? error.stack : undefined,
    }, message.pageId)
  }
}

function handleWxsEffect(
  connection: BridgeConnection,
  host: RenderInboundHost,
  message: ProtocolMessage,
): void {
  const effect = (message.payload ?? {}) as {
    kind?: 'callMethod' | 'triggerEvent'
    viewId?: string
    method?: string
    args?: unknown[]
    name?: string
    detail?: unknown
    options?: Record<string, unknown>
  }
  if (!effect.kind || !effect.viewId) return
  try {
    host.dispatchWxsEffect(message.pageId ?? '', {
      kind: effect.kind,
      viewId: effect.viewId,
      ...(effect.method ? { method: effect.method } : {}),
      ...(effect.args ? { args: effect.args } : {}),
      ...(effect.name ? { name: effect.name } : {}),
      ...(effect.detail !== undefined ? { detail: effect.detail } : {}),
      ...(effect.options ? { options: effect.options } : {}),
    })
  } catch (error) {
    connection.sendDiagnostic('warn', {
      code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
      message: error instanceof Error ? error.message : String(error),
    }, message.pageId)
  }
}
