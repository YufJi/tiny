import type { InputAdapter, InputEvent, InputPoint } from './types'

const MOUSE_POINTER_ID = -1

const toPoint = (touch: Touch, source: 'touch' | 'mouse'): InputPoint => ({
  id: source === 'touch' ? touch.identifier : MOUSE_POINTER_ID,
  x: touch.clientX,
  y: touch.clientY,
  source,
})

const touchPoints = (list: TouchList | null | undefined, source: 'touch' | 'mouse'): InputPoint[] => (
  list ? Array.from(list, (touch) => toPoint(touch, source)) : []
)

/**
 * Touch is the primary input on mini-program targets. Listen in the capture
 * phase and stay passive so native scrolling keeps working.
 */
export function createTouchAdapter(root: HTMLElement): InputAdapter {
  return (sink) => {
    const emit = (phase: InputEvent['phase'], event: TouchEvent): void => {
      sink({
        phase,
        points: touchPoints(event.touches, 'touch'),
        changedPoints: touchPoints(event.changedTouches, 'touch'),
        originalEvent: event,
      })
    }
    const onStart = (event: TouchEvent) => emit('start', event)
    const onMove = (event: TouchEvent) => emit('move', event)
    const onEnd = (event: TouchEvent) => emit('end', event)
    const onCancel = (event: TouchEvent) => emit('cancel', event)

    root.addEventListener('touchstart', onStart, { capture: true, passive: true })
    root.addEventListener('touchmove', onMove, { capture: true, passive: true })
    root.addEventListener('touchend', onEnd, { capture: true, passive: true })
    root.addEventListener('touchcancel', onCancel, { capture: true, passive: true })
    return () => {
      root.removeEventListener('touchstart', onStart, { capture: true })
      root.removeEventListener('touchmove', onMove, { capture: true })
      root.removeEventListener('touchend', onEnd, { capture: true })
      root.removeEventListener('touchcancel', onCancel, { capture: true })
    }
  }
}

/**
 * Mouse input is the devtool's way of pretending to be a finger. It feeds the
 * same recognizer as touch, so both paths share thresholds and ordering.
 */
export function createMouseAdapter(
  root: HTMLElement,
  shouldIgnoreMouse: () => boolean,
): InputAdapter {
  return (sink) => {
    const target = root.ownerDocument ?? root
    let pressed = false

    const pointOf = (event: MouseEvent): InputPoint => ({
      id: MOUSE_POINTER_ID,
      x: event.clientX,
      y: event.clientY,
      source: 'mouse',
    })
    const emit = (phase: InputEvent['phase'], event: MouseEvent): void => {
      const point = pointOf(event)
      sink({ phase, points: [point], changedPoints: [point], originalEvent: event })
    }

    const onDown = (event: MouseEvent) => {
      if (event.button !== 0 || shouldIgnoreMouse()) return
      pressed = true
      emit('start', event)
    }
    const onMove = (event: MouseEvent) => {
      if (!pressed) return
      emit('move', event)
    }
    const onUp = (event: MouseEvent) => {
      if (!pressed) return
      pressed = false
      emit('end', event)
    }
    const onLeave = (event: MouseEvent) => {
      if (!pressed) return
      pressed = false
      emit('cancel', event)
    }

    root.addEventListener('mousedown', onDown, { capture: true })
    target.addEventListener('mousemove', onMove, { capture: true })
    target.addEventListener('mouseup', onUp, { capture: true })
    root.addEventListener('mouseleave', onLeave, { capture: true })

    return () => {
      root.removeEventListener('mousedown', onDown, { capture: true })
      target.removeEventListener('mousemove', onMove, { capture: true })
      target.removeEventListener('mouseup', onUp, { capture: true })
      root.removeEventListener('mouseleave', onLeave, { capture: true })
    }
  }
}
