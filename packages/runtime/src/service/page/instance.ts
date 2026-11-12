import { applyDataPatch, cloneJsonSafe, type DataPatch } from '../../shared/data'
import { runObservers, type ObserverHost } from '../../component/observers'
import type {
  ComponentLifecycleName,
  NormalizedComponentDefinition,
} from '../../component/definition/types'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { MiniProgramPropertyType } from '../../component/schema'
import type { RuntimePageLifecyclePhase } from '../../shared/diagnostics'
import type { MiniProgramRouter } from './router'
import type {
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
} from './types'

const LIFECYCLE_METHODS = new Set([
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPageScroll',
  'onReachBottom',
  'onResize',
  'onTabItemTap',
  'onPullDownRefresh',
  'onShareAppMessage',
  'onShareTimeline',
  'onAddToFavorites',
  'onSaveExitState',
])

export type PageLifecycleName = RuntimePageLifecyclePhase

/** `this.animate` / `this.clearAnimate` bridge owned by the logic tree. */
export type PageAnimationHooks = {
  animate: (
    selector: string,
    keyframes: unknown,
    duration: unknown,
    options?: unknown,
  ) => boolean
  clear: (selector: string, options?: unknown, callback?: unknown) => boolean
}

/**
 * Page-scoped framework objects supplied by the service thread.
 *
 * `router` is the page router (`this.router === this.pageRouter` on a page);
 * `eventChannel` is the page side of the channel created by `wx.navigateTo`.
 */
export type MiniProgramPageRuntime = {
  router?: MiniProgramRouter
  eventChannel?: unknown
}

/** Logic-tree hooks: selector queries, relations, intersection and animation. */
export type MiniProgramPageLogicHooks = {
  selectComponents?: (selector: string, all: boolean) => unknown[]
  /** Resolve a `getTabBar(callback)` request once the custom tabBar exists. */
  onTabBarReady?: (callback: (tabBar: unknown) => void) => void
  relationNodes?: (relationKey: string) => unknown[]
  selectorQuery?: () => Record<string, unknown>
  intersectionObserver?: (options?: Record<string, unknown>) => Record<string, unknown>
  animation?: PageAnimationHooks
}

/** Construction contract for a page instance. */
export type MiniProgramPageInstanceOptions = {
  pageId: string
  path: string
  /** Raw `Page()`/`Component()` options; the route query is `query`. */
  options: MiniProgramPageOptions
  query?: Record<string, string>
  /** Normalized definition when the page body is a component. */
  definition?: NormalizedComponentDefinition
  /** Forward `setData` patches to the render side. */
  onDataPatch?: (pageId: string, patch: DataPatch) => void
  /** State persisted by the previous launch's `onSaveExitState`. */
  exitState?: unknown
  /**
   * Run a `setData` completion after the page's render update. Without a render
   * thread the callback still runs asynchronously, matching WeChat's contract.
   */
  afterRender?: (pageId: string, callback: () => void) => void
  onDiagnostic?: (code: string, message: string, details?: unknown) => void
  /** Logic-tree hooks; omitted for an instance without a logic tree. */
  logic?: MiniProgramPageLogicHooks
  /** Framework objects (`router`, opener channel) for this page. */
  runtime?: MiniProgramPageRuntime
}

export class MiniProgramPageInstance implements ObserverHost {
  readonly pageId: string
  readonly componentId: string
  readonly path: string
  readonly query: Record<string, string>
  readonly data: Record<string, unknown>
  readonly properties: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  /** Page path as exposed by `this.route` (WeChat page instance property). */
  readonly route: string
  /** Legacy alias of {@link route}; several community libraries read it. */
  readonly __route__: string
  /** Query string as exposed by `this.options` (WeChat page instance property). */
  readonly options: Record<string, string>
  /** `this.router` / `this.pageRouter`: both are the same page-scoped router. */
  readonly router: MiniProgramRouter | undefined
  readonly pageRouter: MiniProgramRouter | undefined
  /** `this.getOpenerEventChannel()`; `{}` when the page has no opener. */
  readonly eventChannel: unknown
  observerDepth = 0
  /** Loaded exit state exposed as WeChat's `this.exitState`. */
  exitState: unknown
  savedExitState?: unknown
  /** Raw `Page()`/`Component()` options; `this.options` is the route query. */
  private readonly pageOptions: MiniProgramPageOptions
  private readonly definition?: NormalizedComponentDefinition
  private readonly onDataPatch?: (pageId: string, patch: DataPatch) => void
  private readonly afterRender?: (pageId: string, callback: () => void) => void
  private readonly onDiagnostic?: (code: string, message: string, details?: unknown) => void
  private readonly logic: MiniProgramPageLogicHooks
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()
  private unloaded = false

