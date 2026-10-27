import { describe, expect, test } from 'vitest'
import type { NormalizedObserver } from '../src/component/component-definition'
import { matchesChangedPaths, runObservers, type ObserverHost } from '../src/component/observers'

function observer(paths: string[], handler: (...args: unknown[]) => unknown): NormalizedObserver {
  return { key: 'obs-test', paths, kind: 'observer', handler }
}

function createHost(): ObserverHost & { calls: unknown[][]; errors: string[] } {
  const host = {
    data: {
      a: 1,
      b: 2,
      nested: { value: 3, child: { value: 4 } },
      list: [10, 20],
    },
    calls: [] as unknown[][],
    errors: [] as string[],
    observerDepth: 0,
    invokeMethod(name: string, args: unknown[] = []) {
      host.calls.push([name, ...args])
      return undefined
    },
    onError(code: string) {
      host.errors.push(code)
    },
  }
  return host
}

describe('observers', () => {
  test('matches parent, child and wildcard paths', () => {
    expect(matchesChangedPaths(observer(['a'], () => undefined), ['a'])).toBe(true)
    expect(matchesChangedPaths(observer(['a'], () => undefined), ['a.b'])).toBe(true)
    expect(matchesChangedPaths(observer(['a.b'], () => undefined), ['a'])).toBe(true)
    expect(matchesChangedPaths(observer(['a'], () => undefined), ['b'])).toBe(false)
    expect(matchesChangedPaths(observer(['nested.field.**'], () => undefined), ['nested.field.x'])).toBe(true)
    expect(matchesChangedPaths(observer(['nested.field.**'], () => undefined), ['nested'])).toBe(true)
    expect(matchesChangedPaths(observer(['**'], () => undefined), ['anything'])).toBe(true)
  })

  test('passes values in declaration order and skips non-matching observers', () => {
    const host = createHost()
    runObservers(host, [
      observer(['a', 'b'], (...values) => host.calls.push(values)),
      observer(['missing'], () => host.calls.push(['wrong'])),
      observer(['list[1]'], (value) => host.calls.push([value])),
    ], ['a', 'list[1]'])
    expect(host.calls).toEqual([[1, 2], [20]])
  })

  test('passes old value for property observers', () => {
    const host = createHost()
    const property: NormalizedObserver = {
      key: 'prop-a',
      paths: ['a'],
      kind: 'property',
      propertyName: 'a',
      handler: (value: unknown, oldValue: unknown) => host.calls.push([value, oldValue]),
    }
    runObservers(host, [property], ['a'], { a: 0 })
    expect(host.calls).toEqual([[1, 0]])
  })

  test('supports string handler and reports errors', () => {
    const host = createHost()
    runObservers(host, [
      { key: 'obs-method', paths: ['a'], kind: 'observer', handler: 'onA' },
      { key: 'obs-throw', paths: ['a'], kind: 'observer', handler: () => { throw new Error('boom') } },
    ], ['a'])
    expect(host.calls).toEqual([['onA', 1]])
    expect(host.errors).toEqual(['OBSERVER_ERROR'])
  })

  test('guards against deep recursion', () => {
    const host = createHost()
    host.observerDepth = 20
    runObservers(host, [observer(['a'], () => host.calls.push(['called']))], ['a'])
    expect(host.calls).toEqual([])
    expect(host.errors).toEqual(['OBSERVER_RECURSION_LIMIT'])
  })
})
