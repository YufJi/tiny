import type { BridgeConnection, ProtocolMessage } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { LogicTreeAdapter } from '../logic-tree/adapter'
import type {
  ViewEventPayload,
  ViewIntersectionEntry,
} from '../logic-tree/events'
import {
  QUERY_CONTROL,
  TREE_PROTOCOL,
  type RenderEventTarget,
} from '../../tree-protocol/protocol'

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
  /** Re-send the page flow so definitions that arrived late are applied. */
  sendFlow: (pageId: string) => void
  /** Run component `ready` callbacks once the pageframe mounted the page. */
  flushPageReady: (pageId: string) => void
  reportError: (message: string) => void
  dispatchWxsEffect: (pageId: string, effect: RenderWxsEffect) => void
  /** The render thread reflected a batch; run its `setData` completions. */
  acknowledgeRenders: (tokens: string[]) => void
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
    // The host core emits this after a page finished. Re-sending the flow is
    // what lets a lazily loaded package swap its placeholder for the real
    // component (the flow carries the now-registered definitions).
    host.sendFlow(message.pageId)
  })
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.pageReady, (message) => {
    if (!host.getLogicTree() || !message.pageId || !host.isMounted(message.pageId)) return
    host.flushPageReady(message.pageId)
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.ack, (message) => {
    const payload = (message.payload ?? {}) as { tokens?: unknown }
    const tokens = Array.isArray(payload.tokens)
      ? payload.tokens.filter((token): token is string => typeof token === 'string')
      : []
    if (tokens.length === 0) return
    host.acknowledgeRenders(tokens)
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
    mark?: Record<string, unknown>
    targetId?: string
    targetNode?: RenderEventTarget
    eventToken?: string
    currentTarget?: {
      offsetLeft?: number
      offsetTop?: number
      offsetWidth?: number
      offsetHeight?: number
    }
    target?: {
      offsetLeft?: number
      offsetTop?: number
      offsetWidth?: number
      offsetHeight?: number
    }
  }
  if (!payload.componentId || !payload.handler) return
  try {
    const handled = tree.dispatchTemplateHandler({
      pageId: message.pageId ?? payload.pageId,
      componentId: payload.componentId,
      handler: payload.handler,
      name: payload.name ?? '',
      ...(payload.detail !== undefined ? { detail: payload.detail } : {}),
      ...(payload.touches ? { touches: payload.touches } : {}),
      ...(payload.changedTouches ? { changedTouches: payload.changedTouches } : {}),
      ...(payload.id ? { id: payload.id } : {}),
      ...(payload.dataset ? { dataset: payload.dataset } : {}),
      ...(payload.mark ? { mark: payload.mark } : {}),
      ...(payload.targetId ? { targetId: payload.targetId } : {}),
      ...(payload.targetNode ? { targetNode: payload.targetNode } : {}),
      ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
      ...(payload.target ? { target: payload.target } : {}),
    }, (result) => {
      if (
        !payload.eventToken
        || result === undefined
        || result === null
      ) return
      connection.sendEvent(
        TREE_PROTOCOL.domain,
        TREE_PROTOCOL.eventReturn,
        {
          eventToken: payload.eventToken,
          result,
          ...(message.pageId ? { pageId: message.pageId } : {}),
        },
        message.pageId ? { pageId: message.pageId } : {},
      )
    })
    if (!handled) {
      connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.EVENT_HANDLER_MISSING,
        message: `template handler is not registered: ${payload.handler}`,
        details: {
          componentId: payload.componentId,
          handler: payload.handler,
          event: payload.name ?? '',
        },
      }, message.pageId)
    }
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
    targetId?: string
    name?: string
    detail?: unknown
    touches?: unknown[]
    changedTouches?: unknown[]
    target?: ViewEventPayload['target']
    currentTarget?: ViewEventPayload['currentTarget']
    wxsHandled?: boolean
    eventToken?: string
  }
  if (!payload.id || !payload.name) return
  try {
    tree.dispatchViewEvent({
      viewId: payload.id,
      ...(payload.targetId ? { targetId: payload.targetId } : {}),
      name: payload.name,
      pageId: message.pageId,
      detail: payload.detail,
      touches: payload.touches,
      changedTouches: payload.changedTouches,
      ...(payload.target ? { target: payload.target } : {}),
      ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
      ...(payload.wxsHandled ? { wxsHandled: true } : {}),
      ...(payload.eventToken ? { eventToken: payload.eventToken } : {}),
    }, (result) => {
      if (
        !payload.eventToken
        || result === undefined
        || result === null
      ) return
      connection.sendEvent(
        TREE_PROTOCOL.domain,
        TREE_PROTOCOL.eventReturn,
        {
          eventToken: payload.eventToken,
          result,
          ...(message.pageId ? { pageId: message.pageId } : {}),
        },
        message.pageId ? { pageId: message.pageId } : {},
      )
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
