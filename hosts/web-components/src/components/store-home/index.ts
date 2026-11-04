import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { defineOpenCapability } from '../open-capability'

/** `<store-home>` platform/open-capability tag. */
export function defineStoreHome(ctx: BuiltinContext): BuiltinDefinition {
  return defineOpenCapability(ctx, {
    tag: 'store-home',
    properties: {
      appid: { type: String, value: '' },
      path: { type: String, value: '' },
    },
    code: 'UNSUPPORTED_STORE_HOME',
    message: '<store-home> needs the WeChat store service; the browser host renders a placeholder.',
    requestMethod: 'store.navigate',
  })
}
