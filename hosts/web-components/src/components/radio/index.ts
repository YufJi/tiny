import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'
import { builtinDefinitionName } from '../../tags'

export function defineRadio(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('radio'),
    template: ctx.template('radio'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent, ctx.behaviors.labelTarget, ctx.behaviors.item],
    properties: {
      disabled: { type: Boolean, value: false },
      color: { type: String, value: '#09BB07' },
    },
    options: ctx.hostOptions('radio'),
    methods: {
      select() {
        // WeChat's radio ignores a tap on the already selected item.
        if (this.data.disabled || this.data.checked) return
        const value = this.data.value as string
        // `checked` belongs to the item; the group reacts through the `item`
        // behavior (property observer on `checked`) and unchecks its previous
        // selection there.
        this.setData({ checked: true })
        ;(this as unknown as { changedByTap?: () => void }).changedByTap?.()
        this.triggerEvent('change', { value, checked: true }, { bubbles: false, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        if (!checked) {
          this.setData({ checked: false })
          return
        }
        this.select()
      },
      handleLabelTap() {
        this.select()
      },
    },
  }).general()
}
