import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineProgress(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:progress',
    template: ctx.template('progress'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      ariaLabel: { type: String, value: '' },
      percent: { type: Number, value: 0 },
      showInfo: { type: Boolean, value: false },
      active: { type: Boolean, value: false },
      activeMode: { type: String, value: 'backwards' },
      activeColor: { type: String, value: '#09BB07' },
      backgroundColor: { type: String, value: '#EBEBEB' },
      color: { type: String, value: '#09BB07' },
      borderRadius: { type: String, optionalTypes: [Number], value: 0 },
      fontSize: { type: String, optionalTypes: [Number], value: 16 },
      strokeWidth: { type: String, optionalTypes: [Number], value: 6 },
    },
    options: ctx.hostOptions(),
    methods: {
      handleActiveEnd() {
        if (this.data.active) this.triggerEvent('activeend', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
