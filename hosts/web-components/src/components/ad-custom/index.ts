import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<ad-custom>` platform/open-capability tag. */
export function defineAdCustom(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'ad-custom',
    properties: {
      unitId: { type: String, value: '' },
      adIntervals: { type: Number, value: 30 },
    },
    code: 'UNSUPPORTED_AD_CUSTOM',
    message: '<ad-custom> needs the WeChat ad service; the browser host renders the slot only.',
    requestMethod: 'adCustom.load',
  })
}
