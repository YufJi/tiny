import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown>; sync: boolean }> = []
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'battery.infoSync': () => ({ level: 55, isCharging: false }),
    'audio.sources': () => ({ audioSources: ['auto', 'mic'] }),
    'media.cropImage': (params) => ({
      tempFilePath: 'blob:crop',
      errMsg: 'cropImage:ok',
      width: params.width,
    }),
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

describe('device extras round two', () => {
  test('getBatteryInfoSync uses the synchronous channel', () => {
    const { host, calls } = createHost()
    expect(host.getBatteryInfoSync()).toEqual({ level: 55, isCharging: false })
    expect(calls[0]).toMatchObject({ method: 'battery.infoSync', sync: true })
  })

  test('getAvailableAudioSources asks the host', async () => {
    const { host, calls } = createHost()
    await expect(host.getAvailableAudioSources({})).resolves.toEqual({
      audioSources: ['auto', 'mic'],
    })
    expect(calls[0].method).toBe('audio.sources')
  })

  test('cropImage forwards the crop rectangle', async () => {
    const { host, calls } = createHost()
    await expect(host.cropImage({
      src: 'blob:big',
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      destWidth: 200,
      destHeight: 100,
    })).resolves.toMatchObject({ tempFilePath: 'blob:crop' })
    expect(calls[0]).toMatchObject({
      method: 'media.cropImage',
      params: { src: 'blob:big', x: 10, y: 20, width: 100, height: 50, destWidth: 200, destHeight: 100 },
    })
  })
})
