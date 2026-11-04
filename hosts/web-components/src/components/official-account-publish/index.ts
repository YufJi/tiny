import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<official-account-publish>` platform/open-capability tag. */
export function defineOfficialAccountPublish(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'official-account-publish',
    properties: {},
    code: 'UNSUPPORTED_OFFICIAL_ACCOUNT_PUBLISH',
    message: '<official-account-publish> needs the WeChat official-account service; the browser host keeps the slot only.',
  })
}
