import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const DEFAULT_ICON_SIZE = '23px'

/**
 * `<icon>` mirrors `wx-icon`: one `<i class="tiny-icon-<type>">`, the weui
 * font on `i`, and the per-type glyph rules from the component stylesheet.
 */
export function defineIcon(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('icon'),
    template: ctx.template('icon'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      type: { type: String, value: '' },
      size: { type: String, value: DEFAULT_ICON_SIZE, observer: 'sizeChanged' },
      color: { type: String, value: '' },
    },
    data: {
      fontSize: DEFAULT_ICON_SIZE,
    },
    lifetimes: {
      created() {
        ;(this as unknown as { sizeChanged: () => void }).sizeChanged()
      },
      attached() {
        ;(this as unknown as { sizeChanged: () => void }).sizeChanged()
        ;(this as unknown as { setAriaRoleDefault: (role: string) => void }).setAriaRoleDefault('img')
      },
    },
    options: ctx.hostOptions('icon'),
    methods: {
      sizeChanged() {
        const normalizeSizeStr = (this as unknown as {
          normalizeSizeStr: (value: unknown) => string
        }).normalizeSizeStr
        this.setData({
          fontSize: normalizeSizeStr.call(this, this.data.size),
        })
      },
    },
  }).general()
}
