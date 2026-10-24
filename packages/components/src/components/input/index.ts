import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'

export function defineInput(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:input',
    template: ctx.template('input'),
    properties: {
      value: { type: String, value: '' },
      type: { type: String, value: 'text' },
      placeholder: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleFocus(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event) ?? this.data.value
        this.triggerEvent('focus', { value }, { bubbles: true, composed: true })
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event) ?? this.data.value
        this.setData({ value })
        this.triggerEvent('blur', { value }, { bubbles: true, composed: true })
      },
      handleKeyDown(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { key?: string; keyCode?: number; which?: number; value?: unknown }
        const key = String(detail.key ?? '')
        const keyCode = Number(detail.keyCode ?? detail.which ?? 0)
        const value = detail.value ?? this.data.value
        this.triggerEvent('keydown', { key, keyCode, value }, { bubbles: true, composed: true })
        if (key === 'Enter' || keyCode === 13) {
          this.triggerEvent('confirm', { value }, { bubbles: true, composed: true })
        }
      },
    },
  }).general()
}
