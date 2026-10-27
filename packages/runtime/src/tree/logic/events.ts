/**
 * Event, query and intersection payloads shared by the service logic tree and
 * the host. Render nodes themselves are defined by `tree/protocol`.
 */

export type ViewNodeId = string

import type { RenderIntersectionEntry, RenderRect } from '../protocol'

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
}
