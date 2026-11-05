import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { DEFAULT_BEHAVIOR_SCHEME } from '@tiny/manifest'
import { BUILTIN_BEHAVIOR_NAMES } from '@tiny/runtime'
import {
  createBuiltinBehaviors,
  getPublicBuiltinBehaviors,
  publicBuiltinBehaviorIds,
} from '../src/behaviors'

describe('wx:// behaviors', () => {
  test('public ids alias the internal markers built-ins compare by identity', () => {
    const space = new glassEasel.ComponentSpace()
    const builtins = createBuiltinBehaviors(space)
    const ids = publicBuiltinBehaviorIds()
    const behaviors = getPublicBuiltinBehaviors(space)!

    expect(behaviors[ids.formField].hasBehavior(builtins.formField)).toBe(true)
    expect(behaviors[ids.formFieldGroup].hasBehavior(builtins.formFieldGroup)).toBe(true)
    expect(behaviors[ids.formFieldButton].hasBehavior(builtins.formFieldButton)).toBe(true)
    expect(behaviors[ids.labelTarget].hasBehavior(builtins.labelTarget)).toBe(true)
  })

  test('render-side form-field is a marker like the kernel', () => {
    // `<form>` reads node attributes/props (page-level snapshot props and
    // template attributes), so neither side declares `name` / `value`.
    const space = new glassEasel.ComponentSpace()
    createBuiltinBehaviors(space)
    const ids = publicBuiltinBehaviorIds()
    const behaviors = getPublicBuiltinBehaviors(space)!
    const formField = behaviors[ids.formField] as unknown as {
      prepare?: () => void
      listProperties: () => string[]
    }
    formField.prepare?.()
    expect(formField.listProperties()).toEqual([])
  })

  test('the public id set matches the kernel list', () => {
    const expected = BUILTIN_BEHAVIOR_NAMES
      .map((name) => `${DEFAULT_BEHAVIOR_SCHEME}${name}`)
      .sort()
    expect(Object.values(publicBuiltinBehaviorIds()).sort()).toEqual(expected)
  })

  test('the scheme comes from compatibility, not a literal', () => {
    const space = new glassEasel.ComponentSpace()
    createBuiltinBehaviors(space)
    const ids = publicBuiltinBehaviorIds('my://')
    const behaviors = getPublicBuiltinBehaviors(space, 'my://')!
    for (const id of Object.values(ids)) expect(behaviors[id], id).toBeDefined()
    // The default registry stays registered for built-ins.
    expect(getPublicBuiltinBehaviors(space)![`${DEFAULT_BEHAVIOR_SCHEME}form-field`]).toBeDefined()
  })

  test('unsupported WeChat behaviors are absent from the render registry', () => {
    const space = new glassEasel.ComponentSpace()
    createBuiltinBehaviors(space)
    const ids = publicBuiltinBehaviorIds()
    const behaviors = getPublicBuiltinBehaviors(space)!
    for (const id of [ids.styleFilter, ids.componentExport]) {
      expect(behaviors[id], id).toBeDefined()
    }
    // The kernel reports these as `UNSUPPORTED_BEHAVIOR`, so the render side
    // must not silently accept them.
    for (const id of ['wx://request-filter', 'wx://request-sender', 'wx://functional-page-behavior', 'wx://proxy-swiper']) {
      expect(behaviors[id], id).toBeUndefined()
    }
  })
})
