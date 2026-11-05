import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { TouchTrackEvent } from './types'

export function createTouchTrackBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.touchTrack,
    methods: {
      touchtrack(
        _element: unknown,
        handler: (event: TouchTrackEvent) => boolean | void,
        useCapture = false,
      ): () => void {
        // Track through glass events (not DOM listeners) so native touch and a
        // mouse sequence projected by the event compositor take the same path.
        const instance = this as unknown as {
          addListener?: (name: string, listener: (event: unknown) => void, options?: { capture?: boolean }) => void
          removeListener?: (name: string, listener: (event: unknown) => void, options?: { capture?: boolean }) => void
        }
        if (typeof instance.addListener !== 'function') return () => {}
        type TrackPoint = { clientX: number; clientY: number }
        const listOf = (event: unknown, key: 'touches' | 'changedTouches'): ArrayLike<TrackPoint> => {
          const projected = (event as Record<string, ArrayLike<TrackPoint> | undefined>)[key]
          if (projected) return projected
          const original = (event as { getOriginalEvent?: () => TouchEvent | undefined })
            .getOriginalEvent?.()
          return original?.[key] ?? []
        }
        let active = false
        let startX = 0
        let startY = 0
        let lastX = 0
        let lastY = 0
        let previousX = 0
        let previousY = 0
        const emit = (event: unknown, state: TouchTrackEvent['detail']['state'], x: number, y: number) => {
          const source = event as {
            target?: unknown
            currentTarget?: unknown
            preventDefault?: () => void
            stopPropagation?: () => void
            timeStamp?: number
          }
          const result = handler({
            target: source.target,
            currentTarget: source.currentTarget,
            preventDefault: () => source.preventDefault?.(),
            stopPropagation: () => source.stopPropagation?.(),
            touches: Array.from(listOf(event, 'touches')),
            changedTouches: Array.from(listOf(event, 'changedTouches')),
            detail: {
              state,
              x,
              y,
              dx: x - startX,
              dy: y - startY,
              ddx: x - previousX,
              ddy: y - previousY,
              timeStamp: Number(source.timeStamp ?? Date.now()),
            },
          })
          previousX = x
          previousY = y
          return result
        }
        const onStart = (event: unknown) => {
          const touches = listOf(event, 'touches')
          if (touches.length !== 1 || active) return
          active = true
          const touch = touches[0]!
          startX = lastX = previousX = touch.clientX
          startY = lastY = previousY = touch.clientY
          emit(event, 'start', startX, startY)
        }
        const onMove = (event: unknown) => {
          const touches = listOf(event, 'touches')
          if (!active || touches.length !== 1) return
          const touch = touches[0]!
          lastX = touch.clientX
          lastY = touch.clientY
          emit(event, 'move', lastX, lastY)
        }
        const onEnd = (event: unknown) => {
          if (!active || listOf(event, 'touches').length !== 0) return
          active = false
          const touch = listOf(event, 'changedTouches')[0]
          emit(event, 'end', touch?.clientX ?? lastX, touch?.clientY ?? lastY)
        }
        const onCancel = (event: unknown) => {
          if (!active) return
          active = false
          const touch = listOf(event, 'changedTouches')[0]
          emit(event, 'cancel', touch?.clientX ?? lastX, touch?.clientY ?? lastY)
        }
        instance.addListener('touchstart', onStart, { capture: useCapture })
        instance.addListener('touchmove', onMove, { capture: useCapture })
        instance.addListener('touchend', onEnd, { capture: useCapture })
        instance.addListener('touchcancel', onCancel, { capture: useCapture })

        // Native touch does not reach glass `addListener` callbacks in the web
        // render tree (only projected mouse gestures do), so attach the same
        // state machine to the backend element as well. The glass listeners
        // keep devtool mouse drags working; native touch goes through the DOM.
        const target = (
          (_element as { addEventListener?: unknown } | null | undefined)?.addEventListener
            ? _element
            : (this as unknown as { getBackendElement?: () => unknown }).getBackendElement?.()
        ) as {
          addEventListener?: (name: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
          removeEventListener?: (name: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
        } | null | undefined
        let domActive = false
        let domStartX = 0
        let domStartY = 0
        let domLastX = 0
        let domLastY = 0
        let domPreviousX = 0
        let domPreviousY = 0
        const domEmit = (event: TouchEvent, state: 'start' | 'move' | 'end' | 'cancel', x: number, y: number) => {
          const result = handler({
            target: event.target,
            currentTarget: event.currentTarget,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            touches: Array.from(event.touches),
            changedTouches: Array.from(event.changedTouches),
            detail: {
              state,
              x,
              y,
              dx: x - domStartX,
              dy: y - domStartY,
              ddx: x - domPreviousX,
              ddy: y - domPreviousY,
              timeStamp: Number(event.timeStamp || Date.now()),
            },
          })
          if (result === false && event.cancelable) event.preventDefault()
          domPreviousX = x
          domPreviousY = y
        }
        const domStart = (event: TouchEvent) => {
          if (event.touches.length !== 1 || domActive) return
          domActive = true
          const touch = event.touches[0]!
          domStartX = domLastX = domPreviousX = touch.clientX
          domStartY = domLastY = domPreviousY = touch.clientY
          domEmit(event, 'start', domStartX, domStartY)
        }
        const domMove = (event: TouchEvent) => {
          if (!domActive || event.touches.length !== 1) return
          const touch = event.touches[0]!
          domLastX = touch.clientX
          domLastY = touch.clientY
          domEmit(event, 'move', domLastX, domLastY)
        }
        const domEnd = (event: TouchEvent) => {
          if (!domActive || event.touches.length !== 0) return
          domActive = false
          const touch = event.changedTouches[0]
          domEmit(event, 'end', touch?.clientX ?? domLastX, touch?.clientY ?? domLastY)
        }
        const domCancel = (event: TouchEvent) => {
          if (!domActive) return
          domActive = false
          const touch = event.changedTouches[0]
          domEmit(event, 'cancel', touch?.clientX ?? domLastX, touch?.clientY ?? domLastY)
        }
        target?.addEventListener?.('touchstart', domStart, { capture: true })
        target?.addEventListener?.('touchmove', domMove, { capture: true })
        target?.addEventListener?.('touchend', domEnd, { capture: true })
        target?.addEventListener?.('touchcancel', domCancel, { capture: true })
        return () => {
          instance.removeListener?.('touchstart', onStart, { capture: useCapture })
          instance.removeListener?.('touchmove', onMove, { capture: useCapture })
          instance.removeListener?.('touchend', onEnd, { capture: useCapture })
          instance.removeListener?.('touchcancel', onCancel, { capture: useCapture })
          target?.removeEventListener?.('touchstart', domStart, { capture: true })
          target?.removeEventListener?.('touchmove', domMove, { capture: true })
          target?.removeEventListener?.('touchend', domEnd, { capture: true })
          target?.removeEventListener?.('touchcancel', domCancel, { capture: true })
        }
      },
    },
  })
}
