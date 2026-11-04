import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<store-gift>` platform/open-capability tag. */
export function defineStoreGift(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'store-gift',
    properties: {
      appid: { type: String, value: '' },
      path: { type: String, value: '' },
    },
    code: 'UNSUPPORTED_STORE_GIFT',
    message: '<store-gift> needs the WeChat store service; the browser host renders a placeholder.',
    requestMethod: 'store.navigate',
  })
}
