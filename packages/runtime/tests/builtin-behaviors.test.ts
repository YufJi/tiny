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
    expect(definition.labelTarget).toBe(true)

    // Every service-side built-in behavior is a placeholder: none of them may
    // inject properties, data, methods or listeners into the user definition.
    // The real semantics live in the framework (export rewrite) and in the
    // render-side host behaviors (form button re-emit, label activation).
    expect(definition.properties).toEqual({})
    expect(definition.methods.size).toBe(0)
    expect(definition.data).toEqual({})
    expect(definition.listeners).toEqual({})
  })

  test('form-field-button is a marker without field properties or listeners', () => {
    const definition = normalize(['wx://form-field-button'])
    expect(definition.formField).toBe(false)
    expect(definition.formFieldButton).toBe(true)
    expect(definition.properties).toEqual({})
    // The formSubmit/formReset re-emit is a render-side behavior
    // (`hosts/web-components/src/behaviors/builtin.ts`).
    expect(definition.listeners).toEqual({})
  })

  test('form-field is a marker and does not declare name/value', () => {
    const definition = normalize(['wx://form-field'])
    expect(definition.formField).toBe(true)
    expect(definition.formFieldButton).toBe(false)
    expect(definition.properties).toEqual({})
    // The author owns the properties, as in WeChat.
    const declared = normalizeComponentDefinition({
      behaviors: ['wx://form-field'],
      properties: { name: { type: String, value: 'own' }, value: { type: String, value: '' } },
    }, 'components/behaviors/own')
    expect(declared.properties.name.value).toBe('own')
    expect(declared.properties.value).toMatchObject({ type: 'string' })
  })

  test('label-target is a marker without the activation method', () => {
    const definition = normalize(['wx://label-target'])
    expect(definition.labelTarget).toBe(true)
    expect(definition.methods.size).toBe(0)
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

  test('style-filter is a placeholder', () => {
    const style = normalize(['wx://style-filter'])
    expect(style.methods.size).toBe(0)
    expect(style.data).toEqual({})
  })

  test('functional-page-behavior is not supported', () => {
    const functional = normalize(['wx://functional-page-behavior'])
    expect(functional.diagnostics.map((item) => item.code)).toEqual(['UNSUPPORTED_BEHAVIOR'])
    expect(functional.methods.size).toBe(0)
    expect(functional.data).toEqual({})
    expect(BUILTIN_BEHAVIOR_NAMES).not.toContain('functional-page-behavior')
  })

  test('unknown scheme matches no built-in and still reports a diagnostic', () => {
    const custom = { ...compatibility, behaviorScheme: 'my://' }
    const definition = normalizeComponentDefinition({
      behaviors: ['my://form-field', 'wx://form-field'],
    }, 'components/behaviors/custom', custom)
    expect(definition.formField).toBe(true)
    expect(definition.diagnostics.map((item) => item.code)).toEqual(['UNSUPPORTED_BEHAVIOR'])
  })

  test('component-export marker still rewrites export into methods.__export__', () => {
    const definition = normalizeComponentDefinition({
      behaviors: ['wx://component-export'],
      export() { return { tag: 'exported' } },
    }, 'components/export/export')
    const exporter = definition.methods.get('__export__')
    expect(typeof exporter).toBe('function')
    expect((exporter as () => unknown)()).toEqual({ tag: 'exported' })
  })
})
