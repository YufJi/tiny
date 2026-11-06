import { cloneJsonSafe } from '../../data'
import type { ComponentDefinitionPayload } from '../../tree/protocol'
import type { MiniProgramComponentSchema } from '../../types'
import {
  normalizeComponentDefinition,
  resolveComponentReference,
  type NormalizedComponentDefinition,
} from '../../component/component-definition'

/**
 * Strip everything the render tree must not receive.
 *
 * WeChat ships the same shape to the view thread: public properties, behavior
 * ids and component options. Methods, lifetimes, observers and relations stay
 * in the service; the render side resolves the template by component path.
 */
function jsonSafePayload(payload: ComponentDefinitionPayload): ComponentDefinitionPayload {
  return cloneJsonSafe(payload)
}

/**
 * Strip the trailing extension from a compiler-defined path.
 *
 * The mini-program extension is configurable (`extensions.style`); consumers
 * must not assume `.wxss`.
 */
function withoutTrailingExtension(path: string): string {
  return path.replace(/\.[^./\\]+$/, '')
}

/**
 * Serialize one normalized service definition into the render-side payload.
 *
 * `behaviors` contains ids only. Object behaviors were already merged into the
 * normalized definition by `normalizeComponentDefinition`, and their functions
 * cannot cross the bridge.
 */
export function serializeComponentDefinition(
  componentPath: string,
  definition: NormalizedComponentDefinition,
  schema?: MiniProgramComponentSchema,
  styleScope?: string,
): ComponentDefinitionPayload {
  const behaviors = [...definition.behaviors].filter(
    (behavior): behavior is string => typeof behavior === 'string',
  )
  const externalClasses = definition.externalClasses.filter((name) => name.length > 0)
  // Only user handlers: `__export__` is the component-export rewrite and
  // underscore methods are engine-internal.
  const methods = [...definition.methods.keys()]
    .filter((name) => name !== '__export__' && !name.startsWith('_'))
  const options = schema?.options ?? { ...definition.options }
  const using = Object.entries(schema?.using ?? {})
    .filter(([tag, target]) => tag.length > 0 && typeof target === 'string' && target.length > 0)
    .map(([tag, target]) => [tag, resolveComponentReference(componentPath, target)] as const)
  const payload: ComponentDefinitionPayload = {
    path: componentPath,
    properties: definition.properties as Record<string, unknown>,
    data: definition.data,
    ...(behaviors.length > 0 ? { behaviors } : {}),
    ...(methods.length > 0 ? { methods } : {}),
    ...(externalClasses.length > 0 ? { externalClasses } : {}),
    ...(using.length > 0 ? { using: Object.fromEntries(using) } : {}),
    ...(styleScope ? { styleScope } : {}),
    ...(schema?.generics && Object.keys(schema.generics).length > 0
      ? { generics: schema.generics }
      : {}),
    ...(options ? { options } : {}),
  }
  return jsonSafePayload(payload)
}

/**
 * Build the definition table for every compiled component artifact.
 *
 * Mirrors `buildComponentSchemas`: an artifact without a registered
 * `Component()` call still gets an empty definition so the render tree can
 * register the tag.
 */
export function buildComponentDefinitions(
  schemas: readonly MiniProgramComponentSchema[],
  definitions: ReadonlyMap<string, NormalizedComponentDefinition>,
  styles: ReadonlyArray<{ path: string; scope?: string }> = [],
): Map<string, ComponentDefinitionPayload> {
  const scopeByPath = new Map<string, string>()
  for (const style of styles) {
    if (!style.scope) continue
    // Style artifacts carry the compiler-defined source path; the schema and
    // the definition table are keyed by the extension-less component path.
    scopeByPath.set(withoutTrailingExtension(style.path), style.scope)
    scopeByPath.set(style.path, style.scope)
  }
  const payloads = new Map<string, ComponentDefinitionPayload>()
  for (const schema of schemas) {
    const definition = definitions.get(schema.path)
      ?? normalizeComponentDefinition({}, schema.path)
    payloads.set(
      schema.path,
      serializeComponentDefinition(
        schema.path,
        definition,
        schema,
        scopeByPath.get(schema.path),
      ),
    )
  }
  return payloads
}
