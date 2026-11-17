import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { BuiltinContext } from '../../types'
import { valueFromEvent } from '../../events'
import { showHostKeyboard } from '../../host-keyboard'
import { nativeViewFrameOf, nativeViewStyleOf } from '../../host-native-view'
import type {
  TextareaHostComponent,
  TextareaHostElement,
  TextareaHostMethods,
} from './host'
import { textareaRuntime } from './host'

/**
 * DOM/WebView host: the real `<textarea>` owns focus, selection and caret.
 */
export function createDomTextareaHost(ctx: BuiltinContext): TextareaHostMethods {
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
      } | null)?.getElementById?.('wrapped')?.getBackendElement?.() as HTMLElement | null) ?? null
    },

    isNativeFocusable(this: TextareaHostComponent): boolean {
      const element = this.textareaElement()
      if (!element || element.isConnected === false || this.data.disabled) return false
      const style = typeof window !== 'undefined'
        ? window.getComputedStyle(element)
        : null
      if (style?.display === 'none' || style?.visibility === 'hidden') return false
      return element.offsetWidth > 0 || element.offsetHeight > 0
    },

    focusNative(this: TextareaHostComponent): boolean {
      const element = this.textareaElement()
      if (!element?.focus) return false
      try {
        element.focus({ preventScroll: true })
      } catch {
        element.focus()
      }
      this.applySelection()
      return this.isNativeFocused()
    },

    blurKeyboard(this: TextareaHostComponent): void {
      this.textareaElement()?.blur?.()
    },

    seedHostCursor(this: TextareaHostComponent): void {
      // The DOM textarea already has a live selection.
    },

    handleWrapperTap(this: TextareaHostComponent): void {
      // The DOM textarea owns its own tap target.
    },

    isNativeFocused(this: TextareaHostComponent): boolean {
      const element = this.textareaElement()
      return Boolean(element && typeof document !== 'undefined' && document.activeElement === element)
    },

    focusScrollIntoView(this: TextareaHostComponent): void {
      if (!this.data.adjustPosition) return
      this.textareaElement()?.scrollIntoView?.({ block: 'center', inline: 'nearest' })
      this.syncNativeViewGeometrySoon()
    },

    requestKeyboardShow(this: TextareaHostComponent, value: unknown): void {
      const instance = textareaRuntime(this)
      const requestId = ++instance.__keyboardRequestId
      instance.__keyboardShowPending = false
      const element = this.textareaElement()
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

    bindKeyboardActivation(this: TextareaHostComponent): void {
      // The DOM textarea receives focus directly from the browser.
    },

    applySelection(this: TextareaHostComponent): void {
      const element = this.textareaElement()
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

    syncKeyboardValue(this: TextareaHostComponent, _cursorOverride?: number): void {
      // The DOM textarea already owns its live selection.
    },

    nativeViewSpec(this: TextareaHostComponent): null {
      return null
    },

    syncNativeViewGeometry(this: TextareaHostComponent, _attach = false): void {
      // Native same-layer views do not exist in the DOM host.
    },

    syncNativeViewGeometrySoon(this: TextareaHostComponent, _duration = 120): void {
      // Native same-layer views do not exist in the DOM host.
    },

    bindNativeViewTracking(this: TextareaHostComponent): void {
      // Native same-layer views do not exist in the DOM host.
    },

    detachNativeViewLayer(this: TextareaHostComponent): void {
      const instance = textareaRuntime(this)
      if (instance.__nativeViewActive) {
        instance.__nativeViewActive = false
        this.setData({ nativeViewActive: false })
      }
    },

    handleInput(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const detail = (event.detail ?? {}) as { cursor?: unknown; keyCode?: unknown }
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      const native = this.textareaElement()
      const cursor = Number(detail.cursor ?? native?.selectionEnd ?? -1)
      const keyCode = Number(detail.keyCode ?? 0)
      this.setData({ value })
      const text = String(value)
      const lineCount = text.split('\n').length
      const element = this.textareaElement()
      const lineHeight = 1.2 * 16
      const height = Math.max(Number(element?.scrollHeight ?? 0), lineHeight)
      const scale = typeof window !== 'undefined' && window.innerWidth > 0
        ? 750 / window.innerWidth
        : 1
      this.triggerEvent('input', { value, cursor, keyCode }, {
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

    handleFocus(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      this.requestKeyboardShow(valueFromEvent(event) ?? this.data.value)
    },

    handleBlur(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void {
      const value = String(valueFromEvent(event) ?? this.data.value ?? '')
      this.setData({ value })
      const cursor = Number((event.detail as { cursor?: unknown } | undefined)?.cursor ?? -1)
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
