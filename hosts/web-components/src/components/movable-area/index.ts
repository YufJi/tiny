import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type MovableAreaRuntime = {
  _touchStart?: (event: TouchEvent) => void
  _touchMove?: (event: TouchEvent) => void
  _touchEnd?: (event: TouchEvent) => void
  _pinchStart?: number
  _views?: Array<{ setScale?: (ratio: number) => void }>
  getBackendElement?: () => HTMLElement | null
}

function touchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0
  const dx = touches[1]!.pageX - touches[0]!.pageX
  const dy = touches[1]!.pageY - touches[0]!.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Mirrors `wx-movable-area`: a relative-positioned box that owns absolutely
 * positioned `<movable-view>` children. With `scale-area` a two-finger gesture
 * scales all direct movable views.
 */
export function defineMovableArea(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('movable-area'),
    template: ctx.template('movable-area'),
    behaviors: [ctx.behaviors.base],
    properties: {
      scaleArea: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('movable-area'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (!host) return
        runtime._touchStart = (event) => {
          if (!this.data.scaleArea || event.touches.length < 2) return
          runtime._pinchStart = touchDistance(event.touches)
        }
        runtime._touchMove = (event) => {
          if (!this.data.scaleArea || event.touches.length < 2) return
          const start = runtime._pinchStart ?? 0
          if (start <= 0) return
          event.preventDefault()
          const ratio = touchDistance(event.touches) / start
          if (!ratio || ratio === 1) return
          for (const view of (this as unknown as {
            views: () => Array<{ setScale?: (value: number) => void }>
          }).views()) {
            view.setScale?.(ratio)
          }
          runtime._pinchStart = touchDistance(event.touches)
        }
        runtime._touchEnd = () => {
          runtime._pinchStart = undefined
        }
        host.addEventListener('touchstart', runtime._touchStart, { passive: true })
        host.addEventListener('touchmove', runtime._touchMove, { passive: false })
        host.addEventListener('touchend', runtime._touchEnd, { passive: true })
        host.addEventListener('touchcancel', runtime._touchEnd, { passive: true })
      },
      detached() {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (!host) return
        if (runtime._touchStart) host.removeEventListener('touchstart', runtime._touchStart)
        if (runtime._touchMove) host.removeEventListener('touchmove', runtime._touchMove)
        if (runtime._touchEnd) {
          host.removeEventListener('touchend', runtime._touchEnd)
          host.removeEventListener('touchcancel', runtime._touchEnd)
        }
      },
    },
    methods: {
      views(): Array<{ setScale?: (ratio: number) => void }> {
        const runtime = this as unknown as MovableAreaRuntime
        const host = runtime.getBackendElement?.()
        if (!host) return []
        return Array.from(host.querySelectorAll('tiny-movable-view'))
          .map((node) => (node as { __wxElement?: unknown }).__wxElement)
          .filter((view): view is { setScale?: (ratio: number) => void } => Boolean(view))
      },
    },
  }).general()
}
