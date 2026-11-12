import * as glassEasel from 'glass-easel'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import type { LogicBackendElement } from '../backend'
import { queryLogicNodes } from '../query'
import type { InspectNode } from '../inspect'
import { inspectComponentTree } from './inspect'
import {
  GlassFrameworkProperties,
  type LogicFrameworkContext,
} from './framework'
import {
  GlassPageTreeManager,
  componentReadyOrder,
  type ComponentSnapshot,
} from './lifecycle'
import {
  GlassStyleRegistry,
  type StyleRegistrationOptions,
} from './styles'
import {
  GlassDefinitionRegistry,
} from './definitions'
import type { MiniProgramComponentSchema } from '../../../component/schema'
import type { StyleLoader, TemplateRegistry } from '../../../shared/template'
import { toJsonSafe } from '../../../shared/events'
import type {
  AssetUrlResolver,
  ProtocolRelativeUrlResolver,
} from '../../../shared/assets'
import type {
  NormalizedComponentDefinition,
  NormalizedRelation,
} from '../../../component/definition/types'



export type { PageComponentOptions } from './definitions'

export type { LogicFrameworkContext } from './framework'

export type GlassEaselAdapterOptions = {
  backend: glassEasel.GeneralBackendContext
  manifest: Manifest
  templates: TemplateRegistry
  /** Host hook mapping compiler-normalized app-root `url(...)` values to loadable URLs. */
  resolveAssetUrl?: AssetUrlResolver
  /** Host policy for protocol-relative stylesheet URLs in custom-scheme pages. */
  resolveProtocolRelativeUrl?: ProtocolRelativeUrlResolver
  /** Runtime page kind, derived from the actual `Page()` / `Component()` registration. */
  isComponentPage?: (path: string) => boolean
  onDiagnostic?: (diagnostic: import('../../../shared/diagnostics').RuntimeDiagnostic) => void
  /** Page/component JavaScript options for the service-side logic tree. */
  logicPageOptions?: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  logicComponentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  /** Logic-layer selector query factory used by `this.createSelectorQuery()`. */
  logicQueryFactory?: (component: glassEasel.GeneralComponent) => unknown
  /** Wrap a selected component with the service page/component handle. */
  componentHandleFactory?: (component: glassEasel.GeneralComponent) => unknown
  /** Called after logic-tree page/component data changes. */
  onLogicDataChange?: (pageId: string) => void
  /** Touch payload currently being dispatched by the logic tree. */
  logicTouchState?: () => { touches?: unknown[]; changedTouches?: unknown[] }
  logicIntersectionFactory?: (
    component: glassEasel.GeneralComponent,
    options?: Record<string, unknown>,
  ) => unknown
  /** A component `triggerEvent` reached the logic tree; forward it to render. */
  onCustomEvent?: (
    pageId: string,
    component: glassEasel.GeneralComponent,
    name: string,
    detail: unknown,
    options?: { bubbles?: boolean; composed?: boolean },
  ) => void
  /**
   * Run a component `setData` completion after the owning page's render update.
   * The render bridge owns the acknowledgement; a standalone logic tree falls
   * back to glass-easel's own render pass.
   */
  afterRender?: (pageId: string, callback: () => void) => void
  /** Router / opener-channel hooks for page and component instances. */
  frameworkContext?: LogicFrameworkContext
  /** `this.animate` / `this.clearAnimate` for logic components. */
  logicAnimationFactory?: {
    animate: (
      component: glassEasel.GeneralComponent,
      selector: string,
      keyframes: unknown,
      duration: unknown,
      options?: unknown,
    ) => boolean
    clear: (
      component: glassEasel.GeneralComponent,
      selector: string,
      options?: unknown,
      callback?: unknown,
    ) => boolean
  }
}

const PAGE_LIFECYCLE_KEYS = new Set([
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onShareTimeline',
  'onPageScroll',
  'onResize',
  'onTabItemTap',
  'onAddToFavorites',
  'onSaveExitState',
])

export type { StyleRegistrationOptions } from './styles'

