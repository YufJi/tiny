import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * `wx-voip-room` requires the WeChat VoIP service. The browser host keeps the
 * tag/slot and reports the missing capability once.
 */
export function defineVoipRoom(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('voip-room'),
    template: ctx.template('voip-room'),
    behaviors: [ctx.behaviors.base],
    properties: {
      openid: { type: String, value: '' },
      mode: { type: String, value: 'camera' },
      devicePosition: { type: String, value: 'front' },
    },
    options: ctx.hostOptions('voip-room'),
    lifetimes: {
      attached() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_VOIP_ROOM',
          message: '<voip-room> needs the WeChat VoIP service; it renders a placeholder in the browser host.',
        })
      },
    },
  }).general()
}
