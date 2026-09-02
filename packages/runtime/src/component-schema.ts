import type { ComponentArtifact } from '@tiny/compiler-next'
import type { MiniProgramComponentOptions } from './service'
import type { MiniProgramComponentSchema, MiniProgramPropertyDefinition, MiniProgramPropertyType } from './types'

const PROPERTY_TYPES: Record<string, MiniProgramPropertyType> = {
  String: 'string',
  Number: 'number',
  Boolean: 'boolean',
  Object: 'object',
  Array: 'array',
  Function: 'function',
}

export function buildComponentSchemas(
  artifacts: ComponentArtifact[],
  definitions: Map<string, MiniProgramComponentOptions>,
): MiniProgramComponentSchema[] {
  return artifacts.map((artifact) => {
    const options = definitions.get(artifact.path) ?? {}
    const effective = artifact.configuration?.effective ?? {}
    return {
      componentId: `component-${artifacts.findIndex((item) => item.path === artifact.path) + 1}`,
      path: artifact.path,
      data: {
        ...Object.fromEntries(
          Object.entries(normalizeProperties(options.properties)).map(([name, definition]) => [name, definition.value]),
        ),
        ...structuredCloneSafe(options.data ?? {}),
      },
      properties: normalizeProperties(options.properties),
      using: readUsingComponents(effective),
    }
  })
}

function normalizeProperties(properties: unknown): Record<string, MiniProgramPropertyDefinition> {
  if (!properties || typeof properties !== 'object') return {}
  return Object.fromEntries(Object.entries(properties as Record<string, unknown>).map(([name, definition]) => {
    if (!definition || typeof definition !== 'object') {
      return [name, { type: normalizePropertyType(definition) }]
    }
    const option = definition as Record<string, unknown>
    const optionalTypes = Array.isArray(option.optionalTypes)
      ? option.optionalTypes.map((type) => normalizePropertyType(type))
      : undefined
    const normalized: MiniProgramPropertyDefinition = {
      type: normalizePropertyType(option.type),
      value: structuredCloneSafe(option.value),
    }
    if (optionalTypes) normalized.optionalTypes = optionalTypes
    return [name, normalized]
  }))
}

function normalizePropertyType(type: unknown): MiniProgramPropertyType {
  if (type === String) return 'string'
  if (type === Number) return 'number'
  if (type === Boolean) return 'boolean'
  if (type === Object) return 'object'
  if (type === Array) return 'array'
  if (type === Function) return 'function'
  return PROPERTY_TYPES[String(type)] ?? 'Any'
}

function readUsingComponents(config: unknown): Record<string, string> {
  if (!config || typeof config !== 'object') return {}
  const usingComponents = (config as Record<string, unknown>).usingComponents
  if (!usingComponents || typeof usingComponents !== 'object') return {}
  return Object.fromEntries(
    Object.entries(usingComponents as Record<string, unknown>).map(([tag, value]) => [tag, String(value)]),
  )
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
