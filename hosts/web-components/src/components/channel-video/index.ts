import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * `wx-channel-video` requires the WeChat Channels video service. The browser
 * host keeps the tag and reports the missing capability.
 */
export function defineChannelVideo(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('channel-video'),
    template: ctx.template('channel-video'),
    behaviors: [ctx.behaviors.base],
    properties: {
      feedId: { type: String, value: '' },
      finderUserName: { type: String, value: '' },
      autoplay: { type: Boolean, value: false },
      loop: { type: Boolean, value: false },
      muted: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('channel-video'),
    lifetimes: {
      attached() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CHANNEL_VIDEO',
          message: '<channel-video> needs the WeChat Channels service; it renders a placeholder in the browser host.',
        })
      },
    },
  }).general()
}
