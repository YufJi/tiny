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
  const themeListeners = context.themeListeners ?? new Set<(value: unknown) => void>()
  // No host currently forwards keyboard geometry; keep the registration API
  // functional so apps that subscribe do not crash.
  const keyboardListeners = new Set<(value: unknown) => void>()
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
    getLaunchOptionsSync: () => ({
      path: context.getCurrentPagePath?.() ?? '',
      query: {},
      scene: 1001,
    }),
    onThemeChange: (callback: unknown) => {
      if (typeof callback === 'function') themeListeners.add(callback as (value: unknown) => void)
    },
    offThemeChange: (callback?: unknown) => {
      if (typeof callback === 'function') themeListeners.delete(callback as (value: unknown) => void)
      else themeListeners.clear()
    },
    onKeyboardHeightChange: (callback: unknown) => {
      if (typeof callback === 'function') keyboardListeners.add(callback as (value: unknown) => void)
    },
    offKeyboardHeightChange: (callback?: unknown) => {
      if (typeof callback === 'function') keyboardListeners.delete(callback as (value: unknown) => void)
      else keyboardListeners.clear()
    },
    hideKeyboard: (params: unknown = {}) => runApi(params, 'hideKeyboard', () => ({
      errMsg: 'hideKeyboard:ok',
    })),
  }
}
