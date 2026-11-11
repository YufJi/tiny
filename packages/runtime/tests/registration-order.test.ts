import { describe, expect, test } from 'vitest'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { installMiniProgramGlobals } from '../src/service/api-globals'
import { MiniProgramPageRegistry } from '../src/service/page-registry'

describe('path-aware registration', () => {
  test('registers pages and components out of declaration order', () => {
    const registry = new MiniProgramPageRegistry(['pages/a', 'pages/b'], ['components/c'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>

    globals[TINY_ENGINE_NAMING.entryPathHint] = 'pages/b'
    ;(globals.Page as (options: unknown) => void)({ data: { b: true } })
    expect(globals[TINY_ENGINE_NAMING.entryPathHint]).toBeUndefined()

    globals[TINY_ENGINE_NAMING.entryPathHint] = 'components/c'
    ;(globals.Component as (options: unknown) => void)({ data: { c: true } })
    expect(registry.components.has('components/c')).toBe(true)
    expect(registry.normalizedComponents.has('components/c')).toBe(true)
    expect(registry.isComponentPage('components/c')).toBe(false)

    globals[TINY_ENGINE_NAMING.entryPathHint] = 'pages/a'
    ;(globals.Page as (options: unknown) => void)({ data: { a: true } })
    expect([...registry.pages.keys()]).toEqual(['pages/b', 'pages/a'])
    expect(registry.isComponentPage('pages/a')).toBe(false)
  })

  test('classifies a declared page registered through Component as a component page', () => {
    const registry = new MiniProgramPageRegistry(['pages/a', 'pages/form'], ['components/c'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>

    globals[TINY_ENGINE_NAMING.entryPathHint] = 'pages/form'
    ;(globals.Component as (options: unknown) => void)({ data: { form: true } })

    expect(registry.isComponentPage('pages/form')).toBe(true)
    expect(registry.isComponentPage('pages/a')).toBe(false)
    expect(registry.components.has('pages/form')).toBe(true)
    expect(registry.normalizedComponents.has('pages/form')).toBe(true)
    expect(registry.pages.has('pages/form')).toBe(false)
  })

  test('rejects a hinted page that app.json never declared', () => {
    const registry = new MiniProgramPageRegistry(['pages/a'])
    installMiniProgramGlobals(registry, {})
    const globals = globalThis as unknown as Record<string, unknown>
    globals[TINY_ENGINE_NAMING.entryPathHint] = 'pages/unknown'
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
