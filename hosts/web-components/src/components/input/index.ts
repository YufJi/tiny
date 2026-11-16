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
import {
  cancelHostFrame,
  isHostPageActive,
  requestHostFrame,
  subscribeHostPageVisibility,
  type HostFrame,
} from '../../host-page'
import { builtinDefinitionName } from '../../tags'

type InputRuntime = {
  __keyboardOwnerId: string
  __keyboardHeight: number
  __keyboardRequestId: number
  __unsubscribeKeyboard?: () => void
  __unsubscribePage?: () => void
  __pageActive: boolean
  __autoFocused: boolean
  __focusScheduled: boolean
  __focusFrame?: HostFrame
}

export function defineInput(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('input'),
    template: ctx.template('input'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.dataComponent,
      ctx.behaviors.classPrefix,
      ctx.behaviors.autofill,
      ctx.behaviors.labelTarget,
    ],
    properties: {
      value: { type: String, value: '' },
      type: { type: String, value: 'text' },
      password: { type: Boolean, value: false },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
      dropdownStyle: { type: Object, value: {} },
      disabled: { type: Boolean, value: false },
      maxlength: { type: Number, value: 140, observer: 'maxlengthChanged' },
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
        if (value) {
          this.scheduleInputFocus()
        } else {
          this.cancelScheduledFocus()
          this.blurNative()
        }
      },
      autoFocus(value: boolean) {
        if (value) this.scheduleInputFocus()
        else this.cancelScheduledFocus()
      },
      'cursor, selectionStart, selectionEnd'() {
        this.applySelection()
      },
      value(next: string) {
        this.syncNativeValue(next)
        this.restoreSelection()
      },
    },
    lifetimes: {
      attached() {
        const instance = this as unknown as InputRuntime
        instance.__keyboardOwnerId = createKeyboardOwnerId('input')
        instance.__keyboardHeight = 0
        instance.__keyboardRequestId = 0
        instance.__pageActive = isHostPageActive(ctx)
        instance.__autoFocused = false
        instance.__focusScheduled = false
        instance.__unsubscribeKeyboard = subscribeKeyboard(ctx, (event) => {
          this.handleHostKeyboard(event)
        })
        instance.__unsubscribePage = subscribeHostPageVisibility(ctx, (visibility) => {
          instance.__pageActive = visibility.active
          if (visibility.active) {
            this.scheduleInputFocus()
          } else {
            this.cancelScheduledFocus()
            if (this.isNativeFocused()) this.blurNative()
          }
        })
        this.scheduleInputFocus()
      },
      detached() {
        const instance = this as unknown as InputRuntime
        instance.__unsubscribeKeyboard?.()
        instance.__unsubscribeKeyboard = undefined
        instance.__unsubscribePage?.()
        instance.__unsubscribePage = undefined
        this.cancelScheduledFocus()
        if (instance.__keyboardHeight > 0) {
          hideHostKeyboard(ctx, {
            ownerId: instance.__keyboardOwnerId,
            source: 'input',
            reason: 'detach',
          })
        }
      },
    },
    externalClasses: ['placeholder-class'],
    options: ctx.hostOptions('input'),
    methods: {
      nativeInput(): {
        focus?: (options?: FocusOptions) => void
        blur?: () => void
        setSelectionRange?: (start: number, end: number) => void
        selectionStart?: number
        selectionEnd?: number
        value?: string
      } | null {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
        } | null)?.getElementById?.('native-input')?.getBackendElement?.()
        return (element as {
          focus?: (options?: FocusOptions) => void
          blur?: () => void
          setSelectionRange?: (start: number, end: number) => void
          selectionStart?: number
          selectionEnd?: number
          value?: string
        } | null) ?? null
      },
      syncNativeValue(next: unknown) {
        const element = this.nativeInput()
        const value = String(next ?? '')
        if (element && typeof element.value === 'string' && element.value !== value) {
          element.value = value
        }
      },
      rememberSelection() {
        const element = this.nativeInput()
        if (!element || typeof element.selectionStart !== 'number' || typeof element.selectionEnd !== 'number') return
        ;(this as unknown as { _selection?: { start: number; end: number } })._selection = {
          start: element.selectionStart,
          end: element.selectionEnd,
        }
      },
      restoreSelection() {
        const selection = (this as unknown as {
          _selection?: { start: number; end: number }
        })._selection
        if (!selection) return
        const explicit = Number(this.data.cursor ?? -1) >= 0 ||
          Number(this.data.selectionStart ?? -1) >= 0 ||
          Number(this.data.selectionEnd ?? -1) >= 0
        if (explicit) return
        setTimeout(() => {
          const element = this.nativeInput()
          if (!element?.setSelectionRange) return
          if (typeof document !== 'undefined' && document.activeElement !== element) return
          const value = String(element.value ?? '')
          const clamp = (position: number) => Math.max(0, Math.min(value.length, position))
          element.setSelectionRange(clamp(selection.start), clamp(selection.end))
        }, 0)
      },
      shouldFocus(): boolean {
        const instance = this as unknown as InputRuntime
        return Boolean(this.data.focus || (this.data.autoFocus && !instance.__autoFocused))
      },
      isNativeFocusable(): boolean {
        const element = this.nativeInput() as HTMLElement | null
        if (!element || element.isConnected === false || this.data.disabled) return false
        const style = typeof window !== 'undefined'
          ? window.getComputedStyle(element)
          : null
        if (style?.display === 'none' || style?.visibility === 'hidden') return false
        return element.offsetWidth > 0 || element.offsetHeight > 0
      },
      cancelScheduledFocus() {
        const instance = this as unknown as InputRuntime
        cancelHostFrame(instance.__focusFrame)
        instance.__focusFrame = undefined
        instance.__focusScheduled = false
      },
      scheduleInputFocus() {
        const instance = this as unknown as InputRuntime
        if (!instance.__pageActive || instance.__focusScheduled || !this.shouldFocus()) return
        instance.__focusScheduled = true
        instance.__focusFrame = requestHostFrame(() => {
          instance.__focusScheduled = false
          instance.__focusFrame = undefined
          if (!instance.__pageActive || !this.shouldFocus()) return
          if (!this.isNativeFocusable() || !this.focusNative()) return
          if (this.data.autoFocus) instance.__autoFocused = true
        })
      },
      focusNative(): boolean {
        const element = this.nativeInput()
        if (!element?.focus) return false
        try {
          element.focus({ preventScroll: true })
        } catch {
          element.focus()
        }
        this.applySelection()
        return this.isNativeFocused()
      },
      blurNative() {
        this.nativeInput()?.blur?.()
      },
      isNativeFocused(): boolean {
        const element = this.nativeInput()
        return Boolean(element && typeof document !== 'undefined' && document.activeElement === element)
      },
      focusScrollIntoView() {
        if (!this.data.adjustPosition) return
        const element = this.nativeInput() as {
          scrollIntoView?: (options?: ScrollIntoViewOptions) => void
        } | null
        element?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
      },
      requestKeyboardShow(value: unknown) {
        const instance = this as unknown as InputRuntime
        const requestId = ++instance.__keyboardRequestId
        const element = this.nativeInput()
        const request = {
          ownerId: instance.__keyboardOwnerId,
          source: 'input' as const,
          value: String(value ?? this.data.value ?? ''),
          maxlength: Number(this.data.maxlength ?? 0),
          confirmType: String(this.data.confirmType ?? 'done'),
          password: Boolean(this.data.password),
          disabled: Boolean(this.data.disabled),
          adjustPosition: Boolean(this.data.adjustPosition),
          holdKeyboard: Boolean(this.data.holdKeyboard),
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
        const instance = this as unknown as InputRuntime
        instance.__keyboardRequestId += 1
        hideHostKeyboard(ctx, {
          ownerId: instance.__keyboardOwnerId,
          source: 'input',
          reason,
          value: String(this.data.value ?? ''),
        })
      },
      handleHostKeyboard(event: HostKeyboardEvent) {
        const instance = this as unknown as InputRuntime
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        if (event.height === instance.__keyboardHeight) {
          if (event.height === 0 && event.blur && this.isNativeFocused()) this.blurNative()
          return
        }
        instance.__keyboardHeight = event.height
        this.triggerEvent(
          'keyboardheightchange',
          { height: event.height, duration: event.duration },
          { bubbles: true, composed: true },
        )
        if (event.height === 0 && event.blur && this.isNativeFocused()) this.blurNative()
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
      maxlengthChanged(next: number): void {
        if (!(next > 0)) return
        const value = String(this.data.value ?? '')
        if (value.length > next) this.setData({ value: value.slice(0, next) })
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
      handleLabelTap(): void {
        this.focusNative()
      },
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; cursor?: unknown; keyCode?: unknown }
        const value = valueFromEvent(event)
        const cursor = Number(detail.cursor ?? this.nativeInput()?.selectionEnd ?? -1)
        const keyCode = Number(detail.keyCode ?? 0)
        this.rememberSelection()
        this.setData({ value })
        this.restoreSelection()
        this.triggerEvent('input', { value, cursor, keyCode }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.rememberSelection()
        if (value !== this.data.value) this.setData({ value })
        this.restoreSelection()
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleFocus(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown; height?: unknown }
        const value = detail.value ?? this.data.value
        this.requestKeyboardShow(value)
      },
      handleBlur(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown }
        const value = detail.value ?? this.data.value
        if (value !== this.data.value) this.setData({ value })
        const cursor = Number(this.nativeInput()?.selectionEnd ?? -1)
        this.cancelScheduledFocus()
        this.releaseKeyboard('blur')
        this.triggerEvent('blur', { value, cursor }, { bubbles: true, composed: true })
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
        const element = (event.currentTarget as unknown as {
          getBackendElement?: () => { selectionStart?: number; selectionEnd?: number } | null
        } | null)?.getBackendElement?.()
        this.rememberSelection()
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
        this.rememberSelection()
        this.triggerEvent('keydown', { key, keyCode, value }, { bubbles: true, composed: true })
        if (key === 'Enter' || keyCode === 13) {
          this.triggerEvent('confirm', { value }, { bubbles: true, composed: true })
          if (!this.data.confirmHold) this.releaseKeyboard('confirm')
        }
      },
    },
  }).general()
}
