import type { BuiltinContext, BuiltinDefinition } from '../../types'

const ICON_GLYPHS: Record<string, string> = {
  success: '✓',
  success_no_circle: '✓',
  info: 'ℹ',
  warn: '!',
  waiting: '◌',
  cancel: '✕',
  download: '↓',
  search: '⌕',
  clear: '✕',
}

export function defineIcon(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:icon',
    template: ctx.template('icon'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      ariaLabel: { type: String, value: '' },
      type: { type: String, value: 'success' },
      size: { type: String, optionalTypes: [Number], value: 23 },
      color: { type: String, value: '' },
    },
    data: {
      glyph: ICON_GLYPHS.success,
    },
    observers: {
      type(value: string) {
        this.setData({ glyph: ICON_GLYPHS[value] ?? ICON_GLYPHS.success })
      },
    },
  }).general()
}
