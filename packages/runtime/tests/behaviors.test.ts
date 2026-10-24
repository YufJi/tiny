import { describe, expect, test } from 'vitest'
import { registerBehavior } from '../src/behaviors'
import { normalizeComponentDefinition } from '../src/component-definition'

describe('normalizeComponentDefinition', () => {
  test('merges nested behaviors with component overrides and stable ordering', () => {
    const attachOrder: string[] = []
    const base = registerBehavior({
      properties: {
        label: { type: String, value: 'base' },
        extra: { type: Number, value: 1 },
      },
      data: {
        nested: { a: 1 },
        list: [1],
        baseOnly: true,
      },
      methods: {
        shared: () => 'base',
        baseMethod: () => 'base-method',
      },
      lifetimes: {
        attached: () => attachOrder.push('base'),
      },
      observers: {
        label: () => undefined,
      },
      relations: {
        './child': { type: 'child', linked: () => undefined },
      },
      externalClasses: ['base-class'],
      options: { multipleSlots: true },
    })
    const nested = registerBehavior({
      behaviors: [base],
      data: { nested: { b: 2 } },
      lifetimes: {
        attached: () => attachOrder.push('nested'),
      },
      methods: { nestedMethod: () => 'nested-method' },
    })

    const definition = normalizeComponentDefinition({
      behaviors: [nested, base],
      properties: {
        label: { type: String, value: 'component' },
      },
      data: {
        nested: { c: 3 },
        list: [2],
      },
      methods: {
        shared: () => 'component',
        own: () => 'own',
      },
      lifetimes: {
        attached: () => attachOrder.push('component'),
      },
      observers: {
        'label, extra': () => undefined,
      },
      externalClasses: ['own-class'],
      options: { styleIsolation: 'apply-shared', addGlobalClass: true },
    }, 'components/foo/foo')

    expect(definition.properties.label.value).toBe('component')
    expect(definition.properties.extra.value).toBe(1)
    expect(definition.data).toEqual({
      label: 'component',
      extra: 1,
      nested: { a: 1, b: 2, c: 3 },
      list: [2],
      baseOnly: true,
    })
    expect(definition.methods.get('shared')?.()).toBe('component')
    expect(definition.methods.has('baseMethod')).toBe(true)
    expect(definition.methods.has('nestedMethod')).toBe(true)
    expect(definition.methods.has('own')).toBe(true)
    // referenced behavior -> referencing behavior -> component; duplicate base is not executed twice
    for (const handler of definition.lifetimeHandlers.attached) handler.call({})
    expect(attachOrder).toEqual(['base', 'nested', 'component'])
    expect(definition.observers.map((observer) => observer.paths)).toEqual([
      ['label'],
      ['label', 'extra'],
    ])
    expect(definition.relations).toHaveLength(1)
    expect(definition.relations[0]).toMatchObject({
      key: './child',
      type: 'child',
      targetPath: 'components/foo/child',
    })
    expect(definition.externalClasses).toEqual(['base-class', 'own-class'])
    expect(definition.options).toMatchObject({
      multipleSlots: true,
      styleIsolation: 'apply-shared',
      addGlobalClass: true,
      explicitStyleIsolation: true,
    })
    expect(definition.behaviors.has(base)).toBe(true)
    expect(definition.behaviors.has(nested)).toBe(true)
  })

  test('keeps property observers and replaces them when the property is overridden', () => {
    const base = registerBehavior({
      properties: {
        value: { type: String, value: 'a', observer: 'onBaseValue' },
        untouched: { type: String, value: 'b', observer: 'onUntouched' },
      },
    })
    const definition = normalizeComponentDefinition({
      behaviors: [base],
      properties: {
        value: { type: String, value: 'c' },
      },
    }, 'components/foo/foo')
    expect(definition.observers).toHaveLength(1)
    expect(definition.observers[0]).toMatchObject({
      kind: 'property',
      propertyName: 'untouched',
      paths: ['untouched'],
      handler: 'onUntouched',
    })
  })

  test('records unsupported built-in behaviors and definition filters', () => {
    const definition = normalizeComponentDefinition({
      behaviors: ['wx://form-field'],
      definitionFilter: () => undefined,
    }, 'components/foo/foo')
    expect(definition.diagnostics.map((item) => item.code)).toEqual(
      expect.arrayContaining(['UNSUPPORTED_BEHAVIOR', 'UNSUPPORTED_BEHAVIOR_FILTER']),
    )
  })

  test('stops cyclic behavior graphs', () => {
    const cyclic = registerBehavior({ data: { value: 1 } })
    cyclic.behaviors = [cyclic]
    const definition = normalizeComponentDefinition({ behaviors: [cyclic] }, 'components/a')
    expect(definition.data).toEqual({ value: 1 })
    expect(definition.behaviors.has(cyclic)).toBe(true)
  })

  test('supports component export marker', () => {
    const definition = normalizeComponentDefinition({
      behaviors: ['wx://component-export'],
      export() {
        return { value: 1 }
      },
    }, 'components/foo/foo')
    expect(definition.componentExport).toBe(true)
    expect(typeof definition.export).toBe('function')
  })
})
