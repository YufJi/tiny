import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

export function defineText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('text'),
    template: ctx.template('text'),
    behaviors: [ctx.behaviors.base],
    properties: {
      selectable: { type: Boolean, value: false },
      decode: { type: Boolean, value: false },
      space: { type: String, value: '' },
    },
    options: ctx.hostOptions('text'),
  }).general()
}
