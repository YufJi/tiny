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
import type {
  TextareaHostComponent,
  TextareaHostElement,
  TextareaHostMethods,
} from './host'
import { textareaRuntime } from './host'

/**
 * iOS/WeChat-native host: a native text view owns the keyboard, selection and
 * caret; the template exposes the WebKit scroll placeholder owned by the host.
 */
export function createNativeTextareaHost(ctx: BuiltinContext): TextareaHostMethods {
  return {
    textareaElement(this: TextareaHostComponent): TextareaHostElement | null {
      return ((this.getShadowRoot?.() as {
        getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
      } | null)?.getElementById?.('native-textarea')?.getBackendElement?.() as TextareaHostElement | null) ?? null
    },

    activationElement(this: TextareaHostComponent): HTMLElement | null {
      const host = (this as unknown as { getBackendElement?: () => HTMLElement | null })
        .getBackendElement?.()
      if (host) return host
      return ((this.getShadowRoot?.() as {
        getElementById?: (id: string) => { getBackendElement?: () => unknown } | null
      } | null)?.getElementById?.('container')?.getBackendElement?.() as HTMLElement | null) ?? null
    },

    nativeViewSpec(this: TextareaHostComponent): NativeViewSpec | null {
      const instance = textareaRuntime(this)
      const element = this.activationElement()
      const styleElement = element ?? this.textareaElement()
      const frame = nativeViewContentFrameOf(element)
      if (!frame) return null
      return {
        id: instance.__keyboardOwnerId,
        kind: 'textarea',
        markerClass: nativeViewMarkerClass(instance.__keyboardOwnerId),
        frame,
        style: nativeViewStyleOf(styleElement),
        props: {
          value: String(this.data.value ?? ''),
          placeholder: String(this.data.placeholder ?? ''),
          maxlength: Number(this.data.maxlength ?? 0),
          confirmType: String(this.data.confirmType ?? 'return'),
          showConfirmBar: Boolean(this.data.showConfirmBar),
          autoHeight: Boolean(this.data.autoHeight),
          cursor: instance.__hostCursor,
          selectionStart: instance.__hostSelectionStart,
          selectionEnd: instance.__hostSelectionEnd,
        },
      }
    },

    isNativeFocusable(this: TextareaHostComponent): boolean {
      const element = this.activationElement()
      if (!element || element.isConnected === false || this.data.disabled) return false
      const style = typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      if (style?.display === 'none' || style?.visibility === 'hidden') return false
      return element.offsetWidth > 0 || element.offsetHeight > 0
    },

    focusNative(this: TextareaHostComponent): boolean {
      if (this.data.disabled) return false
      const instance = textareaRuntime(this)
      if (!instance.__keyboardShowPending) {
        this.seedHostCursor()
        this.requestKeyboardShow(this.data.value)
      }
      return true
    },

    blurKeyboard(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
      if (instance.__nativeKeyboardVisible || instance.__keyboardShowPending) {
        this.releaseKeyboard('blur')
      }
    },

    seedHostCursor(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
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

    handleWrapperTap(this: TextareaHostComponent): void {
      if (this.data.disabled) return
      this.focusNative()
    },

    isNativeFocused(this: TextareaHostComponent): boolean {
      return textareaRuntime(this).__nativeKeyboardVisible
    },

    focusScrollIntoView(this: TextareaHostComponent): void {
      if (!this.data.adjustPosition) return
      this.activationElement()?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
    },

    requestKeyboardShow(this: TextareaHostComponent, value: unknown): void {
      const instance = textareaRuntime(this)
      const requestId = ++instance.__keyboardRequestId
      instance.__keyboardShowPending = true
      const element = this.textareaElement()
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
        source: 'textarea' as const,
        value: String(value ?? this.data.value ?? ''),
        placeholder: String(this.data.placeholder ?? ''),
        maxlength: Number(this.data.maxlength ?? 0),
        confirmType: String(this.data.confirmType ?? 'return'),
        disabled: Boolean(this.data.disabled),
        adjustPosition: Boolean(this.data.adjustPosition),
        holdKeyboard: Boolean(this.data.holdKeyboard),
        cursorSpacing: Number(this.data.cursorSpacing ?? 0),
        showConfirmBar: Boolean(this.data.showConfirmBar),
        adjustKeyboardTo: String(this.data.adjustKeyboardTo ?? 'cursor'),
        keyboardAppearance: String(this.data.keyboardAppearance ?? 'default'),
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

    bindKeyboardActivation(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
      if (instance.__unsubscribeActivation) return
      const element = this.activationElement()
      if (!element) return
      instance.__unsubscribeActivation = subscribeKeyboardActivation(
        element,
        () => Boolean(this.data.nativeKeyboard && !this.data.disabled),
        () => this.focusNative(),
      )
    },

    applySelection(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
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

    syncKeyboardValue(this: TextareaHostComponent, cursorOverride?: number): void {
      const instance = textareaRuntime(this)
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

    syncNativeViewGeometry(this: TextareaHostComponent, attach = false): void {
      const instance = textareaRuntime(this)
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

    detachNativeViewLayer(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
      void detachNativeView(ctx, instance.__keyboardOwnerId)
      if (instance.__nativeViewActive) {
        instance.__nativeViewActive = false
        this.setData({ nativeViewActive: false })
      }
    },

    handleInput(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      this.applyHostKeyboardValue(value)
      const element = this.textareaElement()
      const lineCount = value.split('\n').length
      const lineHeight = 1.2 * 16
      const height = Math.max(Number(element?.scrollHeight ?? 0), lineHeight)
      const scale = typeof window !== 'undefined' && window.innerWidth > 0
        ? 750 / window.innerWidth
        : 1
      this.triggerEvent('input', { value, cursor: textareaRuntime(this).__hostCursor, keyCode: 0 }, {
        bubbles: true,
        composed: true,
        ...this.eventTargetFields(),
      })
      this.triggerEvent(
        'linechange',
        { height, heightRpx: Math.round(scale * height), lineHeight, lineCount },
        { bubbles: true, composed: true },
      )
      this.scheduleAutoHeight()
    },

    handleFocus(this: TextareaHostComponent, _event: glassEasel.ShadowedEvent<unknown>): void {
      this.focusNative()
    },

    handleBlur(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { value?: unknown; cursor?: unknown }
      const value = String(detail.value ?? this.data.value ?? '')
      if (value !== this.data.value) this.applyHostKeyboardValue(value)
      const cursor = Number(detail.cursor ?? textareaRuntime(this).__hostCursor)
      this.cancelScheduledFocus()
      this.releaseKeyboard('blur')
      this.triggerEvent('blur', { value, cursor }, { bubbles: true, composed: true })
    },

    handleConfirm(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      this.triggerEvent(
        'confirm',
        { value: valueFromEvent(event) ?? this.data.value },
        { bubbles: true, composed: true },
      )
    },
  }
}
