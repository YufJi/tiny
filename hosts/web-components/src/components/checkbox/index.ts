import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'
import { builtinDefinitionName } from '../../tags'

export function defineCheckbox(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('checkbox'),
    template: ctx.template('checkbox'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent, ctx.behaviors.labelTarget, ctx.behaviors.item],
    properties: {
      ariaLabel: { type: String, value: '' },
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
    options: ctx.hostOptions('checkbox'),
    methods: {
      commitChecked(checked: boolean) {
        if (this.data.disabled) return
        const value = this.data.value as string
        // `checked` belongs to the item; the group is notified through the
        // `item` behavior (property observer on `checked`).
        this.setData({ checked })
        ;(this as unknown as { changedByTap?: () => void }).changedByTap?.()
        // The group owns the bubbling `change`; keep the child event local so
        // the page binding on the group only sees the group-level detail.
        this.triggerEvent('change', { value, checked }, { bubbles: false, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        this.commitChecked(booleanFromEvent(event, this.data.checked as boolean))
      },
      handleLabelTap() {
        this.commitChecked(!this.data.checked)
      },
    },
  }).general()
}
