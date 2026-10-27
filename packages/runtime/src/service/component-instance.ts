import { applyDataPatch, cloneJsonSafe, type DataPatch } from '../data'
import { runObservers, type ObserverHost } from '../observers'
import type { ComponentLifecycleName, NormalizedComponentDefinition } from '../component-definition'
import type { ComponentRuntimeContext } from './types'

export class MiniProgramComponentInstance implements ObserverHost {
  readonly componentId: string
  readonly path: string
  readonly data: Record<string, unknown>
  readonly properties: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  observerDepth = 0
  private readonly definition: NormalizedComponentDefinition
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()
  private readonly runtime: ComponentRuntimeContext

  constructor(
    componentId: string,
    path: string,
    definition: NormalizedComponentDefinition,
    initialData: Record<string, unknown>,
    runtime: ComponentRuntimeContext,
    private readonly bridge?: {
      onDataPatch: (componentId: string, patch: DataPatch) => void
      onTriggerEvent: (
        componentId: string,
        name: string,
        detail: unknown,
        options: Record<string, unknown> | undefined,
      ) => void
    },
  ) {
    this.componentId = componentId
    this.path = path
    this.definition = definition
    this.runtime = runtime
    this.data = cloneJsonSafe(initialData ?? definition.data)
    this.properties = {}
    for (const name of Object.keys(definition.properties)) {
      if (name in this.data) this.properties[name] = this.data[name]
    }

    for (const [name, method] of definition.methods) {
      const bound = method.bind(this)
      this.methods.set(name, bound)
      ;(this as unknown as Record<string, unknown>)[name] = bound
    }

    Object.assign(this, {
      setData: this.setData.bind(this),
      triggerEvent: this.triggerEvent.bind(this),
      selectComponent: this.selectComponent.bind(this),
      selectAllComponents: this.selectAllComponents.bind(this),
      selectOwnerComponent: this.selectOwnerComponent.bind(this),
      getRelationNodes: this.getRelationNodes.bind(this),
      hasBehavior: this.hasBehavior.bind(this),
      createSelectorQuery: this.createSelectorQuery.bind(this),
      createIntersectionObserver: this.createIntersectionObserver.bind(this),
      groupSetData: this.groupSetData.bind(this),
    })
  }

  setData(patch: DataPatch, callback?: () => void): void {
    const clonedPatch = cloneJsonSafe(patch)
    const hasPropertyObserver = this.definition.observers.some(
      (observer) => observer.kind === 'property',
    )
    const oldData = hasPropertyObserver ? cloneJsonSafe(this.data) : undefined
    applyDataPatch(this.data, clonedPatch)
    for (const name of Object.keys(this.definition.properties)) {
      if (name in this.data) this.properties[name] = this.data[name]
      else delete this.properties[name]
    }
    this.bridge?.onDataPatch(this.componentId, clonedPatch)
    runObservers(this, this.definition.observers, Object.keys(clonedPatch), oldData)
    callback?.()
  }

  triggerEvent(name: string, detail?: unknown, options?: Record<string, unknown>): void {
    this.bridge?.onTriggerEvent(
      this.componentId,
      name,
      cloneJsonSafe(detail ?? null),
      cloneJsonSafe(options ?? {}),
    )
  }

  /** Component-level selector query, scoped like `this.createSelectorQuery()`. */
  createSelectorQuery(): Record<string, unknown> {
    return this.runtime.createSelectorQuery()
  }

  /** Component-level intersection observer (API shape only). */
  createIntersectionObserver(options?: Record<string, unknown>): Record<string, unknown> {
    return this.runtime.createIntersectionObserver(options)
  }

  /** Batch several `setData` calls; this runtime applies them synchronously. */
  groupSetData(callback?: () => void): void {
    callback?.()
  }

  syncData(data: Record<string, unknown> | undefined): void {
    if (!data) return
    const next = cloneJsonSafe(data)
    for (const key of Object.keys(this.data)) delete this.data[key]
    Object.assign(this.data, next)
    for (const name of Object.keys(this.definition.properties)) {
      if (name in this.data) this.properties[name] = this.data[name]
      else delete this.properties[name]
    }
  }

  invokeMethod(name: string, args: unknown[] = []): unknown {
    const method = this.methods.get(name)
    if (!method) throw new Error(`Component method not found: ${name}`)
    return method(...args)
  }

  triggerLifecycle(name: ComponentLifecycleName): void {
    this.lifecycleEvents.push(name)
    for (const handler of this.definition.lifetimeHandlers[name]) {
      handler.call(this)
    }
  }

  triggerPageLifetime(name: 'show' | 'hide'): void {
    for (const handler of this.definition.pageLifetimeHandlers[name]) {
      handler.call(this)
    }
  }

  getComponentOptions(): NormalizedComponentDefinition {
    return this.definition
  }

  selectComponent(selector: unknown): unknown {
    const nodes = this.runtime.tree.select(this.componentId, String(selector ?? ''), false)
    return nodes[0] ? this.resolveSelection(nodes[0].componentId) : null
  }

  selectAllComponents(selector: unknown): unknown[] {
    const nodes = this.runtime.tree.select(this.componentId, String(selector ?? ''), true)
    return nodes
      .map((node) => this.resolveSelection(node.componentId))
      .filter((value) => value !== null && value !== undefined)
  }

  selectOwnerComponent(): unknown {
    const owner = this.runtime.tree.owner(this.componentId)
    return owner ? this.resolveSelection(owner.componentId) : null
  }

  getRelationNodes(relationKey: string): unknown[] {
    return this.runtime.relations.getRelationNodes(this.componentId, relationKey)
  }

  hasBehavior(behavior: unknown): boolean {
    return this.definition.behaviors.has(behavior as object | string)
  }

  onError(code: string, message: string, details?: unknown): void {
    this.runtime.onDiagnostic(code, message, details)
  }

  private resolveSelection(componentId: string): unknown {
    const instance = this.runtime.getInstance(componentId)
    if (!instance) return null
    const definition = instance.getComponentOptions()
    if (definition.componentExport && typeof definition.export === 'function') {
      try {
        return definition.export.call(instance)
      } catch (error) {
        this.onError('COMPONENT_EXPORT_ERROR', error instanceof Error ? error.message : String(error), {
          componentId,
        })
      }
    }
    return instance
  }
}
