import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

export function defineSwiperItem(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('swiper-item'),
    template: ctx.template('swiper-item'),
    behaviors: [ctx.behaviors.base],
    properties: {
      itemId: { type: String, value: '' },
    },
    observers: {
      itemId(value: string) {
        let node = (this as unknown as { parentNode?: unknown }).parentNode as {
          asGeneralComponent?: () => { is?: string; handleItemIdChanged?: (item: unknown, id: string) => void } | null
          parentNode?: unknown
        } | null
        for (let depth = 0; node && depth < 20; depth += 1) {
          const parent = node.asGeneralComponent?.()
          if (parent?.is === builtinDefinitionName('swiper')) {
            parent.handleItemIdChanged?.(this, String(value ?? ''))
            return
          }
          node = node.parentNode as typeof node
        }
      },
    },
    options: ctx.hostOptions('swiper-item', { multipleSlots: true }),
  }).general()
}
