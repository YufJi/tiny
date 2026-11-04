import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<official-account>` platform/open-capability tag. */
export function defineOfficialAccount(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'official-account',
    properties: {
      show: { type: Boolean, value: true },
    },
    code: 'UNSUPPORTED_OFFICIAL_ACCOUNT',
    message: '<official-account> needs the WeChat official-account banner service; the browser host renders a placeholder.',
  })
}
