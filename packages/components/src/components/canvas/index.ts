import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type CanvasRuntime = {
  __canvasLongTapTimer?: ReturnType<typeof setTimeout>
}

function touchDetail(event: glassEasel.ShadowedEvent<unknown>): Record<string, unknown> {
  const detail = (event.detail ?? {}) as Record<string, unknown>
  return {
    ...detail,
    touches: (detail.touches ?? (event as unknown as { touches?: unknown[] }).touches ?? []) as unknown,
    changedTouches: (detail.changedTouches ?? (event as unknown as { changedTouches?: unknown[] }).changedTouches ?? []) as unknown,
  }
}

export function defineCanvas(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:canvas',
    template: ctx.template('canvas'),
    behaviors: [ctx.behaviors.base],
    properties: {
      canvasId: { type: String, value: '' },
      type: { type: String, value: '' },
      disableScroll: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    lifetimes: {
      created() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CANVAS',
          message: 'Canvas rendering is a non-blocking placeholder in the P0 runtime.',
          details: { canvasId: this.data.canvasId, type: this.data.type },
        })
      },
      detached() {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
      },
    },
    methods: {
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = setTimeout(() => {
          instance.__canvasLongTapTimer = undefined
          this.handleLongTap(event)
        }, 350)
        this.triggerEvent('touchstart', touchDetail(event), { bubbles: true, composed: true })
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
        this.triggerEvent('touchmove', touchDetail(event), { bubbles: true, composed: true })
      },
      handleTouchEnd(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
        this.triggerEvent('touchend', touchDetail(event), { bubbles: true, composed: true })
      },
      handleTouchCancel(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as CanvasRuntime
        if (instance.__canvasLongTapTimer) clearTimeout(instance.__canvasLongTapTimer)
        instance.__canvasLongTapTimer = undefined
        this.triggerEvent('touchcancel', touchDetail(event), { bubbles: true, composed: true })
      },
      handleLongTap(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('longtap', touchDetail(event), { bubbles: true, composed: true })
      },
      handleError(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('error', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
    options: { virtualHost: true },
  }).general()
}
