import {
  DIAGNOSTIC_CODES,
  WECHAT_RUNTIME_COMPATIBILITY,
  type RuntimeCompatibilityConfig,
} from '@tiny/manifest'
import {
  isBuiltinBehavior,
  resolveBuiltinBehavior,
} from '../behaviors'
import { componentExportDefinitionFilter } from '../behaviors/component-export'
import type { MiniProgramComponentOptions } from '../options'
import type { DefinitionDiagnostic } from './types'

const filteredDefinitions = new WeakSet<object>()

/**
 * Run the definitionFilter chain contributed by the direct behaviors of
 * `source`, matching WeChat's declaration-time filtering. Nested behaviors are
 * visited first by normalizeComponentDefinition, so each filter observes a
 * fully prepared user definition.
 *
 * String behaviors are resolved against the built-in registry: WeChat's
 * `callDefinitionFilter` does the same, which is how `wx://component-export`
 * rewrites `export` into a method.
 */
export function applyDefinitionFilters(
  source: Record<string, unknown>,
  onDiagnostic?: (diagnostic: DefinitionDiagnostic) => void,
  compatibility: RuntimeCompatibilityConfig = WECHAT_RUNTIME_COMPATIBILITY,
): void {
  if (filteredDefinitions.has(source)) return
  filteredDefinitions.add(source)
  const behaviors = Array.isArray(source.behaviors) ? source.behaviors : []
  for (const behavior of behaviors) {
    let filter: MiniProgramComponentOptions['definitionFilter']
    let filterOwner: object | string = behavior as object
    if (typeof behavior === 'string') {
      if (!isBuiltinBehavior(behavior)) continue
      const spec = resolveBuiltinBehavior(behavior, compatibility)
      // `wx://component-export` is a placeholder behavior; its `export` rewrite
      // is framework logic keyed by the marker.
      filter = spec?.options.definitionFilter
        ?? (spec?.markers.componentExport ? componentExportDefinitionFilter : undefined)
      filterOwner = behavior
    } else if (behavior && typeof behavior === 'object') {
      filter = (behavior as MiniProgramComponentOptions).definitionFilter
    } else {
      continue
    }
    if (typeof filter !== 'function') continue
    const filterArr = typeof behavior === 'object' && behavior
      ? collectDirectDefinitionFilters(behavior as MiniProgramComponentOptions)
      : []
    try {
      filter(source, filterArr)
    } catch (error) {
      onDiagnostic?.({
        code: DIAGNOSTIC_CODES.DEFINITION_FILTER_ERROR,
        message: error instanceof Error ? error.message : String(error),
        details: { behavior: describeBehavior(filterOwner) },
      })
    }
  }
}

function collectDirectDefinitionFilters(
  behavior: MiniProgramComponentOptions,
): Array<(defFields: unknown) => unknown> {
  if (!Array.isArray(behavior.behaviors)) return []
  const filters: Array<(defFields: unknown) => unknown> = []
  for (const item of behavior.behaviors) {
    if (!item || typeof item !== 'object') continue
    const filter = (item as MiniProgramComponentOptions).definitionFilter
    if (typeof filter === 'function') {
      // WeChat supplies the nested filter array when a filter invokes
      // `definitionFilterArr[i](defFields)`; wrap it so callers only pass the
      // definition object.
      filters.push((defFields: unknown) => filter(
        defFields,
        collectDirectDefinitionFilters(item as MiniProgramComponentOptions),
      ))
    }
  }
  return filters
}

function describeBehavior(behavior: object | string): string {
  if (typeof behavior === 'string') return behavior
  const is = (behavior as MiniProgramComponentOptions).is
  return typeof is === 'string' ? is : '[object Behavior]'
}
