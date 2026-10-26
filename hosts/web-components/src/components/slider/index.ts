import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { numberFromEvent } from '../../events'

export function defineSlider(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:slider',
    template: ctx.template('slider'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: Number, value: 0 },
      min: { type: Number, value: 0 },
      max: { type: Number, value: 100 },
      step: { type: Number, value: 1 },
      disabled: { type: Boolean, value: false },
      showValue: { type: Boolean, value: false },
      activeColor: { type: String, value: '#1aad19' },
      backgroundColor: { type: String, value: '#e9e9e9' },
      blockSize: { type: Number, value: 28 },
      blockColor: { type: String, value: '#ffffff' },
      selectedColor: { type: String, value: '#1aad19' },
      color: { type: String, value: '#e9e9e9' },
    },
    data: {
      displayValue: 0,
      percent: 0,
      blockOffset: -14,
    },
    observers: {
      'value, min, max, step'() {
        this.syncDisplayValue()
      },
      blockSize() {
        this.syncBlockOffset()
      },
    },
    lifetimes: {
      attached() {
        this.syncBlockOffset()
        this.syncDisplayValue()
      },
    },
    options: ctx.hostOptions('slider'),
    methods: {
      normalizeValue(raw: unknown): number {
        const min = Number(this.data.min)
        const max = Number(this.data.max)
        const step = Number(this.data.step)
        const hasRange = Number.isFinite(min) && Number.isFinite(max) && max > min
        const low = hasRange ? min : 0
        const high = hasRange ? max : 100
        let value = Number(raw)
        if (!Number.isFinite(value)) value = low
        value = Math.min(high, Math.max(low, value))
        if (Number.isFinite(step) && step > 0) {
          value = min + Math.round((value - min) / step) * step
          const decimals = (String(step).split('.')[1] ?? '').length
          if (decimals > 0) value = Number(value.toFixed(decimals))
          value = Math.min(high, Math.max(low, value))
        }
        return value
      },
      percentOf(value: number): number {
        const min = Number(this.data.min)
        const max = Number(this.data.max)
        if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return 0
        const percent = ((value - min) / (max - min)) * 100
        return Math.max(0, Math.min(100, Number(percent.toFixed(3))))
      },
      syncDisplayValue(): void {
        const value = this.normalizeValue(this.data.value)
        this.setData({ displayValue: value, percent: this.percentOf(value) })
      },
      syncBlockOffset(): void {
        const size = Number(this.data.blockSize)
        this.setData({ blockOffset: Number.isFinite(size) && size > 0 ? -size / 2 : -14 })
      },
      handleChanging(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const value = this.normalizeValue(numberFromEvent(event, this.data.value as number))
        this.setData({ value, displayValue: value, percent: this.percentOf(value) })
        this.triggerEvent('changing', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const value = this.normalizeValue(numberFromEvent(event, this.data.value as number))
        this.setData({ value, displayValue: value, percent: this.percentOf(value) })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
