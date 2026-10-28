import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

export function defineProgress(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('progress'),
    template: ctx.template('progress'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      ariaLabel: { type: String, value: '' },
      percent: { type: Number, value: 0 },
      showInfo: { type: Boolean, value: false },
      active: { type: Boolean, value: false },
      activeMode: { type: String, value: 'backwards' },
      activeColor: { type: String, value: '#09BB07' },
      backgroundColor: { type: String, value: '#EBEBEB' },
      color: { type: String, value: '#09BB07' },
      borderRadius: { type: String, optionalTypes: [Number], value: 0 },
      fontSize: { type: String, optionalTypes: [Number], value: 16 },
      strokeWidth: { type: String, optionalTypes: [Number], value: 6 },
    },
    data: {
      curPercent: 0,
    },
    observers: {
      percent(value: number) {
        const percent = Math.max(0, Math.min(100, Number(value) || 0))
        if (percent !== Number(value)) {
          this.setData({ percent })
          return
        }
        ;(this as unknown as { _lastPercent?: number })._lastPercent = Number(this.data.curPercent ?? 0)
        this.activeAnimation(Boolean(this.data.active))
      },
      active(value: boolean) {
        this.activeAnimation(Boolean(value))
      },
    },
    lifetimes: {
      created() {
        ;(this as unknown as { _lastPercent?: number })._lastPercent = Number(this.data.percent) || 0
        if (!this.data.active) this.setData({ curPercent: Number(this.data.percent) || 0 })
      },
      detached() {
        this.stopActiveAnimation()
      },
    },
    options: ctx.hostOptions('progress'),
    methods: {
      stopActiveAnimation() {
        const instance = this as unknown as { __activeTimer?: ReturnType<typeof setInterval> }
        if (instance.__activeTimer) clearInterval(instance.__activeTimer)
        instance.__activeTimer = undefined
      },
      activeAnimation(active: boolean) {
        this.stopActiveAnimation()
        const percent = Math.max(0, Math.min(100, Number(this.data.percent) || 0))
        if (!active) {
          this.setData({ curPercent: percent })
          return
        }
        const instance = this as unknown as {
          __activeTimer?: ReturnType<typeof setInterval>
          _lastPercent?: number
        }
        let current = this.data.activeMode === 'forwards' ? Number(instance._lastPercent ?? 0) : 0
        this.setData({ curPercent: current })
        const step = () => {
          if (this.data.percent <= current + 1) {
            current = percent
            this.setData({ curPercent: current })
            this.stopActiveAnimation()
            this.triggerEvent('activeend', { curPercent: current }, { bubbles: true, composed: true })
            return
          }
          current += 1
          this.setData({ curPercent: current })
        }
        instance.__activeTimer = setInterval(step, 30)
        step()
      },
      handleActiveEnd() {
        // Kept for callers that bind transitionend; activeend is emitted by
        // activeAnimation when the frame loop reaches the target.
      },
    },
  }).general()
}
