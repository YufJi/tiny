import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { valueFromEvent } from '../../events'
import {
  createKeyboardOwnerId,
  hideHostKeyboard,
  showHostKeyboard,
  subscribeKeyboard,
  type HostKeyboardEvent,
} from '../../host-keyboard'
import { builtinDefinitionName } from '../../tags'

type TextareaRuntime = {
  __keyboardOwnerId: string
  __keyboardHeight: number
  __keyboardRequestId: number
  __unsubscribeKeyboard?: () => void
}

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
        const instance = this as unknown as TextareaRuntime
        instance.__keyboardOwnerId = createKeyboardOwnerId('textarea')
        instance.__keyboardHeight = 0
        instance.__keyboardRequestId = 0
        instance.__unsubscribeKeyboard = subscribeKeyboard(ctx, (event) => {
          this.handleHostKeyboard(event)
        })
        this.scheduleAutoHeight()
        if (this.data.autoFocus) setTimeout(() => this.focusNative(), 0)
      },
      detached() {
        const instance = this as unknown as TextareaRuntime
        instance.__unsubscribeKeyboard?.()
        instance.__unsubscribeKeyboard = undefined
        if (instance.__keyboardHeight > 0) {
          hideHostKeyboard(ctx, {
            ownerId: instance.__keyboardOwnerId,
            source: 'textarea',
            reason: 'detach',
          })
        }
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
      isNativeFocused(): boolean {
        const element = this.textareaElement()
        return Boolean(element && typeof document !== 'undefined' && document.activeElement === element)
      },
      focusScrollIntoView() {
        if (!this.data.adjustPosition) return
        const element = this.textareaElement() as {
          scrollIntoView?: (options?: ScrollIntoViewOptions) => void
        } | null
        element?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
      },
      requestKeyboardShow(value: unknown) {
        const instance = this as unknown as TextareaRuntime
        const requestId = ++instance.__keyboardRequestId
        const element = this.textareaElement() as {
          selectionStart?: number
          selectionEnd?: number
        } | null
        const request = {
          ownerId: instance.__keyboardOwnerId,
          source: 'textarea' as const,
          value: String(value ?? this.data.value ?? ''),
          maxlength: Number(this.data.maxlength ?? 0),
          confirmType: String(this.data.confirmType ?? 'return'),
          disabled: Boolean(this.data.disabled),
          adjustPosition: Boolean(this.data.adjustPosition),
          holdKeyboard: Boolean(this.data.holdKeyboard),
          cursorSpacing: Number(this.data.cursorSpacing ?? 0),
          showConfirmBar: Boolean(this.data.showConfirmBar),
          selectionStart: Number(element?.selectionStart ?? -1),
          selectionEnd: Number(element?.selectionEnd ?? -1),
        }
        void showHostKeyboard(ctx, request).then((detail) => {
          if (requestId !== instance.__keyboardRequestId) return
          const height = detail?.height ?? 0
          this.triggerEvent(
            'focus',
            { value: this.data.value, height },
            { bubbles: true, composed: true },
          )
          if (height > 0) this.focusScrollIntoView()
        })
      },
      releaseKeyboard(reason: string) {
        const instance = this as unknown as TextareaRuntime
        instance.__keyboardRequestId += 1
        hideHostKeyboard(ctx, {
          ownerId: instance.__keyboardOwnerId,
          source: 'textarea',
          reason,
          value: String(this.data.value ?? ''),
        })
      },
      handleHostKeyboard(event: HostKeyboardEvent) {
        const instance = this as unknown as TextareaRuntime
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        if (event.height === instance.__keyboardHeight) {
          if (event.height === 0 && event.blur && this.isNativeFocused()) this.blurKeyboard()
          return
        }
        instance.__keyboardHeight = event.height
        this.triggerEvent(
          'keyboardheightchange',
          { height: event.height, duration: event.duration },
          { bubbles: true, composed: true },
        )
        if (event.height === 0 && event.blur && this.isNativeFocused()) this.blurKeyboard()
      },
      blurKeyboard() {
        const element = this.textareaElement() as { blur?: () => void } | null
        element?.blur?.()
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
        this.requestKeyboardShow(valueFromEvent(event) ?? this.data.value)
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event) ?? this.data.value
        this.setData({ value })
        const cursor = Number((event.detail as { cursor?: unknown } | undefined)?.cursor ?? -1)
        this.releaseKeyboard('blur')
        this.triggerEvent('blur', { value, cursor }, { bubbles: true, composed: true })
      },
      handleConfirm(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('confirm', { value: valueFromEvent(event) ?? this.data.value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
