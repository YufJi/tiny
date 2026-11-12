import { DIAGNOSTIC_CODES, TINY_ENGINE_NAMING, type Manifest } from '@tiny/manifest'
import type { BridgeConnection } from '@tiny/bridge'
import { cloneJsonSafe } from '../../shared/data'
import { MiniProgramPageInstance, type PageLifecycleName } from './instance'
import type { MiniProgramPageRegistry } from './registry'
import type { ServiceRenderPort } from '../render-bridge/port'
import type { ServiceTabBar } from '../app/tab-bar'
import { requireActivePage } from './route'
import type { MiniProgramRouter } from './router'
import {
  PageNavigator,
  type PageNavigatorHost,
} from './navigation'
import {
  publishRuntimeState,
  type PageStateSnapshot,
} from './state'

export type { PageStateSnapshot } from './state'

export type ServicePageStackOptions = {
  manifest: Manifest
  initialPath: string
  registry: MiniProgramPageRegistry
  render: ServiceRenderPort
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
  /** State loaded for the first page created after a cold launch. */
  initialExitState?: unknown
}

/**
 * Service runtime page stack.
 *
 * This class owns page instances, stack state, lifecycle delivery and runtime
 * state projection. Navigation commands live in `navigation.ts`; the stack
 * remains render-agnostic and talks to the logic tree only through
 * {@link ServiceRenderPort}.
 */
export class ServicePageStack implements PageNavigatorHost {
  readonly options: ServicePageStackOptions
  readonly pageInstances = new Map<string, MiniProgramPageInstance>()
  private readonly stack: MiniProgramPageInstance[] = []
  private readonly readyPages = new Set<string>()
  private readonly tabPages = new Map<string, MiniProgramPageInstance>()
  private active: MiniProgramPageInstance | null = null
  private path: string
  private visible = true
  private lifecycleSequence = 0
  private maxStack: number
  private pageIdCounter = 0
  private pendingExitState: unknown
  private hasPendingExitState: boolean
  /**
   * Page side of the `EventChannel` from the `wx.navigateTo` in flight. The API
   * layer binds it right before the host call; the page created for that call
   * consumes it and exposes it through `this.getOpenerEventChannel()`.
   */
  private pendingEventChannel: unknown
  private readonly pageNavigator: PageNavigator

