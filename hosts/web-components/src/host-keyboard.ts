import type { BuiltinContext } from './types'

/** Opaque event field used only by the web host to correlate listener returns. */
export const EVENT_RETURN_TOKEN_FIELD = '__tinyEventReturnToken'

export type HostKeyboardEvent = {
  height: number
  duration: number
  status?: string
  native?: boolean
  ownerId?: string
  reason?: string
  blur?: boolean
}

export type HostKeyboardMode = {
  native: boolean
}

export type HostKeyboardValueEvent = {
  ownerId?: string
  value: string
  cursor: number
}

export type HostKeyboardSelectionEvent = {
  ownerId?: string
  selectionStart: number
  selectionEnd: number
}

type KeyboardListenerTarget = {
  applyKeyboardListenerReturn?: (result: unknown) => void
}

const keyboardListenerTargets = new Map<string, KeyboardListenerTarget>()

export function registerKeyboardListenerTarget(
  ownerId: string,
  target: KeyboardListenerTarget,
): () => void {
  keyboardListenerTargets.set(ownerId, target)
  return () => {
    if (keyboardListenerTargets.get(ownerId) === target) {
      keyboardListenerTargets.delete(ownerId)
    }
  }
}

export function applyKeyboardListenerReturn(ownerId: string, result: unknown): boolean {
  const target = keyboardListenerTargets.get(ownerId)
  if (!target?.applyKeyboardListenerReturn) return false
  target.applyKeyboardListenerReturn(result)
  return true
}

export type HostKeyboardShowRequest = {
  ownerId: string
  source: 'input' | 'textarea'
  value: string
  placeholder?: string
  maxlength: number
  confirmType: string
  type?: string
  password?: boolean
  disabled?: boolean
  adjustPosition?: boolean
  adjustKeyboardTo?: string
  holdKeyboard?: boolean
  cursorSpacing?: number
  showConfirmBar?: boolean
  cursor?: number
  selectionStart?: number
  selectionEnd?: number
  style?: {
    width: number
    height: number
    left: number
    top: number
    fontSize?: number
    lineHeight?: number
    color?: string
    fontFamily?: string
    fontWeight?: string
    textAlign?: string
  }
  keyboardAppearance?: string
}

export type HostKeyboardHideRequest = {
  ownerId: string
  source: 'input' | 'textarea'
  reason: string
  value?: string
}

let keyboardOwnerSeed = 0

export function createKeyboardOwnerId(source: 'input' | 'textarea'): string {
  keyboardOwnerSeed += 1
  return `${source}-${keyboardOwnerSeed}`
}

function asNumber(value: unknown, fallback = 0): number {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function readKeyboardEvent(payload: unknown): HostKeyboardEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = payload as Record<string, unknown>
  if (detail.height === undefined) return null
  return {
    height: Math.max(0, asNumber(detail.height)),
    duration: Math.max(0, asNumber(detail.duration)),
    ...(typeof detail.status === 'string' ? { status: detail.status } : {}),
    ...(typeof detail.native === 'boolean' ? { native: detail.native } : {}),
    ...(typeof detail.ownerId === 'string' ? { ownerId: detail.ownerId } : {}),
    ...(typeof detail.reason === 'string' ? { reason: detail.reason } : {}),
    ...(typeof detail.blur === 'boolean' ? { blur: detail.blur } : {}),
  }
}

export function readKeyboardMode(payload: unknown): HostKeyboardMode | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = payload as Record<string, unknown>
  if (typeof detail.native !== 'boolean') return null
  return { native: detail.native }
}

export function currentHostKeyboardMode(
  context: BuiltinContext,
): HostKeyboardMode | null {
  return readKeyboardMode(context.options.hostEvents?.last?.('keyboardMode'))
}

export function subscribeHostKeyboardMode(
  context: BuiltinContext,
  listener: (mode: HostKeyboardMode) => void,
): (() => void) | undefined {
  const unsubscribe = context.options.hostEvents?.subscribe('keyboardMode', (payload) => {
    const mode = readKeyboardMode(payload)
    if (mode) listener(mode)
  })
  const current = currentHostKeyboardMode(context)
  if (current) listener(current)
  return unsubscribe
}

export function readKeyboardValueEvent(payload: unknown): HostKeyboardValueEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = payload as Record<string, unknown>
  if (detail.value === undefined) return null
  return {
    value: String(detail.value),
    cursor: asNumber(detail.cursor, -1),
    ...(typeof detail.ownerId === 'string' ? { ownerId: detail.ownerId } : {}),
  }
}

export function readKeyboardSelectionEvent(
  payload: unknown,
): HostKeyboardSelectionEvent | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = payload as Record<string, unknown>
  return {
    selectionStart: asNumber(detail.selectionStart, -1),
    selectionEnd: asNumber(detail.selectionEnd, -1),
    ...(typeof detail.ownerId === 'string' ? { ownerId: detail.ownerId } : {}),
  }
}

export function subscribeKeyboard(
  context: BuiltinContext,
  listener: (event: HostKeyboardEvent) => void,
): (() => void) | undefined {
  return context.options.hostEvents?.subscribe('keyboardHeightChange', (payload) => {
    const event = readKeyboardEvent(payload)
    if (event) listener(event)
  })
}

