import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import type { MiniProgramComponentOptions } from '../../service'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * WeChat rewrites the component option `export` into `methods.__export__`
 * through a `definitionFilter`, so the export function travels with the
 * definition and `selectComponent` returns its result.
 *
 * The rewrite is framework behaviour, not part of the behavior object: the
 * service-side `wx://component-export` is a placeholder (`Behavior({ is })`)
 * and `applyDefinitionFilters` applies this filter when it sees the marker.
 */
export function componentExportDefinitionFilter(defFields: unknown): void {
  const options = defFields as MiniProgramComponentOptions
  if (typeof options.export !== 'function') return
  if (options.methods && typeof options.methods === 'object') {
    options.methods.__export__ = options.export
  } else {
    options.methods = { __export__: options.export }
  }
}

/**
 * `wx://component-export`
 *
 * Marker only; the rewrite above is applied by the definition normalizer.
 */
export function createComponentExportBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'component-export'),
    markers: { componentExport: true },
    options: {
      is: builtinBehaviorId(compatibility, 'component-export'),
    },
  }
}
