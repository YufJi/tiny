import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'
import { builtinDefinitionName } from '../../tags'

export function defineTextarea(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('textarea'),
    template: ctx.template('textarea'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.classPrefix, ctx.behaviors.autofill],
    properties: {
      value: { type: String, value: '' },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      maxlength: { type: Number, value: 140, observer: 'maxlengthChanged' },
      adjustKeyboardTo: { type: String, value: 'cursor' },
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
      maxlengthChanged(next: unknown): void {
        const max = Number(next)
        if (!(max > 0)) return
        const value = String(this.data.value ?? '')
        if (value.length > max) this.setData({ value: value.slice(0, max) })
      },
      getFormData(callback?: (value: unknown) => void): unknown {
        if (typeof callback === 'function') {
          callback(this.data.value)
          return undefined
        }
        return this.data.value
      },
      resetFormData(): void {
        this.setData({ value: '' })
      },
      autofillGetValue(): unknown {
        return this.data.value
      },
      autofillSetValue(value: unknown): void {
        const next = String(value ?? '')
        this.setData({ value: next })
        this.triggerEvent('change', { value: next })
      },
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        const text = String(value)
        const lineCount = text.split('\n').length
        const element = this.textareaElement() as unknown as {
          scrollHeight?: number
          style?: { height?: string }
        } | null
        const lineHeight = 1.2 * 16
        const height = Math.max(Number(element?.scrollHeight ?? 0), lineHeight)
        const scale = typeof window !== 'undefined' && window.innerWidth > 0
          ? 750 / window.innerWidth
          : 1
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
        this.triggerEvent(
          'linechange',
          { height, heightRpx: Math.round(scale * height), lineHeight, lineCount },
          { bubbles: true, composed: true },
        )
        this.scheduleAutoHeight()
      },
      handleFocus(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent(
          'focus',
          { value: valueFromEvent(event) ?? this.data.value, height: 0 },
          { bubbles: true, composed: true },
        )
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event) ?? this.data.value
        this.setData({ value })
        const cursor = Number((event.detail as { cursor?: unknown } | undefined)?.cursor ?? -1)
        this.triggerEvent('blur', { value, cursor }, { bubbles: true, composed: true })
      },
      handleConfirm(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('confirm', { value: valueFromEvent(event) ?? this.data.value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
