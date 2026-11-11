/**
 * Narrow seam between the service runtime and the service-render layer.
 *
 * The page stack constructs page instances before the logic tree exists and
 * calls these methods on every lifecycle transition / `setData`. Implementations
 * must be no-ops until the render bridge has started, so the runtime never has
 * to know whether the render side is ready.
 */
export type ServiceRenderPage = {
  pageId: string
  path: string
  data: Record<string, unknown>
  invokeMethod(name: string, args?: unknown[]): unknown
}

export type ServiceRenderPort = {
  mountPage(page: ServiceRenderPage): void
  unmountPage(pageId: string): void
  syncPageData(pageId: string, patch: Record<string, unknown>): void
  /**
   * Run a `setData` completion after the page's render tree applied the update.
   * Implementations without a render thread must still run it asynchronously.
   */
  completeAfterRender(pageId: string, callback: () => void): void
  /** Resolve `this.getTabBar(callback)` once the page's custom tab bar mounts. */
  onTabBarReady?(pageId: string, callback: (tabBar: unknown) => void): void
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide' | 'resize', event?: unknown): void
  selectComponents(pageId: string, selector: string, all: boolean): unknown[]
  relationNodes(pageId: string, relationKey: string): unknown[]
  pageSelectorQuery(pageId: string): Record<string, unknown>
  pageIntersectionObserver(pageId: string, options?: Record<string, unknown>): Record<string, unknown>
  pageAnimate(
    pageId: string,
    selector: string,
    keyframes: unknown,
    duration: unknown,
    options?: unknown,
  ): boolean
  pageClearAnimate(
    pageId: string,
    selector: string,
    options?: unknown,
    callback?: unknown,
  ): boolean
}
