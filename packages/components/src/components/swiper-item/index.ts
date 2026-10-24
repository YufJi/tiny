import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineSwiperItem(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:swiper-item',
    template: ctx.template('swiper-item'),
    behaviors: [ctx.behaviors.base],
    properties: {
      itemId: { type: String, value: '' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
