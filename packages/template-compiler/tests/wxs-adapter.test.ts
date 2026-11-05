import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, test } from 'vitest'

const adapterSource = readFileSync(new URL('../src/runtime/wxs-adapter.js', import.meta.url), 'utf8')

type Adapter = {
  B: (elem: unknown, evName: string, value: unknown, final: boolean, mutated: boolean, capture: boolean) => unknown
}

const globals = globalThis as unknown as Record<string, unknown>

function loadAdapter(registerBinding: (...args: unknown[]) => boolean): Adapter {
  const runtime = {
    originOf: (value: unknown) => (
      typeof value === 'function' ? (value as { origin?: unknown }).origin : undefined
    ),
    register: () => () => ({}),
  }
  globals.__TINY_WXS_RUNTIME_GLOBAL__ = runtime
  globals.__TINY_WXS_EVENT_HOST_GLOBAL__ = { registerBinding }
  const Q = {} as Adapter
  new Function('Q', adapterSource)(Q)
  return Q
}

afterEach(() => {
  delete globals.__TINY_WXS_RUNTIME_GLOBAL__
  delete globals.__TINY_WXS_EVENT_HOST_GLOBAL__
})

describe('Q.B binding locality', () => {
  test('returns a placeholder when the render tree owns the WXS handler', () => {
    const handler = Object.assign(() => {}, { origin: { moduleId: 'm.wxs', exportPath: ['tap'] } })
    const calls: unknown[][] = []
    const Q = loadAdapter((...args) => {
      calls.push(args)
      return true
    })

    const attached = Q.B({}, 'tap', handler, false, false, false)
    expect(attached).not.toBe(handler)
    expect(typeof attached).toBe('function')
    expect(calls).toHaveLength(1)
    expect(calls[0]![2]).toEqual({ moduleId: 'm.wxs', exportPath: ['tap'] })
  })

  test('keeps the function for service-only input events', () => {
    const handler = Object.assign(() => {}, { origin: { moduleId: 'm.wxs', exportPath: ['input'] } })
    const Q = loadAdapter(() => false)

    expect(Q.B({}, 'input', handler, false, false, false)).toBe(handler)
  })

  test('never replaces a plain dynamic handler', () => {
    const handler = (): void => {}
    const Q = loadAdapter(() => true)

    expect(Q.B({}, 'tap', handler, false, false, false)).toBe(handler)
  })
})
