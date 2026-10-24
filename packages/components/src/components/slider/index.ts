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
    methods: {
      handleChanging(event: glassEasel.ShadowedEvent<unknown>) {
        const value = numberFromEvent(event, this.data.value as number)
        this.setData({ value })
        this.triggerEvent('changing', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = numberFromEvent(event, this.data.value as number)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
