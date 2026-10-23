import { describe, expect, test } from 'vitest'
import type { ComponentArtifact } from '@tiny/compiler-next'
import { buildComponentSchemas } from '../src/component-schema'
import type { MiniProgramComponentOptions } from '../src/service'

function artifact(path: string): ComponentArtifact {
  return {
    path,
    sourcePath: `${path}.js`,
    script: {},
    configuration: { effective: {} },
  } as unknown as ComponentArtifact
}

describe('buildComponentSchemas', () => {
  test('omits undefined property defaults from schema data', () => {
    const definitions = new Map<string, MiniProgramComponentOptions>([
      ['components/a', {
        properties: {
          ec: { type: Object },
          label: { type: String, value: 'ok' },
        },
      } as unknown as MiniProgramComponentOptions],
    ])
    const schemas = buildComponentSchemas([artifact('components/a')], definitions)
    expect(schemas[0]!.data).toEqual({ label: 'ok' })
    expect(schemas[0]!.properties.ec).toEqual({ type: 'object' })
    expect(schemas[0]!.properties.label).toEqual({ type: 'string', value: 'ok' })
  })
})
