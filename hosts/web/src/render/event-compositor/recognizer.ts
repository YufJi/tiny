import type { GestureDetail, GestureRecognizerOptions, InputEvent } from './types'

type ActiveGesture = {
  id: number
  startX: number
  startY: number
  lastX: number
  lastY: number
  moved: boolean
  longPressFired: boolean
  timer: ReturnType<typeof setTimeout> | undefined
  originalEvent: Event
}

const DEFAULT_TAP_DISTANCE = 10
const DEFAULT_LONG_PRESS_DELAY = 350

/**
 * Single-gesture recognizer shared by every input adapter.
 *
 * Recognized gestures (`tap`, `longpress`, `canceltap`) are injected into the
 * glass tree by the compositor, so page bindings, built-in component bindings
 * and `catch` semantics all observe one event.
 */
export function createGestureRecognizer(options: GestureRecognizerOptions): (event: InputEvent) => void {
  const tapDistance = options.tapDistance ?? DEFAULT_TAP_DISTANCE
  const longPressDelay = options.longPressDelay ?? DEFAULT_LONG_PRESS_DELAY
  let active: ActiveGesture | null = null

  const detailOf = (x: number, y: number): GestureDetail => ({ x, y })

  const clearTimer = (gesture: ActiveGesture): void => {
    if (gesture.timer !== undefined) clearTimeout(gesture.timer)
    gesture.timer = undefined
  }

  const emitGesture = (
    name: 'tap' | 'longpress' | 'canceltap',
    x: number,
    y: number,
    originalEvent: Event,
  ): void => {
    options.onGesture({ name, detail: detailOf(x, y), originalEvent })
  }

  const cancelActive = (originalEvent: Event, emitCancel: boolean): void => {
    if (!active) return
    const gesture = active
    active = null
    clearTimer(gesture)
    if (emitCancel) {
      emitGesture('canceltap', gesture.lastX, gesture.lastY, originalEvent)
    }
  }

  const start = (event: InputEvent): void => {
    // A second finger makes the gesture ambiguous; drop the candidate instead
    // of turning a pinch into a tap.
    if (event.points.length > 1) {
      cancelActive(event.originalEvent, true)
      return
    }
    const point = event.changedPoints[0] ?? event.points[0]
    if (!point) return
    cancelActive(event.originalEvent, false)
    const gesture: ActiveGesture = {
      id: point.id,
      startX: point.x,
      startY: point.y,
      lastX: point.x,
      lastY: point.y,
      moved: false,
      longPressFired: false,
      timer: undefined,
      originalEvent: event.originalEvent,
    }
    gesture.timer = setTimeout(() => {
      gesture.timer = undefined
      if (!active || active !== gesture || gesture.moved) return
      gesture.longPressFired = true
      emitGesture('longpress', gesture.lastX, gesture.lastY, gesture.originalEvent)
    }, longPressDelay)
    active = gesture
  }

  const move = (event: InputEvent): void => {
    if (!active) return
    const point = event.points.find((entry) => entry.id === active?.id)
      ?? event.changedPoints.find((entry) => entry.id === active?.id)
    if (!point) return
    active.lastX = point.x
    active.lastY = point.y
    // Once longpress fired the gesture is consumed; a later drag must not
    // emit `canceltap` on top of it.
    if (active.moved || active.longPressFired) return
    if (Math.abs(point.x - active.startX) > tapDistance || Math.abs(point.y - active.startY) > tapDistance) {
      active.moved = true
      clearTimer(active)
      // A drag is no longer a tap; `canceltap` is the WeChat signal for that.
      emitGesture('canceltap', point.x, point.y, event.originalEvent)
    }
  }

  const end = (event: InputEvent): void => {
    if (!active) return
    const gesture = active
    const point = event.changedPoints.find((entry) => entry.id === gesture.id)
      ?? event.points.find((entry) => entry.id === gesture.id)
    if (point) {
      gesture.lastX = point.x
      gesture.lastY = point.y
    }
    active = null
    clearTimer(gesture)
    if (!gesture.moved && !gesture.longPressFired) {
      emitGesture('tap', gesture.startX, gesture.startY, event.originalEvent)
    }
  }

  const cancel = (event: InputEvent): void => {
    cancelActive(event.originalEvent, true)
  }

  return (event) => {
    if (event.phase === 'start') start(event)
    else if (event.phase === 'move') move(event)
    else if (event.phase === 'end') end(event)
    else cancel(event)
  }
}
