import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

export function defineView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('view'),
    template: ctx.template('view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.hover],
    properties: {
      inline: { type: Boolean, value: false },
      hoverClass: { type: String, value: 'none' },
      hover: { type: Boolean, value: false },
      sessionFrom: { type: String, value: 'wxapp' },
      ariaRole: { type: String, value: '' },
      ariaLabel: { type: String, value: '' },
    },
    options: ctx.hostOptions('view', { multipleSlots: true }),
  }).general()
}
