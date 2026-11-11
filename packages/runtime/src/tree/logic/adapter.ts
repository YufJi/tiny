import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { DIAGNOSTIC_CODES, type Manifest, type PageArtifact } from '@tiny/manifest'
import type {
  RenderAnimationRequest,
  RenderClearAnimationRequest,
  RenderEventGeometry,
  RenderNode,
  RenderPatch,
} from '../protocol'
import { diffRenderTree } from '../diff'
import type { AssetUrlResolver } from '../../assets'
import { normalizeAnimationFrames, animationTimingOptions } from '../animation'
import * as glassEasel from 'glass-easel'
import type { MiniProgramComponentSchema, QueryNodeSnapshot, TemplateRegistry } from '../../types'
import type { NormalizedComponentDefinition } from '../../component'
import { GlassEaselRuntimeAdapter } from './glass-easel-adapter'
import type { LogicFrameworkContext } from './glass-easel-adapter'
import {
  LogicBackendContext,
  LogicBackendElement,
  findLogicNodeByElement,
  type LogicStyleSheetRole,
} from './backend'
import { PageTreeManager } from './page-tree-manager'
import { createRuntimeDiagnostic } from '../../diagnostics'
import {
  createLogicSelectorQuery,
  queryLogicNodes,
  snapshotLogicNode,
  type QueryViewRequest,
  type QueryViewResult,
} from './query'
import type {
  ViewEventPayload,
  ViewIntersectionEntry,
  ViewIntersectionRequest,
  ViewRect,
} from './events'

export type LogicTreeAdapterOptions = {
  manifest: Manifest
  templates: TemplateRegistry
  pageOptions?: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  componentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  measureView?: (viewIds: string[]) => Promise<Record<string, ViewRect>>
  /** Geometry of elements addressed by component-scoped locators. */
  measureLocators?: (locators: string[]) => Promise<Record<string, ViewRect>>
  /** Scoped render query for nodes that have no render-side node id. */
  queryView?: (request: QueryViewRequest & { pageId?: string }) => Promise<QueryViewResult>
  loadStyle?: (outputPath: string) => string
  /** Host hook used to resolve stylesheet `url(...)` assets before delivery. */
  resolveAssetUrl?: AssetUrlResolver
  /** Runtime page kind, derived from the actual registration. */
  isComponentPage?: (path: string) => boolean
  onDataChange?: (pageId: string) => void
  onDiagnostic?: (diagnostic: import('../../diagnostics').RuntimeDiagnostic) => void
  /** Report a handler/observer error raised inside glass-easel. */
  onError?: (pageId: string | undefined, message: string, details?: unknown) => void
  /**
   * Run a component `setData` completion after the render thread applied the
   * update. Without it (standalone logic tree) the adapter falls back to
   * glass-easel's own render pass.
   */
  afterRender?: (pageId: string, callback: () => void) => void
  /** Router / opener-channel hooks for page and component instances. */
  frameworkContext?: LogicFrameworkContext
  viewIntersection?: {
    observe: (request: ViewIntersectionRequest & { pageId: string }) => void
    unobserve: (observerId: string, pageId: string) => void
  }
  /**
   * A component `triggerEvent` was dispatched in the logic tree. The service
   * forwards it to the render tree so WXS handlers run there (WeChat's view
   * side); JS listeners have already run here.
   */
  onCustomEvent?: (
    pageId: string,
    componentId: string,
    name: string,
    detail: unknown,
    options?: { bubbles?: boolean; composed?: boolean },
  ) => void
  /** Render-thread animation commands issued by `this.animate`/`clearAnimate`. */
  viewAnimation?: {
    play: (request: RenderAnimationRequest & { pageId: string }) => void
    clear: (request: RenderClearAnimationRequest & { pageId: string }) => void
  }
}

/**
 * Service-side logic tree: glass-easel runs against a recording backend and
 * projects a host-neutral render tree (`tree/protocol`) for the render thread.
 */
export class LogicTreeAdapter {
  readonly backend: LogicBackendContext
  readonly glass: GlassEaselRuntimeAdapter
  private readonly pageTrees = new Map<string, PageTreeManager>()
  private activePageId?: string
  private readonly pageStyleEntries = new Map<string, Array<{
    path: string
    content: string
    role: LogicStyleSheetRole
  }>>()
  private activeTouches: unknown[] | undefined
  private activeChangedTouches: unknown[] | undefined
  private readonly manifest: Manifest
  private readonly loadStyle: (outputPath: string) => string
  private readonly resolveAssetUrl?: AssetUrlResolver
  private readonly isComponentPage?: (path: string) => boolean
  private componentSchemas: MiniProgramComponentSchema[] = []
  private componentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  private readonly styledPages = new Set<string>()
  private readonly measureView?: (viewIds: string[]) => Promise<Record<string, ViewRect>>
  private readonly measureLocators?: (locators: string[]) => Promise<Record<string, ViewRect>>
  private readonly queryView?: (request: QueryViewRequest & { pageId?: string }) => Promise<QueryViewResult>
  private readonly customTabBarPath?: string
  private readonly tabBarPagePaths = new Set<string>()
  private readonly onDiagnostic?: LogicTreeAdapterOptions['onDiagnostic']
  private readonly reportedPages = new Set<string>()
  private readonly viewIntersection?: LogicTreeAdapterOptions['viewIntersection']
  private readonly viewAnimation?: LogicTreeAdapterOptions['viewAnimation']
  private readonly intersectionObservers = new Map<string, {
    callbacks: Map<string, (entry: Record<string, unknown>) => void>
    selectorByViewId: Map<string, string>
    pageId: string
  }>()
  private intersectionObserverCounter = 0

