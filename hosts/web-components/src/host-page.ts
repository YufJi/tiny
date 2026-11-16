import type { BuiltinContext } from './types'

export const HOST_PAGE_VISIBILITY_EVENT = 'pageVisibility'

export type HostPageVisibility = {
  active: boolean
  pageId?: string
}

export type HostFrame = number | ReturnType<typeof setTimeout>

export function readHostPageVisibility(payload: unknown): HostPageVisibility | null {
  if (!payload || typeof payload !== 'object') return null
  const detail = payload as Record<string, unknown>
  if (typeof detail.active !== 'boolean') return null
  return {
    active: detail.active,
    ...(typeof detail.pageId === 'string' ? { pageId: detail.pageId } : {}),
  }
}

export function currentHostPageVisibility(
  context: BuiltinContext,
): HostPageVisibility | null {
  return readHostPageVisibility(
    context.options.hostEvents?.last?.(HOST_PAGE_VISIBILITY_EVENT),
  )
}

export function isHostPageActive(context: BuiltinContext): boolean {
  const current = currentHostPageVisibility(context)
  if (current) return current.active
  if (typeof window === 'undefined') return true
  try {
    const state = (window.frameElement as HTMLIFrameElement | null)?.dataset.state
    if (state) return state === 'active'
  } catch {
    // Cross-origin render documents have no readable frame element.
  }
  return true
}

export function subscribeHostPageVisibility(
  context: BuiltinContext,
  listener: (visibility: HostPageVisibility) => void,
): (() => void) | undefined {
  const unsubscribe = context.options.hostEvents?.subscribe(
    HOST_PAGE_VISIBILITY_EVENT,
    (payload) => {
      const visibility = readHostPageVisibility(payload)
      if (visibility) listener(visibility)
    },
  )
  const current = currentHostPageVisibility(context)
  if (current) listener(current)
  return unsubscribe
}

export function requestHostFrame(callback: () => void): HostFrame {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(callback)
  return setTimeout(callback, 0)
}

export function cancelHostFrame(frame: HostFrame | undefined): void {
  if (frame === undefined) return
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(frame as number)
    return
  }
  clearTimeout(frame as ReturnType<typeof setTimeout>)
}
