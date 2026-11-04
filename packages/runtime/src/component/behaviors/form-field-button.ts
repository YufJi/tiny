import type { RuntimeCompatibilityConfig } from '@tiny/manifest'
import { builtinBehaviorId } from './types'
import type { BuiltinBehaviorSpec } from './types'

type FormFieldButtonRuntime = {
  _tinyFormFieldButtonReemitting?: boolean
  triggerEvent(
    name: string,
    detail?: unknown,
    options?: { bubbles?: boolean; composed?: boolean },
  ): void
}

/**
 * `wx://form-field-button`
 *
 * WeChat re-emits the form's `formSubmit` / `formReset` events from the custom
 * button component so a wrapper (for example Vant's `van-button`) participates
 * in form submission without owning the native `<button>`. It does not add
 * `name` / `value` properties.
 */
export function createFormFieldButtonBehavior(
  compatibility: RuntimeCompatibilityConfig,
): BuiltinBehaviorSpec {
  return {
    id: builtinBehaviorId(compatibility, 'form-field-button'),
    markers: { formFieldButton: true },
    options: {
      is: builtinBehaviorId(compatibility, 'form-field-button'),
      listeners: {
        // glass-easel listeners also receive events re-triggered on the same
        // component, so guard the re-emit to avoid a synchronous loop.
        formSubmit(this: FormFieldButtonRuntime, event: unknown) {
          if (this._tinyFormFieldButtonReemitting) return
          this._tinyFormFieldButtonReemitting = true
          try {
            this.triggerEvent('formSubmit', event, { bubbles: true })
          } finally {
            this._tinyFormFieldButtonReemitting = false
          }
        },
        formReset(this: FormFieldButtonRuntime, event: unknown) {
          if (this._tinyFormFieldButtonReemitting) return
          this._tinyFormFieldButtonReemitting = true
          try {
            this.triggerEvent('formReset', event, { bubbles: true })
          } finally {
            this._tinyFormFieldButtonReemitting = false
          }
        },
      },
    },
  }
}
