import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { callHost, runApi } from './run-api'

/** Share-menu APIs; the host decides whether a native share sheet exists. */
export function createShareApi(context: ServiceApiContext): MiniProgramApiHost {
  return {
    showShareMenu: (params: unknown = {}) => runApi(
      params,
      'showShareMenu',
      () => callHost(context, 'share.menu', { action: 'showShareMenu' }),
    ),
    hideShareMenu: (params: unknown = {}) => runApi(
      params,
      'hideShareMenu',
      () => callHost(context, 'share.menu', { action: 'hideShareMenu' }),
    ),
    updateShareMenu: (params: unknown = {}) => runApi(
      params,
      'updateShareMenu',
      () => callHost(context, 'share.menu', { action: 'updateShareMenu' }),
    ),
  }
}
