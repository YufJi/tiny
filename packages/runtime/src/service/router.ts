import type { MiniProgramApiHost } from './types'
import { resolveRouteUrl } from './route'

/**
 * The `this.router` / `this.pageRouter` object (WeChat base library 2.16.1+).
 *
 * It exposes the five navigation APIs with one difference: relative URLs are
 * always resolved against the page or component that owns `this`, never against
 * whatever page happens to be on top of the stack when the call runs (the
 * base-route drift WeChat documents for `wx.navigateTo`).
 */
export type MiniProgramRouter = {
  navigateTo(params?: unknown): unknown
  navigateBack(params?: unknown): unknown
  redirectTo(params?: unknown): unknown
  reLaunch(params?: unknown): unknown
  switchTab(params?: unknown): unknown
}

/**
 * Build a router bound to one base path.
 *
 * Every method calls the installed `wx.*` table, so callbacks, the
 * `EventChannel` and diagnostics behave exactly like the global API. `api` is
 * read lazily because the service thread builds its API table after the page
 * stack (and its router factory) exist.
 */
export function createServiceRouter(
  api: () => MiniProgramApiHost,
  basePath: string,
): MiniProgramRouter {
  const invoke = (method: string, params: unknown): unknown => {
    const table = api()
    const handler = table[method]
    if (typeof handler !== 'function') {
      throw new Error(`this.router requires the mini-program API ${method}`)
    }
    return handler(withBasePath(params, basePath))
  }
  return {
    navigateTo: (params?: unknown) => invoke('navigateTo', params),
    navigateBack: (params?: unknown) => invoke('navigateBack', params),
    redirectTo: (params?: unknown) => invoke('redirectTo', params),
    reLaunch: (params?: unknown) => invoke('reLaunch', params),
    switchTab: (params?: unknown) => invoke('switchTab', params),
  }
}

/**
 * Copy the caller's params and rewrite the URL against the router base.
 *
 * `navigateBack` has no URL, so `withBasePath` leaves it untouched. The original
 * params object is never mutated: app code frequently reuses one options object
 * for several navigation calls.
 */
function withBasePath(params: unknown, basePath: string): Record<string, unknown> {
  const input = params && typeof params === 'object'
    ? { ...(params as Record<string, unknown>) }
    : {}
  if (typeof input.url === 'string') {
    input.url = resolveRouteUrl(basePath, input.url)
  }
  return input
}
