import { DIAGNOSTIC_CODES, TINY_ENGINE_NAMING, type Manifest } from '@tiny/manifest'
import type { BridgeConnection } from '@tiny/bridge'
import type { ComponentTree } from './component-tree'
import { cloneJsonSafe } from '../data'
import { createRuntimeStateDiagnostic } from '../diagnostics'
import type { RuntimePageState } from '../diagnostics'
import { MiniProgramPageInstance, type PageLifecycleName } from './page-instance'
import type { MiniProgramPageRegistry } from './page-registry'
import type { ServiceRenderPort } from './render/port'
import type { ServiceTabBar } from './tab-bar'
import {
  findPageArtifact,
  normalizeRoutePath,
  requireActivePage,
  resolveComponentReference,
} from './route'
import type { MiniProgramRouter } from './router'

export type ServicePageStackOptions = {
  manifest: Manifest
  initialPath: string
  registry: MiniProgramPageRegistry
  render: ServiceRenderPort
  componentTree: ComponentTree
  connection: BridgeConnection
  tabBar: ServiceTabBar
  /**
   * Build `this.router` / `this.pageRouter` for one page path. Supplied by the
   * service thread so every page router shares the installed `wx.*` table.
   * Direct users of this class (unit tests, embedded stacks) may omit it; the
   * page then has no router object.
   */
  createRouter?: (basePath: string) => MiniProgramRouter
  /** Host hook: the page is gone, release per-page resources (canvas nodes, …). */
  onPageRelease?: (pageId: string) => void
  maxPageStack?: number
}

/**
 * Service runtime: page instances, the page stack, navigation and app
 * visibility.
 *
 * The stack is render-agnostic: it mutates page instances and then calls the
 * injected {@link ServiceRenderPort} to mount/sync/unmount them. It never reads
 * the logic tree or the tree protocol; `service/render` implements that port.
 */
export class ServicePageStack {
  readonly componentTree: ComponentTree
  readonly pageInstances = new Map<string, MiniProgramPageInstance>()
  private readonly stack: MiniProgramPageInstance[] = []
  private readonly readyPages = new Set<string>()
  private readonly tabPageCache = new Map<string, MiniProgramPageInstance>()
  private active: MiniProgramPageInstance | null = null
  private path: string
  private visible = true
  private lifecycleSequence = 0
  private maxStack: number
  private pageIdCounter = 0
  /**
   * Page side of the `EventChannel` from the `wx.navigateTo` in flight. The API
   * layer binds it right before the host call; the page created for that call
   * consumes it and exposes it through `this.getOpenerEventChannel()`.
   */
  private pendingEventChannel: unknown

  constructor(private readonly options: ServicePageStackOptions) {
    this.componentTree = options.componentTree
    this.path = options.initialPath
    this.maxStack = options.maxPageStack ?? 10
  }

  get activePage(): MiniProgramPageInstance | null {
    return this.active
  }

  get pageStack(): MiniProgramPageInstance[] {
    return this.stack
  }

  get currentPath(): string {
    return this.path
  }

  get appVisible(): boolean {
    return this.visible
  }

  get maxPageStack(): number {
    return this.maxStack
  }

  setInitialPath(path: string): void {
    this.path = path
  }

  setMaxPageStack(limit: number): void {
    if (Number.isInteger(limit) && limit > 0) this.maxStack = limit
  }

  /** Create and show the entry page if the stack is still empty. */
  start(): void {
    if (this.stack.length > 0) return
    const pageArtifact = findPageArtifact(this.options.manifest, this.path)
    const currentPage = this.createPageInstance(this.path, {})
    this.triggerPageLifecycle(currentPage, 'onLoad', [currentPage.query])
    this.triggerPageLifecycle(currentPage, 'onShow')
    if (pageArtifact?.bodyType === 'component') {
      currentPage.triggerComponentLifecycle('attached')
      currentPage.triggerComponentLifecycle('ready')
    }
    this.sendRuntimeState()
  }

