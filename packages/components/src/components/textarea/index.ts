import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'

export function defineTextarea(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:textarea',
    template: ctx.template('textarea'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.classPrefix],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: String, value: '' },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
      placeholderClass: { type: String, value: 'textarea-placeholder' },
      disabled: { type: Boolean, value: false },
      maxlength: { type: Number, value: 140 },
      autoFocus: { type: Boolean, value: false },
      focus: { type: Number, value: 0 },
      autoHeight: { type: Boolean, value: false },
      fixed: { type: Boolean, value: false },
      cursorSpacing: { type: Number, value: 0 },
      cursor: { type: Number, value: -1 },
      selectionStart: { type: Number, value: -1 },
      selectionEnd: { type: Number, value: -1 },
      adjustPosition: { type: Boolean, value: true },
      holdKeyboard: { type: Boolean, value: false },
      showConfirmBar: { type: Boolean, value: true },
      disableDefaultPadding: { type: Boolean, value: false },
      confirmType: { type: String, value: 'return' },
      confirmHold: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
        this.triggerEvent('linechange', { value, lineCount: String(value).split('\n').length }, { bubbles: true, composed: true })
      },
      handleFocus(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('focus', { value: valueFromEvent(event) ?? this.data.value }, { bubbles: true, composed: true })
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event) ?? this.data.value
        this.setData({ value })
        this.triggerEvent('blur', { value }, { bubbles: true, composed: true })
      },
      handleConfirm(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('confirm', { value: valueFromEvent(event) ?? this.data.value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
