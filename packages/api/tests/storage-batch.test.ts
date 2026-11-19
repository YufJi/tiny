import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown>; sync: boolean }> = []
  const store: Record<string, unknown> = { a: 1, b: 'two' }
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'storage.batchGet': (params) => ({
      dataList: (params.keyList as string[]).map((key) => store[key]),
      errMsg: 'batchGetStorage:ok',
    }),
    'storage.batchSet': (params) => {
      for (const entry of params.kvList as Array<{ key: string; value: unknown }>) {
        store[entry.key] = entry.value
      }
      return { errMsg: 'batchSetStorage:ok' }
    },
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
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    store,
  }
}

describe('batch storage', () => {
  test('batchGetStorage returns the host dataList in key order', async () => {
    const { host, calls } = createHost()
    const result = await host.batchGetStorage({ keyList: ['b', 'a'] })
    expect(result).toEqual({ dataList: ['two', 1], errMsg: 'batchGetStorage:ok' })
    expect(calls[0]).toMatchObject({
      method: 'storage.batchGet',
      params: { keyList: ['b', 'a'] },
    })
  })

  test('batchGetStorageSync unwraps the host envelope', () => {
    const { host, calls } = createHost()
    expect(host.batchGetStorageSync(['a', 'b'])).toEqual([1, 'two'])
    expect(calls[0]).toMatchObject({ method: 'storage.batchGet', sync: true })
  })

  test('batchSetStorage writes through the async channel', async () => {
    const { host, store } = createHost()
    await expect(host.batchSetStorage({
      kvList: [{ key: 'c', value: 3 }, { key: 'd', value: { nested: true } }],
    })).resolves.toEqual({ errMsg: 'batchSetStorage:ok' })
    expect(store.c).toBe(3)
    expect(store.d).toEqual({ nested: true })
  })

  test('batchSetStorageSync uses the synchronous channel', () => {
    const { host, calls, store } = createHost()
    host.batchSetStorageSync([{ key: 'e', value: 'five' }])
    expect(store.e).toBe('five')
    expect(calls[0]).toMatchObject({ method: 'storage.batchSet', sync: true })
  })

  test('an empty key list stays empty instead of throwing', async () => {
    const { host } = createHost()
    await expect(host.batchGetStorage({})).resolves.toMatchObject({ dataList: [] })
  })
})
