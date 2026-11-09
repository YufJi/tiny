import type { ApiHost, ApiContext } from './context'
import { CAN_I_USE_CAPABILITIES } from './capabilities'
import { createCanIUse } from './can-i-use'
import { cloneJsonSafe } from './json'
import { callHost, callHostSync, runApi } from './run-api'

/**
 * Device/system facts and feature detection.
 *
 * The host owns the facts: `getSystemInfoSync` uses the host's synchronous
 * channel and `getSystemInfo` awaits a real `system.info` round-trip. The
 * runtime keeps no snapshot, so a host that changes its window facts (rotation,
 * panel resize) is observable immediately.
 */
export function createSystemApi(context: ApiContext): ApiHost {
  return {
    getSystemInfoSync: () => cloneJsonSafe(callHostSync(context, 'system.info')),
    getSystemInfo: (params: unknown = {}) => runApi(
      params,
      'getSystemInfo',
      async () => cloneJsonSafe(await callHost(context, 'system.info')),
    ),
    canIUse: createCanIUse(context, CAN_I_USE_CAPABILITIES),
    nextTick: (callback: unknown) => {
      if (typeof callback === 'function') Promise.resolve().then(() => callback())
    },
    getLaunchOptionsSync: () => cloneJsonSafe(context.launchOptions ?? {}),
    hideKeyboard: (params: unknown = {}) => runApi(params, 'hideKeyboard', () => ({
      errMsg: 'hideKeyboard:ok',
    })),
  }
}
