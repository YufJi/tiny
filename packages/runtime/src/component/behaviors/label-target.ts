import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://label-target`
 *
 * Marker only: WeChat's service-side behavior is an empty `Behavior`. The
 * `wx-label-target` implementation lives in the host package
 * (`hosts/web-components/src/behaviors/labelTarget.ts`), which listens for the
 * composed `labelTap` event and calls `handleLabelTap`; user components may
 * override that method render-side.
 */
export function createBuiltinLabelTargetBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'label-target'),
    markers: { labelTarget: true },
    options: {
      is: builtinBehaviorId(compatibility, 'label-target'),
    },
  }
}