export class GlassEaselRuntimeAdapter {
  readonly backend: glassEasel.GeneralBackendContext
  readonly componentSpace: glassEasel.ComponentSpace
  private readonly styles: GlassStyleRegistry
  private readonly mountedComponents = new Map<string, glassEasel.GeneralComponent>()
  private readonly pageTrees = new Map<string, GlassPageTreeManager>()
  private readonly definitions: GlassDefinitionRegistry
  private readonly componentSchemas = new Map<string, MiniProgramComponentSchema>()
  private readonly unscopedInstances = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentIds = new WeakMap<object, string>()
  private readonly componentPaths = new WeakMap<object, string>()
  private readonly frameworkProperties: GlassFrameworkProperties
  private readonly unscopedComponentUsage = new Map<string, number>()
  private readonly methodCallerComponents = new WeakMap<object, glassEasel.GeneralComponent>()
  private readonly setDataCallbackComponents = new WeakSet<object>()
  private readonly logicComponentDefinitions?: GlassEaselAdapterOptions['logicComponentDefinitions']
  private readonly componentHandleFactory?: GlassEaselAdapterOptions['componentHandleFactory']
  private readonly onLogicDataChange?: GlassEaselAdapterOptions['onLogicDataChange']
  private readonly pageIdsByComponent = new WeakMap<object, string>()
  /**
   * Page-root relations. glass-easel links relations through the light tree;
   * a page template is a shadow tree, so page relations are resolved here.
   */
  /**
   * Page being constructed right now. glass-easel renders a page's template
   * during `Component.createWithContext`, before `mountPage` receives the page
   * root, so components created in that window cannot resolve their page from
   * the tree yet. The scope is only set for the duration of that call.
   */
  private constructingPageId: string | null = null
  private readonly onCustomEvent?: GlassEaselAdapterOptions['onCustomEvent']
  private readonly afterRender?: GlassEaselAdapterOptions['afterRender']
  private readonly customEventComponents = new WeakSet<object>()
  private readonly readyComponents = new WeakSet<object>()
  private readonly pendingReadyPages = new Set<string>()

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.logicComponentDefinitions = options.logicComponentDefinitions
    this.componentHandleFactory = options.componentHandleFactory
    this.onLogicDataChange = options.onLogicDataChange
    this.onCustomEvent = options.onCustomEvent
    this.afterRender = options.afterRender
    this.frameworkProperties = new GlassFrameworkProperties({
      context: options.frameworkContext,
      pageIdOf: (component) => this.pageIdOf(component),
      pageTree: (pageId) => this.pageTrees.get(pageId),
    })
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
    this.styles = new GlassStyleRegistry({
      backend: this.backend,
      componentSpace: this.componentSpace,
      ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
      ...(options.resolveProtocolRelativeUrl
        ? { resolveProtocolRelativeUrl: options.resolveProtocolRelativeUrl }
        : {}),
      componentSchemas: this.componentSchemas,
      collectUsedComponentPaths: (path, config, using) => (
        this.definitions.collectUsedComponentPaths(path, config, using)
      ),
      ...(options.onDiagnostic ? { onDiagnostic: options.onDiagnostic } : {}),
    })
    this.definitions = new GlassDefinitionRegistry({
      componentSpace: this.componentSpace,
      templates: options.templates,
      manifest: options.manifest,
      styles: this.styles,
      componentSchemas: this.componentSchemas,
      pageComponentOptions: new Map(),
      ...(options.isComponentPage ? { isComponentPage: options.isComponentPage } : {}),
      ...(options.logicPageOptions ? { logicPageOptions: options.logicPageOptions } : {}),
      ...(options.logicComponentDefinitions
        ? { logicComponentDefinitions: options.logicComponentDefinitions }
        : {}),
      ...(options.onDiagnostic ? { onDiagnostic: options.onDiagnostic } : {}),
      ...(options.logicTouchState ? { logicTouchState: options.logicTouchState } : {}),
      ...(options.logicQueryFactory ? { logicQueryFactory: options.logicQueryFactory } : {}),
      ...(options.logicIntersectionFactory
        ? { logicIntersectionFactory: options.logicIntersectionFactory }
        : {}),
      ...(options.logicAnimationFactory
        ? { logicAnimationFactory: options.logicAnimationFactory }
        : {}),
      componentIdFor: (schema, component) => this.componentIdFor(schema, component),
      createEventMethodCaller: (component, fields, framework) => (
        this.createEventMethodCaller(component, fields, framework)
      ),
      methodCallerComponents: this.methodCallerComponents,
      notifyLogicDataChange: (component) => this.notifyLogicDataChange(component),
      resolveMethodCaller: (caller) => this.resolveMethodCaller(caller),
      cleanupComponent: (component) => this.cleanupComponent(component),
      logicPropertyValues: new WeakMap(),
      observerPreviousValues: new WeakMap(),
    })
    this.componentSpace.updateComponentOptions({
      hostNodeTagName: TINY_ENGINE_NAMING.hostNodeTagName,
      reflectToAttributes: true,
    })
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    this.definitions.registerComponentSchemas(schemas)
  }

  registerStyles(
    manifest: Manifest,
    loadStyle: StyleLoader = () => '',
    componentSchemas: MiniProgramComponentSchema[] = [],
    options: StyleRegistrationOptions = {},
  ): void {
    this.styles.registerStyles(manifest, loadStyle, componentSchemas, options)
  }

  registerPage(page: PageArtifact, data: Record<string, unknown> = {}): glassEasel.GeneralComponentDefinition {
    return this.definitions.registerPage(page, data)
  }

  /** Compiler-assigned style scope of a mounted page, if it has one. */
  pageScopeName(pagePath: string): string | undefined {
    return this.styles.pageScopeName(pagePath)
  }

  whenRendered(): Promise<void> {
    return new Promise((resolve) => {
      const backend = this.backend as unknown as {
        render?: (callback: (error: Error | null) => void) => void
      }
      if (typeof backend.render === 'function') backend.render(() => resolve())
      else resolve()
    })
  }

  getComponentCount(): number {
    let count = this.unscopedInstances.size
    for (const pageTree of this.pageTrees.values()) count += pageTree.instances.size
    return count
  }

  getComponentSnapshot(): ComponentSnapshot[] {
    const items: ComponentSnapshot[] = []
    for (const [componentId, component] of this.allComponentInstances()) {
      const path = this.componentPaths.get(component as unknown as object)
      if (!path) continue
      const element = component as unknown as {
        tagName?: unknown
        is?: unknown
        id?: unknown
        class?: unknown
      }
      const parentComponentId = this.findParentComponentId(component)
      items.push({
        componentId,
        path,
        parentComponentId,
        tag: typeof element.tagName === 'string'
          ? element.tagName
          : (typeof element.is === 'string' ? element.is : path),
        id: typeof element.id === 'string' ? element.id : '',
        class: typeof element.class === 'string' ? element.class : '',
        data: (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
      })
    }
    const byId = new Map(items.map((item) => [item.componentId, item]))
    const depth = (item: ComponentSnapshot): number => {
      let value = 0
      let parent = item.parentComponentId
      while (parent) {
        value += 1
        parent = byId.get(parent)?.parentComponentId ?? null
      }
      return value
    }
    items.sort((a, b) => depth(a) - depth(b))
    return items
  }

  registerPageArtifact(page: PageArtifact): void {
    this.definitions.registerPageArtifact(page)
  }

  private componentIdFor(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): string {
    const key = component as unknown as object
    const existing = this.componentIds.get(key)
    if (existing) return existing
    // Component instance counters are page-local, like WeChat's per-tree
    // compManager. The page id still namespaces the public instance id.
    const pageId = this.pageIdOf(component)
    const counters = pageId
      ? this.pageTrees.get(pageId)?.componentUsage ?? this.unscopedComponentUsage
      : this.unscopedComponentUsage
    const usage = (counters.get(schema.path) ?? 0) + 1
    counters.set(schema.path, usage)
    const baseId = usage === 1
      ? schema.componentId
      : `${schema.componentId}${TINY_ENGINE_NAMING.componentInstanceSeparator}${usage}`
    // Component IDs are scoped per page in the service instance registry. Two
    // pages using the same global component would otherwise resolve to the
    // first page's component instance (and its event method callers).
    const componentId = pageId
      ? `${pageId}${TINY_ENGINE_NAMING.componentIdSeparator}${baseId}`
      : baseId
    this.componentIds.set(key, componentId)
    this.componentPaths.set(key, schema.path)
    this.componentInstancesFor(pageId).set(componentId, component)
    return componentId
  }

  private componentInstancesFor(pageId?: string): Map<string, glassEasel.GeneralComponent> {
    return pageId ? this.pageTrees.get(pageId)?.instances ?? this.unscopedInstances
      : this.unscopedInstances
  }

  private *allComponentInstances(): IterableIterator<[string, glassEasel.GeneralComponent]> {
    yield* this.unscopedInstances
    for (const pageTree of this.pageTrees.values()) yield* pageTree.instances
  }

  /** Tear down the logic page root and its page-scoped relation index. */
  unmountPage(pageId: string): void {
    const pageTree = this.pageTrees.get(pageId)
    this.pageTrees.delete(pageId)
    const component = pageTree?.component
    const tabBarComponent = pageTree?.tabBarComponent
    pageTree?.clear()
    for (const mounted of [component, tabBarComponent]) {
      if (!mounted) continue
      this.pageIdsByComponent.delete(mounted as unknown as object)
      const methodCaller = (mounted as unknown as { _$methodCaller?: unknown })._$methodCaller
      if (methodCaller && typeof methodCaller === 'object') {
        this.methodCallerComponents.delete(methodCaller as object)
        this.pageIdsByComponent.delete(methodCaller as object)
      }
      this.componentIds.delete(mounted as unknown as object)
      this.componentPaths.delete(mounted as unknown as object)
      ;(mounted as unknown as { destroy?: () => void }).destroy?.()
    }
    if (!component) return
    this.mountedComponents.delete(component.is)
  }

  /** Resolve page-root relations over the rendered shadow tree. */
  resolvePageRelations(pageId: string): void {
    const pageTree = this.pageTrees.get(pageId)
    const page = pageTree?.component
    const definition = page ? this.logicComponentDefinitions?.get(page.is) : undefined
    if (!page || !definition || definition.relations.length === 0) return
    const candidates = this.collectPageComponents(page)
    const nodes = pageTree.relationNodes
    const linked = pageTree.linkedTargets
    for (const relation of definition.relations) {
      const targets = candidates.filter((component) => {
        if (component.is !== relation.targetPath) return false
        return relation.type === 'descendant' || relation.type === 'child'
      })
      nodes.set(relation.key, targets)
      const previous = linked.get(relation.key) ?? new Set<glassEasel.GeneralComponent>()
      const next = new Set(targets)
      for (const target of next) {
        if (previous.has(target)) continue
        this.invokeRelation(relation.linked, page, target)
        this.invokeReciprocal(relation, page, target, 'linked')
      }
      for (const target of previous) {
        if (next.has(target)) continue
        this.invokeRelation(relation.unlinked, page, target)
        this.invokeReciprocal(relation, page, target, 'unlinked')
      }
      linked.set(relation.key, next)
    }
  }

  /** Relation nodes of the page root, resolved over the render shadow tree. */
  relationNodes(pageId: string, relationKey: string): glassEasel.GeneralComponent[] {
    const pageTree = this.pageTrees.get(pageId)
    const resolved = pageTree?.relationNodes.get(relationKey)
    if (resolved) return resolved
    const page = pageTree?.component
    return page ? page.getRelationNodes(relationKey) : []
  }

  private collectPageComponents(page: glassEasel.GeneralComponent): glassEasel.GeneralComponent[] {
    const result: glassEasel.GeneralComponent[] = []
    const visited = new Set<unknown>()
    const walk = (node: unknown): void => {
      if (!node || visited.has(node)) return
      visited.add(node)
      const element = node as {
        childNodes?: unknown[]
        shadowRoot?: { childNodes?: unknown[] }
        asGeneralComponent?: () => glassEasel.GeneralComponent | undefined
      }
      const component = element.asGeneralComponent?.()
      if (component) {
        result.push(component)
        walk(component.shadowRoot)
      }
      for (const child of element.childNodes ?? []) walk(child)
    }
    walk(page.shadowRoot)
    return result
  }

  private invokeRelation(
    handler: NormalizedRelation['linked'],
    owner: glassEasel.GeneralComponent,
    target: glassEasel.GeneralComponent,
  ): void {
    if (!handler) return
    const caller = (component: glassEasel.GeneralComponent): unknown => (
      (component as unknown as { getMethodCaller?: () => unknown }).getMethodCaller?.() ?? component
    )
    const targetCaller = caller(target)
    if (typeof handler === 'function') {
      handler.call(caller(owner), targetCaller)
      return
    }
    const definition = this.logicComponentDefinitions?.get(owner.is)
    const method = definition?.methods.get(handler)
    if (method) method.call(caller(owner), targetCaller)
  }

  private invokeReciprocal(
    relation: NormalizedRelation,
    page: glassEasel.GeneralComponent,
    target: glassEasel.GeneralComponent,
    phase: 'linked' | 'unlinked',
  ): void {
    const definition = this.logicComponentDefinitions?.get(target.is)
    const reciprocal = definition?.relations.find((candidate) => (
      candidate.targetPath === page.is
      && ((relation.type === 'child' && candidate.type === 'parent')
        || (relation.type === 'descendant' && candidate.type === 'ancestor'))
    ))
    if (reciprocal) this.invokeRelation(reciprocal[phase], target, page)
  }

  getMountedComponentByPageId(pageId: string): glassEasel.GeneralComponent | undefined {
    return this.pageTrees.get(pageId)?.component
  }

  /**
   * Resolve `selectComponent` / `selectAllComponents` against one page or
   * component scope. Both Page and Component call sites use this primitive so
   * selector depth and component boundaries stay identical.
   */
  selectComponents(
    root: LogicBackendElement,
    selector: string,
    all: boolean,
  ): glassEasel.GeneralComponent[] {
    const componentsOf = (nodes: LogicBackendElement[]): glassEasel.GeneralComponent[] => (
      nodes.flatMap((node) => (
        node.nodeType === 'component' && node.__wxElement
          ? [node.__wxElement as glassEasel.GeneralComponent]
          : []
      ))
    )
    const deep = selector.split('>>>')
    if (deep.length === 2) {
      const ownerSelector = deep[0]!.trim()
      const innerSelector = deep[1]!.trim()
      const owner = queryLogicNodes(root, ownerSelector, false, true)
        .find((node) => node.nodeType === 'component' && node.__wxElement)
      if (!owner) return []
      return componentsOf(queryLogicNodes(owner, innerSelector, all))
    }
    return componentsOf(queryLogicNodes(root, selector, all, true))
  }

  /** The owning custom component, or null when the parent is a page root. */
  ownerComponentFor(
    component: glassEasel.GeneralComponent,
  ): glassEasel.GeneralComponent | undefined {
    const ownerId = this.findParentComponentId(component)
    return ownerId ? this.getMountedComponentByComponentId(ownerId) : undefined
  }

  /** Deliver a page lifetime to every logic component mounted on the page. */
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide' | 'resize', event?: unknown): void {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) return
    for (const component of pageTree.instances.values()) {
      component.triggerPageLifetime(phase, event === undefined ? [] : [event])
    }
  }

  /** Resolve the page that owns a component, for host diagnostics. */
  pageIdFor(component: unknown): string | undefined {
    return component ? this.pageIdOf(component) : undefined
  }

  componentIdOf(component: unknown): string | undefined {
    return this.componentIds.get(component as object)
  }

  /** Resolve a page method a render-evaluated page template bound. */
  pageTemplateMethod(
    path: string,
    name: string,
  ): ((this: unknown, event: unknown) => unknown) | undefined {
    return this.definitions.pageTemplateMethod(path, name)
  }

  getMountedComponentByComponentId(componentId: string): glassEasel.GeneralComponent | undefined {
    for (const pageTree of this.pageTrees.values()) {
      const component = pageTree.instances.get(componentId)
      if (component) return component
    }
    return this.unscopedInstances.get(componentId)
  }

  private triggerReady(component: glassEasel.GeneralComponent): void {
    if (this.readyComponents.has(component as unknown as object)) return
    this.readyComponents.add(component as unknown as object)
    component.triggerLifetime('ready', [])
  }

  /**
   * WeChat's operation flow fires one `ready` callback for each component
   * created by the update. Component creation walks the shadow tree before the
   * host is attached, then its light/slot children follow the host:
   *
   *   shadow descendants -> component -> light descendants
   *
   * This is observable when a slot child and a host-template child are both
   * present (`child(inner)`, host, `child(slot)`).
   */
  private resolvedReadyOrder(pageId: string): glassEasel.GeneralComponent[] {
    const root = this.pageTrees.get(pageId)?.component
    if (!root) return []
    return componentReadyOrder(root)
  }

  /** Run `ready` for components that have not observed their first render. */
  triggerPendingReady(pageId: string): void {
    const root = this.pageTrees.get(pageId)?.component
    if (!root) return
    for (const component of this.resolvedReadyOrder(pageId)) {
      if (component !== root) {
        const path = this.componentPaths.get(component as unknown as object)
        if (!path || !this.logicComponentDefinitions?.has(path)) continue
      }
      this.triggerReady(component)
    }
  }

  /**
   * A component created by `setData` becomes ready after the pageframe applies
   * that update. Multiple service updates in one tick share one ready pass.
   */
  schedulePendingReady(pageId: string): void {
    if (!this.logicComponentDefinitions || this.pendingReadyPages.has(pageId)) return
    this.pendingReadyPages.add(pageId)
    const flush = (): void => {
      this.pendingReadyPages.delete(pageId)
      this.triggerPendingReady(pageId)
    }
    if (this.afterRender) this.afterRender(pageId, flush)
    else queueMicrotask(flush)
  }

  mountPage(
    path: string,
    data: Record<string, unknown> = {},
    pageId?: string,
  ): glassEasel.GeneralComponent {
    const page = this.definitions.getPage(path)
    if (!page) throw new Error(`page is not registered: ${path}`)
    if (pageId && this.pageTrees.has(pageId)) {
      throw new Error(`logic page is already mounted: ${pageId}`)
    }
    const pageTree = pageId ? new GlassPageTreeManager(pageId, path) : undefined
    if (pageId && pageTree) this.pageTrees.set(pageId, pageTree)
    const previousPageId = this.constructingPageId
    this.constructingPageId = pageId ?? null
    let component: glassEasel.GeneralComponent
    try {
      component = glassEasel.Component.createWithContext(
        'page',
        this.registerPage(page, data),
        this.backend,
      )
    } catch (error) {
      if (pageId) this.pageTrees.delete(pageId)
      throw error
    } finally {
      this.constructingPageId = previousPageId
    }
    // App-global selectors are anchored to this unprefixed marker so the page
    // root participates without exposing built-in component internals.
    component.classList?.toggle(TINY_ENGINE_NAMING.scopeMarkerClass, true)
    this.mountedComponents.set(path, component)
    if (pageId) {
      pageTree!.attachComponent(component)
      // Multiple pages stay mounted in the service logic tree. Data changes
      // raised from an event handler on a non-active page must resolve back to
      // that page, not the most recently mounted one. glass-easel invokes
      // listeners with the method caller as `this`, so both identities map to
      // the page.
      this.pageIdsByComponent.set(component as unknown as object, pageId)
      const methodCaller = (component as unknown as { _$methodCaller?: unknown })._$methodCaller
      if (methodCaller && typeof methodCaller === 'object') {
        this.methodCallerComponents.set(methodCaller as object, component)
        this.pageIdsByComponent.set(methodCaller as object, pageId)
      }
    }
    component.setData(data)
    glassEasel.Element.pretendAttached(component)
    if (pageId) this.triggerPendingReady(pageId)
    else this.triggerReady(component)
    return component
  }

  /**
   * Mount the custom tabBar as a second root in the page's logic tree.
   *
   * The root is intentionally not appended to the page component, matching
   * WeChat's `tabRoot`. The page tree still owns the instance and releases it
   * with the page.
   */
  mountTabBar(pageId: string, path: string): LogicBackendElement | undefined {
    const pageTree = this.pageTrees.get(pageId)
    const schema = this.definitions.schemaFor(path)
    if (!pageTree || !schema) return undefined
    if (pageTree.tabBarRoot) return pageTree.tabBarRoot
    const definition = this.registerComponentDefinition(schema)
    const previousPageId = this.constructingPageId
    this.constructingPageId = pageId
    let component: glassEasel.GeneralComponent
    try {
      component = glassEasel.Component.createWithContext('custom-tab-bar', definition, this.backend)
    } catch (error) {
      this.constructingPageId = previousPageId
      throw error
    }
    this.constructingPageId = previousPageId
    const root = (component as unknown as {
      getBackendElement?: () => LogicBackendElement
    }).getBackendElement?.()
    if (!root) {
      ;(component as unknown as { destroy?: () => void }).destroy?.()
      return undefined
    }
    pageTree.attachTabBar(component, root)
    this.pageIdsByComponent.set(component as unknown as object, pageId)
    const methodCaller = (component as unknown as { _$methodCaller?: unknown })._$methodCaller
    if (methodCaller && typeof methodCaller === 'object') {
      this.methodCallerComponents.set(methodCaller as object, component)
      this.pageIdsByComponent.set(methodCaller as object, pageId)
    }
    glassEasel.Element.pretendAttached(component)
    this.triggerReady(component)
    return root
  }

  getTabBarComponent(pageId: string): glassEasel.GeneralComponent | undefined {
    return this.pageTrees.get(pageId)?.tabBarComponent
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }

  inspectTree(pageId?: string): InspectNode | null {
    const component = pageId
      ? this.pageTrees.get(pageId)?.component
      : [...this.pageTrees.values()].at(-1)?.component
        ?? [...this.mountedComponents.values()].at(-1)
    if (!component) return null
    return this.inspectLogicalTree(component)
  }

  private inspectLogicalTree(component: glassEasel.GeneralComponent): InspectNode | null {
    return inspectComponentTree(component)
  }

  private registerComponentDefinition(
    schema: MiniProgramComponentSchema,
    pageScope?: number,
  ): glassEasel.GeneralComponentDefinition {
    return this.definitions.registerComponentDefinition(schema, pageScope)
  }

  pageUsingComponents(pagePath: string): Record<string, string> {
    return this.definitions.pageUsingComponents(pagePath)
  }

  usedComponentPaths(pagePath: string): Set<string> {
    return this.definitions.usedComponentPaths(pagePath)
  }

  private notifyLogicDataChange(component: glassEasel.GeneralComponent): void {
    const resolved = this.resolveMethodCaller(component) ?? component
    const pageId = this.pageIdOf(resolved)
    if (pageId) {
      this.onLogicDataChange?.(pageId)
      return
    }
    // No owning page could be resolved: the component is detached from every
    // mounted page, so there is no page to patch.
    return
  }

  /** Resolve the owning page structurally, falling back to the construction scope. */
  private pageIdOf(component?: unknown): string | undefined {
    const pageId = component === undefined ? undefined : this.pageIdOfComponent(component)
    return pageId ?? this.constructingPageId ?? undefined
  }

  /** Resolve the page that owns a logic component by walking its tree ancestry. */
  private pageIdOfComponent(component: unknown): string | undefined {
    let current = component as {
      parentNode?: unknown
      ownerShadowRoot?: { _$host?: unknown; owner?: unknown }
    } | undefined
    for (let depth = 0; depth < 64 && current; depth += 1) {
      const pageId = this.pageIdsByComponent.get(current as unknown as object)
      if (pageId) return pageId
      const shadowHost = current.ownerShadowRoot?._$host ?? current.ownerShadowRoot?.owner
      if (shadowHost && typeof shadowHost === 'object' && shadowHost !== current) {
        current = shadowHost as typeof current
        continue
      }
      const parent = current.parentNode
      if (parent && typeof parent === 'object') {
        current = parent as typeof current
        continue
      }
      current = undefined
    }
    return undefined
  }

  /**
   * Mini-program event handlers run with a glass method caller as `this`.
   * glass's `setData` only accepts the patch, while pages commonly pass a
   * completion callback (`setData(patch, cb)`); preserve the callback on the
   * component instance so nested page methods also see it.
   *
   * The callback is not a data-completion hook: WeChat runs it after the view
   * layer applied the update, so it goes through the render bridge (or glass's
   * own render pass when there is no render tree).
   */
  private ensureSetDataCallback(component: glassEasel.GeneralComponent): void {
    if (this.setDataCallbackComponents.has(component)) return
    this.setDataCallbackComponents.add(component)
    const target = component as unknown as {
      setData: (data: never, callback?: () => void) => void
    }
    const original = target.setData.bind(component)
    target.setData = (data: never, callback?: () => void): void => {
      original(data)
      if (typeof callback !== 'function') return
      const pageId = this.pageIdOf(component)
      if (this.afterRender && pageId) {
        this.afterRender(pageId, callback)
        return
      }
      // No render bridge can acknowledge this update (standalone logic tree or
      // a component detached from every page). Defer to glass's render pass so
      // the callback still never runs before the data update settled.
      glassEasel.triggerRender(component, () => callback())
    }
  }

  /**
   * `this.triggerEvent` dispatches in the logic tree. JS listeners run here
   * (as before); the render tree additionally receives the event so WXS
   * handlers execute where WeChat runs them.
   */
  private ensureCustomEventForwarding(component: glassEasel.GeneralComponent): void {
    const forward = this.onCustomEvent
    if (!forward || this.customEventComponents.has(component)) return
    this.customEventComponents.add(component)
    const target = component as unknown as {
      triggerEvent: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
    }
    const original = target.triggerEvent.bind(component)
    target.triggerEvent = (name: string, detail?: unknown, options?: Record<string, unknown>): void => {
      original(name, detail, options)
      const pageId = this.pageIdFor(component)
      if (!pageId) return
      forward(pageId, component, String(name), detail, options as
        | { bubbles?: boolean; composed?: boolean }
        | undefined)
    }
  }

  private createEventMethodCaller(
    component?: glassEasel.GeneralComponent,
    initialFields?: Record<string, unknown>,
    framework?: { path: string; pageRoot: boolean },
  ): unknown {
    const logicMode = Boolean(this.logicComponentDefinitions)
    const instanceFields: Record<string, unknown> = { ...(initialFields ?? {}) }
    if (logicMode && component) {
      this.ensureSetDataCallback(component)
      this.ensureCustomEventForwarding(component)
    }
    if (component && framework) this.frameworkProperties.install(component, framework)
    if (component) this.definitions.installTraitAPI(component)
    const adapter = this
    const selectComponents = (selector: string, all: boolean): unknown[] => {
      if (!component) return []
      const element = (component as unknown as {
        getBackendElement?: () => LogicBackendElement | null
      }).getBackendElement?.()
      if (!element) return []
      return this.selectComponents(element, selector, all)
        .map((selected) => this.componentHandleOf(selected))
    }
    let methodCaller: Record<string, unknown>
    methodCaller = new Proxy(instanceFields, {
      has() {
        return true
      },
      get(target, property) {
        if (typeof property !== 'string') return undefined
        if (Object.prototype.hasOwnProperty.call(target, property)) return target[property]
        if (property === 'selectComponent') {
          return (selector: string) => selectComponents(selector, false)[0] ?? null
        }
        if (property === 'selectAllComponents') {
          return (selector: string) => selectComponents(selector, true)
        }
        if (property === 'selectOwnerComponent') {
          return () => {
            const owner = component ? adapter.ownerComponentFor(component) : undefined
            return owner ? adapter.componentHandleOf(owner) : null
          }
        }
        if (logicMode && component && !property.startsWith('_$')) {
          const value = (component as unknown as Record<string, unknown>)[property]
          if (value !== undefined) {
            return typeof value === 'function' ? value.bind(methodCaller) : value
          }
        }
        return undefined
      },
      set(target, property, value) {
        if (typeof property === 'string') target[property] = value
        return true
      },
    })
    return methodCaller
  }

  private componentHandleOf(component: glassEasel.GeneralComponent): unknown {
    return this.componentHandleFactory?.(component)
      ?? (component as unknown as { getMethodCaller?: () => unknown }).getMethodCaller?.()
      ?? component
  }

  private findParentComponentId(component: glassEasel.GeneralComponent): string | null {
    let node = (component as unknown as { parentNode?: unknown }).parentNode
    while (node) {
      const path = this.componentPaths.get(node as object)
      if (path) {
        const schema = this.definitions.schemaFor(path)
        if (schema) return this.componentIdFor(schema, node as glassEasel.GeneralComponent)
      }
      const host = (node as { getHostNode?: () => unknown }).getHostNode?.()
      if (host && host !== node) {
        node = host
        continue
      }
      node = (node as { parentNode?: unknown }).parentNode
    }
    return null
  }

  private resolveMethodCaller(caller: unknown): glassEasel.GeneralComponent | undefined {
    if (!caller || typeof caller !== 'object') return undefined
    const mapped = this.methodCallerComponents.get(caller as object)
    if (mapped) return mapped
    const candidate = caller as { is?: unknown; data?: unknown }
    if (typeof candidate.is === 'string' && candidate.data && typeof candidate.data === 'object') {
      return caller as glassEasel.GeneralComponent
    }
    return undefined
  }

  private cleanupComponent(component: glassEasel.GeneralComponent): void {
    const componentId = this.componentIds.get(component as unknown as object)
    if (componentId) this.componentInstancesFor(this.pageIdOf(component)).delete(componentId)
    this.componentIds.delete(component as unknown as object)
    this.componentPaths.delete(component as unknown as object)
  }
}
