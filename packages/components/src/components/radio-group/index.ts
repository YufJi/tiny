import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineRadioGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:radio-group',
    template: ctx.template('radio-group'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