  ready(pageId?: string): { status: 'ready'; pageId: string } {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    if (!this.readyPages.has(page.pageId)) {
      this.readyPages.add(page.pageId)
      // Components attached during this render pass missed the page's earlier
      // onShow; deliver their pageLifetimes.show once now.
      if (this.visible) this.options.render.triggerPageLifetime(page.pageId, 'show')
      this.triggerPageLifecycle(page, 'onReady')
    }
    this.sendRuntimeState()
    return { status: 'ready', pageId: page.pageId }
  }

  navigateTo(url: string): Record<string, unknown> {
    // Consume the EventChannel before any validation: a failed navigation must
    // not hand the opener's channel to whichever page opens next.
    const eventChannel = this.takePendingEventChannel()
    const route = this.resolveRoute(url)
    // Resolve the target before hiding the current page: a typo in a URL must
    // not leave the app with an onHide that is never followed by onShow.
    this.assertRouteTarget(route.path, route.query, { allowTabBar: false })
    if (this.stack.length >= this.maxStack) {
      throw new Error(`navigateTo:fail page stack limit ${this.maxStack}`)
    }
    const previousPage = this.active
    if (previousPage) {
      this.triggerPageLifecycle(previousPage, 'onHide')
      previousPage.triggerPageLifetime('hide')
      this.options.render.triggerPageLifetime(previousPage.pageId, 'hide')
    }
    let page: MiniProgramPageInstance
    try {
      page = this.createPageInstance(route.path, route.query, eventChannel)
    } catch (error) {
      if (previousPage) {
        this.active = previousPage
        this.path = previousPage.path
        this.triggerPageLifecycle(previousPage, 'onShow')
        previousPage.triggerPageLifetime('show')
        this.options.render.triggerPageLifetime(previousPage.pageId, 'show')
      }
      throw error
    }
    this.showPage(page)
    this.sendRuntimeState()
    return {
      status: 'navigated',
      errMsg: 'navigateTo:ok',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      initialData: cloneJsonSafe(page.data),
    }
  }

