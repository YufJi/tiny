import { describe, expect, test } from 'vitest'
import type { ComponentArtifact } from '@tiny/manifest'
import { buildComponentSchemas } from '../src/component-schema'
import { normalizeComponentDefinition } from '../src/component-definition'

function artifact(path: string, effective: Record<string, unknown> = {}): ComponentArtifact {
  return {
    path,
    sourcePath: `${path}.js`,
    script: {},
    configuration: { effective },
  } as unknown as ComponentArtifact
}

describe('buildComponentSchemas', () => {
  test('omits undefined property defaults from schema data', () => {
    const definitions = new Map([
      ['components/a', normalizeComponentDefinition({
        properties: {
          ec: { type: Object },
          label: { type: String, value: 'ok' },
        },
      }, 'components/a')],
    ])
    const schemas = buildComponentSchemas([artifact('components/a')], definitions)
    expect(schemas[0]!.data).toEqual({ label: 'ok' })
    expect(schemas[0]!.properties.ec).toEqual({ type: 'object' })
    expect(schemas[0]!.properties.label).toEqual({ type: 'string', value: 'ok' })
  })

  test('serializes external classes, observers, relations and options', () => {
    const definitions = new Map([
      ['components/a', normalizeComponentDefinition({
        externalClasses: ['ext-class'],
        observers: {
          'value': () => undefined,
        },
        relations: {
          './child': { type: 'child', linked: () => undefined },
        },
        options: {
          multipleSlots: true,
          virtualHost: true,
          addGlobalClass: true,
        },
      }, 'components/a')],
    ])
    const schemas = buildComponentSchemas([artifact('components/a')], definitions)
    expect(schemas[0]!.externalClasses).toEqual(['ext-class'])
    expect(schemas[0]!.observers).toHaveLength(1)
    expect(schemas[0]!.relations).toEqual([{
      key: './child',
      type: 'child',
      target: 'components/child',
    }])
    expect(schemas[0]!.options).toMatchObject({
      multipleSlots: true,
      virtualHost: true,
      styleIsolation: 'apply-shared',
      explicitStyleIsolation: false,
      addGlobalClass: true,
    })
  })

  test('marks form-field components in the schema', () => {
    const definitions = new Map([
      ['components/a', normalizeComponentDefinition({
        behaviors: ['wx://form-field'],
      }, 'components/a')],
    ])
    const schemas = buildComponentSchemas([artifact('components/a')], definitions)
    expect(schemas[0]!.formField).toBe(true)
    expect(schemas[0]!.properties.name).toBeDefined()
    expect(schemas[0]!.properties.value).toBeDefined()
  })

  test('reads styleIsolation from component json when JS does not set it', () => {
    const definitions = new Map([
      ['components/a', normalizeComponentDefinition({}, 'components/a')],
    ])
    const schemas = buildComponentSchemas([
      artifact('components/a', { styleIsolation: 'shared' }),
    ], definitions)
    expect(schemas[0]!.options?.styleIsolation).toBe('shared')
    expect(schemas[0]!.options?.explicitStyleIsolation).toBe(true)
  })
})
