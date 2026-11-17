import type { BuiltinContext } from './types'

export type NativeViewFrame = {
  left: number
  top: number
  width: number
  height: number
}

export type NativeViewStyle = {
  fontSize?: number
  lineHeight?: number
  color?: string
  fontFamily?: string
  fontWeight?: string
  textAlign?: string
}

export type NativeViewSpec = {
  id: string
  kind: 'input' | 'textarea'
  markerClass: string
  frame: NativeViewFrame
  style?: NativeViewStyle
  props?: Record<string, unknown>
}

function rectOf(element: Element): NativeViewFrame {
  const rect = element.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
}

export function nativeViewFrameOf(element: Element | null): NativeViewFrame | null {
  if (!element || typeof element.getBoundingClientRect !== 'function' || typeof window === 'undefined') {
    return null
  }
  const frame = rectOf(element)
  if (!(frame.width > 0) || !(frame.height > 0)) return null
  return frame
}

/**
 * Native text fields are positioned in the host's content box. This mirrors
 * WeChat's wx-input/wx-textarea geometry and keeps CSS padding/border out of
 * the native control.
 */
export function nativeViewContentFrameOf(element: Element | null): NativeViewFrame | null {
  const frame = nativeViewFrameOf(element)
  if (!frame || typeof window === 'undefined') return null
  const style = window.getComputedStyle(element!)
  const left = numberValue(style.borderLeftWidth, 0) + numberValue(style.paddingLeft, 0)
  const right = numberValue(style.borderRightWidth, 0) + numberValue(style.paddingRight, 0)
  const top = numberValue(style.borderTopWidth, 0) + numberValue(style.paddingTop, 0)
  const bottom = numberValue(style.borderBottomWidth, 0) + numberValue(style.paddingBottom, 0)
  const width = Math.max(0, frame.width - left - right)
  const height = Math.max(0, frame.height - top - bottom)
  if (!(width > 0) || !(height > 0)) return null
  return {
    left: frame.left + left,
    top: frame.top + top,
    width,
    height,
  }
}

export function nativeViewStyleOf(element: Element | null): NativeViewStyle | undefined {
  if (!element || typeof element.getBoundingClientRect !== 'function' || typeof window === 'undefined') {
    return undefined
  }
  const style = window.getComputedStyle(element)
  const fontSize = numberValue(style.fontSize, 16)
  return {
    fontSize,
    lineHeight: numberValue(style.lineHeight, fontSize * 1.2),
    ...(style.color ? { color: style.color } : {}),
    ...(style.fontFamily ? { fontFamily: style.fontFamily } : {}),
    ...(style.fontWeight ? { fontWeight: style.fontWeight } : {}),
    ...(style.textAlign ? { textAlign: style.textAlign } : {}),
  }
}

export function nativeViewMarkerClass(ownerId: string): string {
  return `tiny-native-view-${ownerId.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function requestNativeView(
  context: BuiltinContext,
  method: 'attach' | 'update' | 'detach',
  payload: unknown,
): Promise<unknown> | undefined {
  const hostRequest = context.options.hostRequest
  if (!hostRequest) return undefined
  return hostRequest(`nativeView.${method}`, payload)
    .catch(() => undefined)
}

export function attachNativeView(
  context: BuiltinContext,
  spec: NativeViewSpec,
): Promise<unknown> | undefined {
  return requestNativeView(context, 'attach', spec)
}

export function updateNativeView(
  context: BuiltinContext,
  spec: NativeViewSpec,
): Promise<unknown> | undefined {
  return requestNativeView(context, 'update', spec)
}

export function detachNativeView(
  context: BuiltinContext,
  id: string,
): Promise<unknown> | undefined {
  return requestNativeView(context, 'detach', { id })
}
