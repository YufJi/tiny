import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

/**
 * `wx://form-field-group`
 *
 * Marks a wrapper component whose shadow tree contains form fields. WeChat's
 * form traverses into this component instead of treating it as a single field.
 * The marker is carried as `formFieldGroup`; the render side attaches the
 * matching glass-easel marker behavior.
 */
export function createFormFieldGroupBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'form-field-group'),
    markers: { formFieldGroup: true },
    options: {
      is: builtinBehaviorId(compatibility, 'form-field-group'),
    },
  }
}
