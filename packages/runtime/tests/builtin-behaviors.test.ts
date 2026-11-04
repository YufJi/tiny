import { describe, expect, test } from 'vitest'
import { WECHAT_RUNTIME_COMPATIBILITY } from '@tiny/manifest'
import {
  BUILTIN_BEHAVIOR_NAMES,
  builtinBehaviorId,
  isBuiltinBehavior,
  resolveBuiltinBehavior,
} from '../src/component/behaviors'
import { normalizeComponentDefinition } from '../src/component/component-definition'

const compatibility = { behaviorScheme: 'wx://' } as typeof WECHAT_RUNTIME_COMPATIBILITY

function normalize(behaviors: string[]) {
  return normalizeComponentDefinition({ behaviors }, 'components/behaviors/behaviors')
}

describe('built-in behaviors', () => {
  test('resolves every implemented WeChat built-in behavior id', () => {
    for (const name of BUILTIN_BEHAVIOR_NAMES) {
      const spec = resolveBuiltinBehavior(builtinBehaviorId(compatibility, name), compatibility)
      expect(spec, name).toBeDefined()
      expect(spec?.id).toBe(`wx://${name}`)
    }
    expect(resolveBuiltinBehavior('wx://not-a-behavior', compatibility)).toBeUndefined()
    expect(isBuiltinBehavior('wx://form-field')).toBe(true)
    expect(isBuiltinBehavior('./my-behavior')).toBe(false)
  })

  test('merges all runtime built-ins without diagnostics', () => {
    const definition = normalize(BUILTIN_BEHAVIOR_NAMES.map((name) => `wx://${name}`))

    expect(definition.diagnostics).toEqual([])
    expect(definition.componentExport).toBe(true)
    expect(definition.formField).toBe(true)
    expect(definition.formFieldButton).toBe(true)
    expect(definition.formFieldGroup).toBe(true)
    expect(definition.functionalPage).toBe(true)
    expect(definition.labelTarget).toBe(true)

    expect(definition.properties.name).toEqual({ type: 'string', value: '' })
    expect(definition.properties.value).toEqual({ type: 'any', value: '' })
    expect(definition.properties.accountInfo).toMatchObject({ type: 'object' })
    expect(definition.properties.pluginInfo).toBeDefined()
    expect(definition.properties.originAccountInfo).toBeDefined()
    expect(definition.properties.args).toBeDefined()

    expect(definition.methods.has('handleLabelTap')).toBe(true)
    expect(definition.methods.has('_styleFilter')).toBe(true)
    expect(definition.methods.has('waitOnShow')).toBe(true)
    expect(definition.methods.has('returnSuccess')).toBe(true)
    expect(definition.methods.has('returnFail')).toBe(true)
    expect(definition.methods.has('returnCancel')).toBe(true)
    expect(definition.methods.has('back')).toBe(true)

    expect(Object.keys(definition.listeners)).toEqual(['formSubmit', 'formReset'])
  })

  test('form-field-button only contributes listeners, not field properties', () => {
    const definition = normalize(['wx://form-field-button'])
    expect(definition.formField).toBe(false)
    expect(definition.formFieldButton).toBe(true)
    expect(definition.properties.name).toBeUndefined()
    expect(definition.properties.value).toBeUndefined()
  })

  test('form-field keeps name/value and the form marker', () => {
    const definition = normalize(['wx://form-field'])
    expect(definition.formField).toBe(true)
    expect(definition.formFieldButton).toBe(false)
    expect(definition.properties.name).toEqual({ type: 'string', value: '' })
    expect(definition.properties.value).toEqual({ type: 'any', value: '' })
    // Explicit component properties override the behavior defaults.
    const overridden = normalizeComponentDefinition({
      behaviors: ['wx://form-field'],
      properties: { name: { type: String, value: 'own' } },
    }, 'components/behaviors/own')
    expect(overridden.properties.name.value).toBe('own')
  })

  test('form-field-button re-emits form events', () => {
    const definition = normalize(['wx://form-field-button'])
    const events: Array<{ name: string; detail: unknown; options: unknown }> = []
    const runtime = {
      triggerEvent(name: string, detail: unknown, options: unknown) {
        events.push({ name, detail, options })
      },
    }
    const submit = definition.listeners.formSubmit as (event: unknown) => void
    const reset = definition.listeners.formReset as (event: unknown) => void
    submit.call(runtime, { value: 1 })
    reset.call(runtime, undefined)
    expect(events).toEqual([
      { name: 'formSubmit', detail: { value: 1 }, options: { bubbles: true } },
      { name: 'formReset', detail: undefined, options: { bubbles: true } },
    ])
  })

  test('request-filter/request-sender are explicitly out of scope', () => {
    const definition = normalize(['wx://request-filter', 'wx://request-sender'])
    expect(definition.diagnostics.map((item) => item.code)).toEqual([
      'UNSUPPORTED_BEHAVIOR',
      'UNSUPPORTED_BEHAVIOR',
    ])
    expect(definition.methods.has('_srcFilter')).toBe(false)
    expect(definition.methods.has('checkProp')).toBe(false)
    expect(BUILTIN_BEHAVIOR_NAMES).not.toContain('request-filter')
    expect(BUILTIN_BEHAVIOR_NAMES).not.toContain('request-sender')
  })

  test('style-filter returns an empty style string', () => {
    const filter = normalize(['wx://style-filter']).methods.get('_styleFilter')!
    expect(filter()).toBe('')
  })

  test('functional-page exposes event and loading methods', () => {
    const methods = normalize(['wx://functional-page-behavior']).methods
    const events: Array<{ name: string; detail: unknown }> = []
    const data: Record<string, unknown> = {}
    const runtime = {
      _enteredForeground: true,
      _enteredForegroundCb: null as (() => void) | null,
      data,
      triggerEvent(name: string, detail: unknown) { events.push({ name, detail }) },
      setData(patch: Record<string, unknown>) { Object.assign(data, patch) },
      returnCancel: methods.get('returnCancel')!,
    }
    const call = (name: string, ...args: unknown[]) => (
      methods.get(name) as (...inner: unknown[]) => unknown
    ).apply(runtime, args)

    call('returnSuccess', { ok: 1 }, 'log')
    call('returnFail', { err: 1 }, 'log')
    call('returnCancel', 'cancel')
    call('back')
    expect(events.map((item) => item.name)).toEqual(['success', 'fail', 'cancel', 'cancel'])
    expect(events[0]?.detail).toEqual({ res: { ok: 1 }, logDetail: 'log' })

    call('_showButtonLoading')
    expect(data).toEqual({ buttonLoading: true })
    call('_hideButtonLoading')
    expect(data).toEqual({ buttonLoading: false })

    let shown = 0
    call('waitOnShow', () => { shown += 1 })
    expect(shown).toBe(1)
  })

  test('unknown scheme matches no built-in and still reports a diagnostic', () => {
    const custom = { ...compatibility, behaviorScheme: 'my://' }
    const definition = normalizeComponentDefinition({
      behaviors: ['my://form-field', 'wx://form-field'],
    }, 'components/behaviors/custom', custom)
    expect(definition.formField).toBe(true)
    expect(definition.diagnostics.map((item) => item.code)).toEqual(['UNSUPPORTED_BEHAVIOR'])
  })
})
