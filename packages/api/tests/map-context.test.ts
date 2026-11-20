import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createMapContext } from '../src/map-context'

type Result = Record<string, unknown>

function createContext(results: Result[]) {
  const calls: Array<{ domain: string; method: string; payload: Record<string, unknown>; options?: { pageId?: string } }> = []
  const connection = {
    sendDiagnostic: () => undefined,
    callSync: () => undefined,
    call: (domain: string, method: string, payload: Record<string, unknown>, options?: { pageId?: string }) => {
      calls.push({ domain, method, payload, ...(options ? { options } : {}) })
      return Promise.resolve(results.shift() ?? { status: 'ok', value: {} })
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
  return { context, calls }
}

describe('createMapContext', () => {
  test('addresses the component by id and reports success', async () => {
    const { context, calls } = createContext([{ status: 'ok', value: { scale: 16 } }])
    const map = createMapContext(context, 'myMap')
    const success: unknown[] = []
    await map.getScale({ success: (value) => success.push(value) })

    expect(calls[0]).toMatchObject({
      domain: 'component',
      method: 'invoke',
      payload: { selector: '#myMap', method: 'getScale' },
      options: { pageId: 'page-1' },
    })
    expect(success).toEqual([{ scale: 16 }])
  })

  test('moveToLocation passes coordinates through', async () => {
    const { context, calls } = createContext([{ status: 'ok', value: {} }])
    const map = createMapContext(context, 'myMap')
    await map.moveToLocation({ latitude: 39.9, longitude: 116.4 })
    expect(calls[0]?.payload).toMatchObject({
      method: 'moveToLocation',
      args: { latitude: 39.9, longitude: 116.4 },
    })
  })

  test('a failing command calls fail with the WeChat errMsg shape', async () => {
    const { context } = createContext([{ status: 'not-found' }])
    const map = createMapContext(context, 'missing')
    const failures: Array<{ errMsg: string }> = []
    await map.getCenterLocation({ fail: (error) => failures.push(error) })
    expect(failures).toEqual([{ errMsg: 'mapContext.getCenterLocation:fail component not found' }])
  })

  test('fails fast when there is no active page', async () => {
    const { context, calls } = createContext([])
    ;(context as unknown as { pageId?: string }).pageId = undefined
    const map = createMapContext(context, 'myMap')
    const failures: Array<{ errMsg: string }> = []
    await map.getScale({ fail: (error) => failures.push(error) })
    expect(calls).toHaveLength(0)
    expect(failures).toEqual([{ errMsg: 'mapContext.getScale:fail no active page' }])
  })

  test('the promise form rejects without callbacks', async () => {
    const { context } = createContext([{ status: 'unsupported-method', method: 'takePhoto' }])
    const map = createMapContext(context, 'myMap')
    await expect(map.getScale({})).rejects.toMatchObject({
      errMsg: expect.stringContaining('unsupported method takePhoto'),
    })
  })
})
