import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { callHost, runApi } from './run-api'

/**
 * Device, clipboard, settings, authorization and session APIs.
 *
 * Some of these are honest stubs in the P0 surface (profile, login, authorize,
 * checkSession): they keep the call shape and report what actually happened
 * through diagnostics instead of pretending to own an identity system.
 */
export function createDeviceApi(context: ServiceApiContext): MiniProgramApiHost {
  const warnStub = (code: string, message: string) => {
    context.connection.sendDiagnostic('warn', { code, message }, context.pageId)
  }
  return {
    setClipboardData: (params: unknown = {}) => runApi(
      params,
      'setClipboardData',
      () => callHost(context, 'clipboard.set', params as Record<string, unknown>),
    ),
    getClipboardData: (params: unknown = {}) => runApi(
      params,
      'getClipboardData',
      () => callHost(context, 'clipboard.get'),
    ),
    vibrateShort: (params: unknown = {}) => runApi(
      params,
      'vibrateShort',
      () => callHost(context, 'device.vibrate', { duration: 15 }),
    ),
    vibrateLong: (params: unknown = {}) => runApi(
      params,
      'vibrateLong',
      () => callHost(context, 'device.vibrate', { duration: 400 }),
    ),
    getSetting: (params: unknown = {}) => runApi(
      params,
      'getSetting',
      () => callHost(context, 'settings.get'),
    ),
    openSetting: (params: unknown = {}) => runApi(
      params,
      'openSetting',
      () => callHost(context, 'settings.open'),
    ),
    authorize: (params: unknown = {}) => runApi(
      params,
      'authorize',
      () => ({ errMsg: 'authorize:ok' }),
    ),
    checkSession: (params: unknown = {}) => runApi(
      params,
      'checkSession',
      () => ({ errMsg: 'checkSession:ok' }),
    ),
    login: (params: unknown = {}) => {
      warnStub(
        DIAGNOSTIC_CODES.API_LOGIN_STUB,
        `${context.apiName}.login returns a host-generated stub code; no session is created.`,
      )
      return runApi(params, 'login', () => callHost(context, 'login'))
    },
    getUserProfile: (params: unknown = {}) => {
      warnStub(
        DIAGNOSTIC_CODES.API_PROFILE_STUB,
        `${context.apiName}.getUserProfile returns a stub profile in the P0 runtime.`,
      )
      return runApi(params, 'getUserProfile', () => callHost(context, 'profile.get'))
    },
    getUserInfo: (params: unknown = {}) => {
      warnStub(
        DIAGNOSTIC_CODES.API_PROFILE_STUB,
        `${context.apiName}.getUserInfo returns a stub profile in the P0 runtime.`,
      )
      return runApi(params, 'getUserInfo', () => callHost(context, 'profile.get'))
    },
  }
}
