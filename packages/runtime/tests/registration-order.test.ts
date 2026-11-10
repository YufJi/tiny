import { describe, expect, test } from 'vitest'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { installMiniProgramGlobals } from '../src/service/api-globals'
import { MiniProgramPageRegistry } from '../src/service/page-registry'

describe('path-aware registration', () => {
  test('registers pages and components out of declaration order', () => {
    const registry = new MiniProgramPageRegistry(['pages/a', 'pages/b'], ['components/c'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>

    globals[TINY_ENGINE_NAMING.pageRegistrationHint] = 'pages/b'
    ;(globals.Page as (options: unknown) => void)({ data: { b: true } })
    expect(globals[TINY_ENGINE_NAMING.pageRegistrationHint]).toBeUndefined()

    globals[TINY_ENGINE_NAMING.componentRegistrationHint] = 'components/c'
    ;(globals.Component as (options: unknown) => void)({ data: { c: true } })
    expect(registry.components.has('components/c')).toBe(true)
    expect(registry.normalizedComponents.has('components/c')).toBe(true)

    globals[TINY_ENGINE_NAMING.pageRegistrationHint] = 'pages/a'
    ;(globals.Page as (options: unknown) => void)({ data: { a: true } })
    expect([...registry.pages.keys()]).toEqual(['pages/b', 'pages/a'])
  })

  test('rejects a hinted page that app.json never declared', () => {
    const registry = new MiniProgramPageRegistry(['pages/a'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>
    globals[TINY_ENGINE_NAMING.pageRegistrationHint] = 'pages/unknown'
    expect(() => (globals.Page as (options: unknown) => void)({})).toThrow(
      /not declared in app\.json/,
    )
  })

  test('falls back to declaration order without a hint', () => {
    const registry = new MiniProgramPageRegistry(['pages/a', 'pages/b'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>
    ;(globals.Page as (options: unknown) => void)({ data: { a: true } })
    ;(globals.Page as (options: unknown) => void)({ data: { b: true } })
    expect([...registry.pages.keys()]).toEqual(['pages/a', 'pages/b'])
  })
})
