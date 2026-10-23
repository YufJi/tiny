import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineLabel(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:label',
    template: ctx.template('label'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
