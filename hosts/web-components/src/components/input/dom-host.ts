import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { BuiltinContext } from '../../types'
import { valueFromEvent } from '../../events'
import { hideHostKeyboard, showHostKeyboard } from '../../host-keyboard'
import { nativeViewFrameOf, nativeViewStyleOf } from '../../host-native-view'
import type { InputHostComponent, InputHostElement, InputHostMethods } from './host'
import { inputRuntime } from './host'

/**
 * DOM/WebView host: the real `<input>` owns focus, selection and the native
 * caret. The host keyboard request only reports height to the mini-program.
 */
export function createDomInputHost(ctx: BuiltinContext): InputHostMethods {
  return {
    nativeInput(this: InputHostComponent): InputHostElement | null {
      const element = (this.getShadowRoot?.() as {
        getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
      } | null)?.getElementById?.('native-input')?.getBackendElement?.()
      return (element as InputHostElement | null) ?? null
    },

    activationElement(this: InputHostComponent): HTMLElement | null {
      const host = (this as unknown as { getBackendElement?: () => HTMLElement | null })
        .getBackendElement?.()
      if (host) return host
      return ((this.getShadowRoot?.() as {
        getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
      } | null)?.getElementById?.('wrapper')?.getBackendElement?.() as HTMLElement | null) ?? null
    },

    syncNativeValue(this: InputHostComponent, next: unknown): void {
      const element = this.nativeInput()
      const value = String(next ?? '')
      if (element && typeof element.value === 'string' && element.value !== value) {
        element.value = value
      }
    },

    rememberSelection(this: InputHostComponent): void {
      const element = this.nativeInput()
      if (!element || typeof element.selectionStart !== 'number' || typeof element.selectionEnd !== 'number') {
        return
      }
      inputRuntime(this)._selection = {
        start: element.selectionStart,
        end: element.selectionEnd,
      }
    },

    restoreSelection(this: InputHostComponent): void {
      const selection = inputRuntime(this)._selection
      if (!selection) return
      const explicit = Number(this.data.cursor ?? -1) >= 0
        || Number(this.data.selectionStart ?? -1) >= 0
        || Number(this.data.selectionEnd ?? -1) >= 0
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

    isNativeFocusable(this: InputHostComponent): boolean {
      const element = this.nativeInput()
      if (!element || element.isConnected === false || this.data.disabled) return false
      const style = typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      if (style?.display === 'none' || style?.visibility === 'hidden') return false
      return element.offsetWidth > 0 || element.offsetHeight > 0
    },

    focusNative(this: InputHostComponent): boolean {
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

    blurNative(this: InputHostComponent): void {
      this.nativeInput()?.blur?.()
    },

    seedHostCursor(this: InputHostComponent): void {
      // The DOM input already has a live selection.
    },

    handleWrapperTap(this: InputHostComponent): void {
      // The DOM input owns its own tap target.
    },

    isNativeFocused(this: InputHostComponent): boolean {
      const element = this.nativeInput()
      return Boolean(element && typeof document !== 'undefined' && document.activeElement === element)
    },

    focusScrollIntoView(this: InputHostComponent): void {
      if (!this.data.adjustPosition) return
      this.nativeInput()?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
    },

    requestKeyboardShow(this: InputHostComponent, value: unknown): void {
      const instance = inputRuntime(this)
      const requestId = ++instance.__keyboardRequestId
      instance.__keyboardShowPending = false
      const element = this.nativeInput()
      const rect = element?.getBoundingClientRect?.()
      const computed = element && typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      const nativeStyle = nativeViewStyleOf(this.activationElement())
      const fontSize = computed ? Number.parseFloat(computed.fontSize) : Number.NaN
      const lineHeight = computed ? Number.parseFloat(computed.lineHeight) : Number.NaN
      const frame = nativeViewFrameOf(this.activationElement())
      const request = {
        ownerId: instance.__keyboardOwnerId,
        source: 'input' as const,
        value: String(value ?? this.data.value ?? ''),
        placeholder: String(this.data.placeholder ?? ''),
        maxlength: Number(this.data.maxlength ?? 0),
        confirmType: String(this.data.confirmType ?? 'done'),
        type: String(this.data.type ?? 'text'),
        password: Boolean(this.data.password),
        disabled: Boolean(this.data.disabled),
        adjustPosition: Boolean(this.data.adjustPosition),
        holdKeyboard: Boolean(this.data.holdKeyboard),
        keyboardAppearance: String(this.data.keyboardAppearance ?? 'default'),
        cursorSpacing: Number(this.data.cursorSpacing ?? 0),
        cursor: instance.__hostCursor,
        selectionStart: instance.__hostSelectionStart,
        selectionEnd: instance.__hostSelectionEnd,
        ...(rect
          ? {
              style: {
                ...(nativeStyle ?? {}),
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top,
                ...(Number.isFinite(fontSize) ? { fontSize } : {}),
                ...(Number.isFinite(lineHeight) ? { lineHeight } : {}),
              },
            }
          : {}),
      }
      if (frame && request.style) {
        request.style.left = frame.left
        request.style.top = frame.top
        request.style.width = frame.width
        request.style.height = frame.height
      }
      void showHostKeyboard(ctx, request).then((detail) => {
        if (requestId === instance.__keyboardRequestId) {
          instance.__keyboardShowPending = false
          instance.__nativeKeyboardVisible = false
        }
        if (requestId !== instance.__keyboardRequestId) return
        this.detachNativeViewLayer()
        const height = detail?.height ?? 0
        this.triggerEvent(
          'focus',
          { value: this.data.value, height },
          { bubbles: true, composed: true },
        )
        if (height > 0) this.focusScrollIntoView()
      })
    },

    bindKeyboardActivation(this: InputHostComponent): void {
      // The DOM input receives focus directly from the browser.
    },

    applySelection(this: InputHostComponent): void {
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

    syncKeyboardValue(this: InputHostComponent, _cursorOverride?: number): void {
      // The DOM input already owns its live selection.
    },

    nativeViewSpec(this: InputHostComponent): null {
      return null
    },

    syncNativeViewGeometry(this: InputHostComponent, _attach = false): void {
      // Native same-layer views do not exist in the DOM host.
    },

    detachNativeViewLayer(this: InputHostComponent): void {
      const instance = inputRuntime(this)
      if (instance.__nativeViewActive) {
        instance.__nativeViewActive = false
        this.setData({ nativeViewActive: false })
      }
    },

    handleInput(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { value?: unknown; cursor?: unknown; keyCode?: unknown }
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      const cursor = Number(detail.cursor ?? this.nativeInput()?.selectionEnd ?? -1)
      const keyCode = Number(detail.keyCode ?? 0)
      this.rememberSelection()
      this.setData({ value })
      this.restoreSelection()
      this.triggerEvent('input', { value, cursor, keyCode }, {
        bubbles: true,
        composed: true,
        ...this.eventTargetFields(),
      })
    },

    handleChange(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      this.rememberSelection()
      if (value !== this.data.value) this.setData({ value })
      this.restoreSelection()
      this.triggerEvent('change', { value }, { bubbles: true, composed: true })
    },

    handleFocus(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { value?: unknown }
      const value = String(detail.value ?? this.data.value ?? '')
      this.requestKeyboardShow(value)
    },

    handleBlur(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { value?: unknown }
      const value = String(detail.value ?? this.data.value ?? '')
      if (value !== this.data.value) this.setData({ value })
      const cursor = Number(this.nativeInput()?.selectionEnd ?? -1)
      this.cancelScheduledFocus()
      this.releaseKeyboard('blur')
      this.triggerEvent('blur', { value, cursor }, { bubbles: true, composed: true })
    },

    handleCompositionStart(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      this.triggerEvent('keyboardcompositionstart', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
    },

    handleCompositionUpdate(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      this.triggerEvent('keyboardcompositionupdate', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
    },

    handleCompositionEnd(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      this.triggerEvent('keyboardcompositionend', { value: valueFromEvent(event) }, { bubbles: true, composed: true })
    },

    handleSelect(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const element = (event.currentTarget as unknown as {
        getBackendElement?: () => { selectionStart?: number; selectionEnd?: number } | null
      } | null)?.getBackendElement?.()
      this.rememberSelection()
      this.triggerEvent('selectionchange', {
        selectionStart: Number(element?.selectionStart ?? -1),
        selectionEnd: Number(element?.selectionEnd ?? -1),
      }, { bubbles: true, composed: true })
    },

    handleKeyDown(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
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
  }
}
