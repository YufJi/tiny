import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost, createGlobalEventHub } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const events = createGlobalEventHub()
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve({ errMsg: `${method}:ok` })
    },
    callSync: () => undefined,
  }
  const context = {
    connection,
    events,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    events,
  }
}

describe('device extras', () => {
  test('setKeepScreenOn forwards the flag, defaulting to true', async () => {
    const { host, calls } = createHost()
    await host.setKeepScreenOn({ keepScreenOn: true })
    await host.setKeepScreenOn({})
    await host.setKeepScreenOn({ keepScreenOn: false })
    expect(calls.map((call) => call.params.keepScreenOn)).toEqual([true, true, false])
  })

  test('loadFontFace forwards family and source as given', async () => {
    const { host, calls } = createHost()
    await host.loadFontFace({ family: 'MyFont', source: 'url("https://example.com/f.woff2")', global: true })
    expect(calls[0]).toMatchObject({
      method: 'font.load',
      params: { family: 'MyFont', source: 'url("https://example.com/f.woff2")', global: true },
    })
  })

  test('network weak changes arrive through the global event hub', () => {
    const { host, events } = createHost()
    const seen: unknown[] = []
    host.onNetworkWeakChange((value: unknown) => seen.push(value))
    events.emit('networkWeakChange', { weakNetwork: true, weakRTT: 1200 })
    expect(seen).toEqual([{ weakNetwork: true, weakRTT: 1200 }])

    host.offNetworkWeakChange()
    events.emit('networkWeakChange', { weakNetwork: false })
    expect(seen).toHaveLength(1)
  })
})
