import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'

export function defineInput(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:input',
    template: ctx.template('input'),
    properties: {
      value: { type: String, value: '' },
      type: { type: String, value: 'text' },
      placeholder: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
