import type { ComponentArtifact } from '@tiny/manifest'
import { normalizeComponentDefinition, type NormalizedComponentDefinition } from './component-definition'
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
    return {
      componentId: `component-${index + 1}`,
      path: artifact.path,
      data: definition.data,
      properties: definition.properties,
      using: readUsingComponents(effective),
      externalClasses: definition.externalClasses,
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

function readUsingComponents(config: unknown): Record<string, string> {
  if (!config || typeof config !== 'object') return {}
  const usingComponents = (config as Record<string, unknown>).usingComponents
  if (!usingComponents || typeof usingComponents !== 'object') return {}
  return Object.fromEntries(
    Object.entries(usingComponents as Record<string, unknown>).map(([tag, value]) => [tag, String(value)]),
  )
}
