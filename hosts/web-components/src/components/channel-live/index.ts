import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

/**
 * `wx-channel-live` requires the WeChat Channels live service. The browser
 * host keeps the tag and reports the missing capability.
 */
export function defineChannelLive(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('channel-live'),
    template: ctx.template('channel-live'),
    behaviors: [ctx.behaviors.base],
    properties: {
      feedId: { type: String, value: '' },
      finderUserName: { type: String, value: '' },
      mode: { type: String, value: 'live' },
    },
    options: ctx.hostOptions('channel-live'),
    lifetimes: {
      attached() {
        ctx.options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CHANNEL_LIVE',
          message: '<channel-live> needs the WeChat Channels service; it renders a placeholder in the browser host.',
        })
      },
    },
  }).general()
}
