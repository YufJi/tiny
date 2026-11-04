import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://form-field`
 *
 * WeChat declares `name` (String) and `value` (any) on the component and marks
 * it as a form field. The form component reads `value` from the marker; it does
 * not call user code. `form-field-button` deliberately does not get these two
 * properties.
 */
export function createFormFieldBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'form-field'),
    markers: { formField: true },
    options: {
      is: builtinBehaviorId(compatibility, 'form-field'),
      properties: {
        name: { type: String, value: '' },
        // WeChat uses `type: null`, i.e. an untyped property.
        value: { value: '' },
      },
    },
  }
}
