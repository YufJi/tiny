/**
 * Host-side contracts for the `wx.*` table.
 *
 * These types describe what a host supplies or reports; they are not runtime
 * internals. They live in `@tiny/api` because the host entry composes the API
 * context from them, and because the runtime must not depend on host facts.
 */

/** Rectangle reported by `wx.getWindowInfo().safeArea`. */
export type SafeArea = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
  height: number
}

/** Host-reported system facts; the shape `wx.getSystemInfo*` returns. */
export type SystemInfo = {
  pixelRatio: number
  windowWidth: number
  windowHeight: number
  screenWidth?: number
  screenHeight?: number
  language?: string
  platform?: string
  SDKVersion?: string
  /** Host-reported device identity, forwarded to `wx.getSystemInfo` as-is. */
  system?: string
  model?: string
  brand?: string
  statusBarHeight?: number
  safeArea?: SafeArea
}

/** Host-owned storage values, keyed by storage key. */
export type StorageValues = Record<string, unknown>

export type HostApiParams = Record<string, unknown>

/**
 * Synchronous host implementations for WeChat's `*Sync` APIs
 * (`system.info`, `storage.*`). The bridge is asynchronous, so hosts install a
 * direct channel; handlers must return a value, never a promise.
 */
export type SyncApiHandlers = Record<
  string,
  (params: HostApiParams) => unknown
>

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