  constructor(options: LogicTreeAdapterOptions) {
    this.backend = new LogicBackendContext()
    this.componentDefinitions = options.componentDefinitions
    this.manifest = options.manifest
    this.loadStyle = options.loadStyle ?? (() => '')
    this.resolveAssetUrl = options.resolveAssetUrl
    this.isComponentPage = options.isComponentPage
    this.measureView = options.measureView
    this.measureLocators = options.measureLocators
    this.queryView = options.queryView
    this.viewIntersection = options.viewIntersection
    this.viewAnimation = options.viewAnimation
    this.onDiagnostic = options.onDiagnostic
    const appConfig = options.manifest.app?.configuration?.effective as
      | Record<string, unknown>
      | undefined
    const tabBar = appConfig?.tabBar
    if (tabBar && typeof tabBar === 'object' && !Array.isArray(tabBar)
      && (tabBar as Record<string, unknown>).custom === true) {
      const customPath = 'custom-tab-bar/index'
      if (options.manifest.components.some((component) => component.path === customPath)) {
        this.customTabBarPath = customPath
      }
      const list = (tabBar as Record<string, unknown>).list
      if (Array.isArray(list)) {
        for (const item of list) {
          if (!item || typeof item !== 'object') continue
          const pagePath = (item as Record<string, unknown>).pagePath
          if (typeof pagePath === 'string') {
            this.tabBarPagePaths.add(pagePath.replace(/^\/+/, ''))
          }
        }
      }
    }
    this.glass = new GlassEaselRuntimeAdapter({
      backend: this.backend as unknown as glassEasel.GeneralBackendContext,
      manifest: options.manifest,
      templates: options.templates,
      ...(options.resolveAssetUrl ? { resolveAssetUrl: options.resolveAssetUrl } : {}),
      ...(options.isComponentPage ? { isComponentPage: options.isComponentPage } : {}),
      logicPageOptions: options.pageOptions,
      logicComponentDefinitions: options.componentDefinitions,
      ...(options.frameworkContext ? { frameworkContext: options.frameworkContext } : {}),
      logicQueryFactory: (component) => this.createSelectorQueryFor(component),
      onLogicDataChange: options.onDataChange,
      ...(options.afterRender ? { afterRender: options.afterRender } : {}),
      logicTouchState: () => this.getActiveTouches(),
      logicIntersectionFactory: (component, observerOptions) => (
        this.createIntersectionObserverFor(component, observerOptions)
      ),
      logicAnimationFactory: {
        animate: (component, selector, keyframes, duration, options) => (
          this.animateFor(component, selector, keyframes, duration, options)
        ),
        clear: (component, selector, options, callback) => (
          this.clearAnimateFor(component, selector, options, callback)
        ),
      },
      onCustomEvent: (pageId, component, name, detail, eventOptions) => {
        const node = findLogicNodeByElement(component)
        if (!node) return
        options.onCustomEvent?.(pageId, this.backend.ensureViewId(node), name, detail, eventOptions)
      },
    })
    glassEasel.addGlobalErrorListener((error, method, relatedComponent) => {
      const message = error instanceof Error ? error.message : String(error)
      options.onError?.(
        this.glass.pageIdFor(relatedComponent),
        message,
        method ? { method } : undefined,
      )
    })
    this.backend.setScopeNameResolver(
      (scopeId) => this.glass.componentSpace.styleScopeManager.queryName(scopeId),
    )
    // The logic layer must not lose Date prototypes or function values while
    // copying data; glass-easel's default strategy flattens Date to {}.
    this.glass.componentSpace.updateComponentOptions({
      dataDeepCopy: glassEasel.DeepCopyKind.None,
      propertyPassingDeepCopy: glassEasel.DeepCopyKind.None,
    })
    for (const page of options.manifest.pages) this.glass.registerPageArtifact(page)
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    const merged = new Map(this.componentSchemas.map((schema) => [schema.path, schema]))
    for (const schema of schemas) merged.set(schema.path, schema)
    this.componentSchemas = [...merged.values()]
    for (const pageTree of this.pageTrees.values()) pageTree.components.register(schemas)
    this.glass.registerComponentSchemas(schemas)
  }

