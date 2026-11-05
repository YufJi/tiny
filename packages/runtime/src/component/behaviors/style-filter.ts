import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://style-filter`
 *
 * Marker only: WeChat's service-side behavior is an empty `Behavior`, and the
 * platform-injected style pipeline it belongs to is not modelled here.
 */
export function createStyleFilterBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  const id = builtinBehaviorId(compatibility, 'style-filter')
  return {
    id,
    markers: {},
    options: {
      is: id,
    },
  }
}
