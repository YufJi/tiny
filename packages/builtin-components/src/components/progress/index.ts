import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineProgress(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:progress',
    template: ctx.template('progress'),
    properties: {
      percent: { type: Number, value: 0 },
      showInfo: { type: Boolean, value: false },
      active: { type: Boolean, value: false },
      strokeWidth: { type: String, optionalTypes: [Number], value: 6 },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
  }).general()
}
