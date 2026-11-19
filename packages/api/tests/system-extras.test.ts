import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const store: Record<string, string> = {}
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'backgroundFetch.setToken': (params) => {
      store.token = String(params.token ?? '')
      return { errMsg: 'setBackgroundFetchToken:ok' }
    },
    'backgroundFetch.getToken': () => ({ token: store.token ?? '', errMsg: 'getBackgroundFetchToken:ok' }),
    'device.benchmark': () => ({ benchmarkLevel: 20, deviceLevel: 18, errMsg: 'getDeviceBenchmarkInfo:ok' }),
    'location.startBackground': () => ({ errMsg: 'startLocationUpdateBackground:ok' }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: () => undefined,
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

describe('system extras', () => {
  test('background fetch token round-trips through the host', async () => {
    const { host } = createHost()
    await expect(host.setBackgroundFetchToken({ token: 'abc' })).resolves.toEqual({
      errMsg: 'setBackgroundFetchToken:ok',
    })
    await expect(host.getBackgroundFetchToken({})).resolves.toEqual({
      token: 'abc',
      errMsg: 'getBackgroundFetchToken:ok',
    })
  })

  test('getDeviceBenchmarkInfo forwards to the host', async () => {
    const { host, calls } = createHost()
    await expect(host.getDeviceBenchmarkInfo({})).resolves.toMatchObject({ benchmarkLevel: 20 })
    expect(calls.at(-1)?.method).toBe('device.benchmark')
  })

  test('getUserCryptoManager produces random bytes but no account key', async () => {
    const { host } = createHost()
    const manager = host.getUserCryptoManager()
    const random = await manager.getRandomValues({ length: 8 })
    expect(random.randomValues).toBeInstanceOf(ArrayBuffer)
    expect(random.randomValues.byteLength).toBe(8)

    const failures: Array<{ errMsg?: string }> = []
    await manager.getLatestUserKey({ fail: (value: { errMsg?: string }) => failures.push(value) })
    expect(failures[0]?.errMsg).toContain('getLatestUserKey:fail')
  })

  test('startLocationUpdateBackground forwards the call', async () => {
    const { host, calls } = createHost()
    await host.startLocationUpdateBackground({ type: 'gcj02' })
    expect(calls.at(-1)).toMatchObject({
      method: 'location.startBackground',
      params: { type: 'gcj02' },
    })
  })
})
