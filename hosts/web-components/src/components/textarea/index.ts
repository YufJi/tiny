import type { BuiltinContext, BuiltinDefinition } from '../../types'
import {
  EVENT_RETURN_TOKEN_FIELD,
  createKeyboardOwnerId,
  currentHostKeyboardMode,
  registerKeyboardListenerTarget,
  hideHostKeyboard,
  subscribeKeyboard,
  subscribeHostKeyboardMode,
  subscribeKeyboardBlur,
  subscribeKeyboardConfirm,
  subscribeKeyboardOutsideTouch,
  subscribeKeyboardSelection,
  subscribeKeyboardValue,
  type HostKeyboardSelectionEvent,
  type HostKeyboardValueEvent,
  type HostKeyboardEvent,
} from '../../host-keyboard'
import {
  cancelHostFrame,
  isHostPageActive,
  requestHostFrame,
  subscribeHostPageVisibility,
} from '../../host-page'
import { nativeViewMarkerClass } from '../../host-native-view'
import { builtinDefinitionName } from '../../tags'
import type { TextareaHostComponent, TextareaHostRuntime } from './host'
import { textareaRuntime } from './host'
import { createDomTextareaHost } from './dom-host'
import { createNativeTextareaHost } from './native-host'

export function defineTextarea(ctx: BuiltinContext): BuiltinDefinition {
  const nativeTextInput = ctx.options.textInputHost === 'native'
    || (ctx.options.textInputHost !== 'dom' && currentHostKeyboardMode(ctx)?.native === true)
  const host = nativeTextInput ? createNativeTextareaHost(ctx) : createDomTextareaHost(ctx)
  return ctx.space.defineComponent({
    is: builtinDefinitionName('textarea'),
    template: ctx.template('textarea', nativeTextInput ? 'native' : undefined),
    data: {
      nativeKeyboard: false,
      nativeViewActive: false,
      nativeViewClass: '',
    },
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.native,
      ctx.behaviors.positioningTarget,
      ctx.behaviors.reload,
      ctx.behaviors.sizeNormalizer,
      ctx.behaviors.dataComponent,
      ctx.behaviors.classPrefix,
      ctx.behaviors.autofill,
      ctx.behaviors.keyboardAccessoryHost,
    ],
    properties: {
      value: { type: String, value: '' },
      placeholder: { type: String, value: '' },
      placeholderStyle: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      maxlength: { type: Number, value: 140, observer: 'maxlengthChanged' },
      adjustKeyboardTo: { type: String, value: 'cursor' },
      autoFocus: { type: Boolean, value: false },
      focus: { type: Boolean, value: false },
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
      keyboardAppearance: { type: String, value: 'default' },
    },
    observers: {
      value() {
        this.scheduleAutoHeight()
        this.syncKeyboardValue()
        this.syncNativeViewGeometry()
      },
      autoHeight() {
        this.scheduleAutoHeight()
      },
      focus(value: boolean) {
        if (value) {
          this.scheduleInputFocus()
        } else {
          this.cancelScheduledFocus()
          this.blurKeyboard()
        }
      },
      autoFocus(value: boolean) {
        if (value) this.scheduleInputFocus()
        else this.cancelScheduledFocus()
      },
      'cursor, selectionStart, selectionEnd'() {
        this.applySelection()
        this.syncKeyboardValue()
      },
    },
    lifetimes: {
      attached() {
        const instance = this as unknown as TextareaHostRuntime
        instance.__keyboardOwnerId = createKeyboardOwnerId('textarea')
        instance.__unregisterReturnTarget = registerKeyboardListenerTarget(
          instance.__keyboardOwnerId,
          this,
        )
        instance.__keyboardHeight = 0
        instance.__keyboardRequestId = 0
        instance.__pageActive = isHostPageActive(ctx)
        instance.__autoFocused = false
        instance.__focusScheduled = false
        instance.__nativeKeyboard = currentHostKeyboardMode(ctx)?.native ?? false
        instance.__nativeKeyboardVisible = false
        instance.__keyboardShowPending = false
        instance.__applyingHostKeyboardValue = false
        instance.__hostCursor = -1
        instance.__hostSelectionStart = -1
        instance.__hostSelectionEnd = -1
        instance.__nativeViewActive = false
        this.setData({
          nativeKeyboard: instance.__nativeKeyboard,
          nativeViewClass: nativeViewMarkerClass(instance.__keyboardOwnerId),
        })
        const unsubscribers = [
          subscribeKeyboard(ctx, (event) => {
            this.handleHostKeyboard(event)
          }),
          subscribeHostKeyboardMode(ctx, (mode) => {
            instance.__nativeKeyboard = mode.native
            this.setData({ nativeKeyboard: mode.native })
            if (!mode.native && instance.__nativeKeyboardVisible) this.blurKeyboard()
          }),
          subscribeKeyboardValue(ctx, (event) => {
            this.handleHostKeyboardValue(event)
          }),
          subscribeKeyboardSelection(ctx, (event) => {
            this.handleHostKeyboardSelection(event)
          }),
          subscribeKeyboardConfirm(ctx, (event) => {
            this.handleHostKeyboardConfirm(event)
          }),
          subscribeKeyboardBlur(ctx, (event) => {
            this.handleHostKeyboardBlur(event)
          }),
        ].filter((unsubscribe): unsubscribe is () => void => typeof unsubscribe === 'function')
        instance.__unsubscribeKeyboard = () => {
          for (const unsubscribe of unsubscribers) unsubscribe()
        }
        instance.__unsubscribePage = subscribeHostPageVisibility(ctx, (visibility) => {
          instance.__pageActive = visibility.active
          if (visibility.active) {
            this.scheduleInputFocus()
          } else {
            this.cancelScheduledFocus()
            if (instance.__nativeKeyboardVisible) this.blurKeyboard()
          }
        })
        instance.__unsubscribeOutsideTouch = subscribeKeyboardOutsideTouch(
          () => Boolean(this.data.nativeKeyboard && instance.__nativeKeyboardVisible),
          () => Boolean(this.data.holdKeyboard),
          () => this.blurKeyboard(),
        )
        this.bindKeyboardActivation()
        this.scheduleAutoHeight()
        this.scheduleInputFocus()
      },
      ready() {
        this.bindKeyboardActivation()
      },
      detached() {
        const instance = this as unknown as TextareaHostRuntime
        instance.__unsubscribeKeyboard?.()
        instance.__unsubscribeKeyboard = undefined
        instance.__unsubscribePage?.()
        instance.__unsubscribePage = undefined
        instance.__unsubscribeOutsideTouch?.()
        instance.__unsubscribeOutsideTouch = undefined
        instance.__unsubscribeActivation?.()
        instance.__unsubscribeActivation = undefined
        this.detachNativeViewLayer()
        instance.__unregisterReturnTarget?.()
        instance.__unregisterReturnTarget = undefined
        this.cancelScheduledFocus()
        if (
          instance.__keyboardHeight > 0
          || instance.__nativeKeyboardVisible
          || instance.__keyboardShowPending
        ) {
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
      shouldFocus(this: TextareaHostComponent): boolean {
        const instance = textareaRuntime(this)
        return Boolean(this.data.focus || (this.data.autoFocus && !instance.__autoFocused))
      },
      cancelScheduledFocus(this: TextareaHostComponent) {
        const instance = textareaRuntime(this)
        cancelHostFrame(instance.__focusFrame)
        instance.__focusFrame = undefined
        instance.__focusScheduled = false
      },
      scheduleInputFocus(this: TextareaHostComponent) {
        const instance = textareaRuntime(this)
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
      releaseKeyboard(this: TextareaHostComponent, reason: string) {
        const instance = textareaRuntime(this)
        instance.__keyboardRequestId += 1
        instance.__keyboardShowPending = false
        instance.__nativeKeyboardVisible = false
        this.detachNativeViewLayer()
        hideHostKeyboard(ctx, {
          ownerId: instance.__keyboardOwnerId,
          source: 'textarea',
          reason,
          value: String(this.data.value ?? ''),
        })
      },
      handleHostKeyboard(this: TextareaHostComponent, event: HostKeyboardEvent) {
        const instance = textareaRuntime(this)
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        if (event.height === 0) {
          instance.__nativeKeyboardVisible = false
          instance.__keyboardShowPending = false
        }
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
      handleHostKeyboardValue(this: TextareaHostComponent, event: HostKeyboardValueEvent) {
        const instance = textareaRuntime(this)
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        instance.__nativeKeyboardVisible = true
        instance.__hostCursor = event.cursor
        instance.__hostSelectionStart = event.cursor
        instance.__hostSelectionEnd = event.cursor
        if (!instance.__nativeViewActive) {
          instance.__nativeViewActive = true
          this.setData({ nativeViewActive: true })
        }
        this.applyHostKeyboardValue(event.value)
        this.triggerEvent(
          'input',
          { value: event.value, cursor: event.cursor, keyCode: 0 },
          {
            bubbles: true,
            composed: true,
            ...this.eventTargetFields(),
          },
        )
        this.scheduleAutoHeight()
      },
      applyKeyboardListenerReturn(this: TextareaHostComponent, result: unknown) {
        const instance = textareaRuntime(this)
        let value: string | undefined
        let cursor = -1
        if (typeof result === 'string' || typeof result === 'number') {
          value = String(result)
          cursor = value.length
        } else if (result && typeof result === 'object') {
          const detail = result as { value?: unknown; cursor?: unknown }
          if (detail.value === undefined) return
          value = String(detail.value)
          const requestedCursor = Number(detail.cursor)
          if (Number.isInteger(requestedCursor) && requestedCursor >= 0) {
            cursor = requestedCursor
          }
        }
        if (value === undefined) return
        this.applyHostKeyboardValue(value)
        if (cursor >= 0) {
          instance.__hostCursor = cursor
          instance.__hostSelectionStart = cursor
          instance.__hostSelectionEnd = cursor
        }
        const element = this.textareaElement()
        if (cursor >= 0) element?.setSelectionRange?.(cursor, cursor)
        this.syncKeyboardValue(cursor >= 0 ? cursor : undefined)
        this.scheduleAutoHeight()
      },
      handleHostKeyboardSelection(this: TextareaHostComponent, event: HostKeyboardSelectionEvent) {
        const instance = textareaRuntime(this)
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        instance.__hostCursor = event.selectionEnd >= 0 ? event.selectionEnd : event.selectionStart
        instance.__hostSelectionStart = event.selectionStart
        instance.__hostSelectionEnd = event.selectionEnd
        this.triggerEvent(
          'selectionchange',
          {
            selectionStart: event.selectionStart,
            selectionEnd: event.selectionEnd,
          },
          { bubbles: true, composed: true },
        )
      },
      handleHostKeyboardConfirm(this: TextareaHostComponent, event: HostKeyboardValueEvent) {
        const instance = textareaRuntime(this)
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        instance.__nativeKeyboardVisible = true
        instance.__hostCursor = event.cursor
        instance.__hostSelectionStart = event.cursor
        instance.__hostSelectionEnd = event.cursor
        if (event.value !== this.data.value) this.applyHostKeyboardValue(event.value)
        this.triggerEvent(
          'confirm',
          { value: event.value },
          { bubbles: true, composed: true },
        )
        if (!this.data.confirmHold) this.releaseKeyboard('confirm')
      },
      handleHostKeyboardBlur(this: TextareaHostComponent, event: HostKeyboardValueEvent) {
        const instance = textareaRuntime(this)
        if (event.ownerId && event.ownerId !== instance.__keyboardOwnerId) return
        instance.__nativeKeyboardVisible = false
        instance.__keyboardShowPending = false
        instance.__hostCursor = event.cursor
        instance.__hostSelectionStart = event.cursor
        instance.__hostSelectionEnd = event.cursor
        this.detachNativeViewLayer()
        if (event.value !== this.data.value) this.applyHostKeyboardValue(event.value)
        this.cancelScheduledFocus()
        this.triggerEvent(
          'change',
          { value: event.value },
          { bubbles: true, composed: true },
        )
        this.triggerEvent(
          'blur',
          { value: event.value, cursor: event.cursor },
          { bubbles: true, composed: true },
        )
      },
      applyHostKeyboardValue(this: TextareaHostComponent, value: string) {
        const instance = textareaRuntime(this)
        instance.__applyingHostKeyboardValue = true
        try {
          this.setData({ value })
        } finally {
          instance.__applyingHostKeyboardValue = false
        }
      },
      scheduleAutoHeight(this: TextareaHostComponent) {
        if (!this.data.autoHeight) return
        requestHostFrame(() => {
          requestHostFrame(() => this.syncAutoHeight())
        })
      },
      syncAutoHeight(this: TextareaHostComponent) {
        const element = this.textareaElement()
        if (!element?.style) return
        element.style.height = 'auto'
        const height = Number(element.scrollHeight ?? 0)
        if (height > 0) element.style.height = `${height}px`
        this.syncNativeViewGeometry()
      },
      maxlengthChanged(this: TextareaHostComponent, next: unknown): void {
        const max = Number(next)
        if (!(max > 0)) return
        const value = String(this.data.value ?? '')
        if (value.length > max) this.setData({ value: value.slice(0, max) })
      },
      getFormData(this: TextareaHostComponent, callback?: (value: unknown) => void): unknown {
        if (typeof callback === 'function') {
          callback(this.data.value)
          return undefined
        }
        return this.data.value
      },
      resetFormData(this: TextareaHostComponent): void {
        this.setData({ value: '' })
      },
      autofillGetValue(this: TextareaHostComponent): unknown {
        return this.data.value
      },
      autofillSetValue(this: TextareaHostComponent, value: unknown): void {
        const next = String(value ?? '')
        this.setData({ value: next })
        this.triggerEvent('change', { value: next })
      },
      eventTargetFields(this: TextareaHostComponent): Record<string, unknown> {
        const instance = textareaRuntime(this)
        return {
          extraFields: {
            [EVENT_RETURN_TOKEN_FIELD]: instance.__keyboardOwnerId,
          },
        }
      },
      ...host,
    },
  }).general()
}
