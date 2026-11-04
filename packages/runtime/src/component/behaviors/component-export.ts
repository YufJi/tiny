import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://component-export`
 *
 * WeChat only marks the component in `attached`; `export()` itself stays a
 * component option. The marker is consumed by `normalizeComponentDefinition`
 * and carried on `NormalizedComponentDefinition.componentExport`.
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
