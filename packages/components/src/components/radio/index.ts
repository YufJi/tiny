import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'

export function defineRadio(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:radio',
    template: ctx.template('radio'),
    behaviors: [ctx.behaviors.base],
    properties: {
      value: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
    },
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: this.data.value, checked }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