  constructor(input: MiniProgramPageInstanceOptions) {
    const query = input.query ?? {}
    const runtime = input.runtime ?? {}
    const definition = input.definition
    this.pageId = input.pageId
    this.componentId = `page:${input.pageId}`
    this.path = input.path
    this.pageOptions = input.options
    this.definition = definition
    this.onDataPatch = input.onDataPatch
    this.afterRender = input.afterRender
    this.onDiagnostic = input.onDiagnostic
    this.logic = input.logic ?? {}
    this.query = cloneJsonSafe(query)
    this.data = cloneJsonSafe(definition?.data ?? input.options.data ?? {})
    this.properties = {}
    this.router = runtime.router
    this.pageRouter = runtime.router
    this.eventChannel = runtime.eventChannel ?? {}
    this.exitState = cloneJsonSafe(input.exitState)

    if (definition) {
      const oldData = cloneJsonSafe(this.data)
      const changedPaths: string[] = []
      for (const [name, property] of Object.entries(definition.properties)) {
        if (Object.prototype.hasOwnProperty.call(query, name)) {
          this.data[name] = coerceQueryProperty(property.type, query[name]!)
          changedPaths.push(name)
        }
        if (name in this.data) this.properties[name] = this.data[name]
      }
      for (const [name, method] of definition.methods) {
        const bound = method.bind(this)
        this.methods.set(name, bound)
        ;(this as unknown as Record<string, unknown>)[name] = bound
      }
      this.bindRuntimeMethods()
      // Route facts are framework-owned: set them after page-declared fields
      // were copied so a user field with the same name cannot shadow them.
      this.route = this.path
      this.__route__ = this.path
      this.options = this.query
      this.exitState = cloneJsonSafe(input.exitState)
      if (changedPaths.length > 0) {
        runObservers(this, definition.observers, changedPaths, oldData)
      }
    } else {
      this.bindLegacyPageOptions(input.options)
      this.bindRuntimeMethods()
      this.route = this.path
      this.__route__ = this.path
      this.options = this.query
      this.exitState = cloneJsonSafe(input.exitState)
    }
  }

  private bindLegacyPageOptions(options: MiniProgramPageOptions): void {
    const reserved = new Set(['data', 'methods', 'options', 'behaviors', 'lifetimes'])
    for (const [name, value] of Object.entries(options)) {
      if (typeof value === 'function') {
        if (LIFECYCLE_METHODS.has(name)) continue
        this.methods.set(name, value.bind(this))
        continue
      }
      // WeChat copies plain page fields (`extraLine: []`, counters, ...) onto
      // the page instance; methods close over `this.<field>` and would hit
      // `undefined` otherwise.
      if (reserved.has(name) || LIFECYCLE_METHODS.has(name)) continue
      ;(this as unknown as Record<string, unknown>)[name] = value
    }
    for (const [name, method] of Object.entries(options.methods ?? {})) {
      if (typeof method === 'function') this.methods.set(name, method.bind(this))
    }
    for (const [name, method] of this.methods) {
      ;(this as unknown as Record<string, unknown>)[name] = method
    }
    // WeChat exposes lifecycle methods on the page object itself; Taro reads
    // e.g. `this.onReady.called`, so bind lifecycle functions onto the instance.
    for (const [name, value] of Object.entries(options)) {
      if (typeof value === 'function') {
        ;(this as unknown as Record<string, unknown>)[name] = value.bind(this)
      }
    }
  }

