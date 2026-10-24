import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineRadioGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:radio-group',
    template: ctx.template('radio-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    properties: {
      style: { type: String, value: '' },
    },
    data: {
      value: '',
    },
    externalClasses: ['class'],
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; checked?: unknown }
        if (detail.checked === false) return
        const value = String(detail.value ?? '')
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
