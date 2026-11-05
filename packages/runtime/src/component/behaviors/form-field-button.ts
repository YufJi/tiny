import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://form-field-button`
 *
 * Marker only: WeChat's service-side behavior is an empty `Behavior`. The
 * `formSubmit` / `formReset` re-emit that lets a custom button component (for
 * example Vant's `van-button`) submit an enclosing `<form>` lives on the
 * **render** side (`hosts/web-components/src/behaviors/builtin.ts`), where the
 * form and the button share one tree; the logic tree never needs it.
 */
export function createFormFieldButtonBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'form-field-button'),
    markers: { formFieldButton: true },
    options: {
      is: builtinBehaviorId(compatibility, 'form-field-button'),
    },
  }
}
