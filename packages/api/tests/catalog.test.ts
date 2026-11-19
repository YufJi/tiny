import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'
import {
  API_CATALOG,
  API_NAMES,
  HOST_EXTENSION_APIS,
  TINY_ONLY_APIS,
  apiHostKeys,
} from '../src/catalog'
import { STUB_APIS } from '../src/capabilities'

type WechatRow = {
  name: string
  category: string
  scope: 'in' | 'in-mock' | 'out'
  mask: number
}

const WECHAT_LIST = new URL('../data/wechat-3.17.5.tsv', import.meta.url)

function readWechatList(): WechatRow[] {
  return readFileSync(WECHAT_LIST, 'utf8')
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [name, category, scope, mask] = line.split('\t')
      return { name, category, scope: scope as WechatRow['scope'], mask: Number(mask) }
    })
}

/** The real table, built the way a host entry builds it. */
function createTable(): Record<string, unknown> {
  const noop = () => undefined
  const context = new Proxy({}, {
    get: (_target, property) => {
      if (property === 'hasApi') return () => true
      if (property === 'launchOptions') return {}
      return noop
    },
  }) as unknown as ApiContext
  return createApiHost(context)
}

describe('api catalog', () => {
  test('declares exactly the names the table installs', () => {
    const table = createTable()
    expect(Object.keys(table).sort()).toEqual([...API_NAMES].sort())
    expect(API_NAMES).toHaveLength(110)
  })

  test('every host key is a domain.method name', () => {
    // `login` predates the dotted convention and is kept as-is on the wire.
    for (const host of apiHostKeys()) {
      expect(host).toMatch(/^[a-z][a-zA-Z]*(\.[a-zA-Z]+)?$/)
    }
    expect(apiHostKeys().length).toBeGreaterThan(0)
  })

  test('grades use the declared vocabulary', () => {
    for (const [name, descriptor] of Object.entries(API_CATALOG)) {
      expect(['real', 'partial', 'stub'], name).toContain(
        (descriptor as { status: string }).status,
      )
    }
  })

  test('a stub never claims to be supported', () => {
    // The honesty rule behind `api:coverage`: `status: 'stub'` means the call
    // shape exists but does nothing (or always fails), so `canIUse` must answer
    // false and apps take their fallback path instead.
    for (const [name, descriptor] of Object.entries(API_CATALOG)) {
      const stub = (descriptor as { status: string }).status === 'stub'
      expect(STUB_APIS.has(name), name).toBe(stub)
    }
  })

  test('host-composed APIs never leak into the core table', () => {
    const table = createTable()
    for (const name of HOST_EXTENSION_APIS) expect(table[name]).toBeUndefined()
  })
})

describe('wechat 3.17.5 name list', () => {
  test('has one row per WeChat API with a scope decision', () => {
    const rows = readWechatList()
    expect(rows).toHaveLength(499)
    expect(new Set(rows.map((row) => row.name)).size).toBe(499)
    const counts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.scope] = (acc[row.scope] ?? 0) + 1
      return acc
    }, {})
    expect(counts).toEqual({ in: 342, 'in-mock': 7, out: 150 })
    for (const row of rows) expect(Number.isFinite(row.mask), row.name).toBe(true)
  })

  test('every catalog name is a WeChat API unless it is a Tiny-only alias', () => {
    const wechat = new Set(readWechatList().map((row) => row.name))
    for (const name of API_NAMES) {
      if (TINY_ONLY_APIS.has(name)) continue
      expect(wechat.has(name), `${name} is missing from data/wechat-3.17.5.tsv`).toBe(true)
    }
  })

  test('tiny-only aliases stay out of the WeChat list', () => {
    const wechat = new Set(readWechatList().map((row) => row.name))
    for (const name of TINY_ONLY_APIS) expect(wechat.has(name)).toBe(false)
  })
})
