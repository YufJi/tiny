import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const DEFAULT_ICON_SIZE = 23

export function defineIcon(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('icon'),
    template: ctx.template('icon'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      ariaLabel: { type: String, value: '' },
      type: { type: String, value: 'success' },
      size: { type: String, optionalTypes: [Number], value: DEFAULT_ICON_SIZE },
      color: { type: String, value: '' },
    },
    data: {
      fontSize: DEFAULT_ICON_SIZE,
    },
    observers: {
      size() {
        this.syncFontSize()
      },
    },
    lifetimes: {
      created() {
        this.syncFontSize()
      },
      attached() {
        this.syncFontSize()
      },
    },
    options: ctx.hostOptions('icon'),
    methods: {
      syncFontSize() {
        const normalizeSize = (this as unknown as {
          normalizeSize: (value: unknown) => number
        }).normalizeSize
        this.setData({ fontSize: normalizeSize.call(this, this.data.size) })
      },
    },
  }).general()
}
