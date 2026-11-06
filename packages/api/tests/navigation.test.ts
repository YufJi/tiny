import { describe, expect, test } from 'vitest'
import type { WeixinApiContext } from '../src'
import { createApiHost } from '../src'
import type { EventChannel } from '../src/event-channel'

type Call = { method: string; payload: Record<string, unknown> }

const NAVIGATION_ERR_MSG: Record<string, string> = {
  'navigate.back': 'navigateBack',
  'navigate.redirectTo': 'redirectTo',
  'navigate.reLaunch': 'reLaunch',
  'navigate.switchTab': 'switchTab',
}

function createContext(options: { failWith?: string } = {}) {
  const calls: Call[] = []
  const pageChannels: Array<EventChannel & { on: (name: string, fn: (value: unknown) => void) => void }> = []
  let releases = 0
  const connection = {
    call: (domain: string, method: string, payload: Record<string, unknown> = {}) => {
      calls.push({ method, payload })
      if (options.failWith) return Promise.reject(new Error(options.failWith))
      if (method === 'navigate.to') {
        // The kernel produces the success object, including `errMsg`; the API
        // layer passes it through.
        return Promise.resolve({
          status: 'navigated',
          errMsg: 'navigateTo:ok',
          path: 'pages/next/next',
          pageId: 'page-2',
        })
      }
      return Promise.resolve({ status: 'ok', errMsg: `${NAVIGATION_ERR_MSG[method] ?? 'ok'}:ok` })
    },
    sendDiagnostic: () => undefined,
  }
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    pageId: 'page-1',
    setNextPageEventChannel(channel: unknown) {
      pageChannels.push(channel as EventChannel)
      return () => {
        releases += 1
      }
    },
  } as unknown as WeixinApiContext
  return {
    context,
    calls,
    pageChannels,
    releases: () => releases,
  }
}

function api(context: WeixinApiContext) {
  return createApiHost(context) as Record<string, (...args: unknown[]) => unknown>
}

describe('navigation API', () => {
  test('navigateTo resolves with errMsg and an EventChannel', async () => {
    const { context, calls, pageChannels, releases } = createContext()
    const host = api(context)
    const result = await host.navigateTo!({ url: './next/next?from=list' }) as Record<string, unknown>

    expect(result).toMatchObject({
      errMsg: 'navigateTo:ok',
      path: 'pages/next/next',
      pageId: 'page-2',
    })
    // Only serializable fields cross the bridge.
    expect(calls[0]).toEqual({
      method: 'navigate.to',
      payload: { url: './next/next?from=list' },
    })
    const channel = result.eventChannel as EventChannel
    expect(typeof channel.emit).toBe('function')
    expect(typeof channel.on).toBe('function')
    expect(typeof channel.once).toBe('function')
    expect(typeof channel.off).toBe('function')
    // The page side was bound before the navigation ran, and the binding is
    // released once the call settled.
    expect(pageChannels).toHaveLength(1)
    expect(releases()).toBe(1)
  })

  test('events handlers and the page-side channel are cross-wired', async () => {
    const { context, pageChannels } = createContext()
    const host = api(context)
    const heard: unknown[] = []
    const result = await host.navigateTo!({
      url: '/pages/next/next',
      events: { pageReady: (payload: unknown) => heard.push(payload) },
    }) as Record<string, unknown>
    const opener = result.eventChannel as EventChannel
    const page = pageChannels[0]!

    // Page -> opener: both the events map and opener.on listen on this side.
    const openerHeard: unknown[] = []
    opener.on('pageReady', (payload) => openerHeard.push(payload))
    page.emit('pageReady', { at: 1 })
    expect(heard).toEqual([{ at: 1 }])
    expect(openerHeard).toEqual([{ at: 1 }])

    // Opener -> page.
    const pageHeard: unknown[] = []
    page.on('fromOpener', (payload) => pageHeard.push(payload))
    opener.emit('fromOpener', { at: 2 })
    expect(pageHeard).toEqual([{ at: 2 }])
  })

  test('the callback form returns undefined and keeps the WeChat callbacks', async () => {
    const { context, calls, releases } = createContext()
    const host = api(context)
    const log: string[] = []
    let successChannel: EventChannel | undefined
    const returned = host.navigateTo!({
      url: '/pages/next/next',
      events: { ignored: () => undefined },
      success: (result: Record<string, unknown>) => {
        successChannel = result.eventChannel as EventChannel
        log.push(`success:${String(result.errMsg)}`)
      },
      complete: () => log.push('complete'),
    })

    expect(returned).toBeUndefined()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(log).toEqual(['success:navigateTo:ok', 'complete'])
    expect(successChannel).toBeDefined()
    // Functions never reach the host payload.
    expect(calls[0]!.payload).toEqual({ url: '/pages/next/next' })
    expect(releases()).toBe(1)
  })

  test('failures reject the promise form and call fail in the callback form', async () => {
    const { context, releases } = createContext({ failWith: 'page stack limit' })
    const host = api(context)

    await expect(host.navigateTo!({ url: '/pages/next/next' })).rejects.toThrow('page stack limit')

    const log: string[] = []
    const returned = host.navigateTo!({
      url: '/pages/next/next',
      fail: (error: { errMsg: string }) => log.push(`fail:${error.errMsg}`),
      complete: (error: { errMsg: string }) => log.push(`complete:${error.errMsg}`),
    })
    expect(returned).toBeUndefined()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(log).toEqual([
      'fail:navigateTo:fail page stack limit',
      'complete:navigateTo:fail page stack limit',
    ])
    // A failed navigation must not leak the channel into the next one.
    expect(releases()).toBe(2)
  })

  test('navigateBack and the other navigation APIs pass the kernel errMsg through', async () => {
    const { context, calls } = createContext()
    const host = api(context)

    expect(await host.navigateBack!()).toMatchObject({ errMsg: 'navigateBack:ok' })
    expect(await host.redirectTo!({ url: '/pages/next/next' }))
      .toMatchObject({ errMsg: 'redirectTo:ok' })
    expect(await host.reLaunch!({ url: '/pages/next/next' }))
      .toMatchObject({ errMsg: 'reLaunch:ok' })
    expect(await host.switchTab!({ url: '/pages/next/next' }))
      .toMatchObject({ errMsg: 'switchTab:ok' })
    expect(calls.map((call) => call.method)).toEqual([
      'navigate.back',
      'navigate.redirectTo',
      'navigate.reLaunch',
      'navigate.switchTab',
    ])
    expect(calls[0]!.payload).toEqual({})
  })

  test('Skyline custom-route fields pass through untouched', async () => {
    const { context, calls } = createContext()
    const host = api(context)
    // This runtime renders WebView pages, so a custom `routeType` is ignored by
    // the page stack — but the API must not reinterpret or drop it.
    await host.navigateTo!({ url: '/pages/next/next', routeType: 'slide' })
    expect(calls[0]!.payload).toEqual({ url: '/pages/next/next', routeType: 'slide' })
  })
})
