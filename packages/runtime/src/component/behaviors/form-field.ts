import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://form-field`
 *
 * A marker: WeChat's service-side behavior is an empty `Behavior` and the
 * component author declares `name` / `value` itself. The form component only
 * needs to recognise the field, which the logic tree tracks through the schema
 * flag and the render side through its own marker behavior.
 */
export function createFormFieldBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'form-field'),
    markers: { formField: true },
    options: {
      is: builtinBehaviorId(compatibility, 'form-field'),
    },
  }
}
