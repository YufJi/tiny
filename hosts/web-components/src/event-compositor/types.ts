import type * as glassEasel from 'glass-easel'

/** Input devices the compositor understands. Touch is the primary source. */
export type PointerSource = 'touch' | 'mouse'

export type InputPhase = 'start' | 'move' | 'end' | 'cancel'

export type InputPoint = {
  id: number
  x: number
  y: number
  source: PointerSource
}

export type InputEvent = {
  phase: InputPhase
  /** Every contact currently down. */
  points: InputPoint[]
  /** Contacts that changed in this event (the finger that lifted, etc.). */
  changedPoints: InputPoint[]
  originalEvent: Event
}

export type GestureName = 'tap' | 'longpress' | 'canceltap'

export type GestureDetail = {
  x: number
  y: number
}

export type GestureEvent = {
  name: GestureName
  detail: GestureDetail
  originalEvent: Event
}

export type GestureRecognizerOptions = {
  /** Movement (px) that turns a tap candidate into a cancelled tap. */
  tapDistance?: number
  /** Hold time (ms) before `longpress`. */
  longPressDelay?: number
  onGesture: (gesture: GestureEvent) => void
}

/**
 * Turn raw DOM input (touch or mouse) into the normalized `InputEvent` stream
 * the gesture recognizer consumes. Mouse input is how the devtool simulates a
 * finger; it must not grow its own click path.
 */
export type InputAdapter = (sink: (event: InputEvent) => void) => () => void

export type TouchProjectionName = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel'

/** A touch-shaped point the compositor projects into the glass tree. */
export type TouchProjectionPoint = {
  identifier: number
  pageX: number
  pageY: number
  clientX: number
  clientY: number
  screenX: number
  screenY: number
  force: number
  radiusX: number
  radiusY: number
}

/**
 * Touch events the compositor emits itself. Touch devices keep riding glass's
 * native projection; mouse input (devtool) is projected into the same touch
 * sequence so `hover`, `touchtrack` and built-in templates share one path.
 */
export type TouchProjection = {
  name: TouchProjectionName
  touches: TouchProjectionPoint[]
  changedTouches: TouchProjectionPoint[]
  originalEvent: Event
}

export type CompositorOptions = {
  /** Delegate target; one listener set per render tree. */
  root: HTMLElement
  onGesture: (gesture: GestureEvent, target: glassEasel.Element) => void
  onTouch?: (touch: TouchProjection, target: glassEasel.Element) => void
  tapDistance?: number
  longPressDelay?: number
}
