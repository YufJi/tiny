import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<store-product>` platform/open-capability tag. */
export function defineStoreProduct(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'store-product',
    properties: {
      appid: { type: String, value: '' },
      path: { type: String, value: '' },
    },
    code: 'UNSUPPORTED_STORE_PRODUCT',
    message: '<store-product> needs the WeChat store service; the browser host renders a placeholder.',
    requestMethod: 'store.navigate',
  })
}