  redirectTo(url: string): Record<string, unknown> {
    const route = this.resolveRoute(url)
    this.assertRouteTarget(route.path, route.query, { allowTabBar: false })
    const previousPage = this.active
    const previousPageId = previousPage?.pageId
    const unloadedPageIds: string[] = []
    if (previousPage) {
      const stackIndex = this.stack.lastIndexOf(previousPage)
      if (stackIndex >= 0) this.stack.splice(stackIndex, 1)
      this.destroyPage(previousPage, unloadedPageIds)
      this.active = this.stack.at(-1) ?? null
    }
    const page = this.createPageInstance(route.path, route.query)
    this.showPage(page)
    this.sendRuntimeState()
    return {
      status: 'redirected',
      errMsg: 'redirectTo:ok',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  }

  reLaunch(url: string): Record<string, unknown> {
    const route = this.resolveRoute(url)
    this.assertRouteTarget(route.path, route.query, { allowTabBar: true })
    const previousPageId = this.active?.pageId
    const unloadedPageIds: string[] = []
    const pages = new Set<MiniProgramPageInstance>([...this.stack].reverse())
    for (const cachedPage of this.tabPageCache.values()) pages.add(cachedPage)
    this.stack.length = 0
    this.active = null
    for (const oldPage of pages) this.destroyPage(oldPage, unloadedPageIds)
    const page = this.createPageInstance(route.path, route.query)
    this.showPage(page)
    this.sendRuntimeState()
    return {
      status: 'relaunched',
      errMsg: 'reLaunch:ok',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  }

  switchTab(payload: { url?: string; index?: number }): Record<string, unknown> {
    const model = this.options.tabBar.requireModel()
    let index = Number.NaN
    if (payload.index !== undefined) {
      index = Number(payload.index)
    } else if (payload.url) {
      const rawPath = normalizeRoutePath((payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''))
      index = model.items.findIndex((item) => item.pagePath === rawPath)
      if (index < 0) {
        const route = this.resolveRoute(payload.url)
        index = model.items.findIndex((item) => item.pagePath === route.path)
      }
    }
    if (!Number.isInteger(index) || index < 0 || index >= model.items.length) {
      throw new Error(`switchTab target is not a tabBar page: ${String(payload.url ?? payload.index)}`)
    }
    const item = model.items[index]!
    if (payload.url) {
      const requested = normalizeRoutePath((payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''))
      if (requested !== item.pagePath) {
        // Relative URLs resolve against the current page; validate the result
        // instead of rejecting a legitimate relative switchTab target.
        const route = this.resolveRoute(payload.url)
        if (route.path !== item.pagePath) {
          throw new Error(`switchTab index ${index} does not match ${payload.url}`)
        }
      }
    }
    const tapEvent = { index, pagePath: item.pagePath, text: item.text }
    if (!this.tabPageCache.has(item.pagePath)) {
      this.assertRouteTarget(item.pagePath, {}, { allowTabBar: true })
    }
    const previousPage = this.active
    if (previousPage && previousPage.path === item.pagePath) {
      this.triggerPageLifecycle(previousPage, 'onTabItemTap', [tapEvent])
      this.sendRuntimeState()
      return {
        status: 'switched',
        errMsg: 'switchTab:ok',
        path: previousPage.path,
        pageId: previousPage.pageId,
        index,
        created: false,
        previousPageId: previousPage.pageId,
        initialData: cloneJsonSafe(previousPage.data),
        unloadedPageIds: [],
      }
    }

    const previousPageId = previousPage?.pageId
    const tabPaths = this.options.tabBar.pagePaths
    const previousTab = previousPage && tabPaths.has(previousPage.path) ? previousPage : null
    const unloadedPageIds: string[] = []
    const oldStack = [...this.stack]
    if (previousTab) {
      this.triggerPageLifecycle(previousTab, 'onHide')
      previousTab.triggerPageLifetime('hide')
      this.options.render.triggerPageLifetime(previousTab.pageId, 'hide')
    }
    this.stack.length = 0
    this.active = null
    for (const oldPage of oldStack) {
      if (oldPage === previousTab) continue
      // Tab pages stay cached between switches; only non-tab pages unload.
      if (tabPaths.has(oldPage.path)) continue
      this.destroyPage(oldPage, unloadedPageIds)
    }

    let target = this.tabPageCache.get(item.pagePath)
    let created = false
    if (!target) {
      target = this.createPageInstance(item.pagePath, {})
      created = true
      this.showPage(target)
    } else {
      this.stack.push(target)
      this.active = target
      this.path = target.path
      this.triggerPageLifecycle(target, 'onShow')
      target.triggerPageLifetime('show')
      this.options.render.triggerPageLifetime(target.pageId, 'show')
    }
    this.triggerPageLifecycle(target, 'onTabItemTap', [tapEvent])
    this.sendRuntimeState()
    return {
      status: 'switched',
      errMsg: 'switchTab:ok',
      path: target.path,
      pageId: target.pageId,
      index,
      created,
      ...(previousPageId ? { previousPageId } : {}),
      initialData: cloneJsonSafe(target.data),
      unloadedPageIds,
    }
  }

  navigateBack(deltaValue?: unknown): Record<string, unknown> {
    const delta = Math.max(1, Number(deltaValue ?? 1))
    if (delta >= this.stack.length) {
      throw new Error('Cannot navigate back beyond the first page')
    }
    const removed = this.stack.splice(-delta)
    const unloadedPageIds: string[] = []
    for (const page of removed.reverse()) {
      // A popped page is destroyed, not hidden. The component page lifetime
      // still ends so components can pause resources before detaching.
      this.destroyPage(page, unloadedPageIds)
    }
    const page = this.stack.at(-1)!
    this.active = page
    this.path = page.path
    this.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    this.options.render.triggerPageLifetime(page.pageId, 'show')
    this.sendRuntimeState()
    return {
      status: 'navigated-back',
      errMsg: 'navigateBack:ok',
      path: page.path,
      pageId: page.pageId,
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  }

  hide(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    if (!this.visible) return { status: 'hidden', pageId: page.pageId }
    this.visible = false
    this.saveExitState(page)
    this.triggerPageLifecycle(page, 'onHide')
    page.triggerPageLifetime('hide')
    this.options.render.triggerPageLifetime(page.pageId, 'hide')
    this.sendRuntimeState()
    return { status: 'hidden', pageId: page.pageId }
  }

  show(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    if (this.visible) return { status: 'shown', pageId: page.pageId }
    this.visible = true
    this.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    this.options.render.triggerPageLifetime(page.pageId, 'show')
    this.sendRuntimeState()
    return { status: 'shown', pageId: page.pageId }
  }

  pullDownRefresh(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    if (!this.visible) return { status: 'ignored', pageId: page.pageId }
    this.triggerPageLifecycle(page, 'onPullDownRefresh')
    return { status: 'refreshed', pageId: page.pageId }
  }

  async share(payload: {
    pageId?: string
    type?: 'appMessage' | 'timeline' | 'favorites'
    from?: 'button' | 'menu'
    target?: unknown
    webViewUrl?: string
  }): Promise<Record<string, unknown>> {
    const page = requireActivePage(this.pageInstances, payload.pageId, this.active)
    const type = payload.type === 'timeline' || payload.type === 'favorites'
      ? payload.type
      : 'appMessage'
    const phase: PageLifecycleName = type === 'timeline'
      ? 'onShareTimeline'
      : type === 'favorites'
        ? 'onAddToFavorites'
        : 'onShareAppMessage'
    const args = type === 'appMessage'
      ? [{
          from: payload.from === 'button' ? 'button' : 'menu',
          ...(payload.target !== undefined ? { target: payload.target } : {}),
          ...(payload.webViewUrl ? { webViewUrl: payload.webViewUrl } : {}),
        }]
      : type === 'favorites'
        ? [{ ...(payload.webViewUrl ? { webViewUrl: payload.webViewUrl } : {}) }]
        : []
    const result = this.triggerPageLifecycle(page, phase, args)
    // onShareAppMessage may return `{ promise }` or a Promise; resolve it before
    // crossing the bridge so the host receives the final share object.
    const resolved = result && typeof (result as PromiseLike<unknown>).then === 'function'
      ? await (result as PromiseLike<unknown>)
      : result
    return {
      status: 'shared',
      type,
      handled: resolved !== undefined,
      share: cloneJsonSafe(resolved ?? null),
    }
  }

  saveExitStateOf(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    const state = this.saveExitState(page)
    return { status: 'saved', state: cloneJsonSafe(state ?? null) }
  }

  unload(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(this.pageInstances, pageId, this.active)
    const stackIndex = this.stack.indexOf(page)
    if (stackIndex >= 0) this.stack.splice(stackIndex, 1)
    this.destroyPage(page)
    if (this.active === page) this.active = this.stack.at(-1) ?? null
    if (this.active) this.path = this.active.path
    this.sendRuntimeState()
    return { status: 'unloaded', pageId: page.pageId }
  }

  resize(windowWidth: number, windowHeight: number): void {
    if (this.active) {
      this.triggerPageLifecycle(this.active, 'onResize', [{
        size: { windowWidth, windowHeight },
      }])
    }
    this.sendRuntimeState()
  }

  /** Host scroll/reachBottom/pullDownRefresh events are page-scoped. */
  pageEvent(
    event: 'pullDownRefresh' | 'scroll' | 'reachBottom',
    pageId?: string,
    payload?: { scrollTop?: number; scrollLeft?: number },
  ): void {
    const page = pageId ? this.pageInstances.get(pageId) : this.active
    if (!page || !this.visible || page !== this.active) return
    if (event === 'scroll') {
      this.triggerPageLifecycle(page, 'onPageScroll', [{
        scrollTop: Number(payload?.scrollTop ?? 0),
        scrollLeft: Number(payload?.scrollLeft ?? 0),
      }], undefined, false)
      return
    }
    if (event === 'reachBottom') {
      this.triggerPageLifecycle(page, 'onReachBottom')
      return
    }
    this.triggerPageLifecycle(page, 'onPullDownRefresh')
  }

  sendRuntimeState(): void {
    const pageStackIds = this.stack.map((page) => page.pageId)
    const pages: RuntimePageState[] = this.stack.map((page) => ({
      pageId: page.pageId,
      path: page.path,
      visible: this.visible && page === this.active,
    }))
    const livePageIds = new Set(pageStackIds)
    for (const cachedPage of this.tabPageCache.values()) {
      if (livePageIds.has(cachedPage.pageId)) continue
      pages.push({
        pageId: cachedPage.pageId,
        path: cachedPage.path,
        visible: false,
        cached: true,
      })
    }
    const tabBar = this.options.tabBar.state(this.active?.path)
    this.options.connection.sendDiagnostic('state', createRuntimeStateDiagnostic(
      'service',
      {
        pageStack: pageStackIds,
        currentPage: this.active?.path ?? '',
        pages,
        appVisible: this.visible,
        ...(tabBar ? { tabBar } : {}),
        maxPageStack: this.maxStack,
        transport: 'connected',
      },
      this.active?.pageId,
    ))
  }

  /** Bind the page side of the next `navigateTo` EventChannel. */
  setNextPageEventChannel(channel: unknown): () => void {
    this.pendingEventChannel = channel
    return () => {
      if (this.pendingEventChannel === channel) this.pendingEventChannel = undefined
    }
  }

  private takePendingEventChannel(): unknown {
    const channel = this.pendingEventChannel
    this.pendingEventChannel = undefined
    return channel
  }

  private createPageInstance(
    path: string,
    query: Record<string, string> = {},
    eventChannel?: unknown,
  ): MiniProgramPageInstance {
    const { registry, render } = this.options
    const pageArtifact = findPageArtifact(this.options.manifest, path)
    const isComponentPage = pageArtifact?.bodyType === 'component'
    const definition = registry.pages.get(path) ?? registry.components.get(path)
    if (!definition) throw new Error(`page is not registered: ${path}`)
    const componentDefinition = isComponentPage
      ? registry.normalizedComponents.get(path)
      : undefined
    this.pageIdCounter += 1
    const pageId = `${TINY_ENGINE_NAMING.pageIdPrefix}${this.pageIdCounter}`
    this.componentTree.ensurePage(pageId, path)
    const page = new MiniProgramPageInstance({
      pageId,
      path,
      options: definition,
      query,
      ...(componentDefinition ? { definition: componentDefinition } : {}),
      onDataPatch: (id, patch) => {
        render.syncPageData(id, patch)
      },
      afterRender: (id, callback) => render.completeAfterRender(id, callback),
      onDiagnostic: (code, message, details) => this.options.connection.sendDiagnostic('warn', {
        code,
        message,
        details,
      }, pageId),
      logic: {
        selectComponents: (selector, all) => render.selectComponents(pageId, selector, all),
        relationNodes: (relationKey) => render.relationNodes(pageId, relationKey),
        selectorQuery: () => render.pageSelectorQuery(pageId),
        intersectionObserver: (observerOptions) => (
          render.pageIntersectionObserver(pageId, observerOptions)
        ),
        animation: {
          animate: (selector, keyframes, duration, animateOptions) => (
            render.pageAnimate(pageId, selector, keyframes, duration, animateOptions)
          ),
          clear: (selector, clearOptions, callback) => (
            render.pageClearAnimate(pageId, selector, clearOptions, callback)
          ),
        },
      },
      runtime: {
        ...(this.options.createRouter ? { router: this.options.createRouter(path) } : {}),
        ...(eventChannel !== undefined ? { eventChannel } : {}),
      },
    })
    if (componentDefinition) page.triggerComponentLifecycle('created')
    this.pageInstances.set(page.pageId, page)
    this.stack.push(page)
    this.active = page
    if (this.options.tabBar.pagePaths.has(path)) this.tabPageCache.set(path, page)
    render.mountPage(page)
    return page
  }

  /** onLoad → onShow → component attached/ready for a freshly created page. */
  private showPage(page: MiniProgramPageInstance): void {
    this.triggerPageLifecycle(page, 'onLoad', [page.query])
    this.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    if (findPageArtifact(this.options.manifest, page.path)?.bodyType === 'component') {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    this.path = page.path
  }

  private destroyPage(page: MiniProgramPageInstance, unloadedPageIds?: string[]): void {
    page.triggerPageLifetime('hide')
    this.options.render.triggerPageLifetime(page.pageId, 'hide')
    this.triggerPageLifecycle(page, 'onUnload')
    if (page.getComponentDefinition()) page.triggerComponentLifecycle('detached')
    this.options.onPageRelease?.(page.pageId)
    this.componentTree.removePage(page.pageId)
    this.options.render.unmountPage(page.pageId)
    this.pageInstances.delete(page.pageId)
    this.readyPages.delete(page.pageId)
    this.tabPageCache.delete(page.path)
    unloadedPageIds?.push(page.pageId)
  }

  private assertRouteTarget(
    path: string,
    query: Record<string, string>,
    optionsForTarget: { allowTabBar: boolean; isEntryPage?: boolean } = { allowTabBar: true },
  ): void {
    const { registry } = this.options
    if (!findPageArtifact(this.options.manifest, path)) {
      registry.reportPageNotFound({
        path,
        query,
        isEntryPage: optionsForTarget.isEntryPage === true,
      })
      throw new Error(`page is not declared: ${path}`)
    }
    if (!registry.pages.get(path) && !registry.components.get(path)) {
      registry.reportPageNotFound({
        path,
        query,
        isEntryPage: optionsForTarget.isEntryPage === true,
      })
      throw new Error(`page is not registered: ${path}`)
    }
    if (!optionsForTarget.allowTabBar && this.options.tabBar.pagePaths.has(path)) {
      throw new Error(`can not navigateTo a tabbar page: ${path}`)
    }
  }

  private resolveRoute(url: string): { path: string; query: Record<string, string> } {
    const [rawPath, queryString] = url.split('?', 2)
    const path = rawPath!.startsWith('/')
      ? normalizeRoutePath(rawPath!.slice(1))
      : resolveComponentReference(this.path, rawPath!)
    const query = Object.fromEntries(new URLSearchParams(queryString ?? ''))
    return { path, query }
  }

  private saveExitState(page: MiniProgramPageInstance): unknown {
    const state = this.triggerPageLifecycle(page, 'onSaveExitState')
    if (state !== undefined) page.savedExitState = cloneJsonSafe(state)
    return state
  }

  private triggerPageLifecycle(
    page: MiniProgramPageInstance,
    phase: PageLifecycleName,
    args: unknown[] = [],
    extra?: Record<string, unknown>,
    emitDiagnostic = true,
  ): unknown {
    const result = page.triggerLifecycle(phase, args)
    if (emitDiagnostic) this.emitPageLifecycle(page, phase, extra)
    return result
  }

  private emitPageLifecycle(
    page: MiniProgramPageInstance,
    phase: string,
    extra?: Record<string, unknown>,
  ): void {
    this.lifecycleSequence += 1
    const hiddenPhase = phase === 'onLoad' || phase === 'onHide' || phase === 'onUnload'
    this.options.connection.sendDiagnostic('log', {
      code: DIAGNOSTIC_CODES.PAGE_LIFECYCLE,
      message: `${phase} ${page.path}`,
      details: {
        pageId: page.pageId,
        path: page.path,
        phase,
        sequence: this.lifecycleSequence,
        visible: !hiddenPhase && this.visible && page === this.active,
        ...(extra ? { extra } : {}),
      },
    }, page.pageId)
  }
}
