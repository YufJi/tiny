import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<ad>` platform/open-capability tag. */
export function defineAd(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'ad',
    properties: {
      unitId: { type: String, value: '' },
      adIntervals: { type: Number, value: 30 },
      adType: { type: String, value: '' },
      adTheme: { type: String, value: '' },
    },
    code: 'UNSUPPORTED_AD',
    message: '<ad> needs the WeChat ad service; the browser host renders a placeholder.',
    requestMethod: 'ad.load',
  })
}
