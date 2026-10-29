/**
 * Event, query and intersection payloads shared by the service logic tree and
 * the host. Render nodes themselves are defined by `tree/protocol`.
 */

export type ViewNodeId = string

import type { RenderEventGeometry, RenderIntersectionEntry, RenderRect } from '../protocol'

export type ViewIntersectionEntry = RenderIntersectionEntry

export type ViewIntersectionRequest = {
  observerId: string
  viewIds: ViewNodeId[]
  rootViewId?: ViewNodeId
  thresholds?: number[]
  rootMargin?: { left?: number; right?: number; top?: number; bottom?: number }
}

export type ViewRect = RenderRect

export type ViewEventPayload = {
  viewId: ViewNodeId
  name: string
  pageId?: string
  detail?: unknown
  touches?: unknown[]
  changedTouches?: unknown[]
  /** Native fields a host may forward (coordinates, key, input value, ...). */
  native?: Record<string, unknown>
  /** Layout geometry of the innermost node the host resolved. */
  target?: RenderEventGeometry
  /** Layout geometry of the node owning the binding being dispatched. */
  currentTarget?: RenderEventGeometry
  /** Set when render already ran a local WXS handler for this event. */
  wxsHandled?: boolean
}
