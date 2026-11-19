import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

/**
 * The honesty rule of the compatibility surface: when a host cannot do the
 * thing, the call must reach `fail` instead of resolving a fake `ok`. These
 * tests pin the service-side half; each host owns the actual `:fail` result.
 */
function createHost(
  handlers: Record<string, (params: Record<string, unknown>) => unknown>,
) {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve(handlers[method]?.(params) ?? {})
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return handlers[method]?.(params) ?? {}
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

describe('honest failures', () => {
  test('a host :fail result reaches the fail callback, not success', async () => {
    const { host, calls } = createHost({
      'page.scrollTo': () => ({ errMsg: 'pageScrollTo:fail not supported by this host' }),
    })
    const failures: unknown[] = []
    const successes: unknown[] = []
    const completed: unknown[] = []

    await host.pageScrollTo({
      scrollTop: 120,
      success: (value: unknown) => successes.push(value),
      fail: (value: unknown) => failures.push(value),
      complete: (value: unknown) => completed.push(value),
    })

    expect(calls).toContainEqual({ method: 'page.scrollTo', params: { scrollTop: 120 } })
    expect(successes).toHaveLength(0)
    expect(failures).toHaveLength(1)
    expect(completed).toHaveLength(1)
  })

  test('navigation loading sends the visible flag and keeps the callbacks local', async () => {
    const { host, calls } = createHost({
      'navigation.loading': () => ({ errMsg: 'showNavigationBarLoading:ok' }),
    })

    await host.showNavigationBarLoading({})
    await host.hideNavigationBarLoading({})

    expect(calls.map((call) => call.params.visible)).toEqual([true, false])
    expect(calls.every((call) => !('success' in call.params))).toBe(true)
  })
})
