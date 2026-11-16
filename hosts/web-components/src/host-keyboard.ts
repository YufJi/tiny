import type { BuiltinContext } from './types'

export type HostKeyboardEvent = {
  height: number
  duration: number
  ownerId?: string
  reason?: string
  blur?: boolean
}

export type HostKeyboardShowRequest = {
  ownerId: string
  source: 'input' | 'textarea'
  value: string
  maxlength: number
  confirmType: string
  password?: boolean
  disabled?: boolean
  adjustPosition?: boolean
  holdKeyboard?: boolean
  cursorSpacing?: number
  showConfirmBar?: boolean
  selectionStart?: number
  selectionEnd?: number
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
    ...(typeof detail.ownerId === 'string' ? { ownerId: detail.ownerId } : {}),
    ...(typeof detail.reason === 'string' ? { reason: detail.reason } : {}),
    ...(typeof detail.blur === 'boolean' ? { blur: detail.blur } : {}),
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
