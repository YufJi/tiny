import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<reward>` platform/open-capability tag. */
export function defineReward(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'reward',
    properties: {
      type: { type: String, value: 'video' },
    },
    code: 'UNSUPPORTED_REWARD',
    message: '<reward> needs the WeChat rewarded-ad service; the browser host renders a placeholder.',
    requestMethod: 'reward.load',
  })
}
