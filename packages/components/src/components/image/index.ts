import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineImage(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:image',
    template: ctx.template('image'),
    behaviors: [ctx.behaviors.base],
    properties: {
      ariaLabel: { type: String, value: '' },
      src: { type: String, value: '' },
      mode: { type: String, value: 'scaleToFill' },
      lazyLoad: { type: Boolean, value: false },
      webp: { type: Boolean, value: false },
      showMenuByLongpress: { type: Boolean, value: false },
      renderingMode: { type: String, value: 'backgroundImage' },
      backgroundSize: { type: String, value: '100% 100%' },
      backgroundPosition: { type: String, value: '' },
      backgroundRepeat: { type: String, value: 'no-repeat' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    methods: {
      handleLoad(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('load', event.detail ?? {}, { bubbles: true, composed: true })
      },
      handleError(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('error', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
