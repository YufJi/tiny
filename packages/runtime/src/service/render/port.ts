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
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide'): void
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
