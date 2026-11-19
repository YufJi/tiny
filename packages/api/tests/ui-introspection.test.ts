import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'page.selectedTextRange': () => ({ start: 2, end: 5, errMsg: 'getSelectedTextRange:ok' }),
    'page.pipActive': () => ({ isActive: true, errMsg: 'checkIsPictureInPictureActive:ok' }),
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

describe('page introspection APIs', () => {
  test('getSelectedTextRange forwards to the host', async () => {
    const { host, calls } = createHost()
    await expect(host.getSelectedTextRange({})).resolves.toEqual({
      start: 2,
      end: 5,
      errMsg: 'getSelectedTextRange:ok',
    })
    expect(calls[0].method).toBe('page.selectedTextRange')
  })

  test('checkIsPictureInPictureActive forwards to the host', async () => {
    const { host, calls } = createHost()
    await expect(host.checkIsPictureInPictureActive({})).resolves.toMatchObject({ isActive: true })
    expect(calls[0].method).toBe('page.pipActive')
  })
})
