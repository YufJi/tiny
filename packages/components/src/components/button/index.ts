import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineButton(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:button',
    template: ctx.template('button'),
    properties: {
      type: { type: String, value: 'default' },
      disabled: { type: Boolean, value: false },
      hoverClass: { type: String, value: 'tiny-button-hover' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        this.triggerEvent('tap', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
