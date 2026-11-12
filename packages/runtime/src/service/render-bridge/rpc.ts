import type { BridgeConnection } from '@tiny/bridge'
import type { QueryViewResult } from '../logic-tree/query'
import type { ViewRect } from '../logic-tree/events'
import type { LogicTreeAdapterOptions } from '../logic-tree/adapter'
import { QUERY_CONTROL, TREE_PROTOCOL } from '../../tree-protocol/protocol'

export type RenderRpc = Pick<
  LogicTreeAdapterOptions,
  'measureView' | 'measureLocators' | 'queryView' | 'viewIntersection' | 'viewAnimation'
>

/**
 * Service-to-render RPC adapters used by the logic tree.
 *
 * Geometry, selector queries, intersection observers and animations are
 * resolved in the render tree. Keeping the connection plumbing here lets the
 * bridge stay focused on projection/lifecycle, and lets tests substitute a
 * smaller facade around the logic tree.
 */
export function createRenderRpc(connection: BridgeConnection): RenderRpc {
  return {
    // Render-side geometry: `measure` addresses nodes by their shared id;
    // `queryView` covers nodes inside an evaluated component shadow tree,
    // which only exist in the render DOM.
    measureView: async (viewIds) => {
      if (viewIds.length === 0) return {}
      try {
        const result = await connection.call(
          TREE_PROTOCOL.domain,
          TREE_PROTOCOL.measure,
          { ids: viewIds },
        )
        return (result ?? {}) as Record<string, ViewRect>
      } catch {
        return {}
      }
    },
    measureLocators: async (locators) => {
      if (locators.length === 0) return {}
      try {
        const result = await connection.call(
          TREE_PROTOCOL.domain,
          TREE_PROTOCOL.measure,
          { locators },
        )
        return (result ?? {}) as Record<string, ViewRect>
      } catch {
        return {}
      }
    },
    queryView: async (request) => {
      try {
        const result = await connection.call(
          QUERY_CONTROL.domain,
          QUERY_CONTROL.select,
          {
            selector: request.selector,
            all: request.all,
            ...(request.scopeId ? { scopeId: request.scopeId } : {}),
          },
          request.pageId ? { pageId: request.pageId } : undefined,
        )
        return ((result ?? {}) as { nodes?: QueryViewResult }).nodes ?? []
      } catch {
        return []
      }
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
      // Fire-and-forget: playback is render-owned, the service keeps only the
      // completion callback it scheduled for the caller.
      play: (request) => {
        connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.animate, {
          viewIds: request.viewIds,
          keyframes: request.keyframes,
          duration: request.duration,
          ...(request.delay !== undefined ? { delay: request.delay } : {}),
          ...(request.easing !== undefined ? { easing: request.easing } : {}),
          ...(request.iterations !== undefined ? { iterations: request.iterations } : {}),
          ...(request.fill !== undefined ? { fill: request.fill } : {}),
          ...(request.scroll !== undefined ? { scroll: request.scroll } : {}),
          ...(request.selector !== undefined ? { selector: request.selector } : {}),
          ...(request.scopeId !== undefined ? { scopeId: request.scopeId } : {}),
        }, { pageId: request.pageId })
      },
      clear: (request) => {
        connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.clearAnimate, {
          viewIds: request.viewIds,
          ...(request.properties ? { properties: request.properties } : {}),
          ...(request.selector !== undefined ? { selector: request.selector } : {}),
          ...(request.scopeId !== undefined ? { scopeId: request.scopeId } : {}),
        }, { pageId: request.pageId })
      },
    },
  }
}