export function subscribeKeyboardValue(
  context: BuiltinContext,
  listener: (event: HostKeyboardValueEvent) => void,
): (() => void) | undefined {
  return context.options.hostEvents?.subscribe('keyboardInput', (payload) => {
    const event = readKeyboardValueEvent(payload)
    if (event) listener(event)
  })
}

export function subscribeKeyboardSelection(
  context: BuiltinContext,
  listener: (event: HostKeyboardSelectionEvent) => void,
): (() => void) | undefined {
  return context.options.hostEvents?.subscribe('keyboardSelection', (payload) => {
    const event = readKeyboardSelectionEvent(payload)
    if (event) listener(event)
  })
}

export function subscribeKeyboardConfirm(
  context: BuiltinContext,
  listener: (event: HostKeyboardValueEvent) => void,
): (() => void) | undefined {
  return context.options.hostEvents?.subscribe('keyboardConfirm', (payload) => {
    const event = readKeyboardValueEvent(payload)
    if (event) listener(event)
  })
}

export function subscribeKeyboardBlur(
  context: BuiltinContext,
  listener: (event: HostKeyboardValueEvent) => void,
): (() => void) | undefined {
  return context.options.hostEvents?.subscribe('keyboardBlur', (payload) => {
    const event = readKeyboardValueEvent(payload)
    if (event) listener(event)
  })
}

function eventTargetsKeyboardControl(event: Event): boolean {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : []
  for (const target of path) {
    const tagName = (target as { tagName?: unknown } | null)?.tagName
    if (typeof tagName !== 'string') continue
    const normalized = tagName.toUpperCase()
    if (normalized === 'TINY-INPUT' || normalized === 'TINY-TEXTAREA') return true
  }
  return false
}

/**
 * WeChat dismisses the native keyboard when a page touch lands outside an
 * input/textarea, unless the active component set `hold-keyboard`. The DOM
 * input in native mode is readonly, so WebView first-responder handling cannot
 * provide this behavior on its own.
 */
export function subscribeKeyboardOutsideTouch(
  isActive: () => boolean,
  shouldHold: () => boolean,
  release: () => void,
): () => void {
  if (typeof document === 'undefined') return () => {}
  const listener = (event: Event) => {
    if (!isActive() || shouldHold() || eventTargetsKeyboardControl(event)) return
    release()
  }
  document.addEventListener('touchstart', listener, { capture: true, passive: true })
  return () => document.removeEventListener('touchstart', listener, { capture: true })
}

/**
 * Activate the host keyboard from the component's stable host element.
 *
 * Internal template elements are not glass nodes in the DOM-like backend, so a
 * template `bindtap` on `#wrapper` cannot be the activation source. The
 * host-specific adapter observes the click before the template's own event
 * handlers can consume it.
 */
export function subscribeKeyboardActivation(
  element: EventTarget | null | undefined,
  canActivate: () => boolean,
  activate: () => void,
): () => void {
  if (!element || typeof element.addEventListener !== 'function') return () => {}
  let touchStart: { x: number; y: number } | null = null
  let ignoreClickUntil = 0
  const touchPoint = (touch: Touch | undefined): { x: number; y: number } | null => (
    touch ? { x: touch.clientX, y: touch.clientY } : null
  )
  const moved = (from: { x: number; y: number }, to: { x: number; y: number }): boolean => (
    Math.hypot(to.x - from.x, to.y - from.y) > 10
  )
  const handleTouchStart = (event: Event) => {
    const touch = (event as TouchEvent | undefined)?.touches?.[0]
    touchStart = touchPoint(touch)
  }
  const handleTouchMove = (event: Event) => {
    const touch = touchPoint((event as TouchEvent | undefined)?.touches?.[0])
    if (!touchStart || !touch) return
    if (!moved(touchStart, touch)) return
    touchStart = null
    ignoreClickUntil = Date.now() + 600
  }
  const handleTouchEnd = (event: Event) => {
    const start = touchStart
    const touch = touchPoint((event as TouchEvent | undefined)?.changedTouches?.[0])
    touchStart = null
    if (!start || !touch || moved(start, touch)) return
    ignoreClickUntil = Date.now() + 600
    if (canActivate()) activate()
  }
  const handleClick = () => {
    if (Date.now() < ignoreClickUntil) return
    if (canActivate()) activate()
  }
  element.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true })
  element.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true })
  element.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true })
  element.addEventListener('click', handleClick, { capture: true })
  return () => {
    element.removeEventListener('touchstart', handleTouchStart, { capture: true })
    element.removeEventListener('touchmove', handleTouchMove, { capture: true })
    element.removeEventListener('touchend', handleTouchEnd, { capture: true })
    element.removeEventListener('click', handleClick, { capture: true })
  }
}

export function showHostKeyboard(
  context: BuiltinContext,
  request: HostKeyboardShowRequest,
): Promise<HostKeyboardEvent | null> {
  const hostRequest = context.options.hostRequest
  if (!hostRequest) return Promise.resolve(null)
  return hostRequest('showKeyboard', request)
    .then((payload) => readKeyboardEvent(payload))
    .catch(() => null)
}

export function hideHostKeyboard(
  context: BuiltinContext,
  request: HostKeyboardHideRequest,
): void {
  void context.options.hostRequest?.('hideKeyboard', request).catch(() => undefined)
}
