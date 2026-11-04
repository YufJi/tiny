import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<store-coupon>` platform/open-capability tag. */
export function defineStoreCoupon(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'store-coupon',
    properties: {
      appid: { type: String, value: '' },
      path: { type: String, value: '' },
    },
    code: 'UNSUPPORTED_STORE_COUPON',
    message: '<store-coupon> needs the WeChat store service; the browser host renders a placeholder.',
    requestMethod: 'store.navigate',
  })
}
