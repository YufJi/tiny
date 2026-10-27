import { DIAGNOSTIC_CODES, type Manifest, type PageArtifact } from '@tiny/manifest'
import type { RenderNode, RenderPatch } from '../tree/protocol'
import { diffRenderTree } from '../tree/diff'
import * as glassEasel from 'glass-easel'
import type { MiniProgramComponentSchema, QueryNodeSnapshot, TemplateRegistry } from '../types'
import type { NormalizedComponentDefinition } from '../component-definition'
import { GlassEaselRuntimeAdapter } from '../glass-easel-adapter'
import {
  LogicBackendContext,
  LogicBackendElement,
  findLogicNodeByElement,
  type LogicStyleSheetRole,
} from './backend'
import { createRuntimeDiagnostic } from '../diagnostics'
import { diffView } from './patch'
import { createLogicSelectorQuery, queryLogicNodes, snapshotLogicNode } from './query'
import type {
  ViewEventPayload,
  ViewIntersectionEntry,
  ViewIntersectionRequest,
  ViewRect,
  ViewSnapshot,
} from './protocol'

export type LogicTreeAdapterOptions = {
  manifest: Manifest
  templates: TemplateRegistry
  pageOptions?: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  componentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  measureView?: (viewIds: string[]) => Promise<Record<string, ViewRect>>
  loadStyle?: (outputPath: string) => string
  onDataChange?: (pageId: string) => void
  onDiagnostic?: (diagnostic: import('../diagnostics').RuntimeDiagnostic) => void
  viewIntersection?: {
    observe: (request: ViewIntersectionRequest & { pageId: string }) => void
    unobserve: (observerId: string, pageId: string) => void
  }
}

/**
 * Service-side logic tree: glass-easel runs against a recording backend and
 * exposes the resulting view description. This is the future source of truth
 * for data, properties and typed dataset values.
 */
export class LogicTreeAdapter {
  readonly backend: LogicBackendContext
  readonly glass: GlassEaselRuntimeAdapter
  private readonly revisions = new Map<string, number>()
  private readonly typedDatasets = new Map<string, Record<string, unknown>>()
  private readonly pageRoots = new Map<string, LogicBackendElement>()
  private activePageId?: string
  private readonly pagePaths = new Map<string, string>()
  private readonly pageStyleEntries = new Map<string, Array<{
    path: string
    content: string
    role: LogicStyleSheetRole
  }>>()
  private activeTouches: unknown[] | undefined
  private activeChangedTouches: unknown[] | undefined
  private readonly lastSnapshots = new Map<string, ViewSnapshot>()
  private readonly lastRenderTrees = new Map<string, RenderNode>()
  private readonly manifest: Manifest
  private readonly loadStyle: (outputPath: string) => string
  private componentSchemas: MiniProgramComponentSchema[] = []
  private readonly styledPages = new Set<string>()
  private readonly measureView?: (viewIds: string[]) => Promise<Record<string, ViewRect>>
  private readonly onDiagnostic?: LogicTreeAdapterOptions['onDiagnostic']
  private readonly reportedPages = new Set<string>()
  private readonly viewIntersection?: LogicTreeAdapterOptions['viewIntersection']
  private readonly intersectionObservers = new Map<string, {
    callbacks: Map<string, (entry: Record<string, unknown>) => void>
    selectorByViewId: Map<string, string>
    pageId: string
  }>()
  private intersectionObserverCounter = 0

