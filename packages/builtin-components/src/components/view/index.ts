import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:view',
    template: ctx.template('view'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
