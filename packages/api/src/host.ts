/**
 * Host-side contracts for the `wx.*` table.
 *
 * These types describe what a host supplies or reports; they are not runtime
 * internals. They live in `@tiny/api` because the host entry composes the API
 * context from them, and because the runtime must not depend on host facts.
 */

/** Host-reported system facts; the shape `wx.getSystemInfo*` returns. */
export type SystemInfo = {
  pixelRatio: number
  windowWidth: number
  windowHeight: number
  language?: string
  platform?: string
  SDKVersion?: string
  /** Host-reported device identity, forwarded to `wx.getSystemInfo` as-is. */
  system?: string
  model?: string
  brand?: string
  statusBarHeight?: number
}

/** Host-owned storage values, keyed by storage key. */
export type StorageValues = Record<string, unknown>

export type HostApiParams = Record<string, unknown>

export type HostApiHandler = (
  params: HostApiParams,
  context: { pageId?: string },
) => unknown | Promise<unknown>

/**
 * Platform handlers for the bridge `api` domain (`storage.*`, `network.*`,
 * `toast.show`, …). The host owns the implementation; the kernel only forwards
 * the call and returns the result.
 */
export type HostApiHandlers = Record<string, HostApiHandler>
