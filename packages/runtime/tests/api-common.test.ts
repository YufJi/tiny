import { describe, expect, test } from 'vitest'
import { createServiceApiHost, type ServiceApiContext } from '../src/service/thread'

function createContext() {
  const storage: Record<string, unknown> = {}
  const calls: Array<{ domain: string; method: string; params: Record<string, unknown> }> = []
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'storage.set': (params) => {
      storage[String(params.key)] = params.value
      return { errMsg: 'setStorageSync:ok' }
    },
    'storage.remove': (params) => {
      delete storage[String(params.key)]
      return { errMsg: 'removeStorageSync:ok' }
    },
    'storage.clear': () => {
      for (const key of Object.keys(storage)) delete storage[key]
      return { errMsg: 'clearStorageSync:ok' }
    },
    'storage.info': () => ({ keys: Object.keys(storage), currentSize: 0, limitSize: 10240 }),
    'network.request': () => ({ statusCode: 200, data: { ok: true }, header: {}, errMsg: 'request:ok' }),
    'network.type': () => ({ networkType: 'wifi', errMsg: 'getNetworkType:ok' }),
    'ui.modal': () => ({ confirm: true, cancel: false, errMsg: 'showModal:ok' }),
    'toast.show': () => ({ errMsg: 'showToast:ok' }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ domain, method, params })
      return Promise.resolve(handlers[method]?.(params))
    },
  }
  const apiNames = new Set([
    'getStorage',
    'setStorage',
    'request',
    'getNetworkType',
    'showModal',
    'showToast',
  ])
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    getSystemInfoSnapshot: () => ({ pixelRatio: 1, windowWidth: 0, windowHeight: 0 }),
    getStorageSnapshot: () => storage,
    setStorageSnapshot: (key: string, value: unknown) => { storage[key] = value },
    apiNames,
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ServiceApiContext
  return { context, storage, calls }
}

describe('common host APIs', () => {
  test('storage async/sync and storage info', async () => {
    const { context, calls } = createContext()
    const host = createServiceApiHost(context) as Record<string, (...args: unknown[]) => unknown>
    await host.setStorage({ key: 'token', value: 'abc' })
    expect(host.getStorageSync('token')).toBe('abc')
    await host.getStorage({ key: 'token', success: (value: unknown) => {
      expect(value).toEqual({ data: 'abc', errMsg: 'getStorage:ok' })
    } })
    expect(host.getStorageInfoSync()).toMatchObject({ keys: ['token'], limitSize: 10240 })
    await host.removeStorage({ key: 'token' })
    expect(host.getStorageSync('token')).toBeUndefined()
    await host.clearStorage()
    expect(calls.some((call) => call.method === 'storage.set')).toBe(true)
  })

  test('request and simple device/UI APIs use host handlers', async () => {
    const { context, calls } = createContext()
    const host = createServiceApiHost(context) as Record<string, (...args: unknown[]) => unknown>
    const request = host.request({ url: 'https://example.test/api', method: 'POST', data: { a: 1 } })
    expect(typeof (request as { abort?: unknown }).abort).toBe('function')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(calls.find((call) => call.method === 'network.request')?.params).toMatchObject({ url: 'https://example.test/api' })

    let networkType = ''
    await host.getNetworkType({ success: (value: unknown) => { networkType = String((value as { networkType?: string }).networkType) } })
    expect(networkType).toBe('wifi')

    let modal: unknown
    await host.showModal({ title: 't', content: 'c', success: (value: unknown) => { modal = value } })
    expect(modal).toMatchObject({ confirm: true, cancel: false })

    expect(host.canIUse('wx.request')).toBe(true)
    expect(host.canIUse('wx.notImplemented')).toBe(false)
    context.apiNamespaces = ['my', 'wx']
    expect(host.canIUse('my.request')).toBe(true)
    expect(host.canIUse('my.notImplemented')).toBe(false)
    expect(host.canIUse('other.request')).toBe(false)
    expect(host.getLaunchOptionsSync()).toMatchObject({ path: 'pages/index/index', scene: 1001 })
  })
})
