import type * as glassEasel from 'glass-easel'
import { createMouseAdapter, createTouchAdapter } from './adapters'
import { createGestureRecognizer } from './recognizer'
import type {
  CompositorOptions,
  GestureEvent,
  InputEvent,
  InputPhase,
  InputPoint,
  TouchProjection,
  TouchProjectionName,
  TouchProjectionPoint,
} from './types'

/** Browsers replay mouse events after a touch sequence; ignore that replay. */
const MOUSE_AFTER_TOUCH_MS = 700

const glassElementOf = (node: unknown): glassEasel.Element | null => {
  // No `instanceof Node`: render hosts may live in an iframe realm, where the
  // parent window's Node constructor does not match.
  let current = node as { __wxElement?: glassEasel.Element; parentNode?: unknown } | null
  while (current) {
    if (current.__wxElement) return current.__wxElement
    current = (current.parentNode as typeof current) ?? null
  }
  return null
}

/**
 * One event entry point per render tree.
 *
 * Raw DOM input (touch, or mouse in the devtool) is normalized, recognized as
 * a gesture, and injected into the glass tree. Glass then owns capture/bubble/
 * `catch` semantics, so page bindings and built-in components see the same
 * event instead of each running its own `click`/`touch` branch.
 */
export function attachEventCompositor(options: CompositorOptions): () => void {
  const { root } = options
  // Detached trees (EmptyBackendContext in tests) have no real DOM to delegate
  // to; gesture recognition stays off until a browser host mounts the tree.
  if (!root || typeof root.addEventListener !== 'function' || root.ownerDocument === undefined) {
    return () => {}
  }
  let lastTouchAt = 0
  let lastTarget: EventTarget | null = null

  const shouldIgnoreMouse = (): boolean => Date.now() - lastTouchAt < MOUSE_AFTER_TOUCH_MS

  // Only gestures whose DOM target belongs to this tree are dispatched. A
  // nested or shared container would otherwise let two compositors inject the
  // same tap into the same glass element.
  const elementInRoot = (candidate: EventTarget | null): glassEasel.Element | null => {
    if (!candidate) return null
    try {
      if (!root.contains(candidate as Node)) return null
    } catch {
      return null
    }
    return glassElementOf(candidate)
  }

  const resolveTarget = (event: Event): glassEasel.Element | null => (
    elementInRoot(event.target)
    ?? elementInRoot(lastTarget)
    ?? null
  )

  const recognize = createGestureRecognizer({
    tapDistance: options.tapDistance,
    longPressDelay: options.longPressDelay,
    onGesture: (gesture: GestureEvent) => {
      const target = resolveTarget(gesture.originalEvent)
      if (target) options.onGesture(gesture, target)
    },
  })

  const projectionName = (phase: InputPhase): TouchProjectionName => (
    phase === 'start' ? 'touchstart'
      : phase === 'move' ? 'touchmove'
        : phase === 'end' ? 'touchend' : 'touchcancel'
  )

  const projectionPoint = (point: InputPoint): TouchProjectionPoint => ({
    identifier: point.id < 0 ? 0 : point.id,
    pageX: point.x,
    pageY: point.y,
    clientX: point.x,
    clientY: point.y,
    screenX: point.x,
    screenY: point.y,
    force: 1,
    radiusX: 0,
    radiusY: 0,
  })

  /**
   * Touch devices already get native touch events through glass. Mouse input
   * (the devtool) has none, so project it into the same touch sequence before
   * gesture recognition runs.
   */
  const projectTouch = (event: InputEvent): TouchProjection => ({
    name: projectionName(event.phase),
    touches: event.phase === 'end' || event.phase === 'cancel'
      ? []
      : event.points.map(projectionPoint),
    changedTouches: event.changedPoints.map(projectionPoint),
    originalEvent: event.originalEvent,
  })

  const feed = (event: InputEvent): void => {
    if (event.phase === 'start') lastTarget = event.originalEvent.target
    const fromMouse = event.points.some((point) => point.source === 'mouse')
    if (fromMouse) {
      const target = resolveTarget(event.originalEvent)
      if (target) options.onTouch?.(projectTouch(event), target)
    } else {
      lastTouchAt = Date.now()
    }
    recognize(event)
  }

  const detachTouch = createTouchAdapter(root)(feed)
  const detachMouse = createMouseAdapter(root, shouldIgnoreMouse)(feed)
  return () => {
    detachTouch()
    detachMouse()
  }
}

export {
  createGestureRecognizer,
  createMouseAdapter,
  createTouchAdapter,
}
export type {
  CompositorOptions,
  GestureDetail,
  GestureEvent,
  GestureName,
  GestureRecognizerOptions,
  InputAdapter,
  InputEvent,
  InputPhase,
  InputPoint,
  PointerSource,
} from './types'
