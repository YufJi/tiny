import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { NativeViewSpec } from '../../host-native-view'
import type { HostFrame } from '../../host-page'

export type InputHostRuntime = {
  __keyboardOwnerId: string
  __keyboardHeight: number
  __keyboardRequestId: number
  __unsubscribeKeyboard?: () => void
  __unsubscribePage?: () => void
  __pageActive: boolean
  __autoFocused: boolean
  __focusScheduled: boolean
  __focusFrame?: HostFrame
  __nativeKeyboard: boolean
  __nativeKeyboardVisible: boolean
  __keyboardShowPending: boolean
  __applyingHostKeyboardValue: boolean
  __hostCursor: number
  __hostSelectionStart: number
  __hostSelectionEnd: number
  __nativeViewActive: boolean
  __nativeViewTracking?: () => void
  __nativeViewFrame?: HostFrame
  __unsubscribeOutsideTouch?: () => void
  __unsubscribeActivation?: () => void
  __unregisterReturnTarget?: () => void
  _selection?: { start: number; end: number }
}

export type InputHostElement = HTMLElement & {
  value?: string
  selectionStart?: number
  selectionEnd?: number
  focus?: (options?: FocusOptions) => void
  blur?: () => void
  setSelectionRange?: (start: number, end: number) => void
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void
}

/**
 * The component object is shared by the canonical mini-program definition and
 * one host adapter. The adapter sees the same glass-easel `this`; only the
 * platform methods and element accessors differ.
 */
export type InputHostComponent = glassEasel.GeneralComponent & {
  data: Record<string, any>
  [key: string]: any
}

export type InputHostMethods = {
  nativeInput(this: InputHostComponent): InputHostElement | null
  activationElement(this: InputHostComponent): HTMLElement | null
  syncNativeValue(this: InputHostComponent, next: unknown): void
  rememberSelection(this: InputHostComponent): void
  restoreSelection(this: InputHostComponent): void
  isNativeFocusable(this: InputHostComponent): boolean
  focusNative(this: InputHostComponent): boolean
  blurNative(this: InputHostComponent): void
  seedHostCursor(this: InputHostComponent): void
  handleWrapperTap(this: InputHostComponent): void
  isNativeFocused(this: InputHostComponent): boolean
  focusScrollIntoView(this: InputHostComponent): void
  requestKeyboardShow(this: InputHostComponent, value: unknown): void
  bindKeyboardActivation(this: InputHostComponent): void
  applySelection(this: InputHostComponent): void
  syncKeyboardValue(this: InputHostComponent, cursorOverride?: number): void
  nativeViewSpec(this: InputHostComponent): NativeViewSpec | null
  syncNativeViewGeometry(this: InputHostComponent, attach?: boolean): void
  syncNativeViewGeometrySoon(this: InputHostComponent, duration?: number): void
  bindNativeViewTracking(this: InputHostComponent): void
  detachNativeViewLayer(this: InputHostComponent): void
  handleInput(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleChange(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleFocus(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleBlur(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleCompositionStart(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleCompositionUpdate(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleCompositionEnd(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleSelect(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleKeyDown(this: InputHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
}

export function inputRuntime(component: InputHostComponent): InputHostRuntime {
  return component as unknown as InputHostRuntime
}
