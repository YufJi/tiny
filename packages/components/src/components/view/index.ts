import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:view',
    template: ctx.template('view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      style: { type: String, value: '' },
      hoverClass: { type: String, value: 'none' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
