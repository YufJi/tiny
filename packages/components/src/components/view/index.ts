import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:view',
    template: ctx.template('view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      style: { type: String, value: '' },
      inline: { type: Boolean, value: false },
      hoverClass: { type: String, value: 'none' },
      hover: { type: Boolean, value: false },
      sessionFrom: { type: String, value: 'wxapp' },
      ariaRole: { type: String, value: '' },
      ariaLabel: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
