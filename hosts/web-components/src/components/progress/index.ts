import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const DEFAULT_ACTIVE_COLOR = '#09BB07'

type ProgressRuntime = {
  __timerId?: ReturnType<typeof setInterval>
  _lastPercent?: number
  getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
  normalizeSizeStr?: (value: unknown) => string
  setAriaRoleDefault?: (role: string) => void
}

function clampPercent(value: unknown): number {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

/**
 * `<progress>` mirrors `wx-progress`: inline height/background/border-radius on
 * the bar, inline width/active color on the inner bar, and the percentage text
 * in `.tiny-progress-info`. The active loop advances one percent per `duration`
 * milliseconds and emits `activeend`.
 */
export function defineProgress(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('progress'),
    template: ctx.template('progress'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      percent: { type: Number, value: 0, observer: 'percentChange' },
      curPercent: { type: Number, value: 0, observer: 'curPercentChange' },
      showInfo: { type: Boolean, value: false },
      strokeWidth: { type: String, optionalTypes: [Number], value: 6, observer: 'syncSizes' },
      active: { type: Boolean, value: false, observer: 'activeAnimation' },
      activeColor: { type: String, value: DEFAULT_ACTIVE_COLOR, observer: 'syncActiveColor' },
      activeMode: { type: String, value: 'backwards' },
      backgroundColor: { type: String, value: '#EBEBEB' },
      color: { type: String, value: DEFAULT_ACTIVE_COLOR, observer: 'syncActiveColor' },
      borderRadius: { type: String, optionalTypes: [Number], value: 0, observer: 'syncSizes' },
      fontSize: { type: String, optionalTypes: [Number], value: 16, observer: 'syncSizes' },
      duration: { type: Number, value: 30 },
    },
    data: {
      curPercent: 0,
      barHeight: '6px',
      barRadius: '0px',
      infoFontSize: '16px',
      activeBarColor: DEFAULT_ACTIVE_COLOR,
    },
    lifetimes: {
      created() {
        ;(this as unknown as ProgressRuntime)._lastPercent = Number(this.data.percent) || 0
        ;(this as unknown as { syncSizes: () => void }).syncSizes()
        ;(this as unknown as { syncActiveColor: () => void }).syncActiveColor()
        if (!this.data.active) {
          this.setData({ curPercent: clampPercent(this.data.percent) })
        }
      },
      attached() {
        ;(this as unknown as ProgressRuntime).setAriaRoleDefault?.('progressbar')
        const element = (this as unknown as ProgressRuntime).getBackendElement?.()
        element?.setAttribute?.('aria-valuemin', '0')
        element?.setAttribute?.('aria-valuemax', '100')
        element?.setAttribute?.('aria-valuenow', String(clampPercent(this.data.percent)))
      },
      detached() {
        ;(this as unknown as { stopTimer: () => void }).stopTimer()
      },
    },
    options: ctx.hostOptions('progress'),
    methods: {
      _getActiveColor(color: unknown, activeColor: unknown): string {
        const active = String(activeColor ?? '')
        const base = String(color ?? '')
        if (active !== DEFAULT_ACTIVE_COLOR) return active
        if (base !== DEFAULT_ACTIVE_COLOR) return base
        return DEFAULT_ACTIVE_COLOR
      },
      syncSizes() {
        const normalize = (this as unknown as ProgressRuntime).normalizeSizeStr
        if (!normalize) return
        this.setData({
          barHeight: normalize.call(this, this.data.strokeWidth),
          barRadius: normalize.call(this, this.data.borderRadius),
          infoFontSize: normalize.call(this, this.data.fontSize),
        })
      },
      syncActiveColor() {
        this.setData({
          activeBarColor: (this as unknown as {
            _getActiveColor: (color: unknown, activeColor: unknown) => string
          })._getActiveColor(this.data.color, this.data.activeColor),
        })
      },
      curPercentChange(value: number) {
        const element = (this as unknown as ProgressRuntime).getBackendElement?.()
        element?.setAttribute?.('aria-valuenow', String(value))
      },
      percentChange(value: number, previous: number) {
        const clamped = clampPercent(value)
        if (clamped !== Number(value)) {
          this.setData({ percent: clamped })
          return
        }
        ;(this as unknown as { stopTimer: () => void }).stopTimer()
        ;(this as unknown as ProgressRuntime)._lastPercent = Number(previous) || 0
        ;(this as unknown as { activeAnimation: (active: boolean) => void })
          .activeAnimation(Boolean(this.data.active))
      },
      activeAnimation(active: boolean) {
        if (!Number.isFinite(Number(this.data.percent))) return
        ;(this as unknown as { stopTimer: () => void }).stopTimer()
        if (!active) {
          this.setData({ curPercent: Number(this.data.percent) })
          return
        }
        const runtime = this as unknown as ProgressRuntime
        const current = this.data.activeMode === 'forwards'
          ? Number(runtime._lastPercent ?? 0)
          : 0
        this.setData({ curPercent: current })
        const step = (): void => {
          const percent = Number(this.data.percent)
          if (percent <= Number(this.data.curPercent) + 1) {
            this.setData({ curPercent: percent })
            ;(this as unknown as { stopTimer: () => void }).stopTimer()
            this.triggerEvent(
              'activeend',
              { curPercent: percent },
              { bubbles: true, composed: true },
            )
            return
          }
          this.setData({ curPercent: Number(this.data.curPercent) + 1 })
        }
        runtime.__timerId = setInterval(step, Number(this.data.duration) || 30)
        step()
      },
      stopTimer() {
        const runtime = this as unknown as ProgressRuntime
        if (runtime.__timerId) clearInterval(runtime.__timerId)
        runtime.__timerId = undefined
      },
    },
  }).general()
}
