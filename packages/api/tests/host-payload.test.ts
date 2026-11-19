import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

type Call = { method: string; payload: Record<string, unknown> }

function createContext(reply: (method: string, payload: Record<string, unknown>) => Promise<unknown>) {
  const calls: Call[] = []
  const context = {
    connection: {
      sendDiagnostic: () => undefined,
      call: (_domain: string, method: string, payload: Record<string, unknown>) => {
        calls.push({ method, payload })
        return reply(method, payload)
      },
      callSync: (_domain: string, method: string, payload: Record<string, unknown>) => {
        calls.push({ method, payload })
        return {}
      },
    },
    pageId: 'page-1',
  } as unknown as ApiContext
  return { context, calls }
}

/**
 * The bridge rejects functions, `undefined`, `Date`/`Map`/`Set` and
 * non-plain objects anywhere in a payload (`assertJsonSafe`). Mirror that
 * check so a regression fails here instead of at the transport.
 */
function expectBridgeSafe(value: unknown, path = 'payload'): void {
  if (value === null) return
  const valueType = typeof value
  if (valueType === 'string' || valueType === 'boolean') return
  if (valueType === 'number') {
    expect(Number.isFinite(value), `${path} is a finite number`).toBe(true)
    return
  }
  expect(valueType, `${path} is JSON-safe`).not.toBe('function')
  expect(valueType, `${path} is JSON-safe`).not.toBe('undefined')
  if (Array.isArray(value)) {
    value.forEach((item, index) => expectBridgeSafe(item, `${path}[${index}]`))
    return
  }
  expect(Object.getPrototypeOf(value), `${path} is a plain object`).toBe(Object.prototype)
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    expectBridgeSafe(item, `${path}.${key}`)
  }
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('host API payloads', () => {
  test('showToast strips completion callbacks and still runs them', async () => {
    const log: string[] = []
    const { context, calls } = createContext(() => Promise.resolve({ errMsg: 'showToast:ok' }))
    const wx = createApiHost(context)
    wx.showToast!({
      title: 'hi',
      icon: 'success',
      success: (value: unknown) => log.push(`success:${JSON.stringify(value)}`),
      fail: () => log.push('fail'),
      complete: (value: unknown) => log.push(`complete:${JSON.stringify(value)}`),
    })
    await tick()
    expect(calls).toEqual([{
      method: 'toast.show',
      payload: { title: 'hi', icon: 'success' },
    }])
    expectBridgeSafe(calls[0]!.payload)
    expect(log).toEqual([
      'success:{"errMsg":"showToast:ok"}',
      'complete:{"errMsg":"showToast:ok"}',
    ])
  })

  test('request sends a bridge-safe body and keeps the task shape', async () => {
    const success: unknown[] = []
    const { context, calls } = createContext(() => Promise.resolve({ statusCode: 200 }))
    const wx = createApiHost(context)
    const task = wx.request!({
      url: 'https://example.com/api',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { query: 'x' },
      success: (value: unknown) => success.push(value),
      fail: () => undefined,
      complete: () => undefined,
    }) as { abort?: unknown }
    await tick()
    expect(calls).toHaveLength(1)
    expect(calls[0]!.method).toBe('network.request')
    expect(calls[0]!.payload).toEqual({
      url: 'https://example.com/api',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: { query: 'x' },
    })
    expectBridgeSafe(calls[0]!.payload)
    expect(success).toEqual([{ statusCode: 200 }])
    expect(task.abort).toBeTypeOf('function')
  })

  test('a resolved host result with a :fail errMsg reaches fail/complete', async () => {
    const log: string[] = []
    const { context } = createContext(() => Promise.resolve({
      errMsg: 'setClipboardData:fail not implemented',
    }))
    const wx = createApiHost(context)
    wx.setClipboardData!({
      data: 'hello',
      success: () => log.push('success'),
      fail: (value: unknown) => log.push(`fail:${JSON.stringify(value)}`),
      complete: (value: unknown) => log.push(`complete:${JSON.stringify(value)}`),
    })
    await tick()
    expect(log).toEqual([
      'fail:{"errMsg":"setClipboardData:fail not implemented"}',
      'complete:{"errMsg":"setClipboardData:fail not implemented"}',
    ])
  })

  test('a host failure reaches fail/complete without sending callbacks', async () => {
    const log: string[] = []
    const { context, calls } = createContext(() => Promise.reject(new Error('boom')))
    const wx = createApiHost(context)
    wx.setClipboardData!({
      data: 'hello',
      success: () => log.push('success'),
      fail: (value: unknown) => log.push(`fail:${JSON.stringify(value)}`),
      complete: (value: unknown) => log.push(`complete:${JSON.stringify(value)}`),
    })
    await tick()
    expect(calls[0]!.payload).toEqual({ data: 'hello' })
    expectBridgeSafe(calls[0]!.payload)
    expect(log).toEqual([
      'fail:{"errMsg":"setClipboardData:fail boom"}',
      'complete:{"errMsg":"setClipboardData:fail boom"}',
    ])
  })

  test('non-WeChat completion functions from wrappers are dropped too', async () => {
    const { context, calls } = createContext(() => Promise.resolve(undefined))
    const wx = createApiHost(context)
    wx.setClipboardData!({
      data: 'copied',
      complete2: () => undefined,
    })
    await tick()
    expect(calls[0]!.payload).toEqual({ data: 'copied' })
    expectBridgeSafe(calls[0]!.payload)
  })
})
