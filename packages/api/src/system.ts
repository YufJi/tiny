import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { CAN_I_USE_CAPABILITIES } from './capabilities'
import { createCanIUse } from './can-i-use'
import { cloneJsonSafe } from './json'
import { runApi } from './run-api'

/**
 * Device/system facts and feature detection.
 *
 * The snapshot itself is a kernel capability (`getSystemInfoSnapshot`) because
 * the host pushes it into the runtime at boot; the shape handed to app code is
 * the WeChat-compatible API surface and therefore lives here.
 */
export function createSystemApi(context: ServiceApiContext): MiniProgramApiHost {
  const themeListeners = context.themeListeners ?? new Set<(value: unknown) => void>()
  // No host currently forwards keyboard geometry; keep the registration API
  // functional so apps that subscribe do not crash.
  const keyboardListeners = new Set<(value: unknown) => void>()
  return {
    getSystemInfoSync: () => cloneJsonSafe(context.getSystemInfoSnapshot()),
    getSystemInfo: (params?: unknown) => {
      const info = cloneJsonSafe(context.getSystemInfoSnapshot())
      const callbacks = (params ?? {}) as {
        success?: (value: unknown) => void
        complete?: (value: unknown) => void
      }
      callbacks.success?.(info)
      callbacks.complete?.(info)
      return info
    },
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