  mountPage(
    path: string,
    data: Record<string, unknown> = {},
    pageId: string,
  ): RenderNode | null {
    let styleStart: number | undefined
    if (!this.styledPages.has(path)) {
      this.styledPages.add(path)
      styleStart = this.backend.styleEntryCount()
      this.glass.registerStyles(
        this.manifest,
        this.loadStyle,
        this.componentSchemas,
        { pagePath: path },
      )
    }
    this.activePageId = pageId
    const page = this.glass.mountPage(path, data, pageId)
    this.reportMissingComponents(path)
    if (styleStart !== undefined) {
      this.pageStyleEntries.set(path, this.backend.styleEntriesSince(styleStart))
    }
    const backendElement = (page as unknown as { getBackendElement?: () => unknown })
      .getBackendElement?.() as LogicBackendElement | undefined
    if (!backendElement) throw new Error(`logic page has no backend element: ${pageId}`)
    const pageTree = new PageTreeManager(pageId, path, backendElement)
    this.pageTrees.set(pageId, pageTree)
    pageTree.components.register(this.componentSchemas)
    this.mountCustomTabBarRoot(pageId, path, pageTree)
    const renderTree = this.snapshotRenderTree(pageId)
    if (renderTree) pageTree.recordRenderTree(renderTree)
    const tabBarTree = this.snapshotTabBarTree(pageId)
    if (tabBarTree) pageTree.recordTabBarRenderTree(tabBarTree)
    return renderTree
  }

  /** Relation nodes of the service-side page component. */
  relationNodes(pageId: string, relationKey: string): unknown[] {
    return this.glass.relationNodes(pageId, relationKey)
  }

  /** Tear down a page root and its render/relation state. */
  unmountPage(pageId: string): void {
    this.pageTrees.get(pageId)?.clear()
    this.pageTrees.delete(pageId)
    this.backend.clearPageLocators(pageId)
    this.glass.unmountPage(pageId)
    if (this.activePageId === pageId) this.activePageId = undefined
  }

