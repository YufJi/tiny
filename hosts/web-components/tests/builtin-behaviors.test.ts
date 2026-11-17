import { describe, expect, test, vi } from 'vitest'
import * as glassEasel from '@tiny/runtime/glass-easel'
import { DEFAULT_BEHAVIOR_SCHEME } from '@tiny/manifest'
import { BUILTIN_BEHAVIOR_NAMES } from '@tiny/runtime'
import {
  createBuiltinBehaviors,
  getPublicBuiltinBehaviors,
  publicBuiltinBehaviorIds,
} from '../src/behaviors'
import {
  applyKeyboardListenerReturn,
  registerKeyboardListenerTarget,
  subscribeKeyboardActivation,
} from '../src/host-keyboard'

describe('wx:// behaviors', () => {
  test('input listener returns route by keyboard owner id', () => {
    let returned: unknown
    const unregister = registerKeyboardListenerTarget('input-1', {
      applyKeyboardListenerReturn(result) {
        returned = result
      },
    })
    expect(applyKeyboardListenerReturn('missing', { value: 'x' })).toBe(false)
    expect(applyKeyboardListenerReturn('input-1', { value: '2', cursor: 1 })).toBe(true)
    expect(returned).toEqual({ value: '2', cursor: 1 })
    unregister()
    expect(applyKeyboardListenerReturn('input-1', { value: '3' })).toBe(false)
  })

  test('host keyboard activation listens to touch and mouse on the capture phase', () => {
    const handlers = new Map<string, (event?: unknown) => void>()
    const addEventListener = vi.fn((name: string, listener: (event?: unknown) => void) => {
      handlers.set(name, listener)
    })
    const removeEventListener = vi.fn()
    const target = {
      addEventListener,
      removeEventListener,
    } as unknown as EventTarget
    let active = false
    let activations = 0
    const unsubscribe = subscribeKeyboardActivation(
      target,
      () => active,
      () => { activations += 1 },
    )

    expect(addEventListener).toHaveBeenCalledWith(
      'touchstart',
      expect.any(Function),
      { capture: true, passive: true },
    )
    expect(addEventListener).toHaveBeenCalledWith(
      'touchend',
      expect.any(Function),
      { capture: true, passive: true },
    )
    expect(addEventListener).toHaveBeenCalledWith(
      'click',
      expect.any(Function),
      { capture: true },
    )
    handlers.get('touchend')?.()
    expect(activations).toBe(0)
    active = true
    handlers.get('click')?.()
    expect(activations).toBe(1)
    handlers.get('touchend')?.({
      changedTouches: [{ clientX: 12, clientY: 18 }],
    })
    expect(activations).toBe(1)
    handlers.get('touchstart')?.({
      touches: [{ clientX: 12, clientY: 18 }],
    })
    handlers.get('touchend')?.({
      changedTouches: [{ clientX: 12, clientY: 18 }],
    })
    expect(activations).toBe(2)
    handlers.get('click')?.()
    expect(activations).toBe(2)
    unsubscribe()
    for (const name of ['touchstart', 'touchmove', 'touchend', 'click']) {
      expect(removeEventListener).toHaveBeenCalledWith(
        name,
        expect.any(Function),
        { capture: true },
      )
    }
  })

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
