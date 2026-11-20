import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

/**
 * Identity is host-owned and mockable: the service side must only name the
 * protocol method and keep WeChat's callback shape. These tests pin the
 * contract the browser host implements in `tests/host/src/host-api.ts` and the
 * native hosts are expected to match.
 */
function createIdentityHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const authSetting: Record<string, boolean> = {}
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'identity.authorize': (params) => {
      const scope = String(params.scope ?? '')
      if (!scope) return { errMsg: 'authorize:fail invalid scope' }
      authSetting[scope] = true
      return { errMsg: 'authorize:ok' }
    },
    'identity.checkSession': () => ({ errMsg: 'checkSession:ok' }),
    'settings.get': () => ({ authSetting: { ...authSetting }, errMsg: 'getSetting:ok' }),
    'settings.open': () => ({ authSetting: { ...authSetting }, errMsg: 'openSetting:ok' }),
    'login': () => ({ code: 'mock-code', errMsg: 'login:ok' }),
    'profile.get': () => ({
      userInfo: { nickName: 'Mock User', avatarUrl: '', language: 'zh_CN' },
      rawData: '{"nickName":"Mock User"}',
      signature: 'mock-signature',
      encryptedData: '',
      iv: '',
      errMsg: 'getUserProfile:ok',
    }),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
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
  return { host: createApiHost(context) as Record<string, (...args: unknown[]) => any>, calls }
}

describe('host-backed identity', () => {
  test('authorize records the scope and getSetting reads it back', async () => {
    const { host, calls } = createIdentityHost()

    const authorized = await host.authorize({ scope: 'scope.userInfo' })
    expect(authorized).toEqual({ errMsg: 'authorize:ok' })
    expect(calls).toContainEqual({
      method: 'identity.authorize',
      params: { scope: 'scope.userInfo' },
    })

    const setting = await host.getSetting()
    expect(setting).toEqual({
      authSetting: { 'scope.userInfo': true },
      errMsg: 'getSetting:ok',
    })
  })

  test('authorize without a scope fails through the callback contract', async () => {
    const { host } = createIdentityHost()
    const failures: unknown[] = []
    const result = await host.authorize({ fail: (value: unknown) => failures.push(value) })
    expect(String(result.errMsg)).toContain('authorize:fail')
    expect(failures).toHaveLength(1)
  })

  test('checkSession and login go through the host', async () => {
    const { host, calls } = createIdentityHost()
    await expect(host.checkSession()).resolves.toEqual({ errMsg: 'checkSession:ok' })
    await expect(host.login({})).resolves.toEqual({ code: 'mock-code', errMsg: 'login:ok' })
    expect(calls.map((call) => call.method)).toEqual(['identity.checkSession', 'login'])
  })

  test('getUserProfile keeps the WeChat profile envelope', async () => {
    const { host } = createIdentityHost()
    const profile = await host.getUserProfile({ desc: 'demo' })
    expect(profile.userInfo).toEqual({ nickName: 'Mock User', avatarUrl: '', language: 'zh_CN' })
    expect(profile.signature).toBe('mock-signature')
    expect(profile.errMsg).toBe('getUserProfile:ok')
  })
})
