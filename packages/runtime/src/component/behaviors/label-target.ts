import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://label-target`
 *
 * WeChat's built-in behavior is literally `behaviors: ['wx-label-target']`.
 * The host package owns the `wx-label-target` implementation; the runtime only
 * carries the marker so the render-side adapter can attach the matching
 * glass-easel marker behavior (which listens for `labelTap` and calls
 * `handleLabelTap`). User components may override `handleLabelTap`.
 */
export function createBuiltinLabelTargetBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'label-target'),
    markers: { labelTarget: true },
    options: {
      is: builtinBehaviorId(compatibility, 'label-target'),
      methods: {
        handleLabelTap() {
          // Activation is dispatched by the `<label>` implementation.
        },
      },
    },
  }
}