  /** Deliver a page lifetime to the page's service-side components. */
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide' | 'resize', event?: unknown): void {
    this.glass.triggerPageLifetime(pageId, phase, event)
  }

  applyPageData(pageId: string, patch: Record<string, unknown>): void {
    const page = this.glass.getMountedComponentByPageId(pageId)
    if (!page) throw new Error(`logic page is not mounted: ${pageId}`)
    page.setData(patch)
    this.glass.resolvePageRelations(pageId)
  }

  /** Runtime-registered stylesheets (shared/page scopes) for the render tree. */
  /** Compiler-assigned style scope of the mounted page. */
  pageScopeName(pageId: string): string | undefined {
    const path = this.pageTrees.get(pageId)?.path
    return path ? this.glass.pageScopeName(path) : undefined
  }

  /** Absolute `usingComponents` paths of the mounted page. */
  pageUsingComponents(pageId: string): Record<string, string> {
    const path = this.pageTrees.get(pageId)?.path
    return path ? this.glass.pageUsingComponents(path) : {}
  }

  pagePathFor(pageId: string): string {
    return this.pageTrees.get(pageId)?.path ?? ''
  }

  /** The page-scoped tree manager, for diagnostics and parity tests. */
  pageTree(pageId: string): PageTreeManager | undefined {
    return this.pageTrees.get(pageId)
  }

  private mountCustomTabBarRoot(
    pageId: string,
    path: string,
    pageTree: PageTreeManager,
  ): void {
    if (!this.customTabBarPath || !this.tabBarPagePaths.has(path)) return
    // Until every renderer supports two roots the compiler may still inject
    // `<custom-tab-bar />` into the page template. In that case keep using the
    // page-owned instance and avoid creating a duplicate tab root.
    const existing = queryLogicNodes(pageTree.root, 'custom-tab-bar', false, true)
      .some((node) => node.nodeType === 'component')
    if (existing) return
    const root = this.glass.mountTabBar(pageId, this.customTabBarPath)
    if (root) pageTree.setTabBarRoot(root)
  }

  private pageStyles(pageId?: string): Array<{
    path: string
    content: string
    role: LogicStyleSheetRole
  }> {
    const path = pageId ? this.pageTrees.get(pageId)?.path : undefined
    if (path) return this.pageStyleEntries.get(path) ?? []
    return [...this.pageStyleEntries.values()].flat()
  }

  hasAppPageScope(pageId?: string): boolean {
    if (pageId) {
      const entries = this.pageStyles(pageId)
      if (entries.length > 0) return entries.some((entry) => entry.role === 'page-scope')
    }
    return this.backend.hasAppPageScope()
  }

  styleTexts(pageId?: string): string[] {
    return this.pageStyles(pageId)
      .filter((entry) => entry.role !== 'app' && entry.role !== 'builtin')
      .map((entry) => entry.content)
  }

  /** Resolve a mini-program selector to logic-tree component handles. */
  selectComponents(pageId: string, selector: string, all: boolean): unknown[] {
    const pageTree = this.pageTrees.get(pageId)
    const root = pageTree?.root
    if (!root) return []
    const tabBarRoot = pageTree.getTabBarRoot()
    if (selector.trim() === 'custom-tab-bar' && tabBarRoot?.__wxElement) {
      return [this.componentHandle(tabBarRoot.__wxElement, pageId)]
    }
    const deep = selector.split('>>>')
    if (deep.length === 2) {
      const ownerSelector = deep[0]!.trim()
      const innerSelector = deep[1]!.trim()
      const owner = queryLogicNodes(root, ownerSelector, false, true)
        .find((node) => node.nodeType === 'component')
      if (!owner) return []
      const nodes = queryLogicNodes(owner, innerSelector, all)
        .filter((node) => node.nodeType === 'component' && node.__wxElement)
      return nodes.map((node) => this.componentHandle(node.__wxElement, pageId))
    }
    const nodes = queryLogicNodes(root, selector, all, true)
      .filter((node) => node.nodeType === 'component' && node.__wxElement)
    return nodes.map((node) => this.componentHandle(node.__wxElement, pageId))
  }

  private reportMissingComponents(path: string): void {
    if (this.reportedPages.has(path)) return
    this.reportedPages.add(path)
    const page = this.manifest.pages.find((item) => item.path === path)
    const using = page?.configuration?.effective?.usingComponents
    if (!using || typeof using !== 'object') return
    const known = new Set([
      ...this.manifest.pages.map((item) => item.path),
      ...this.manifest.components.map((item) => item.path),
    ])
    for (const [tag, target] of Object.entries(using as Record<string, unknown>)) {
      if (typeof target !== 'string') continue
      const normalized = target.replace(/^\//, '').replace(/\.js$/, '')
      if (known.has(normalized)) continue
      this.onDiagnostic?.(createRuntimeDiagnostic(
        'warning',
        DIAGNOSTIC_CODES.UNSUPPORTED_COMPONENT,
        `unsupported component: ${tag}`,
        'service',
        path,
        { tag, target },
      ))
    }
  }

  private componentHandle(component: unknown, pageId: string): unknown {
    const target = component as Record<string, unknown>
    // WeChat returns the `export()` result for a component that declared
    // `wx://component-export`; `undefined` falls back to the instance proxy.
    const exported = this.resolveComponentExport(component)
    if (exported !== undefined) return exported
    const element = (target as { getBackendElement?: () => unknown }).getBackendElement?.()
    const select = (selector: string, all: boolean): unknown[] => {
      if (!element) return []
      const nodes = queryLogicNodes(element as LogicBackendElement, selector, all, true)
        .filter((node) => node.nodeType === 'component' && node.__wxElement)
      return nodes.map((node) => this.componentHandle(node.__wxElement, pageId))
    }
    return new Proxy(target, {
      get: (source, property) => {
        if (property === 'selectComponent') {
          return (selector: string) => select(selector, false)[0] ?? null
        }
        if (property === 'selectAllComponents') {
          return (selector: string) => select(selector, true)
        }
        if (property === 'selectOwnerComponent') {
          return () => {
            const componentId = this.glass.componentIdOf(component)
            const snapshot = this.glass.getComponentSnapshot()
              .find((item) => item.componentId === componentId)
            const parent = snapshot?.parentComponentId
              ? this.glass.getMountedComponentByComponentId(snapshot.parentComponentId)
              : undefined
            return parent ? this.componentHandle(parent, pageId) : null
          }
        }
        const value = Reflect.get(source, property)
        return typeof value === 'function' ? value.bind(source) : value
      },
    })
  }

  /** Run `methods.__export__` contributed by `wx://component-export`. */
  private resolveComponentExport(component: unknown): unknown {
    const path = (component as { is?: unknown }).is
    if (typeof path !== 'string') return undefined
    const exporter = this.componentDefinitions?.get(path)?.methods.get('__export__')
    if (typeof exporter !== 'function') return undefined
    const caller = (component as { getMethodCaller?: () => unknown }).getMethodCaller?.()
      ?? component
    try {
      return exporter.call(caller)
    } catch {
      return undefined
    }
  }

  getMountedComponent(path: string): unknown {
    return this.glass.getMountedComponent(path)
  }

  getMountedComponentByPageId(pageId: string): unknown {
    return this.glass.getMountedComponentByPageId(pageId)
  }

  getMountedComponentByComponentId(componentId: string): unknown {
    return this.glass.getMountedComponentByComponentId(componentId)
  }

  getComponentSnapshot(): unknown[] {
    return this.glass.getComponentSnapshot()
  }

  getComponentCount(): number {
    return this.glass.getComponentCount()
  }

  whenRendered(): Promise<void> {
    return this.glass.whenRendered()
  }

  inspectTree(): unknown {
    return this.glass.inspectTree()
  }

  registerStyles(
    manifest: Manifest,
    loadStyle?: (path: string) => string,
    schemas?: MiniProgramComponentSchema[],
    options?: { pagePath?: string },
  ): void {
    this.glass.registerStyles(manifest, loadStyle, schemas, options)
  }

  registerPageArtifact(page: PageArtifact): void {
    this.glass.registerPageArtifact(page)
  }

  /** Snapshot the logic tree in the host-neutral render-tree protocol. */
  /** Resolve a render view id back to its logic node. */
  findNodeByViewId(viewId: string): LogicBackendElement | undefined {
    return this.backend.findByViewId(viewId)
  }

  /**
   * Render-facing identity: components keep their shared view id, elements are
   * addressed by a component-scoped locator.
   */
  renderIdentity(node: LogicBackendElement): string {
    if (node.nodeType === 'component') return this.backend.ensureViewId(node)
    return this.backend.locatorOf(node) ?? this.backend.ensureViewId(node)
  }

  /** Ensure a logic node has a stable render view id. */
  ensureViewId(node: LogicBackendElement): string {
    return this.backend.ensureViewId(node)
  }

  /** Page id for a glass element, with a fallback while a page is mounting. */
  pageIdFor(element: unknown): string | undefined {
    const pageId = this.glass.pageIdFor(element)
    if (pageId) return pageId
    return this.activePageId ?? [...this.pageTrees.keys()][0]
  }

  /**
   * Snapshot component data keyed by component host view id. Page data stays
   * on the separate page-data path; this map lets render-side `ins.getData()`
   * answer for custom component instances without a bridge round trip.
   */
  snapshotComponentData(pageId: string): Record<string, Record<string, unknown>> {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) return {}
    const result: Record<string, Record<string, unknown>> = {}
    const visit = (node: LogicBackendElement, skipSelf = false): void => {
      if (node.nodeType === 'component') {
        if (!skipSelf && node.__wxElement) {
          const element = node.__wxElement as unknown as {
            asGeneralComponent?: () => Record<string, unknown>
          }
          const component = element.asGeneralComponent?.() ?? element as unknown as Record<string, unknown>
          const data = component.data
          if (data && typeof data === 'object') {
            result[this.backend.ensureViewId(node)] = data as Record<string, unknown>
          }
        }
        if (node.shadowRoot) for (const child of node.shadowRoot.children) visit(child)
      }
      for (const child of node.children) visit(child)
    }
    visit(pageTree.root, true)
    const tabBarRoot = pageTree.getTabBarRoot()
    if (tabBarRoot) visit(tabBarRoot)
    return result
  }

  /**
   * Record the component data already sent to the render tree, so the next
   * update only carries components whose data changed.
   */
  seedComponentData(pageId: string): void {
    this.pageTrees.get(pageId)?.seedComponentData(this.snapshotComponentData(pageId))
  }

  /**
   * Component-scoped data patch.
   *
   * WeChat ships `setData` as a per-component patch; sending the whole component
   * data map on every structural diff would make each keystroke cross the
   * bridge with every component's data.
   */
  updateComponentData(pageId: string): Record<string, Record<string, unknown>> {
    const pageTree = this.pageTrees.get(pageId)
    return pageTree ? pageTree.updateComponentData(this.snapshotComponentData(pageId)) : {}
  }

  snapshotRenderTree(pageId: string): RenderNode | null {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) throw new Error(`logic page is not mounted: ${pageId}`)
    return this.backend.snapshotRenderTree(pageId, pageTree.root)
  }

  /** Initial snapshot of the independent custom tabBar root. */
  snapshotTabBarTree(pageId: string): RenderNode | null {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) throw new Error(`logic page is not mounted: ${pageId}`)
    const root = pageTree.getTabBarRoot()
    if (!root) return null
    return this.backend.snapshotRenderTree(pageId, root, {
      rootKey: 'tabBar',
      rootMode: 'component',
    })
  }

  /** Diff the current render-node tree against the previous one. */
  updateRenderTree(pageId: string): { snapshot: RenderNode; patches: RenderPatch[] } {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) throw new Error(`logic page is not mounted: ${pageId}`)
    const snapshot = this.snapshotRenderTree(pageId)
    if (!snapshot) throw new Error(`logic page is not mounted: ${pageId}`)
    const previous = pageTree.advanceRenderTree(snapshot)
    return { snapshot, patches: previous ? diffRenderTree(previous, snapshot) : [] }
  }

  /** Diff the independent tabBar root against its previous snapshot. */
  updateTabBarTree(pageId: string): { snapshot: RenderNode | null; patches: RenderPatch[] } {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) throw new Error(`logic page is not mounted: ${pageId}`)
    const snapshot = this.snapshotTabBarTree(pageId)
    if (!snapshot) return { snapshot: null, patches: [] }
    const previous = pageTree.advanceTabBarRenderTree(snapshot)
    return { snapshot, patches: previous ? diffRenderTree(previous, snapshot) : [] }
  }

  /**
   * Query the recorded logic tree. Geometry is zero here (the view layer owns
   * layout); dataset and node identity stay typed and service-side.
   */
  createIntersectionObserverFor(
    component: unknown,
    options: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const firstPageTree = this.pageTrees.values().next().value as PageTreeManager | undefined
    const root = findLogicNodeByElement(component)
      ?? firstPageTree?.root
      ?? this.backend.getRootNode()
    const pageId = this.activePageId ?? firstPageTree?.pageId ?? ''
    this.intersectionObserverCounter += 1
    const observerId = `logic-observer-${this.intersectionObserverCounter}`
    const callbacks = new Map<string, (entry: Record<string, unknown>) => void>()
    const selectorByViewId = new Map<string, string>()
    const thresholds = Array.isArray(options.thresholds)
      ? options.thresholds.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [0]
    const observeAll = options.observeAll === true
    let relativeTo: { type: 'viewport' | 'selector'; selector?: string; margins?: Record<string, number> } = {
      type: 'viewport',
    }
    const sendObserve = (): void => {
      const viewIds: string[] = []
      const rootIds = new Map<string, string>()
      for (const [selector] of callbacks) {
        for (const node of queryLogicNodes(root, selector, observeAll)) {
          const viewId = this.renderIdentity(node)
          viewIds.push(viewId)
          rootIds.set(viewId, selector)
        }
      }
      for (const [viewId, selector] of rootIds) {
        selectorByViewId.set(viewId, selector)
      }
      if (viewIds.length === 0) return
      let rootViewId: string | undefined
      if (relativeTo.type === 'selector' && relativeTo.selector) {
        const [relative] = queryLogicNodes(root, relativeTo.selector, false)
        if (relative) rootViewId = this.renderIdentity(relative)
      }
      this.viewIntersection?.observe({
        observerId,
        pageId,
        viewIds,
        ...(rootViewId ? { rootViewId } : {}),
        thresholds,
        ...(relativeTo.margins ? { rootMargin: relativeTo.margins } : {}),
      })
    }
    const tree = this
    const handle: Record<string, unknown> = {
      relativeTo(selector: string, margins?: Record<string, number>) {
        relativeTo = { type: 'selector', selector: String(selector), margins }
        return handle
      },
      relativeToViewport(margins?: Record<string, number>) {
        relativeTo = { type: 'viewport', margins }
        return handle
      },
      observe(selector: string, callback: (entry: Record<string, unknown>) => void) {
        if (typeof selector !== 'string' || typeof callback !== 'function') return handle
        callbacks.set(selector, callback)
        sendObserve()
        return handle
      },
      unobserve(selector: string) {
        callbacks.delete(selector)
        tree.viewIntersection?.unobserve(observerId, pageId)
        return handle
      },
      disconnect() {
        callbacks.clear()
        tree.intersectionObservers.delete(observerId)
        tree.viewIntersection?.unobserve(observerId, pageId)
        return undefined
      },
    }
    this.intersectionObservers.set(observerId, { callbacks, selectorByViewId, pageId })
    return handle
  }

  handleViewIntersection(
    observerId: string,
    entries: ViewIntersectionEntry[],
  ): void {
    const registration = this.intersectionObservers.get(observerId)
    if (!registration) return
    for (const entry of entries) {
      const selector = registration.selectorByViewId.get(entry.viewId)
      if (!selector) continue
      const callback = registration.callbacks.get(selector)
      if (!callback) continue
      const node = this.backend.findByViewId(entry.viewId)
      const dataset: Record<string, unknown> = {}
      if (node) for (const [key, value] of node.dataset) dataset[key] = value
      callback({
        ...entry,
        id: node?.id ?? '',
        dataset,
      })
    }
  }

  getActiveTouches(): { touches?: unknown[]; changedTouches?: unknown[] } {
    return { touches: this.activeTouches, changedTouches: this.activeChangedTouches }
  }

  /** Page-level `this.createSelectorQuery()`; resolved by the glass page. */
  pageSelectorQuery(pageId: string): Record<string, unknown> {
    return this.createSelectorQueryFor(this.glass.getMountedComponentByPageId(pageId))
  }

  /** Page-level `this.createIntersectionObserver()`. */
  pageIntersectionObserver(
    pageId: string,
    options?: Record<string, unknown>,
  ): Record<string, unknown> {
    return this.createIntersectionObserverFor(
      this.glass.getMountedComponentByPageId(pageId),
      options ?? {},
    )
  }

  /** Page-level `this.animate(selector, keyframes, duration, options)`. */
  pageAnimate(
    pageId: string,
    selector: string,
    keyframes: unknown,
    duration: unknown,
    options?: unknown,
  ): boolean {
    return this.animateFor(this.glass.getMountedComponentByPageId(pageId), selector, keyframes, duration, options)
  }

  /** Page-level `this.clearAnimate(selector)`. */
  pageClearAnimate(
    pageId: string,
    selector: string,
    options?: unknown,
    callback?: unknown,
  ): boolean {
    return this.clearAnimateFor(
      this.glass.getMountedComponentByPageId(pageId),
      selector,
      options,
      callback,
    )
  }

  createSelectorQueryFor(component: unknown): Record<string, unknown> {
    const firstPageTree = this.pageTrees.values().next().value as PageTreeManager | undefined
    const node = findLogicNodeByElement(component)
      ?? firstPageTree?.root
      ?? this.backend.getRootNode()
    const pageId = this.pageIdFor(node)
    return createLogicSelectorQuery(
      this.backend,
      node,
      this.measureView,
      this.queryView
        ? (request) => this.queryView!({ ...request, ...(pageId ? { pageId } : {}) })
        : undefined,
      this.measureLocators,
    )
  }

  /**
   * `this.animate(selector, keyframes, duration, options|callback)`.
   *
   * The logic tree resolves both the target and the optional scroll source;
   * playback and scroll-to-time mapping belong to the render thread.
   */
  animateFor(
    component: unknown,
    selector: string,
    keyframes: unknown,
    duration: unknown,
    options?: unknown,
  ): boolean {
    if (typeof selector !== 'string' || selector.length === 0) return false
    const callback = typeof options === 'function' ? options as () => void : undefined
    const settings = options && typeof options === 'object'
      ? options as Record<string, unknown>
      : {}
    const frames = normalizeAnimationFrames(keyframes)
    if (frames.length === 0) return false
    const pageId = this.animationPageId(component)
    const target = this.animationTarget(component, selector)
    if (!pageId || !target) {
      this.onDiagnostic?.(createRuntimeDiagnostic(
        'warning',
        DIAGNOSTIC_CODES.ANIMATION_TARGET_MISSING,
        `this.animate found no node for selector ${selector}`,
        'service',
        pageId ?? '',
        { selector },
      ))
      return false
    }
    const requested = Number(duration)
    const timing = animationTimingOptions(
      Number.isFinite(requested) ? requested : 400,
      settings,
    )
    let scroll: RenderAnimationRequest['scroll']
    if (typeof settings.scrollSource === 'string' && settings.scrollSource) {
      const source = this.animationTarget(component, settings.scrollSource)
      if (source) {
        const startOffset = Number(settings.startScrollOffset)
        const endOffset = Number(settings.endScrollOffset)
        const timeRange = Number(settings.timeRange)
        scroll = {
          sourceViewId: this.renderIdentity(source),
          startOffset: Number.isFinite(startOffset) ? startOffset : 0,
          endOffset: Number.isFinite(endOffset) ? endOffset : 0,
          ...(Number.isFinite(timeRange) && timeRange > 0 ? { timeRange } : {}),
        }
      }
    }
    this.viewAnimation?.play({
      pageId,
      viewIds: [this.renderIdentity(target)],
      keyframes: frames as Array<Record<string, unknown>>,
      ...timing,
      ...(scroll ? { scroll } : {}),
      // Fallback for targets inside an evaluated shadow tree: the id above is
      // logic-only there, so the render tree resolves the selector in scope.
      selector,
      scopeId: this.animationScopeId(component),
    })
    if (callback && !scroll) {
      const iterations = timing.iterations ?? 1
      const total = timing.duration * iterations + (timing.delay ?? 0)
      setTimeout(() => callback(), Math.max(total, 0))
    }
    return true
  }

  /** `this.clearAnimate(selector[, options][, callback])`. */
  clearAnimateFor(
    component: unknown,
    selector: string,
    options?: unknown,
    callback?: unknown,
  ): boolean {
    if (typeof selector !== 'string' || selector.length === 0) return false
    const settings = typeof options === 'function' ? undefined : options
    const done = typeof options === 'function' ? options : callback
    if (typeof done === 'function') setTimeout(() => done(), 0)
    const pageId = this.animationPageId(component)
    const target = this.animationTarget(component, selector)
    if (!pageId || !target) return false
    const properties = Object.entries(settings && typeof settings === 'object'
      ? settings as Record<string, unknown>
      : {})
      .filter(([, enabled]) => enabled === true)
      .map(([name]) => name)
    this.viewAnimation?.clear({
      pageId,
      viewIds: [this.renderIdentity(target)],
      ...(properties.length > 0 ? { properties } : {}),
      selector,
      scopeId: this.animationScopeId(component),
    })
    return true
  }

  private animationScopeId(component: unknown): string {
    const firstPageTree = this.pageTrees.values().next().value as PageTreeManager | undefined
    const scope = findLogicNodeByElement(component)
      ?? firstPageTree?.root
      ?? this.backend.getRootNode()
    return this.backend.ensureViewId(scope)
  }

  private animationTarget(component: unknown, selector: string): LogicBackendElement | undefined {
    const firstPageTree = this.pageTrees.values().next().value as PageTreeManager | undefined
    const root = findLogicNodeByElement(component)
      ?? firstPageTree?.root
      ?? this.backend.getRootNode()
    const [target] = queryLogicNodes(root, selector, false)
    return target as LogicBackendElement | undefined
  }

  private animationPageId(component: unknown): string | undefined {
    const firstPageTree = this.pageTrees.values().next().value as PageTreeManager | undefined
    return this.glass.pageIdFor(component)
      ?? this.activePageId
      ?? firstPageTree?.pageId
  }

  query(pageId: string, selector: string, all: boolean): QueryNodeSnapshot[] {
    const root = this.pageTrees.get(pageId)?.root ?? this.backend.getRootNode()
    return queryLogicNodes(root, selector, all)
      .map((node) => snapshotLogicNode(this.backend, node))
  }

  /** Dispatch a projected DOM event through the glass-easel logic tree. */
  /**
   * Run a template handler reported by the render thread.
   *
   * The component's shadow tree was evaluated in the render thread, so its DOM
   * listeners have no method table there. The render side reports the handler
   * name and this adapter runs the real method from the normalized definition.
   */
  dispatchTemplateHandler(payload: {
    pageId?: string
    componentId: string
    handler: string
    name: string
    detail?: unknown
    touches?: unknown[]
    changedTouches?: unknown[]
    id?: string
    dataset?: Record<string, unknown>
    currentTarget?: { offsetLeft?: number; offsetTop?: number; offsetWidth?: number; offsetHeight?: number }
  }): boolean {
    const node = this.backend.findByViewId(payload.componentId)
    const element = node?.__wxElement
    if (!element) return false
    const component = (element as unknown as {
      asGeneralComponent?: () => unknown
    }).asGeneralComponent?.() ?? element
    const path = (component as { is?: unknown }).is
    const method = typeof path === 'string'
      ? this.componentDefinitions?.get(path)?.methods.get(payload.handler)
      : undefined
    if (typeof method !== 'function') return false
    const geometry = payload.currentTarget
    const shape = {
      id: payload.id ?? '',
      dataset: payload.dataset ?? {},
      offsetLeft: geometry?.offsetLeft ?? 0,
      offsetTop: geometry?.offsetTop ?? 0,
      offsetWidth: geometry?.offsetWidth ?? 0,
      offsetHeight: geometry?.offsetHeight ?? 0,
    }
    const event = {
      type: payload.name,
      timeStamp: Date.now(),
      detail: payload.detail ?? {},
      target: shape,
      currentTarget: shape,
      touches: payload.touches ?? [],
      changedTouches: payload.changedTouches ?? [],
    }
    const caller = (component as { getMethodCaller?: () => unknown }).getMethodCaller?.()
      ?? component
    method.call(caller, event)
    return true
  }

  dispatchViewEvent(payload: ViewEventPayload): boolean {
    if (payload.touches || payload.changedTouches) {
      this.activeTouches = payload.touches
      this.activeChangedTouches = payload.changedTouches
    }
    const node = this.backend.findByViewId(payload.viewId)
    const element = node?.__wxElement
    if (!element) return false
    // Layout geometry is measured by the render thread; mirror it onto the
    // logic element so `event.currentTarget.offsetLeft` works synchronously.
    // Hosts that only measure the event target fall back to that measurement.
    const geometry = payload.currentTarget ?? payload.target
    if (geometry) applyEventGeometry(element, geometry)
    const native = payload.native ?? {}
    // Hosts normalize built-in event detail (switch/checkbox-group/slider/...);
    // the service must not re-derive it from tag names. The fallback below only
    // covers hosts that still send raw native fields.
    let detail: unknown = payload.detail ?? {}
    if (payload.name.startsWith('touch')) {
      detail = {
        ...(payload.detail && typeof payload.detail === 'object' ? payload.detail as object : {}),
        touches: payload.touches ?? [],
        changedTouches: payload.changedTouches ?? [],
      }
    } else if (payload.detail === undefined && (payload.name === 'input' || payload.name === 'change' || payload.name === 'confirm')) {
      detail = { value: native.value ?? '', cursor: native.cursor }
    } else if (payload.detail === undefined && (payload.name === 'tap' || payload.name === 'longpress')) {
      detail = { x: native.clientX ?? 0, y: native.clientY ?? 0 }
    } else if (payload.detail === undefined && payload.name === 'scroll') {
      detail = {
        scrollTop: native.scrollTop ?? 0,
        scrollLeft: native.scrollLeft ?? 0,
        scrollHeight: native.scrollHeight ?? 0,
        scrollWidth: native.scrollWidth ?? 0,
        deltaX: native.deltaX ?? 0,
        deltaY: native.deltaY ?? 0,
      }
    }
    if (payload.name.startsWith('touch')) {
      const event = {
        type: payload.name,
        detail,
        touches: payload.touches ?? [],
        changedTouches: payload.changedTouches ?? [],
      }
      const methodName = payload.name === 'touchstart'
        ? 'touchStart'
        : payload.name === 'touchmove'
          ? 'touchMove'
          : payload.name === 'touchend'
            ? 'touchEnd'
            : payload.name === 'touchcancel' ? 'touchCancel' : payload.name
      let current: unknown = element
      while (current) {
        const component = (current as { asGeneralComponent?: () => unknown }).asGeneralComponent?.()
        const target = component as Record<string, unknown> | undefined
        const handler = target?.[methodName] ?? target?.[payload.name]
        if (typeof handler === 'function') {
          ;(handler as (event: unknown) => void).call(target, event)
          this.activeTouches = undefined
          this.activeChangedTouches = undefined
          return true
        }
        const ownerShadow = (current as {
          ownerShadowRoot?: { _$host?: unknown }
        }).ownerShadowRoot
        current = (current as { parentNode?: unknown }).parentNode
          ?? ownerShadow?._$host
      }
    }
    try {
      // WXML/WXS handlers read `event.touches` directly (not `detail.touches`),
      // so touch payloads ride along as extra event fields.
      const extraFields = {
        ...(payload.name.startsWith('touch')
          ? {
              touches: payload.touches ?? [],
              changedTouches: payload.changedTouches ?? [],
            }
          : {}),
        ...(payload.wxsHandled ? { [TINY_ENGINE_NAMING.wxsHandledField]: true } : {}),
      }
      element.triggerEvent(payload.name, detail, {
        bubbles: true,
        composed: true,
        ...(extraFields ? { extraFields } : {}),
      })
    } finally {
      this.activeTouches = undefined
      this.activeChangedTouches = undefined
    }
    return true
  }
}

/**
 * WeChat hands handlers a node proxy with `offsetLeft/offsetTop/offsetWidth/
 * offsetHeight`. glass-easel hands them its element, so the measured values are
 * written onto it right before dispatch.
 */
function applyEventGeometry(element: unknown, geometry: RenderEventGeometry): void {
  const target = element as Record<string, unknown>
  target.offsetLeft = geometry.offsetLeft
  target.offsetTop = geometry.offsetTop
  target.offsetWidth = geometry.offsetWidth
  target.offsetHeight = geometry.offsetHeight
}
