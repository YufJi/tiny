import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineLabel(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:label',
    template: ctx.template('label'),
    behaviors: [ctx.behaviors.base],
    properties: {
      for: { type: String, value: '' },
    },
    options: ctx.hostOptions({ multipleSlots: true }),
  }).general()
}
