import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost(options: { launchOptions?: unknown } = {}) {
  const calls: Array<{ method: string; params: Record<string, unknown>; sync: boolean }> = []
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'system.info': () => ({ pixelRatio: 2, windowWidth: 390, windowHeight: 844 }),
    'system.setting': () => ({
      bluetoothEnabled: false,
      locationEnabled: true,
      wifiEnabled: false,
      errMsg: 'getSystemSetting:ok',
    }),
    'account.info': () => ({
      miniProgram: { appId: 'cli-app', envVersion: 'develop', version: '0.0.0' },
      plugin: {},
    }),
    'update.check': () => ({ hasUpdate: false, errMsg: 'checkForUpdate:ok' }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: false })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: true })
      const handler = handlers[method]
      if (!handler) throw new Error(`unsupported sync host API: ${method}`)
      return handler(params)
    },
  }
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: options.launchOptions ?? { path: 'pages/index/index', query: { a: '1' }, scene: 1001 },
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
  }
}

const wait = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms))

describe('service basics', () => {
  test('getEnterOptionsSync returns a detached copy of the launch options', async () => {
    const { host } = createHost()
    const options = host.getEnterOptionsSync()
    expect(options).toEqual({ path: 'pages/index/index', query: { a: '1' }, scene: 1001 })
    options.query.a = 'mutated'
    expect(host.getEnterOptionsSync().query.a).toBe('1')
  })

  test('getSystemInfoAsync and getSystemSetting go through the host', async () => {
    const { host, calls } = createHost()
    await expect(host.getSystemInfoAsync()).resolves.toEqual({
      pixelRatio: 2,
      windowWidth: 390,
      windowHeight: 844,
    })
    await expect(host.getSystemSetting()).resolves.toEqual({
      bluetoothEnabled: false,
      locationEnabled: true,
      wifiEnabled: false,
      errMsg: 'getSystemSetting:ok',
    })
    expect(calls.map((call) => call.method)).toEqual(['system.info', 'system.setting'])
  })

  test('getAccountInfoSync uses the synchronous host channel', () => {
    const { host, calls } = createHost()
    expect(host.getAccountInfoSync()).toMatchObject({
      miniProgram: { appId: 'cli-app', envVersion: 'develop' },
    })
    expect(calls).toEqual([{ method: 'account.info', params: {}, sync: true }])
  })

  test('getRandomValues returns a buffer of the requested length', async () => {
    const { host } = createHost()
    const result = await host.getRandomValues({ length: 16 })
    expect(result.errMsg).toBe('getRandomValues:ok')
    expect(result.randomValues).toBeInstanceOf(ArrayBuffer)
    expect(result.randomValues.byteLength).toBe(16)
  })

  test('getRandomValues rejects an invalid length through the fail callback', async () => {
    const { host } = createHost()
    const failures: Array<{ errMsg?: string }> = []
    await host.getRandomValues({ length: 0, fail: (value: { errMsg?: string }) => failures.push(value) })
    expect(failures).toHaveLength(1)
    expect(failures[0].errMsg).toContain('getRandomValues:fail')
  })

  test('createBufferURL and revokeBufferURL round-trip', () => {
    const { host } = createHost()
    const url = host.createBufferURL(new ArrayBuffer(8))
    expect(typeof url).toBe('string')
    expect(url.startsWith('blob:')).toBe(true)
    expect(() => host.revokeBufferURL(url)).not.toThrow()
  })

  test('requestIdleCallback runs the callback without a native scheduler', async () => {
    const { host } = createHost()
    const deadline = await new Promise((resolve) => host.requestIdleCallback(resolve))
    expect(deadline).toMatchObject({ didTimeout: false })
  })

  test('getUpdateManager reports the host answer instead of staying silent', async () => {
    const { host, calls } = createHost()
    const updates: Array<{ hasUpdate: boolean }> = []
    host.getUpdateManager().onCheckForUpdate((value: { hasUpdate: boolean }) => updates.push(value))
    await wait()
    expect(calls).toContainEqual({ method: 'update.check', params: {}, sync: false })
    expect(updates).toEqual([{ hasUpdate: false }])
  })
})
