import type * as glassEasel from 'glass-easel'

/**
 * Page-scoped framework objects the runtime injects into the logic tree.
 *
 * The logic layer never imports the service runtime: it only forwards these
 * opaque values to `this.router`, `this.pageRouter` and
 * `this.getOpenerEventChannel()`.
 */
export type LogicFrameworkContext = {
  /** Build a router whose relative routes resolve against `basePath`. */
  createRouter: (basePath: string) => unknown
  /**
   * Facts owned by the page instance for one page id: its router, route query
   * and opener `EventChannel`.
   */
  pageMeta?: (pageId: string) => {
    route?: string
    query?: Record<string, string>
    router?: unknown
    eventChannel?: unknown
  } | undefined
}

export type FrameworkPageTree = {
  path: string
  router?: unknown
}

export type FrameworkHost = {
  context: LogicFrameworkContext | undefined
  pageIdOf(component: unknown): string | undefined
  pageTree(pageId: string): FrameworkPageTree | undefined
}

/**
 * Installs the framework-owned instance properties WeChat exposes on pages and
 * components (`router`, `pageRouter`, `getOpenerEventChannel`, and the page's
 * `route` / `__route__` / `options`).
 */
export class GlassFrameworkProperties {
  private readonly installed = new WeakSet<object>()
  private readonly componentRouters = new WeakMap<object, unknown>()

  constructor(private readonly host: FrameworkHost) {}

  install(
    component: glassEasel.GeneralComponent,
    framework: { path: string; pageRoot: boolean },
  ): void {
    const context = this.host.context
    if (!context) return
    const key = component as unknown as object
    if (this.installed.has(key)) return
    this.installed.add(key)
    const define = (name: string, get: () => unknown): void => {
      Object.defineProperty(component, name, {
        configurable: true,
        enumerable: false,
        get,
        // glass writes component fields onto the instance; a declared property
        // with a framework name must not throw on assignment.
        set: () => undefined,
      })
    }
    define('router', () => (
      framework.pageRoot
        ? this.pageRouterFor(component, framework.path)
        : this.componentRouterFor(component, framework.path)
    ))
    define('pageRouter', () => this.pageRouterFor(
      component,
      framework.pageRoot ? framework.path : undefined,
    ))
    define('getOpenerEventChannel', () => () => (
      // WeChat stores `__eventChannel` on the page root only; a custom
      // component's `getOpenerEventChannel()` returns `undefined`.
      framework.pageRoot ? this.pageEventChannelFor(component) : undefined
    ))
    if (!framework.pageRoot) return
    define('route', () => framework.path)
    define('__route__', () => framework.path)
    define('options', () => {
      const pageId = this.host.pageIdOf(component)
      return pageId ? context.pageMeta?.(pageId)?.query : undefined
    })
  }

  private componentRouterFor(
    component: glassEasel.GeneralComponent,
    path: string,
  ): unknown {
    const cached = this.componentRouters.get(component as unknown as object)
    if (cached !== undefined) return cached
    const router = this.host.context?.createRouter(path)
    if (router !== undefined) {
      this.componentRouters.set(component as unknown as object, router)
    }
    return router
  }

  private pageRouterFor(
    component: glassEasel.GeneralComponent,
    pageRootPath?: string,
  ): unknown {
    const context = this.host.context
    if (!context) return undefined
    const pageId = this.host.pageIdOf(component)
    const ownerRouter = pageId ? context.pageMeta?.(pageId)?.router : undefined
    // A page's `this.router` and `this.pageRouter` are the same object; reuse
    // the page instance's router so both identities match.
    if (ownerRouter !== undefined) return ownerRouter
    // Only a page root knows its path this early; for a component the owning
    // page's path is the only valid base.
    const pageTree = pageId ? this.host.pageTree(pageId) : undefined
    const path = pageRootPath ?? pageTree?.path
    if (!path) return undefined
    if (pageTree?.router !== undefined) return pageTree.router
    const router = context.createRouter(path)
    if (router !== undefined && pageTree) pageTree.router = router
    return router
  }

  private pageEventChannelFor(component: glassEasel.GeneralComponent): unknown {
    const pageId = this.host.pageIdOf(component)
    return pageId ? this.host.context?.pageMeta?.(pageId)?.eventChannel : undefined
  }
}
