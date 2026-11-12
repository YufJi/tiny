import { describe, expect, test } from 'vitest'
import {
  buildComponentDefinitions,
  serializeComponentDefinition,
} from '../src/service/render-bridge/definition-payload'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import type { MiniProgramComponentSchema } from '../src/component/schema'

const PATH = 'components/card/card'

function normalize(options: Record<string, unknown> = {}) {
  return normalizeComponentDefinition(options, PATH)
}

describe('component definition payload', () => {
  test('carries properties, behaviors and markers', () => {
    const definition = normalize({
      behaviors: ['wx://form-field'],
      properties: { label: { type: String, value: 'hello' } },
      data: { count: 1 },
      externalClasses: ['outer', ''],
    })
    const payload = serializeComponentDefinition(PATH, definition)

    expect(payload.path).toBe(PATH)
    expect(payload.properties?.label).toEqual({ type: 'string', value: 'hello' })
    expect(payload.data).toMatchObject({ label: 'hello', count: 1 })
    expect(payload.behaviors).toEqual(['wx://form-field'])
    expect(payload.externalClasses).toEqual(['outer'])
  })

  test('drops element-reserved properties such as dataset and id', () => {
    const definition = normalize({
      properties: {
        dataset: null,
        id: String,
        label: String,
      },
    })
    const payload = serializeComponentDefinition(PATH, definition)
    expect(payload.properties).not.toHaveProperty('dataset')
    expect(payload.properties).not.toHaveProperty('id')
    expect(payload.properties).toHaveProperty('label')
  })

  test('drops functions and object behaviors', () => {
    const userBehavior = { data: { fromBehavior: true }, methods: { noop() {} } }
    const definition = normalize({
      behaviors: [userBehavior, 'wx://component-export'],
      export() {
        return { value: 1 }
      },
    })
    const payload = serializeComponentDefinition(PATH, definition)

    // Only string ids are resolvable on the render side.
    expect(payload.behaviors).toEqual(['wx://component-export'])
    expect(payload.properties).toBeDefined()
    // Method *names* travel (the render side installs forwarding stubs), but
    // the functions themselves stay in the service.
    expect(payload.methods).toEqual(['noop'])
    expect(payload).not.toHaveProperty('export')
    // Whatever crosses the bridge must be JSON-safe already.
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload)
  })

  test('reuses the schema options and generics when available', () => {
    const definition = normalize()
    const schema = {
      componentId: 'component-1',
      path: PATH,
      data: {},
      properties: {},
      using: {},
      generics: { item: true },
      options: { styleIsolation: 'apply-shared' as const, multipleSlots: true },
    } satisfies MiniProgramComponentSchema
    const payload = serializeComponentDefinition(PATH, definition, schema)

    expect(payload.options).toMatchObject({ styleIsolation: 'apply-shared', multipleSlots: true })
    expect(payload.generics).toEqual({ item: true })
  })

  test('builds one payload per schema and falls back for unregistered artifacts', () => {
    const schemas = [
      {
        componentId: 'component-1',
        path: PATH,
        data: {},
        properties: {},
        using: {},
      },
      {
        componentId: 'component-2',
        path: 'components/empty/empty',
        data: {},
        properties: {},
        using: {},
      },
    ] satisfies MiniProgramComponentSchema[]
    const payloads = buildComponentDefinitions(
      schemas,
      new Map([[PATH, normalize({ data: { label: 'x' } })]]),
    )

    expect([...payloads.keys()]).toEqual([PATH, 'components/empty/empty'])
    expect(payloads.get(PATH)?.data).toMatchObject({ label: 'x' })
    expect(payloads.get('components/empty/empty')?.path).toBe('components/empty/empty')
  })

  test('carries the compiler-assigned style scope', () => {
    const schemas = [{
      componentId: 'component-1',
      path: PATH,
      data: {},
      properties: {},
      using: {},
    }] satisfies MiniProgramComponentSchema[]
    const payloads = buildComponentDefinitions(
      schemas,
      new Map([[PATH, normalize()]]),
      [{ path: PATH, scope: 'tiny-components-card-card' }],
    )
    expect(payloads.get(PATH)?.styleScope).toBe('tiny-components-card-card')
  })
})
