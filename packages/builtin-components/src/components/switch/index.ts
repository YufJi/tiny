import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'

export function defineSwitch(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:switch',
    template: ctx.template('switch'),
    properties: {
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
      type: { type: String, value: 'switch' },
    },
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: checked }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