  constructor(options: LogicTreeAdapterOptions) {
    this.backend = new LogicBackendContext()
    this.manifest = options.manifest
    this.loadStyle = options.loadStyle ?? (() => '')
    this.measureView = options.measureView
    this.viewIntersection = options.viewIntersection
    this.onDiagnostic = options.onDiagnostic
    this.glass = new GlassEaselRuntimeAdapter({
      backend: this.backend as unknown as glassEasel.GeneralBackendContext,
      manifest: options.manifest,
      templates: options.templates,
      logicPageOptions: options.pageOptions,
      logicComponentDefinitions: options.componentDefinitions,
      logicQueryFactory: (component) => this.createSelectorQueryFor(component),
      onLogicDataChange: options.onDataChange,
      logicTouchState: () => this.getActiveTouches(),
      logicIntersectionFactory: (component, observerOptions) => (
        this.createIntersectionObserverFor(component, observerOptions)
      ),
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
    this.componentSchemas = schemas
    this.glass.registerComponentSchemas(schemas)
  }

  mountPage(
    path: string,
    data: Record<string, unknown> = {},
    pageId: string,
  ): ViewSnapshot {
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
    this.pagePaths.set(pageId, path)
    const page = this.glass.mountPage(path, data, pageId)
    this.reportMissingComponents(path)
    if (styleStart !== undefined) {
      this.pageStyleEntries.set(path, this.backend.styleEntriesSince(styleStart))
    }
    const backendElement = (page as unknown as { getBackendElement?: () => unknown })
      .getBackendElement?.() as LogicBackendElement | undefined
    if (backendElement) this.pageRoots.set(pageId, backendElement)
    const snapshot = this.snapshot(pageId)
    const renderTree = this.snapshotRenderTree(pageId)
    if (renderTree) this.lastRenderTrees.set(pageId, renderTree)
    return snapshot
  }

  applyPageData(pageId: string, patch: Record<string, unknown>): void {
    const page = this.glass.getMountedComponentByPageId(pageId)
    if (!page) throw new Error(`logic page is not mounted: ${pageId}`)
    page.setData(patch)
  }

  setPageData(pageId: string, patch: Record<string, unknown>): ViewSnapshot {
    this.applyPageData(pageId, patch)
    return this.snapshot(pageId)
  }

  snapshot(pageId: string): ViewSnapshot {
    const snapshot = this.buildSnapshot(pageId)
    this.lastSnapshots.set(pageId, snapshot)
    return snapshot
  }

  /** Runtime-registered stylesheets (shared/page scopes) for the render tree. */
  pagePathFor(pageId: string): string {
    return this.pagePaths.get(pageId) ?? ''
  }

  private pageStyles(pageId?: string): Array<{
    path: string
    content: string
    role: LogicStyleSheetRole
  }> {
    const path = pageId ? this.pagePaths.get(pageId) : undefined
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
    const root = this.pageRoots.get(pageId)
    if (!root) return []
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
  snapshotRenderTree(pageId: string): RenderNode | null {
    const page = this.glass.getMountedComponentByPageId(pageId)
    if (!page) throw new Error(`logic page is not mounted: ${pageId}`)
    const backendElement = (page as unknown as { getBackendElement?: () => unknown })
      .getBackendElement?.() as LogicBackendElement | undefined
    return this.backend.snapshotRenderTree(pageId, backendElement)
  }

  /** Diff the current render-node tree against the previous one. */
  updateRenderTree(pageId: string): { snapshot: RenderNode; patches: RenderPatch[] } {
    const snapshot = this.snapshotRenderTree(pageId)
    if (!snapshot) throw new Error(`logic page is not mounted: ${pageId}`)
    const previous = this.lastRenderTrees.get(pageId)
    this.lastRenderTrees.set(pageId, snapshot)
    return { snapshot, patches: previous ? diffRenderTree(previous, snapshot) : [] }
  }

  /** Build the next snapshot and diff it against the last one. */
  update(pageId: string): { snapshot: ViewSnapshot; patches: ReturnType<typeof diffView> } {
    const snapshot = this.buildSnapshot(pageId)
    const previous = this.lastSnapshots.get(pageId)
    this.lastSnapshots.set(pageId, snapshot)
    return {
      snapshot,
      patches: previous ? diffView(previous.root, snapshot.root) : [],
    }
  }

  private buildSnapshot(pageId: string): ViewSnapshot {
    const page = this.glass.getMountedComponentByPageId(pageId)
    if (!page) throw new Error(`logic page is not mounted: ${pageId}`)
    const backendElement = (page as unknown as { getBackendElement?: () => unknown })
      .getBackendElement?.() as LogicBackendElement | undefined
    const { snapshot, datasets } = this.backend.snapshot(pageId, backendElement)
    const revision = (this.revisions.get(pageId) ?? 0) + 1
    this.revisions.set(pageId, revision)
    snapshot.revision = revision
    for (const [viewId, dataset] of datasets) this.typedDatasets.set(viewId, dataset)
    return snapshot
  }

  /** Typed dataset of a view node (numbers, dates and objects stay intact). */
  getTypedDataset(viewId: string): Record<string, unknown> | undefined {
    return this.typedDatasets.get(viewId)
  }

  /**
   * Query the recorded logic tree. Geometry is zero here (the view layer owns
   * layout); dataset and node identity stay typed and service-side.
   */
  createIntersectionObserverFor(
    component: unknown,
    options: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const root = findLogicNodeByElement(component)
      ?? [...this.pageRoots.values()][0]
      ?? this.backend.getRootNode()
    const pageId = this.activePageId ?? [...this.pageRoots.keys()][0] ?? ''
    this.intersectionObserverCounter += 1
    const observerId = `logic-observer-${this.intersectionObserverCounter}`
    const callbacks = new Map<string, (entry: Record<string, unknown>) => void>()
    const selectorByViewId = new Map<string, string>()
    const thresholds = Array.isArray(options.thresholds)
      ? options.thresholds.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [0]
    let relativeTo: { type: 'viewport' | 'selector'; selector?: string; margins?: Record<string, number> } = {
      type: 'viewport',
    }
    const sendObserve = (): void => {
      const viewIds: string[] = []
      const rootIds = new Map<string, string>()
      for (const [selector] of callbacks) {
        for (const node of queryLogicNodes(root, selector, true)) {
          const viewId = this.backend.ensureViewId(node)
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
        if (relative) rootViewId = this.backend.ensureViewId(relative)
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

  createSelectorQueryFor(component: unknown): Record<string, unknown> {
    const node = findLogicNodeByElement(component)
      ?? [...this.pageRoots.values()][0]
      ?? this.backend.getRootNode()
    return createLogicSelectorQuery(this.backend, node, this.measureView)
  }

  query(pageId: string, selector: string, all: boolean): QueryNodeSnapshot[] {
    const root = this.pageRoots.get(pageId) ?? this.backend.getRootNode()
    return queryLogicNodes(root, selector, all)
      .map((node) => snapshotLogicNode(this.backend, node))
  }

  /** Dispatch a projected DOM event through the glass-easel logic tree. */
  dispatchViewEvent(payload: ViewEventPayload): boolean {
    if (payload.touches || payload.changedTouches) {
      this.activeTouches = payload.touches
      this.activeChangedTouches = payload.changedTouches
    }
    const node = this.backend.findByViewId(payload.viewId)
    const element = node?.__wxElement
    if (!element) return false
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
      element.triggerEvent(payload.name, detail, { bubbles: true, composed: true })
    } finally {
      this.activeTouches = undefined
      this.activeChangedTouches = undefined
    }
    return true
  }
}
