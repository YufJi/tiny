import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { BuiltinContext } from '../../types'
import { valueFromEvent } from '../../events'
import {
  showHostKeyboard,
  subscribeKeyboardActivation,
} from '../../host-keyboard'
import {
  attachNativeView,
  detachNativeView,
  nativeViewContentFrameOf,
  nativeViewMarkerClass,
  nativeViewStyleOf,
  updateNativeView,
  type NativeViewSpec,
} from '../../host-native-view'
import type { InputHostComponent, InputHostElement, InputHostMethods } from './host'
import { inputRuntime } from './host'

/**
 * iOS/WeChat-native host: the native first responder owns the keyboard and
 * caret. The WebView only keeps an invisible accessibility input and reports
 * the input frame to the native same-layer view.
 */
export function createNativeInputHost(ctx: BuiltinContext): InputHostMethods {
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
      } | null)?.getElementById?.('container')?.getBackendElement?.() as HTMLElement | null) ?? null
    },

    nativeViewSpec(this: InputHostComponent): NativeViewSpec | null {
      const instance = inputRuntime(this)
      const element = this.activationElement()
      const frame = nativeViewContentFrameOf(element)
      if (!frame) return null
      return {
        id: instance.__keyboardOwnerId,
        kind: 'input',
        markerClass: nativeViewMarkerClass(instance.__keyboardOwnerId),
        frame,
        style: nativeViewStyleOf(element ?? this.nativeInput()),
        props: {
          value: String(this.data.value ?? ''),
          placeholder: String(this.data.placeholder ?? ''),
          maxlength: Number(this.data.maxlength ?? 0),
          confirmType: String(this.data.confirmType ?? 'done'),
          password: Boolean(this.data.password),
          type: String(this.data.type ?? 'text'),
          cursor: instance.__hostCursor,
          selectionStart: instance.__hostSelectionStart,
          selectionEnd: instance.__hostSelectionEnd,
        },
      }
    },

    syncNativeValue(this: InputHostComponent, _next: unknown): void {
      // The native text field is the value owner while the keyboard is shown.
    },

    rememberSelection(this: InputHostComponent): void {
      // Selection is owned by NativeKeyboardHost.
    },

    restoreSelection(this: InputHostComponent): void {
      // Selection is owned by NativeKeyboardHost.
    },

    isNativeFocusable(this: InputHostComponent): boolean {
      const element = this.activationElement()
      if (!element || element.isConnected === false || this.data.disabled) return false
      const style = typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      if (style?.display === 'none' || style?.visibility === 'hidden') return false
      return element.offsetWidth > 0 || element.offsetHeight > 0
    },

    focusNative(this: InputHostComponent): boolean {
      if (this.data.disabled) return false
      const instance = inputRuntime(this)
      if (!instance.__keyboardShowPending) {
        this.seedHostCursor()
        this.requestKeyboardShow(this.data.value)
      }
      return true
    },

    blurNative(this: InputHostComponent): void {
      const instance = inputRuntime(this)
      if (instance.__nativeKeyboardVisible || instance.__keyboardShowPending) {
        this.releaseKeyboard('blur')
      }
    },

    handleWrapperTap(this: InputHostComponent): void {
      if (this.data.disabled) return
      this.focusNative()
    },

    seedHostCursor(this: InputHostComponent): void {
      const instance = inputRuntime(this)
      const value = String(this.data.value ?? '')
      const cursor = Number(this.data.cursor ?? -1)
      let selectionStart = Number(this.data.selectionStart ?? -1)
      let selectionEnd = Number(this.data.selectionEnd ?? -1)
      if (cursor >= 0) {
        selectionStart = cursor
        selectionEnd = cursor
      }
      if (selectionStart < 0) {
        selectionStart = value.length
        selectionEnd = value.length
      }
      instance.__hostCursor = selectionStart
      instance.__hostSelectionStart = selectionStart
      instance.__hostSelectionEnd = selectionEnd < 0 ? selectionStart : selectionEnd
    },

    isNativeFocused(this: InputHostComponent): boolean {
      return inputRuntime(this).__nativeKeyboardVisible
    },

    focusScrollIntoView(this: InputHostComponent): void {
      if (!this.data.adjustPosition) return
      this.activationElement()?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
    },

    requestKeyboardShow(this: InputHostComponent, value: unknown): void {
      const instance = inputRuntime(this)
      const requestId = ++instance.__keyboardRequestId
      instance.__keyboardShowPending = true
      const element = this.nativeInput()
      const rect = element?.getBoundingClientRect?.()
      const computed = element && typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      const nativeStyle = nativeViewStyleOf(this.activationElement())
      const fontSize = computed ? Number.parseFloat(computed.fontSize) : Number.NaN
      const lineHeight = computed ? Number.parseFloat(computed.lineHeight) : Number.NaN
      const frame = nativeViewContentFrameOf(this.activationElement())
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
          instance.__nativeKeyboardVisible = Boolean(detail && detail.status !== 'error')
        }
        if (requestId !== instance.__keyboardRequestId) return
        if (instance.__nativeKeyboardVisible) {
          this.syncNativeViewGeometry(true)
        } else {
          this.detachNativeViewLayer()
        }
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
      const instance = inputRuntime(this)
      if (instance.__unsubscribeActivation) return
      const element = this.activationElement()
      if (!element) return
      instance.__unsubscribeActivation = subscribeKeyboardActivation(
        element,
        () => Boolean(this.data.nativeKeyboard && !this.data.disabled),
        () => this.focusNative(),
      )
    },

    applySelection(this: InputHostComponent): void {
      const instance = inputRuntime(this)
      const value = String(this.data.value ?? '')
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
      instance.__hostCursor = clamp(start)
      instance.__hostSelectionStart = clamp(start)
      instance.__hostSelectionEnd = clamp(end < 0 ? start : end)
    },

    syncKeyboardValue(this: InputHostComponent, cursorOverride?: number): void {
      const instance = inputRuntime(this)
      if (!instance.__nativeKeyboardVisible || instance.__applyingHostKeyboardValue) return
      const cursor = cursorOverride
        ?? (instance.__hostCursor >= 0 ? instance.__hostCursor : Number(this.data.cursor ?? -1))
      const selectionStart = cursorOverride
        ?? (instance.__hostSelectionStart >= 0 ? instance.__hostSelectionStart : Number(this.data.selectionStart ?? -1))
      const selectionEnd = cursorOverride
        ?? (instance.__hostSelectionEnd >= 0 ? instance.__hostSelectionEnd : Number(this.data.selectionEnd ?? -1))
      void ctx.options.hostRequest?.('updateKeyboard', {
        ownerId: instance.__keyboardOwnerId,
        value: String(this.data.value ?? ''),
        cursor,
        selectionStart,
        selectionEnd,
      }).catch(() => undefined)
    },

    syncNativeViewGeometry(this: InputHostComponent, attach = false): void {
      const instance = inputRuntime(this)
      if (!instance.__nativeKeyboardVisible) return
      const spec = this.nativeViewSpec()
      if (!spec) {
        this.detachNativeViewLayer()
        return
      }
      if (attach) void attachNativeView(ctx, spec)
      else void updateNativeView(ctx, spec)
      instance.__nativeViewActive = true
      this.setData({ nativeViewActive: true })
    },

    detachNativeViewLayer(this: InputHostComponent): void {
      const instance = inputRuntime(this)
      void detachNativeView(ctx, instance.__keyboardOwnerId)
      if (instance.__nativeViewActive) {
        instance.__nativeViewActive = false
        this.setData({ nativeViewActive: false })
      }
    },

    handleInput(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      this.applyHostKeyboardValue(value)
      this.triggerEvent('input', { value, cursor: inputRuntime(this).__hostCursor, keyCode: 0 }, {
        bubbles: true,
        composed: true,
        ...this.eventTargetFields(),
      })
    },

    handleChange(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      if (value !== this.data.value) this.applyHostKeyboardValue(value)
      this.triggerEvent('change', { value }, { bubbles: true, composed: true })
    },

    handleFocus(this: InputHostComponent, _event: glassEasel.ShadowedEvent<unknown>): void {
      this.focusNative()
    },

    handleBlur(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { value?: unknown; cursor?: unknown }
      const value = String(detail.value ?? this.data.value ?? '')
      if (value !== this.data.value) this.applyHostKeyboardValue(value)
      const cursor = Number(detail.cursor ?? inputRuntime(this).__hostCursor)
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

    handleSelect(this: InputHostComponent, _event: glassEasel.ShadowedEvent<unknown>): void {
      const instance = inputRuntime(this)
      this.triggerEvent('selectionchange', {
        selectionStart: instance.__hostSelectionStart,
        selectionEnd: instance.__hostSelectionEnd,
      }, { bubbles: true, composed: true })
    },

    handleKeyDown(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { key?: string; keyCode?: number; which?: number; value?: unknown }
      const key = String(detail.key ?? '')
      const keyCode = Number(detail.keyCode ?? detail.which ?? 0)
      const value = detail.value ?? this.data.value
      this.triggerEvent('keydown', { key, keyCode, value }, { bubbles: true, composed: true })
      if (key === 'Enter' || keyCode === 13) {
        this.triggerEvent('confirm', { value }, { bubbles: true, composed: true })
        if (!this.data.confirmHold) this.releaseKeyboard('confirm')
      }
    },
  }
}
