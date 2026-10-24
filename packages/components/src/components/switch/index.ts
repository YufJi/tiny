import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'

export function defineSwitch(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:switch',
    template: ctx.template('switch'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent, ctx.behaviors.labelTarget],
    properties: {
      ariaLabel: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
      type: { type: String, value: 'switch' },
      color: { type: String, value: '#04BE02' },
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
