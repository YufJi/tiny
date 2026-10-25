import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineSwiperItem(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:swiper-item',
    template: ctx.template('swiper-item'),
    behaviors: [ctx.behaviors.base],
    properties: {
      itemId: { type: String, value: '' },
    },
    options: ctx.hostOptions({ multipleSlots: true }),
  }).general()
}
