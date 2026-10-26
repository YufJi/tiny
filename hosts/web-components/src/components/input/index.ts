import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'

export function defineInput(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:input',
    template: ctx.template('input'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.classPrefix],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: String, value: '' },
      type: { type: String, value: 'text' },
      password: { type: Boolean, value: false },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
      placeholderClass: { type: String, value: '' },
      dropdownStyle: { type: Object, value: {} },
      disabled: { type: Boolean, value: false },
      maxlength: { type: Number, value: 140 },
      focus: { type: Boolean, value: false },
      autoFocus: { type: Boolean, value: false },
      confirmType: { type: String, value: 'done' },
      confirmHold: { type: Boolean, value: false },
      cursor: { type: Number, value: -1 },
      selectionStart: { type: Number, value: -1 },
      selectionEnd: { type: Number, value: -1 },
      adjustPosition: { type: Boolean, value: true },
      holdKeyboard: { type: Boolean, value: false },
    },
    observers: {
      focus(value: boolean) {
        if (value) this.focusNative()
        else this.blurNative()
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
        if (this.data.autoFocus || this.data.focus) setTimeout(() => this.focusNative(), 0)
      },
    },
    options: ctx.hostOptions(),
    methods: {
      nativeInput(): {
        focus?: () => void
        blur?: () => void
        setSelectionRange?: (start: number, end: number) => void
        value?: string
      } | null {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
        } | null)?.getElementById?.('native-input')?.getBackendElement?.()
        return (element as {
          focus?: () => void
          blur?: () => void
          setSelectionRange?: (start: number, end: number) => void
          value?: string
        } | null) ?? null
      },
      focusNative() {
        const element = this.nativeInput()
        if (!element?.focus) return
        element.focus()
        this.applySelection()
      },
      blurNative() {
        this.nativeInput()?.blur?.()
      },
      applySelection() {
        const element = this.nativeInput()
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
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; cursor?: unknown; keyCode?: unknown }
        const value = valueFromEvent(event)
        const cursor = Number(detail.cursor ?? -1)
        const keyCode = Number(detail.keyCode ?? 0)
        this.setData({ value })
        this.triggerEvent('input', { value, cursor, keyCode }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleFocus(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; height?: unknown }
        const value = detail.value ?? this.data.value
        const height = Number(detail.height ?? 0)
        this.triggerEvent('focus', { value, height }, { bubbles: true, composed: true })
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; height?: unknown }
        const value = detail.value ?? this.data.value
        const height = Number(detail.height ?? 0)
        this.setData({ value })
        this.triggerEvent('blur', { value, height }, { bubbles: true, composed: true })
      },
      handleCompositionStart(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('keyboardcompositionstart', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
      },
      handleCompositionUpdate(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('keyboardcompositionupdate', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
      },
      handleCompositionEnd(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('keyboardcompositionend', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
      },
      handleSelect(event: glassEasel.ShadowedEvent<unknown>) {
        const element = (event.currentTarget as unknown as { getBackendElement?: () => { selectionStart?: number; selectionEnd?: number } | null } | null)?.getBackendElement?.()
        this.triggerEvent('selectionchange', {
          selectionStart: Number(element?.selectionStart ?? -1),
          selectionEnd: Number(element?.selectionEnd ?? -1),
        }, { bubbles: true, composed: true })
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
