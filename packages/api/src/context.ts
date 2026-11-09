import type { BridgeConnection } from '@tiny/bridge'
import type { GlobalEventHub } from './global-events'
import type { AssetUrlResolver } from '@tiny/manifest'

/**
 * The `wx.*` API table and the capabilities it runs against.
 *
 * This package owns the contract: `@tiny/api` never imports `@tiny/runtime`.
 * The host entry (`hosts/web`, `hosts/ios`) creates the connection and composes
 * this context from host facts plus late-bound runtime accessors, then passes
 * the resulting table to the runtime for installation.
 */

/** The `wx` global table. */
export type ApiHost = Record<string, (...args: unknown[]) => unknown>

/** Runtime tabBar actions the `wx.setTabBar*` family drives. */
export type TabBarApi = {
  setStyle(params: Record<string, unknown>): void
  setItem(params: Record<string, unknown>): void
  setBadge(params: Record<string, unknown>): void
  removeBadge(params: Record<string, unknown>): void
  showRedDot(params: Record<string, unknown>): void
  hideRedDot(params: Record<string, unknown>): void
  setVisible(visible: boolean): void
}

export type CanvasMeasurement = {
  width: number
  height: number
  canvasId?: string
  /** Whether the host found a canvas backing the selector. */
  hasCanvas?: boolean
}

/** Options a host uses when acquiring a selector-query canvas node. */
export type CanvasNodeOptions = {
  /** Selector used by `createSelectorQuery`, for hosts that hand off a node. */
  selector?: string
  /** Page that owns the selector query. */
  pageId?: string
  /**
   * Resolve a mini-program image path (for example `./car.png`) to a loadable
   * URL for `canvas.createImage()`.
   */
  resolveAssetUrl?: (src: string) => string | undefined
}

/** A synchronous Canvas 2D/WebGL handle owned by the host. */
export type CanvasNodeHandle = {
  width: number
  height: number
  getContext: (type: string, options?: unknown) => unknown
  createImage?: () => unknown
  toDataURL?: (type?: string, quality?: number) => string
}

/** Request passed to a host when selector-query needs a canvas node. */
export type CanvasNodeRequest = CanvasNodeOptions & {
  canvasId: string
  width: number
  height: number
}

/** Request passed to a host when the legacy `createCanvasContext` API runs. */
export type LegacyCanvasRequest = {
  pageId?: string
}

/** Browser/host canvas hooks injected into the service thread. */
export type ServiceCanvasAdapter = {
  /** Legacy CanvasContext over the same host-owned canvas surface. */
  createLegacyCanvasContext: (
    canvasId: string,
    request?: LegacyCanvasRequest,
  ) => unknown | null
  /**
   * Acquire the host canvas handle for a selector query. Acquisition may be
   * asynchronous, but the returned handle must expose synchronous Canvas APIs.
   */
  acquireCanvasNode?: (
    request: CanvasNodeRequest,
  ) => Promise<CanvasNodeHandle | null> | CanvasNodeHandle | null
  /** Release every node owned by a page (or one canvas of that page). */
  releaseCanvasNode?: (request: {
    pageId?: string
    canvasId?: string
  }) => void
}

/**
 * One DOM node resolved by a selector query.
 *
 * The service runtime produces this shape in its logic tree and returns it over
 * the `query` bridge domain; this is the consumer-side mirror.
 */
export type QueryNodeSnapshot = {
  viewId?: string
  locator?: string
  id: string
  dataset: Record<string, unknown>
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  scrollLeft: number
  scrollTop: number
}

/**
 * Everything the API table needs from its environment.
 *
 * Host facts (`connection`, `canvas`, `resolveAssetUrl`) come from the host
 * entry. Synchronous host answers ride the transport
 * (`connection.callSync`); the bridge stays platform-free. Kernel state (`pageId`, `getActivePage`, `getCurrentPagePath`,
 * `tabBar`, `setNextPageEventChannel`) is exposed by the runtime and late-bound
 * by the host, so the API table can be constructed before the runtime boots.
 */
export type ApiContext = {
  connection: BridgeConnection
  /** API global name used in diagnostics. */
  apiName: string
  /** API globals installed with the table (`wx` plus aliases). */
  apiNamespaces: readonly string[]
  /**
   * Filled by {@link createApiHost} after the table (including host
   * extensions) is assembled; `canIUse` uses it to answer bare API names.
   */
  hasApi?: (name: string) => boolean
  canvas?: ServiceCanvasAdapter
  resolveAssetUrl?: AssetUrlResolver
  /** Service-thread bus behind the global `wx.onXXX` APIs. */
  events?: GlobalEventHub
  /** Active page instance, for `wx.*` entries that scope to the current page. */
  getActivePage?: () => unknown
  getCurrentPagePath?: () => string | undefined
  /** Active page id for page-scoped bridge calls; hosts expose it as a getter. */
  pageId?: string
  /** Runtime tabBar actions; hosts expose the runtime's tab bar as a getter. */
  tabBar?: TabBarApi
  /**
   * Bind the page side of an `EventChannel` that `wx.navigateTo` created.
   * Returns a function that drops the binding again.
   */
  setNextPageEventChannel?: (channel: unknown) => () => void
}