  constructor(options: ServicePageStackOptions) {
    this.options = options
    this.path = options.initialPath
    this.maxStack = options.maxPageStack ?? 10
    this.pendingExitState = cloneJsonSafe(options.initialExitState)
    this.hasPendingExitState = Object.prototype.hasOwnProperty.call(
      options,
      'initialExitState',
    )
    this.pageNavigator = new PageNavigator(this)
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

  get tabPageCache(): Map<string, MiniProgramPageInstance> {
    return this.tabPages
  }

  setActivePage(page: MiniProgramPageInstance | null): void {
    this.active = page
  }

  setCurrentPath(path: string): void {
    this.path = path
  }

  setAppVisible(visible: boolean): void {
    this.visible = visible
  }

  setInitialPath(path: string): void {
    this.path = path
  }

  setMaxPageStack(limit: number): void {
    if (Number.isInteger(limit) && limit > 0) this.maxStack = limit
  }

  /** Provide the state consumed by the next page created for this launch. */
  setInitialExitState(exitState: unknown): void {
    this.pendingExitState = cloneJsonSafe(exitState)
    this.hasPendingExitState = true
  }

  /** Create and show the entry page if the stack is still empty. */
  start(): void {
    if (this.stack.length > 0) return
    const currentPage = this.createPageInstance(this.path, {})
    this.triggerPageLifecycle(currentPage, 'onLoad', [currentPage.query])
    this.triggerPageLifecycle(currentPage, 'onShow')
    if (this.options.registry.isComponentPage(this.path)) {
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
    return this.pageNavigator.navigateTo(url)
  }

  redirectTo(url: string): Record<string, unknown> {
    return this.pageNavigator.redirectTo(url)
  }

  reLaunch(url: string): Record<string, unknown> {
    return this.pageNavigator.reLaunch(url)
  }

  switchTab(payload: { url?: string; index?: number }): Record<string, unknown> {
    return this.pageNavigator.switchTab(payload)
  }

  navigateBack(deltaValue?: unknown): Record<string, unknown> {
    return this.pageNavigator.navigateBack(deltaValue)
  }

  hide(pageId?: string): Record<string, unknown> {
    return this.pageNavigator.hide(pageId)
  }

  show(pageId?: string): Record<string, unknown> {
    return this.pageNavigator.show(pageId)
  }

  pullDownRefresh(pageId?: string): Record<string, unknown> {
    return this.pageNavigator.pullDownRefresh(pageId)
  }

  share(payload: {
    pageId?: string
    type?: 'appMessage' | 'timeline' | 'favorites'
    from?: 'button' | 'menu'
    target?: unknown
    webViewUrl?: string
  }): Promise<Record<string, unknown>> {
    return this.pageNavigator.share(payload)
  }

  saveExitStateOf(pageId?: string): Record<string, unknown> {
    return this.pageNavigator.saveExitStateOf(pageId)
  }

  snapshotState(): PageStateSnapshot[] {
    return this.pageNavigator.snapshotState()
  }

  restoreState(
    pageId: string,
    data: Record<string, unknown>,
    savedExitState?: unknown,
    exitState?: unknown,
  ): Record<string, unknown> {
    return this.pageNavigator.restoreState(pageId, data, savedExitState, exitState)
  }

  unload(pageId?: string): Record<string, unknown> {
    return this.pageNavigator.unload(pageId)
  }

  resize(windowWidth: number, windowHeight: number): void {
    this.pageNavigator.resize(windowWidth, windowHeight)
  }

  pageEvent(
    event: 'pullDownRefresh' | 'scroll' | 'reachBottom',
    pageId?: string,
    payload?: { scrollTop?: number; scrollLeft?: number },
  ): void {
    this.pageNavigator.pageEvent(event, pageId, payload)
  }

  sendRuntimeState(): void {
    publishRuntimeState({
      stack: this.stack,
      tabPages: this.tabPages,
      active: this.active,
      visible: this.visible,
      maxStack: this.maxStack,
      tabBar: this.options.tabBar,
      connection: this.options.connection,
    })
  }

  /** Bind the page side of the next `navigateTo` EventChannel. */
  setNextPageEventChannel(channel: unknown): () => void {
    this.pendingEventChannel = channel
    return () => {
      if (this.pendingEventChannel === channel) this.pendingEventChannel = undefined
    }
  }

  takePendingEventChannel(): unknown {
    const channel = this.pendingEventChannel
    this.pendingEventChannel = undefined
    return channel
  }

  createPageInstance(
    path: string,
    query: Record<string, string> = {},
    eventChannel?: unknown,
  ): MiniProgramPageInstance {
    const { registry, render } = this.options
    const isComponentPage = registry.isComponentPage(path)
    const definition = registry.pages.get(path) ?? registry.components.get(path)
    if (!definition) throw new Error(`page is not registered: ${path}`)
    const componentDefinition = isComponentPage
      ? registry.normalizedComponents.get(path)
      : undefined
    this.pageIdCounter += 1
    const pageId = `${TINY_ENGINE_NAMING.pageIdPrefix}${this.pageIdCounter}`
    const page = new MiniProgramPageInstance({
      pageId,
      path,
      options: definition,
      query,
      ...(this.hasPendingExitState ? { exitState: this.pendingExitState } : {}),
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
        onTabBarReady: (callback) => render.onTabBarReady?.(pageId, callback),
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
    this.pendingExitState = undefined
    this.hasPendingExitState = false
    if (componentDefinition) page.triggerComponentLifecycle('created')
    this.pageInstances.set(page.pageId, page)
    this.stack.push(page)
    this.active = page
    if (this.options.tabBar.pagePaths.has(path)) this.tabPages.set(path, page)
    render.mountPage(page)
    return page
  }

  /** onLoad → onShow → component attached/ready for a freshly created page. */
  showPage(page: MiniProgramPageInstance): void {
    this.triggerPageLifecycle(page, 'onLoad', [page.query])
    this.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    if (this.options.registry.isComponentPage(page.path)) {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    this.path = page.path
  }

  destroyPage(
    page: MiniProgramPageInstance,
    unloadedPageIds?: string[],
  ): void {
    page.triggerPageLifetime('hide')
    this.options.render.triggerPageLifetime(page.pageId, 'hide')
    this.triggerPageLifecycle(page, 'onUnload')
    if (page.getComponentDefinition()) page.triggerComponentLifecycle('detached')
    this.options.onPageRelease?.(page.pageId)
    this.options.render.unmountPage(page.pageId)
    this.pageInstances.delete(page.pageId)
    this.readyPages.delete(page.pageId)
    this.tabPages.delete(page.path)
    unloadedPageIds?.push(page.pageId)
  }

  triggerPageLifecycle(
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
