/**
 * View-description contract between the service-side logic tree and the render
 * thread. This is intentionally host-independent: a DOM renderer, a native
 * renderer and tests consume the same nodes.
 *
 * Typed values never cross this boundary. The logic layer keeps typed dataset
 * values for query/observer projections; the view only receives the serialized
 * attribute strings it needs to render.
 */

export type ViewNodeId = string

export type ViewIntersectionEntry = {
  viewId: ViewNodeId
  boundingClientRect: ViewRect
  intersectionRect: ViewRect
  relativeRect: ViewRect
  intersectionRatio: number
  time: number
}

export type ViewIntersectionRequest = {
  observerId: string
  viewIds: ViewNodeId[]
  rootViewId?: ViewNodeId
  thresholds?: number[]
  rootMargin?: { left?: number; right?: number; top?: number; bottom?: number }
}

export type ViewRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export type ViewEventBinding = {
  /** Mini-program event name (`tap`, `input`, ...). */
  name: string
  /** Handler name on the owning page/component logic instance. */
  handler?: string
  catch?: boolean
  capture?: boolean
  mut?: boolean
}

export type ViewNode = {
  viewId: ViewNodeId
  tag: string
  /** Text node content; mutually exclusive with children. */
  text?: string
  /** Serialized DOM attributes (including `data-*`). */
  attributes?: Record<string, string>
  className?: string
  /** Host-neutral style scope names; the host decides how to apply them. */
  styleScopes?: string[]
  style?: string
  /** Serialized dataset attributes for the view; typed values stay service-side. */
  dataset?: Record<string, string>
  events?: ViewEventBinding[]
  /** Present when the node is backed by a mini-program custom component. */
  component?: {
    path: string
    componentId: string
  }
  children?: ViewNode[]
}

/**
 * Host-provided view adapter for a built-in tag. The view thread creates the
 * semantic host element, then delegates internal structure and updates to the
 * adapter. The kernel never knows what a web/native `image` looks like.
 */
export type BuiltinViewAdapter<TElement = unknown> = {
  /** Create the host element (e.g. mount a real glass-easel built-in). */
  create?: (view: ViewNode) => TElement
  /** Decorate an already-created semantic host element. */
  decorate?: (host: TElement) => void
  update?: (host: TElement) => void
  /** Link a created host into its parent host (for glass component trees). */
  attach?: (host: TElement, parent: TElement) => void
  destroy?: (host: TElement) => void
}

export type ViewSnapshot = {
  pageId: string
  revision: number
  root: ViewNode
}

/**
 * Incremental view updates. Phase 2 starts with snapshots and adds patches
 * before the logic layer becomes the default.
 */
export type ViewPatch =
  | { type: 'insert'; parentId: ViewNodeId; index: number; node: ViewNode }
  | { type: 'remove'; parentId: ViewNodeId; index: number; count?: number }
  | { type: 'move'; parentId: ViewNodeId; from: number; to: number; count?: number }
  | { type: 'text'; viewId: ViewNodeId; text: string }
  | { type: 'attribute'; viewId: ViewNodeId; name: string; value: string | null }
  | { type: 'class'; viewId: ViewNodeId; className: string; styleScopes?: string[] }
  | { type: 'style'; viewId: ViewNodeId; style: string }
  | { type: 'dataset'; viewId: ViewNodeId; dataset: Record<string, string> }
  | { type: 'events'; viewId: ViewNodeId; events: ViewEventBinding[] }

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
