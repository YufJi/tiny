import type * as glassEasel from 'glass-easel'
import { findAncestorWithBehavior } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { booleanFromEvent } from '../../events'

export function defineRadio(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:radio',
    template: ctx.template('radio'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.disabled, ctx.behaviors.dataComponent, ctx.behaviors.labelTarget, ctx.behaviors.item],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
      color: { type: String, value: '#09BB07' },
    },
    options: ctx.hostOptions('radio'),
    methods: {
      select() {
        if (this.data.disabled) return
        const value = this.data.value as string
        this.setData({ checked: true })
        const group = findAncestorWithBehavior(this, 'wx-group') as
          | { handleItemChange?: (detail: { value?: unknown; checked?: unknown }) => void }
          | null
        group?.handleItemChange?.({ value, checked: true })
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
