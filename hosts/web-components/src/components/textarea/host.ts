import type * as glassEasel from '@tiny/runtime/glass-easel'
import type { NativeViewSpec } from '../../host-native-view'
import type { HostFrame } from '../../host-page'

export type TextareaHostRuntime = {
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
}

export type TextareaHostElement = HTMLElement & {
  value?: string
  selectionStart?: number
  selectionEnd?: number
  scrollHeight?: number
  style?: CSSStyleDeclaration
  focus?: (options?: FocusOptions) => void
  blur?: () => void
  setSelectionRange?: (start: number, end: number) => void
  scrollIntoView?: (options?: ScrollIntoViewOptions) => void
}

export type TextareaHostComponent = glassEasel.GeneralComponent & {
  data: Record<string, any>
  [key: string]: any
}

export type TextareaHostMethods = {
  textareaElement(this: TextareaHostComponent): TextareaHostElement | null
  activationElement(this: TextareaHostComponent): HTMLElement | null
  isNativeFocusable(this: TextareaHostComponent): boolean
  focusNative(this: TextareaHostComponent): boolean
  blurKeyboard(this: TextareaHostComponent): void
  seedHostCursor(this: TextareaHostComponent): void
  handleWrapperTap(this: TextareaHostComponent): void
  isNativeFocused(this: TextareaHostComponent): boolean
  focusScrollIntoView(this: TextareaHostComponent): void
  requestKeyboardShow(this: TextareaHostComponent, value: unknown): void
  bindKeyboardActivation(this: TextareaHostComponent): void
  applySelection(this: TextareaHostComponent): void
  syncKeyboardValue(this: TextareaHostComponent, cursorOverride?: number): void
  nativeViewSpec(this: TextareaHostComponent): NativeViewSpec | null
  syncNativeViewGeometry(this: TextareaHostComponent, attach?: boolean): void
  syncNativeViewGeometrySoon(this: TextareaHostComponent, duration?: number): void
  bindNativeViewTracking(this: TextareaHostComponent): void
  detachNativeViewLayer(this: TextareaHostComponent): void
  handleInput(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleFocus(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleBlur(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
  handleConfirm(this: TextareaHostComponent, event: glassEasel.ShadowedEvent<unknown>): void
}

export function textareaRuntime(component: TextareaHostComponent): TextareaHostRuntime {
  return component as unknown as TextareaHostRuntime
}
