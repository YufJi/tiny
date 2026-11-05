import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type SwiperItemBackend = {
  style?: Record<string, string>
  display?: string
}

type SwiperItemRuntime = {
  _attached?: boolean
  _originalDisplay?: string
  _position?: number
  _positionX?: string
  _positionY?: string
  getBackendElement?: () => SwiperItemBackend | null
}

/**
 * Mirrors `wx-swiper-item`: the template is only the slot, the component makes
 * the host absolutely positioned at 100% of the frame in `attached`, and the
 * itemId observer informs the ancestor swiper about relation changes.
 */
export function defineSwiperItem(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('swiper-item'),
    template: ctx.template('swiper-item'),
    behaviors: [ctx.behaviors.base],
    properties: {
      itemId: { type: String, value: '', observer: 'itemIdChanged' },
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as SwiperItemRuntime
        runtime._attached = true
        const element = runtime.getBackendElement?.()
        if (element?.style) {
          element.style.position = 'absolute'
          element.style.width = '100%'
          element.style.height = '100%'
        }
        runtime._originalDisplay = element?.style?.display ?? ''
      },
    },
    options: ctx.hostOptions('swiper-item', { multipleSlots: true }),
    methods: {
      itemIdChanged(value: string, previous: string) {
        let node = (this as unknown as { parentNode?: unknown }).parentNode as {
          asGeneralComponent?: () => {
            is?: string
            _itemIdUpdated?: (item: unknown, next: string, previous: string) => void
          } | null
          parentNode?: unknown
        } | null
        for (let depth = 0; node && depth < 20; depth += 1) {
          const parent = node.asGeneralComponent?.()
          if (parent?.is === builtinDefinitionName('swiper')) {
            parent._itemIdUpdated?.(this, String(value ?? ''), String(previous ?? ''))
            return
          }
          node = node.parentNode as typeof node
        }
      },
    },
  }).general()
}
