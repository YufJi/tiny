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
    options: ctx.hostOptions(),
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        const value = this.data.value as string
        this.setData({ checked })
        const group = findAncestorWithBehavior(this, 'wx-group') as
          | { handleItemChange?: (detail: { value?: unknown; checked?: unknown }) => void }
          | null
        group?.handleItemChange?.({ value, checked })
        this.triggerEvent('change', { value, checked }, { bubbles: false, composed: true })
      },
    },
  }).general()
}
