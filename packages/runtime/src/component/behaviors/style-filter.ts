import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://style-filter`
 *
 * The reference behavior contributes a single `_styleFilter()` hook that
 * returns an empty style string; open-data/native components use it to keep
 * platform-injected styles out of the user style pipeline.
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
      methods: {
        _styleFilter: () => '',
      },
    },
  }
}