  private bindRuntimeMethods(): void {
    Object.assign(this, {
      setData: this.setData.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      selectOwnerComponent: this.selectOwnerComponent.bind(this),
      getRelationNodes: this.getRelationNodes.bind(this),
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      animate: this.animate.bind(this),
      clearAnimate: this.clearAnimate.bind(this),
      clearAnimation: this.clearAnimate.bind(this),
      hasBehavior: this.hasBehavior.bind(this),
      triggerEvent: this.triggerEvent.bind(this),
      getOpenerEventChannel: this.getOpenerEventChannel.bind(this),
    })
  }

  /**
   * Apply a data patch. The patch is visible in `this.data` synchronously;
   * the optional completion runs after the view layer applied the update.
   */
  setData(patch: DataPatch, callback?: () => void): void {
    if (this.unloaded) throw new Error(`Cannot setData on unloaded page: ${this.path}`)
    const clonedPatch = cloneJsonSafe(patch)
    const hasPropertyObserver = this.definition?.observers.some(
      (observer) => observer.kind === 'property',
    ) ?? false
    const oldData = hasPropertyObserver ? cloneJsonSafe(this.data) : undefined
    applyDataPatch(this.data, clonedPatch)
    if (this.definition) {
      for (const name of Object.keys(this.definition.properties)) {
        if (name in this.data) this.properties[name] = this.data[name]
        else delete this.properties[name]
      }
    }
    this.onDataPatch?.(this.pageId, clonedPatch)
    if (this.definition) {
      runObservers(this, this.definition.observers, Object.keys(clonedPatch), oldData)
    }
    if (typeof callback === 'function') this.completeSetData(callback)
  }

  /**
   * WeChat's `setData(patch, callback)` completion runs after the view layer
   * applied the patch. The render bridge owns that acknowledgement; without a
   * render thread the callback still runs asynchronously, never inline with the
   * data update.
   */
  private completeSetData(callback: () => void): void {
    if (this.afterRender) {
      this.afterRender(this.pageId, callback)
      return
    }
    queueMicrotask(() => {
      try {
        callback()
      } catch (error) {
        this.onError(
          DIAGNOSTIC_CODES.SET_DATA_CALLBACK_ERROR,
          error instanceof Error ? error.message : String(error),
          error instanceof Error && error.stack ? { stack: error.stack } : undefined,
        )
      }
    })
  }

  invokeMethod(name: string, args: unknown[] = []): unknown {
    const method = this.methods.get(name)
    if (!method) throw new Error(`Page method not found: ${name}`)
    return method(...args)
  }

  hasMethod(name: string): boolean {
    return this.methods.has(name)
  }

  triggerLifecycle(name: PageLifecycleName, args: unknown[] = []): unknown {
    if (this.unloaded) return undefined
    this.lifecycleEvents.push(name)
    let result: unknown
    if (this.definition) {
      // WeChat requires page lifecycle methods to live in `methods`.
      result = this.methods.get(name)?.(...args)
      // Keep the engine's legacy compatibility path for lifetimes.onXxx.
      const legacy = (this.pageOptions.lifetimes as Record<string, ((...args: unknown[]) => void) | undefined> | undefined)?.[name]
      if (typeof legacy === 'function') {
        const legacyResult = legacy.apply(this, args)
        if (result === undefined) result = legacyResult
      }
    } else {
      result = (this.pageOptions as MiniProgramComponentOptions).lifetimes?.[name]?.apply(this, args)
      const legacyMethod = this.pageOptions[name] as ((...params: unknown[]) => unknown) | undefined
      if (typeof legacyMethod === 'function') {
        const legacyResult = legacyMethod.apply(this, args)
        if (result === undefined) result = legacyResult
      }
    }
    if (name === 'onUnload') this.unloaded = true
    return result
  }

  getComponentOptions(): MiniProgramPageOptions | NormalizedComponentDefinition {
    return this.definition ?? this.pageOptions
  }

  getComponentDefinition(): NormalizedComponentDefinition | undefined {
    return this.definition
  }

