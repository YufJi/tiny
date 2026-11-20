import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown>; sync: boolean }> = []
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'account.extConfig': () => ({ tenant: 'acme' }),
    'env.userAgent': () => ({ userAgent: 'TinyTest/1.0' }),
    'permissions.setting': () => ({
      albumAuthorized: 'not determined',
      cameraAuthorized: 'authorized',
      locationAuthorized: 'denied',
      locationReducedAccuracy: false,
      microphoneAuthorized: 'not determined',
      notificationAuthorized: 'not determined',
      phoneCalendarAuthorized: 'not determined',
      bluetoothAuthorized: 'not determined',
    }),
    'media.hevcSupport': () => ({ supportHevc: true, hevcHardware: false }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: false })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: true })
      return handlers[method]?.(params)
    },
  }
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
  }
}

describe('host environment APIs', () => {
  test('getExtConfig wraps the config in extConfig', async () => {
    const { host } = createHost()
    await expect(host.getExtConfig({})).resolves.toEqual({
      extConfig: { tenant: 'acme' },
      errMsg: 'getExtConfig:ok',
    })
    expect(host.getExtConfigSync()).toEqual({ tenant: 'acme' })
  })

  test('getApiCategory and getRendererUserAgent report local facts', () => {
    const { host, calls } = createHost()
    expect(host.getApiCategory()).toEqual({ apiCategory: 'default' })
    expect(host.getRendererUserAgent()).toBe('TinyTest/1.0')
    expect(calls.at(-1)).toMatchObject({ method: 'env.userAgent', sync: true })
  })

  test('getAppAuthorizeSetting returns the host snapshot', () => {
    const { host } = createHost()
    expect(host.getAppAuthorizeSetting()).toMatchObject({
      cameraAuthorized: 'authorized',
      locationAuthorized: 'denied',
    })
  })

  test('checkDeviceSupportHevc goes through the host', async () => {
    const { host, calls } = createHost()
    await expect(host.checkDeviceSupportHevc({})).resolves.toEqual({
      supportHevc: true,
      hevcHardware: false,
    })
    expect(calls[0].method).toBe('media.hevcSupport')
  })
})
