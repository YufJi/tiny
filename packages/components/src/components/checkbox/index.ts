import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'

export function defineCheckbox(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:checkbox',
    template: ctx.template('checkbox'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent, ctx.behaviors.labelTarget, ctx.behaviors.item],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
      color: { type: String, value: '#09BB07' },
    },
    lifetimes: {
      attached() {
        this.triggerEvent(
          'checkboxstate',
          { value: this.data.value, checked: Boolean(this.data.checked) },
          { bubbles: true, composed: true },
        )
      },
    },
    observers: {
      checked(value: boolean) {
        this.triggerEvent(
          'checkboxstate',
          { value: this.data.value, checked: Boolean(value) },
          { bubbles: true, composed: true },
        )
      },
    },
    externalClasses: ['class'],
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: this.data.value, checked }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
