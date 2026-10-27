import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'
import { builtinDefinitionName } from '../../tags'

export function defineTextarea(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('textarea'),
    template: ctx.template('textarea'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.classPrefix],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: String, value: '' },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
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
    },
    observers: {
      value() {
        this.scheduleAutoHeight()
      },
      autoHeight() {
        this.scheduleAutoHeight()
      },
      focus(value: number) {
        if (Number(value) > 0) this.focusNative()
      },
      autoFocus(value: boolean) {
        if (value) setTimeout(() => this.focusNative(), 0)
      },
      'cursor, selectionStart, selectionEnd'() {
        this.applySelection()
      },
    },
    lifetimes: {
      attached() {
        this.scheduleAutoHeight()
        if (this.data.autoFocus) setTimeout(() => this.focusNative(), 0)
      },
    },
    externalClasses: ['placeholder-class'],
    options: ctx.hostOptions('textarea'),
    methods: {
      textareaElement(): { style?: { height?: string }; scrollHeight?: number } | null {
        return (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => { style?: { height?: string }; scrollHeight?: number } | null } | null
        } | null)?.getElementById?.('native-textarea')?.getBackendElement?.() ?? null
      },
      focusNative() {
        const element = this.textareaElement() as {
          focus?: () => void
        } | null
        element?.focus?.()
        this.applySelection()
      },
      applySelection() {
        const element = this.textareaElement() as {
          value?: string
          setSelectionRange?: (start: number, end: number) => void
        } | null
        if (!element?.setSelectionRange) return
        const value = String(element.value ?? this.data.value ?? '')
        const cursor = Number(this.data.cursor ?? -1)
        let start = Number(this.data.selectionStart ?? -1)
        let end = Number(this.data.selectionEnd ?? -1)
        if (cursor >= 0) {
          start = cursor
          end = cursor
        }
        if (start < 0 && end < 0) return
        const max = value.length
        const clamp = (position: number) => Math.max(0, Math.min(max, Number.isFinite(position) ? position : 0))
        element.setSelectionRange(clamp(start), clamp(end))
      },
      scheduleAutoHeight() {
        if (!this.data.autoHeight) return
        setTimeout(() => this.syncAutoHeight(), 0)
      },
      syncAutoHeight() {
        const element = this.textareaElement()
        if (!element?.style) return
        element.style.height = 'auto'
        const height = Number(element.scrollHeight ?? 0)
        if (height > 0) element.style.height = `${height}px`
      },
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
        this.triggerEvent('linechange', { value, lineCount: String(value).split('\n').length }, { bubbles: true, composed: true })
        this.scheduleAutoHeight()
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
