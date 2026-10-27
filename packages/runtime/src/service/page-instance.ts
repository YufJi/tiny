import { applyDataPatch, cloneJsonSafe, type DataPatch } from '../data'
import { runObservers, type ObserverHost } from '../component'
import type { ComponentLifecycleName, NormalizedComponentDefinition } from '../component'
import type { MiniProgramPropertyType } from '../types'
import type { RuntimePageLifecyclePhase } from '../diagnostics'
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

export class MiniProgramPageInstance implements ObserverHost {
  readonly pageId: string
  readonly componentId: string
  readonly path: string
  readonly query: Record<string, string>
  readonly data: Record<string, unknown>
  readonly properties: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  observerDepth = 0
  savedExitState?: unknown
  private readonly options: MiniProgramPageOptions
  private readonly definition?: NormalizedComponentDefinition
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()
  private unloaded = false

  constructor(
    pageId: string,
    path: string,
    options: MiniProgramPageOptions,
    query: Record<string, string> = {},
    private readonly onDataPatch?: (pageId: string, patch: DataPatch) => void,
    private readonly onDiagnostic?: (code: string, message: string, details?: unknown) => void,
    definition?: NormalizedComponentDefinition,
    private readonly logicSelection?: (selector: string, all: boolean) => unknown[],
    private readonly logicRelations?: (relationKey: string) => unknown[],
    private readonly logicQuery?: () => Record<string, unknown>,
    private readonly logicIntersection?: (options?: Record<string, unknown>) => Record<string, unknown>,
  ) {
    this.pageId = pageId
    this.componentId = `page:${pageId}`
    this.path = path
    this.options = options
    this.definition = definition
    this.query = cloneJsonSafe(query)
    this.data = cloneJsonSafe(definition?.data ?? options.data ?? {})
    this.properties = {}

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
      if (changedPaths.length > 0) {
        runObservers(this, definition.observers, changedPaths, oldData)
      }
    } else {
      this.bindLegacyPageOptions(options)
      this.bindRuntimeMethods()
    }
  }

  private bindLegacyPageOptions(options: MiniProgramPageOptions): void {
    for (const [name, value] of Object.entries(options)) {
      if (typeof value !== 'function' || LIFECYCLE_METHODS.has(name)) continue
      this.methods.set(name, value.bind(this))
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
      hasBehavior: this.hasBehavior.bind(this),
      triggerEvent: this.triggerEvent.bind(this),
    })
  }

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
    callback?.()
  }

  invokeMethod(name: string, args: unknown[] = []): unknown {
    const method = this.methods.get(name)
    if (!method) throw new Error(`Page method not found: ${name}`)
    return method(...args)
  }

  triggerLifecycle(name: PageLifecycleName, args: unknown[] = []): unknown {
    if (this.unloaded) return undefined
    this.lifecycleEvents.push(name)
    let result: unknown
    if (this.definition) {
      // WeChat requires page lifecycle methods to live in `methods`.
      result = this.methods.get(name)?.(...args)
      // Keep the engine's legacy compatibility path for lifetimes.onXxx.
      const legacy = (this.options.lifetimes as Record<string, ((...args: unknown[]) => void) | undefined> | undefined)?.[name]
      if (typeof legacy === 'function') {
        const legacyResult = legacy.apply(this, args)
        if (result === undefined) result = legacyResult
      }
    } else {
      result = (this.options as MiniProgramComponentOptions).lifetimes?.[name]?.apply(this, args)
      const legacyMethod = this.options[name] as ((...params: unknown[]) => unknown) | undefined
      if (typeof legacyMethod === 'function') {
        const legacyResult = legacyMethod.apply(this, args)
        if (result === undefined) result = legacyResult
      }
    }
    if (name === 'onUnload') this.unloaded = true
    return result
  }

  getComponentOptions(): MiniProgramPageOptions | NormalizedComponentDefinition {
    return this.definition ?? this.options
  }

  getComponentDefinition(): NormalizedComponentDefinition | undefined {
    return this.definition
  }

  selectComponent(selector: unknown): unknown {
    return this.logicSelection?.(String(selector ?? ''), false)[0] ?? null
  }

  selectAllComponents(selector: unknown): unknown[] {
    return this.logicSelection?.(String(selector ?? ''), true) ?? []
  }

  selectOwnerComponent(): unknown {
    return null
  }

  getRelationNodes(relationKey: string): unknown[] {
    // Relations are resolved by the glass-easel logic tree; the page wrapper
    // forwards to it instead of mirroring a second component graph.
    return this.logicRelations?.(relationKey) ?? []
  }

  createSelectorQuery(): Record<string, unknown> {
    return this.logicQuery?.() ?? {}
  }

  createIntersectionObserver(options?: Record<string, unknown>): Record<string, unknown> {
    return this.logicIntersection?.(options) ?? {}
  }

  hasBehavior(behavior: unknown): boolean {
    return this.definition?.behaviors.has(behavior as object | string) ?? false
  }

  triggerEvent(_name: string, _detail?: unknown, _options?: Record<string, unknown>): void {
    // A page root has no parent component to receive an event.
  }

  triggerPageLifetime(name: 'show' | 'hide'): void {
    if (this.definition) {
      for (const handler of this.definition.pageLifetimeHandlers[name]) handler.call(this)
      return
    }
    ;(this.options as MiniProgramComponentOptions).pageLifetimes?.[name]?.call(this)
  }

  triggerComponentLifecycle(name: ComponentLifecycleName): void {
    if (this.definition) {
      for (const handler of this.definition.lifetimeHandlers[name]) handler.call(this)
      return
    }
    const componentOptions = this.options as MiniProgramComponentOptions
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


