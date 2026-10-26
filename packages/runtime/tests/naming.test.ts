import { afterEach, describe, expect, test } from 'vitest'
import { resolveNaming } from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component-definition'
import { installMiniProgramGlobals, MiniProgramPageRegistry } from '../src/service'

const globalObject = globalThis as unknown as Record<string, unknown>
const globalKeys = [
  'App',
  'Page',
  'Component',
  'Behavior',
  'getApp',
  'getCurrentPages',
  'wx',
  'tiny',
] as const
const originalGlobals = new Map<string, unknown>()
for (const key of globalKeys) originalGlobals.set(key, globalObject[key])

afterEach(() => {
  for (const key of globalKeys) {
    const value = originalGlobals.get(key)
    if (value === undefined) delete globalObject[key]
    else globalObject[key] = value
  }
})

describe('resolveNaming', () => {
  test('defaults to the wx namespace', () => {
    expect(resolveNaming()).toEqual({
      prefix: 'wx-',
      directive: 'wx',
      api: 'wx',
      apiAliases: [],
      hostAttribute: 'wx-host',
      tagClassPrefix: 'wx-tag-',
      scopeMarkerClass: 'wx-scope',
      behaviorPrefix: 'wx-',
      behaviorScheme: 'wx://',
    })
  })

  test('derives every name from a custom prefix', () => {
    const naming = resolveNaming({ prefix: 'tiny-', apiAliases: ['wx', 'tiny', 'wx'] })
    expect(naming).toMatchObject({
      prefix: 'tiny-',
      directive: 'tiny',
      api: 'tiny',
      apiAliases: ['wx'],
      hostAttribute: 'tiny-host',
      tagClassPrefix: 'tiny-tag-',
      scopeMarkerClass: 'tiny-scope',
      behaviorPrefix: 'tiny-',
      behaviorScheme: 'tiny://',
    })
  })
})

describe('configured API global', () => {
  test('installs the API object under the configured name and aliases', () => {
    const registry = new MiniProgramPageRegistry([], [], { prefix: 'tiny-', apiAliases: ['wx'] })
    installMiniProgramGlobals(registry, { getStorageSync: () => 'ok' })

    expect((globalObject.tiny as Record<string, () => unknown>).getStorageSync()).toBe('ok')
    expect((globalObject.wx as Record<string, () => unknown>).getStorageSync()).toBe('ok')
  })

  test('keeps wx as the default API global', () => {
    const registry = new MiniProgramPageRegistry([])
    installMiniProgramGlobals(registry, { getStorageSync: () => 'legacy' })

    expect((globalObject.wx as Record<string, () => unknown>).getStorageSync()).toBe('legacy')
    expect(globalObject.tiny).toBeUndefined()
  })
})

describe('configured built-in behaviors', () => {
  test('recognizes the configured component-export scheme', () => {
    const naming = resolveNaming({ prefix: 'tiny-' })
    const definition = normalizeComponentDefinition(
      { behaviors: ['tiny://component-export'], export: () => ({ value: 1 }) },
      'components/a',
      naming,
    )
    expect(definition.componentExport).toBe(true)
  })

  test('reports a mismatched built-in behavior scheme instead of ignoring it', () => {
    const naming = resolveNaming({ prefix: 'tiny-' })
    const definition = normalizeComponentDefinition(
      { behaviors: ['wx://component-export'] },
      'components/a',
      naming,
    )
    expect(definition.componentExport).toBe(false)
    expect(definition.diagnostics.map((item) => item.code)).toContain('UNSUPPORTED_BEHAVIOR')
  })
})
