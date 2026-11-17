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
  frame: NativeViewFrame
  clip?: NativeViewFrame
  mask?: NativeViewFrame[]
  zIndex?: number
  visible: boolean
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

function viewportFrame(): NativeViewFrame {
  const width = typeof window === 'undefined' ? 0 : window.innerWidth
  const height = typeof window === 'undefined' ? 0 : window.innerHeight
  return { left: 0, top: 0, width, height }
}

function intersect(a: NativeViewFrame, b: NativeViewFrame): NativeViewFrame {
  const left = Math.max(a.left, b.left)
  const top = Math.max(a.top, b.top)
  const right = Math.min(a.left + a.width, b.left + b.width)
  const bottom = Math.min(a.top + a.height, b.top + b.height)
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

function styleHidesElement(style: CSSStyleDeclaration | Record<string, string>): boolean {
  return style.display === 'none'
    || style.visibility === 'hidden'
    || style.visibility === 'collapse'
    || Number.parseFloat(style.opacity ?? '') === 0
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
 * The native text field is positioned in the host's content box, matching
 * WeChat's `getComputedStyle` for wx-input/wx-textarea. CSS padding and border
 * therefore never get applied twice by the native text control.
 */
export function nativeViewContentFrameOf(element: Element | null): NativeViewFrame | null {
  const frame = nativeViewFrameOf(element)
  if (!frame || typeof window === 'undefined') return null
  const style = window.getComputedStyle(element!)
  const left = numberValue(style.borderLeftWidth, 0)
    + numberValue(style.paddingLeft, 0)
  const right = numberValue(style.borderRightWidth, 0)
    + numberValue(style.paddingRight, 0)
  const top = numberValue(style.borderTopWidth, 0)
    + numberValue(style.paddingTop, 0)
  const bottom = numberValue(style.borderBottomWidth, 0)
    + numberValue(style.paddingBottom, 0)
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

/**
 * Resolve the visible rect of a DOM element inside its scroll/clip ancestors.
 * Coordinates stay in the render viewport, which is also the native host
 * container coordinate space.
 */
export function nativeViewClipOf(element: Element | null): NativeViewFrame {
  let clip = viewportFrame()
  if (!element || typeof window === 'undefined') return clip
  const view = window
  let current = element.parentElement
  while (current) {
    const style = view.getComputedStyle(current)
    const overflow = `${style.overflowX} ${style.overflowY}`
    if (/(auto|scroll|hidden|clip|overlay)/.test(overflow)
      && typeof current.getBoundingClientRect === 'function') {
      clip = intersect(clip, rectOf(current))
    }
    current = current.parentElement
  }
  return clip
}

export function nativeViewScrollAncestors(element: Element | null): Element[] {
  const ancestors: Element[] = []
  if (!element || typeof window === 'undefined') return ancestors
  let current = element.parentElement
  while (current) {
    const style = window.getComputedStyle(current)
    const overflow = `${style.overflowX} ${style.overflowY}`
    if (/(auto|scroll|overlay)/.test(overflow)) ancestors.push(current)
    current = current.parentElement
  }
  return ancestors
}

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value ?? '')
  return Number.isFinite(parsed) ? parsed : fallback
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

export function nativeViewVisibleAt(element: Element | null): boolean {
  return nativeViewMaskOf(element).length > 0
}

/**
 * Resolve the part of a native-view placeholder that is still on top of the
 * DOM paint stack. The render host samples a small grid with elementFromPoint
 * and returns the visible runs as viewport rectangles; the native host turns
 * them into a CAShapeLayer mask. This keeps a toast/modal/scroll clip from
 * being painted over by an always-on-top native view.
 */
export function nativeViewMaskOf(element: Element | null): NativeViewFrame[] {
  if (!element || typeof document === 'undefined' || typeof window === 'undefined') return []
  const frame = nativeViewContentFrameOf(element)
  if (!frame) return []
  const clip = nativeViewClipOf(element)
  if (clip.width <= 0 || clip.height <= 0) return []
  const view = window
  let current: Element | null = element
  while (current) {
    if (styleHidesElement(view.getComputedStyle(current))) return []
    current = current.parentElement
  }
  const visible = intersect(frame, clip)
  if (visible.width <= 0 || visible.height <= 0) {
    return []
  }
  const step = 12
  const columns = Math.max(1, Math.ceil(visible.width / step))
  const rows = Math.max(1, Math.ceil(visible.height / step))
  const cellWidth = visible.width / columns
  const cellHeight = visible.height / rows
  const mask: NativeViewFrame[] = []
  for (let row = 0; row < rows; row += 1) {
    let runStart = -1
    for (let column = 0; column <= columns; column += 1) {
      let hit = false
      if (column < columns) {
        const x = visible.left + (column + 0.5) * cellWidth
        const y = visible.top + (row + 0.5) * cellHeight
        const top = document.elementFromPoint(x, y)
        hit = Boolean(top && element.contains(top))
      }
      if (hit && runStart < 0) runStart = column
      if (!hit && runStart >= 0) {
        mask.push({
          left: visible.left + runStart * cellWidth,
          top: visible.top + row * cellHeight,
          width: (column - runStart) * cellWidth,
          height: cellHeight,
        })
        runStart = -1
      }
    }
  }
  return mask
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
