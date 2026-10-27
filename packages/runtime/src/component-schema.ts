import type { ComponentArtifact } from '@tiny/manifest'
import {
  normalizeComponentDefinition,
  parsePureDataPattern,
  type NormalizedComponentDefinition,
} from './component-definition'
import type { MiniProgramComponentSchema } from './types'

export function buildComponentSchemas(
  artifacts: ComponentArtifact[],
  definitions: Map<string, NormalizedComponentDefinition>,
): MiniProgramComponentSchema[] {
  return artifacts.map((artifact, index) => {
    const definition = definitions.get(artifact.path)
      ?? normalizeComponentDefinition({}, artifact.path)
    const effective = artifact.configuration?.effective ?? {}
    const styleIsolation = resolveStyleIsolation(definition, effective)
    const pureDataPattern = definition.options.pureDataPattern
      ?? parsePureDataPattern(effective.pureDataPattern)
    return {
      componentId: `component-${index + 1}`,
      path: artifact.path,
      data: definition.data,
      properties: definition.properties,
      using: readUsingComponents(effective),
      generics: readComponentGenerics(effective),
      ...(pureDataPattern ? { pureDataPattern: pureDataPattern.source } : {}),
      externalClasses: definition.externalClasses,
      formField: definition.formField,
      observers: definition.observers.map((observer) => ({
        key: observer.key,
        paths: observer.paths,
      })),
      relations: definition.relations.map((relation) => ({
        key: relation.key,
        type: relation.type,
        target: relation.targetPath,
      })),
      options: {
        multipleSlots: definition.options.multipleSlots,
        virtualHost: definition.options.virtualHost,
        styleIsolation,
        explicitStyleIsolation:
          definition.options.explicitStyleIsolation || readStyleIsolation(effective) !== undefined,
        addGlobalClass: definition.options.addGlobalClass,
      },
    }
  })
}

function resolveStyleIsolation(
  definition: NormalizedComponentDefinition,
  effective: Record<string, unknown>,
): 'isolated' | 'apply-shared' | 'shared' {
  if (definition.options.explicitStyleIsolation) return definition.options.styleIsolation
  if (definition.options.addGlobalClass) return 'apply-shared'
  const fromJson = readStyleIsolation(effective)
  if (fromJson) return fromJson
  return 'isolated'
}

function readStyleIsolation(
  config: Record<string, unknown>,
): 'isolated' | 'apply-shared' | 'shared' | undefined {
  const value = config.styleIsolation
  if (value === 'isolated' || value === 'apply-shared' || value === 'shared') return value
  return undefined
}

export function readComponentGenerics(
  config: Record<string, unknown>,
): Record<string, { default?: string } | true> {
  const raw = config.componentGenerics
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const result: Record<string, { default?: string } | true> = {}
  for (const [alias, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!alias) continue
    if (value === true) {
      result[alias] = true
      continue
    }
    if (!value || typeof value !== 'object') continue
    const defaultPath = (value as Record<string, unknown>).default
    result[alias] = typeof defaultPath === 'string' && defaultPath.length > 0
      ? { default: defaultPath }
      : true
  }
  return result
}

function readUsingComponents(config: unknown): Record<string, string> {
  if (!config || typeof config !== 'object') return {}
  const usingComponents = (config as Record<string, unknown>).usingComponents
  if (!usingComponents || typeof usingComponents !== 'object') return {}
  return Object.fromEntries(
    Object.entries(usingComponents as Record<string, unknown>).map(([tag, value]) => [tag, String(value)]),
  )
}
