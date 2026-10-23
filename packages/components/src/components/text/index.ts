import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineText(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:text',
    template: ctx.template('text'),
    properties: {
      selectable: { type: Boolean, value: false },
      space: { type: String, value: '' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
  }).general()
}
