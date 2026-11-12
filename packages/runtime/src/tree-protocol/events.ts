import type { RenderNodeId } from './nodes'

export type RenderRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export type RenderIntersectionRequest = {
  observerId: string
  viewIds: RenderNodeId[]
  rootViewId?: RenderNodeId
  thresholds?: number[]
  rootMargin?: { left?: number; right?: number; top?: number; bottom?: number }
}

export type RenderIntersectionEntry = {
  viewId: RenderNodeId
  boundingClientRect: RenderRect
  intersectionRect: RenderRect
  relativeRect: RenderRect
  intersectionRatio: number
  time: number
}

/**
 * Layout geometry of the node that produced (or is handling) an event.
 * WeChat exposes it as `event.target.offsetLeft` / `event.currentTarget.offsetTop`
 * and drag/gesture libraries read it synchronously inside the handler.
 */
export type RenderEventGeometry = {
  viewId: RenderNodeId
  offsetLeft: number
  offsetTop: number
  offsetWidth: number
  offsetHeight: number
}

/**
 * Event forwarded from a template-declared handler inside a component whose
 * shadow tree was evaluated by the render thread. The service owns the method
 * table, so the render side only reports who fired and what the payload was.
 */
export type RenderTemplateEvent = {
  /** Service node id of the owning component instance. */
  componentId: string
  /** Method name the template bound (`bindtap="onTap"` -> `onTap`). */
  handler: string
  /** DOM event type (`tap`, `touchstart`, ...). */
  name: string
  detail?: unknown
  touches?: unknown[]
  changedTouches?: unknown[]
  id?: string
  dataset?: Record<string, unknown>
  currentTarget?: RenderEventGeometry
  /** Render identity of the innermost event target. */
  targetId?: string
  target?: RenderEventGeometry
}

/**
 * Render-initiated host command. Built-in components such as `<navigator>` own
 * behaviour the page never binds (a tap navigates), so the render tree asks the
 * host to run the equivalent host API instead of synthesising a page event.
 */
export type RenderHostAction =
  | { action: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'; url: string }
  | { action: 'navigateBack'; delta?: number }
  | { action: 'exit' }
