import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineCanvas(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:canvas',
    template: ctx.template('canvas'),
    behaviors: [ctx.behaviors.base],
    properties: {
      canvasId: { type: String, value: '' },
      type: { type: String, value: '' },
      disableScroll: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    lifetimes: {
      created() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CANVAS',
          message: 'Canvas rendering is a non-blocking placeholder in the P0 runtime.',
          details: { canvasId: this.data.canvasId, type: this.data.type },
        })
      },
    },
    options: { virtualHost: true },
  }).general()
}
