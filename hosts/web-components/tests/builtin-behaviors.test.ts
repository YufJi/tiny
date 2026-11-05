import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { BUILTIN_BEHAVIOR_NAMES } from '@tiny/runtime'
import {
  createBuiltinBehaviors,
  getPublicBuiltinBehaviors,
  PUBLIC_BUILTIN_BEHAVIOR_IDS,
} from '../src/behaviors'

describe('wx:// behaviors', () => {
  test('public ids alias the internal markers built-ins compare by identity', () => {
    const space = new glassEasel.ComponentSpace()
    const builtins = createBuiltinBehaviors(space)
    const behaviors = getPublicBuiltinBehaviors(space)!

    expect(behaviors[PUBLIC_BUILTIN_BEHAVIOR_IDS.formField].hasBehavior(builtins.formField)).toBe(true)
    expect(behaviors[PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldGroup].hasBehavior(builtins.formFieldGroup)).toBe(true)
    expect(behaviors[PUBLIC_BUILTIN_BEHAVIOR_IDS.formFieldButton].hasBehavior(builtins.formFieldButton)).toBe(true)
    expect(behaviors[PUBLIC_BUILTIN_BEHAVIOR_IDS.labelTarget].hasBehavior(builtins.labelTarget)).toBe(true)
  })

  test('render-side form-field is a marker like the kernel', () => {
    // `<form>` reads node attributes/props (page-level snapshot props and
    // template attributes), so neither side declares `name` / `value`.
    const space = new glassEasel.ComponentSpace()
    createBuiltinBehaviors(space)
    const behaviors = getPublicBuiltinBehaviors(space)!
    const formField = behaviors[PUBLIC_BUILTIN_BEHAVIOR_IDS.formField] as unknown as {
      prepare?: () => void
      listProperties: () => string[]
    }
    formField.prepare?.()
    expect(formField.listProperties()).toEqual([])
  })

  test('the public id set matches the kernel list', () => {
    const expected = BUILTIN_BEHAVIOR_NAMES.map((name) => `wx://${name}`).sort()
    expect(Object.values(PUBLIC_BUILTIN_BEHAVIOR_IDS).sort()).toEqual(expected)
  })

  test('unsupported WeChat behaviors are absent from the render registry', () => {
    const space = new glassEasel.ComponentSpace()
    createBuiltinBehaviors(space)
    const behaviors = getPublicBuiltinBehaviors(space)!
    for (const id of [
      PUBLIC_BUILTIN_BEHAVIOR_IDS.styleFilter,
      PUBLIC_BUILTIN_BEHAVIOR_IDS.componentExport,
    ]) {
      expect(behaviors[id], id).toBeDefined()
    }
    // The kernel reports these as `UNSUPPORTED_BEHAVIOR`, so the render side
    // must not silently accept them.
    for (const id of ['wx://request-filter', 'wx://request-sender', 'wx://functional-page-behavior', 'wx://proxy-swiper']) {
      expect(behaviors[id], id).toBeUndefined()
    }
  })
})
