import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineScrollView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:scroll-view',
    template: ctx.template('scroll-view'),
    properties: {
      scrollX: { type: Boolean, value: false },
      scrollY: { type: Boolean, value: false },
      upperThreshold: { type: Number, value: 50 },
      lowerThreshold: { type: Number, value: 50 },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
