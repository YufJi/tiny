import { afterEach, describe, expect, test } from 'vitest'
import {
  TINY_ENGINE_NAMING,
  WECHAT_RUNTIME_COMPATIBILITY,
  resolveCompatibility,
  runtimeCompatibilityFrom,
} from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { installMiniProgramGlobals, MiniProgramPageRegistry } from '../src/service/thread'

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
  'HostApp',
  'HostPage',
  'HostComponent',
  'HostBehavior',
  'hostGetApp',
  'hostGetCurrentPages',
  'my',
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

describe('compatibility config', () => {
  test('defaults source conventions to WeChat and mirrors glass-easel attributes', () => {
    const compatibility = resolveCompatibility()
    expect(compatibility).toMatchObject({
      directiveNamespace: 'wx',
      api: { global: 'wx', aliases: [] },
      behaviorScheme: 'wx://',
      extensions: {
        template: ['.wxml'],
        style: ['.wxss'],
      },
    })
    expect(TINY_ENGINE_NAMING).toMatchObject({
      hostAttribute: 'wx-host',
      styleScopeAttribute: 'wx-style-scope',
      scopeMarkerClass: 'tiny-scope',
      tagClassPrefix: 'tiny-tag-',
      behaviorPrefix: 'tiny-',
    })
  })

  test('keeps directive and API namespaces independent', () => {
    const compatibility = resolveCompatibility({
      directiveNamespace: 'directive',
      api: { global: 'my', aliases: ['wx', 'my', 'wx'] },
    })
    expect(compatibility.directiveNamespace).toBe('directive')
    expect(compatibility.api).toEqual({ global: 'my', aliases: ['wx'] })
    expect(compatibility.extensions.style).toEqual(['.wxss'])
  })
})

describe('configured API globals', () => {
  test('installs the configured API object and aliases', () => {
    const compatibility = runtimeCompatibilityFrom({
      api: { global: 'my', aliases: ['wx'] },
    })
    const registry = new MiniProgramPageRegistry([], [], compatibility)
    installMiniProgramGlobals(registry, { getStorageSync: () => 'ok' })

    expect((globalObject.my as Record<string, () => unknown>).getStorageSync()).toBe('ok')
    expect((globalObject.wx as Record<string, () => unknown>).getStorageSync()).toBe('ok')
  })

  test('installs configured registration globals', () => {
    const compatibility = runtimeCompatibilityFrom({
      globals: {
        app: 'HostApp',
        page: 'HostPage',
        component: 'HostComponent',
        behavior: 'HostBehavior',
        getApp: 'hostGetApp',
        getCurrentPages: 'hostGetCurrentPages',
      },
    })
    const registry = new MiniProgramPageRegistry(['pages/index'], [], compatibility)
    installMiniProgramGlobals(registry, {})
    let launched = false
    ;(globalObject.HostApp as (options: unknown) => unknown)({ onLaunch: () => { launched = true } })
    ;(globalObject.HostPage as (options: unknown) => unknown)({ data: { ready: true } })

    expect(launched).toBe(true)
    expect(registry.getApp()).toBeDefined()
    expect(registry.pages.get('pages/index')).toMatchObject({ data: { ready: true } })
    expect(typeof globalObject.HostComponent).toBe('function')
    expect(typeof globalObject.HostBehavior).toBe('function')
    expect(typeof globalObject.hostGetApp).toBe('function')
    expect(typeof globalObject.hostGetCurrentPages).toBe('function')
  })

  test('keeps wx as the default API global', () => {
    const registry = new MiniProgramPageRegistry([], [], WECHAT_RUNTIME_COMPATIBILITY)
    installMiniProgramGlobals(registry, { getStorageSync: () => 'legacy' })

    expect((globalObject.wx as Record<string, () => unknown>).getStorageSync()).toBe('legacy')
    expect(globalObject.tiny).toBeUndefined()
  })
})

describe('configured behavior schemes', () => {
  test('recognizes the configured component-export scheme', () => {
    const compatibility = runtimeCompatibilityFrom({ behaviorScheme: 'my://' })
    const definition = normalizeComponentDefinition(
      { behaviors: ['my://component-export'], export: () => ({ value: 1 }) },
      'components/a',
      compatibility,
    )
    expect(definition.componentExport).toBe(true)
  })

  test('reports a mismatched behavior scheme instead of ignoring it', () => {
    const compatibility = runtimeCompatibilityFrom({ behaviorScheme: 'my://' })
    const definition = normalizeComponentDefinition(
      { behaviors: ['wx://component-export'] },
      'components/a',
      compatibility,
    )
    expect(definition.componentExport).toBe(false)
    expect(definition.diagnostics.map((item) => item.code)).toContain('UNSUPPORTED_BEHAVIOR')
  })
})