  selectComponent(selector: unknown): unknown {
    return this.logic.selectComponents?.(String(selector ?? ''), false)[0] ?? null
  }

  selectAllComponents(selector: unknown): unknown[] {
    return this.logic.selectComponents?.(String(selector ?? ''), true) ?? []
  }

  selectOwnerComponent(): unknown {
    return null
  }

  getRelationNodes(relationKey: string): unknown[] {
    // Relations are resolved by the glass-easel logic tree; the page wrapper
    // forwards to it instead of mirroring a second component graph.
    return this.logic.relationNodes?.(relationKey) ?? []
  }

  createSelectorQuery(): Record<string, unknown> {
    return this.logic.selectorQuery?.() ?? {}
  }

  createIntersectionObserver(options?: Record<string, unknown>): Record<string, unknown> {
    return this.logic.intersectionObserver?.(options) ?? {}
  }

  animate(
    selector: unknown,
    keyframes: unknown,
    duration?: unknown,
    options?: unknown,
  ): boolean {
    const animation = this.logic.animation
    if (!animation) return false
    return animation.animate(String(selector ?? ''), keyframes, duration, options)
  }

  clearAnimate(selector: unknown, options?: unknown, callback?: unknown): boolean {
    const animation = this.logic.animation
    if (!animation) return false
    return animation.clear(String(selector ?? ''), options, callback)
  }

  hasBehavior(behavior: unknown): boolean {
    return Boolean(
      this.definition?.behaviors.has(behavior as object | string)
      || this.definition?.traits.some(({ trait }) => trait === behavior),
    )
  }

  /** `this.getTabBar([callback])`: the page-local custom tab bar, if any. */
  getTabBar(callback?: (tabBar: unknown) => void): unknown {
    const tabBar = this.logic.selectComponents?.('custom-tab-bar', false)?.[0] ?? null
    if (typeof callback !== 'function') return tabBar
    if (tabBar) {
      callback(tabBar)
      return tabBar
    }
    this.logic.onTabBarReady?.(callback)
    return null
  }

  triggerEvent(_name: string, _detail?: unknown, _options?: Record<string, unknown>): void {
    // A page root has no parent component to receive an event.
  }

  /**
   * Page side of the `EventChannel` created by the `wx.navigateTo` that opened
   * this page. Pages opened by any other route get an empty object, matching
   * WeChat's "no opener" result.
   */
  getOpenerEventChannel(): unknown {
    return this.eventChannel
  }

  triggerPageLifetime(
    name: 'show' | 'hide' | 'resize',
    event?: { size: { windowWidth: number; windowHeight: number } },
  ): void {
    if (this.definition) {
      for (const handler of this.definition.pageLifetimeHandlers[name]) {
        handler.call(this, ...(event ? [event] : []))
      }
      return
    }
    ;(this.pageOptions as MiniProgramComponentOptions).pageLifetimes?.[name]?.call(
      this,
      ...(event ? [event] : []),
    )
  }

  triggerComponentLifecycle(name: ComponentLifecycleName): void {
    if (this.definition) {
      for (const handler of this.definition.lifetimeHandlers[name]) handler.call(this)
      return
    }
    const componentOptions = this.pageOptions as MiniProgramComponentOptions
    componentOptions.lifetimes?.[name]?.call(this);
    (componentOptions[name] as ((...args: unknown[]) => void) | undefined)?.call(this)
  }

  onError(code: string, message: string, details?: unknown): void {
    this.onDiagnostic?.(code, message, details)
  }
}

function coerceQueryProperty(type: MiniProgramPropertyType | undefined, raw: string): unknown {
  switch (type) {
    case 'number': {
      const value = Number(raw)
      return Number.isNaN(value) ? raw : value
    }
    case 'boolean':
      if (raw === 'true') return true
      if (raw === 'false') return false
      return Boolean(raw)
    case 'object':
    case 'array':
      try {
        return JSON.parse(raw) as unknown
      } catch {
        return raw
      }
    case 'string':
    case 'function':
    case 'any':
    default:
      return raw
  }
}


