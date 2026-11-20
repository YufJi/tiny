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
    getSystemInfoAsync: (params: unknown = {}) => runApi(
      params,
      'getSystemInfoAsync',
      async () => cloneJsonSafe(await callHost(context, 'system.info')),
    ),
    getSystemSetting: (params: unknown = {}) => runApi(
      params,
      'getSystemSetting',
      () => callHost(context, 'system.setting'),
    ),
    getAccountInfoSync: () => cloneJsonSafe(callHostSync(context, 'account.info')),
    getEnterOptionsSync: () => cloneJsonSafe(context.launchOptions ?? {}),
    getExtConfig: (params: unknown = {}) => runApi(
      params,
      'getExtConfig',
      async () => ({
        extConfig: cloneJsonSafe(await callHost(context, 'account.extConfig')),
        errMsg: 'getExtConfig:ok',
      }),
    ),
    getExtConfigSync: () => cloneJsonSafe(callHostSync(context, 'account.extConfig')),
    getApiCategory: () => ({ apiCategory: 'default' }),
    getRendererUserAgent: () => String(
      (callHostSync(context, 'env.userAgent') as { userAgent?: unknown } | undefined)?.userAgent ?? '',
    ),
    getAppAuthorizeSetting: () => cloneJsonSafe(callHostSync(context, 'permissions.setting')),
    setBackgroundFetchToken: (params: unknown = {}) => runApi(params, 'setBackgroundFetchToken', () => (
      callHost(context, 'backgroundFetch.setToken', { token: String((params as { token?: unknown }).token ?? '') })
    )),
    getBackgroundFetchToken: (params: unknown = {}) => runApi(params, 'getBackgroundFetchToken', () => (
      callHost(context, 'backgroundFetch.getToken')
    )),
    getDeviceBenchmarkInfo: (params: unknown = {}) => runApi(params, 'getDeviceBenchmarkInfo', () => (
      callHost(context, 'device.benchmark')
    )),
    getUserCryptoManager: () => createUserCryptoManager(context),
    canIUse: createCanIUse(context, CAN_I_USE_CAPABILITIES),
    nextTick: (callback: unknown) => {
      if (typeof callback === 'function') Promise.resolve().then(() => callback())
    },
    getLaunchOptionsSync: () => cloneJsonSafe(context.launchOptions ?? {}),
    hideKeyboard: (params: unknown = {}) => runApi(
      params,
      'hideKeyboard',
      () => callHost(context, 'keyboard.hide'),
    ),
  }
}


/**
 * The user crypto manager exposes random bytes; the WeChat-account key pair is
 * unavailable without a login, so `getLatestUserKey` fails honestly.
 */
function createUserCryptoManager(context: ApiContext): Record<string, unknown> {
  return {
    getRandomValues: (params: unknown = {}) => runApi(params, 'getRandomValues', () => {
      const length = Math.floor(Number((params as { length?: unknown }).length ?? 0))
      if (!Number.isFinite(length) || length <= 0) throw new Error('length must be a positive number')
      const bytes = new Uint8Array(length)
      const webcrypto = (globalThis as {
        crypto?: { getRandomValues?: (array: Uint8Array) => unknown }
      }).crypto
      if (typeof webcrypto?.getRandomValues !== 'function') {
        throw new Error('Web Crypto is not available in this runtime')
      }
      webcrypto.getRandomValues(bytes)
      return { randomValues: bytes.buffer, errMsg: 'getRandomValues:ok' }
    }),
    getLatestUserKey: (params: unknown = {}) => runApi(params, 'getLatestUserKey', () => {
      throw new Error('no WeChat account key is available in this host')
    }),
  }
}
