import { cloneJsonSafe } from '../../shared/data'
import { findPageArtifact, normalizeRoutePath, requireActivePage, resolveComponentReference } from './route'
import type { MiniProgramPageInstance, PageLifecycleName } from './instance'
import {
  restorePageState,
  snapshotPageStack,
  type PageStateSnapshot,
} from './state'
import type { ServicePageStackOptions } from './stack'

export type { PageStateSnapshot } from './state'

/**
 * The mutable page-stack surface the navigation commands need.
 *
 * Keeping this explicit prevents `PageNavigator` from reaching into the stack's
 * lifecycle bookkeeping or render bridge.
 */
export type PageNavigatorHost = {
  readonly options: ServicePageStackOptions
  readonly pageInstances: Map<string, MiniProgramPageInstance>
  readonly pageStack: MiniProgramPageInstance[]
  readonly activePage: MiniProgramPageInstance | null
  readonly currentPath: string
  readonly appVisible: boolean
  readonly maxPageStack: number
  readonly tabPageCache: Map<string, MiniProgramPageInstance>
  setActivePage(page: MiniProgramPageInstance | null): void
  setCurrentPath(path: string): void
  setAppVisible(visible: boolean): void
  createPageInstance(
    path: string,
    query?: Record<string, string>,
    eventChannel?: unknown,
  ): MiniProgramPageInstance
  showPage(page: MiniProgramPageInstance): void
  destroyPage(page: MiniProgramPageInstance, unloadedPageIds?: string[]): void
  triggerPageLifecycle(
    page: MiniProgramPageInstance,
    phase: PageLifecycleName,
    args?: unknown[],
    extra?: Record<string, unknown>,
    emitDiagnostic?: boolean,
  ): unknown
  sendRuntimeState(): void
  takePendingEventChannel(): unknown
}

export class PageNavigator {
  constructor(private readonly host: PageNavigatorHost) {}

  navigateTo(url: string): Record<string, unknown> {
    // Consume the EventChannel before any validation: a failed navigation must
    // not hand the opener's channel to whichever page opens next.
    const eventChannel = this.host.takePendingEventChannel()
    const route = this.resolveRoute(url)
    // Resolve the target before hiding the current page: a typo in a URL must
    // not leave the app with an onHide that is never followed by onShow.
    this.assertRouteTarget(route.path, route.query, { allowTabBar: false })
    if (this.host.pageStack.length >= this.host.maxPageStack) {
      throw new Error(`navigateTo:fail page stack limit ${this.host.maxPageStack}`)
    }
    const previousPage = this.host.activePage
    if (previousPage) {
      this.host.triggerPageLifecycle(previousPage, 'onHide')
      previousPage.triggerPageLifetime('hide')
      this.host.options.render.triggerPageLifetime(previousPage.pageId, 'hide')
    }
    let page: MiniProgramPageInstance
    try {
      page = this.host.createPageInstance(route.path, route.query, eventChannel)
    } catch (error) {
      if (previousPage) {
        this.host.setActivePage(previousPage)
        this.host.setCurrentPath(previousPage.path)
        this.host.triggerPageLifecycle(previousPage, 'onShow')
        previousPage.triggerPageLifetime('show')
        this.host.options.render.triggerPageLifetime(previousPage.pageId, 'show')
      }
      throw error
    }
    this.host.showPage(page)
    this.host.sendRuntimeState()
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
    const previousPage = this.host.activePage
    const previousPageId = previousPage?.pageId
    const unloadedPageIds: string[] = []
    if (previousPage) {
      const stackIndex = this.host.pageStack.lastIndexOf(previousPage)
      if (stackIndex >= 0) this.host.pageStack.splice(stackIndex, 1)
      this.host.destroyPage(previousPage, unloadedPageIds)
      this.host.setActivePage(this.host.pageStack.at(-1) ?? null)
    }
    const page = this.host.createPageInstance(route.path, route.query)
    this.host.showPage(page)
    this.host.sendRuntimeState()
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
    const previousPageId = this.host.activePage?.pageId
    const unloadedPageIds: string[] = []
    const pages = new Set<MiniProgramPageInstance>([...this.host.pageStack].reverse())
    for (const cachedPage of this.host.tabPageCache.values()) pages.add(cachedPage)
    this.host.pageStack.length = 0
    this.host.setActivePage(null)
    for (const oldPage of pages) this.host.destroyPage(oldPage, unloadedPageIds)
    const page = this.host.createPageInstance(route.path, route.query)
    this.host.showPage(page)
    this.host.sendRuntimeState()
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
    const model = this.host.options.tabBar.requireModel()
    let index = Number.NaN
    if (payload.index !== undefined) {
      index = Number(payload.index)
    } else if (payload.url) {
      const rawPath = normalizeRoutePath(
        (payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''),
      )
      index = model.items.findIndex((item) => item.pagePath === rawPath)
      if (index < 0) {
        const route = this.resolveRoute(payload.url)
        index = model.items.findIndex((item) => item.pagePath === route.path)
      }
    }
    if (!Number.isInteger(index) || index < 0 || index >= model.items.length) {
      throw new Error(
        `switchTab target is not a tabBar page: ${String(payload.url ?? payload.index)}`,
      )
    }
    const item = model.items[index]!
    if (payload.url) {
      const requested = normalizeRoutePath(
        (payload.url.split('?', 1)[0] ?? '').replace(/^\//, ''),
      )
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
    if (!this.host.tabPageCache.has(item.pagePath)) {
      this.assertRouteTarget(item.pagePath, {}, { allowTabBar: true })
    }
    const previousPage = this.host.activePage
    if (previousPage && previousPage.path === item.pagePath) {
      this.host.triggerPageLifecycle(previousPage, 'onTabItemTap', [tapEvent])
      this.host.sendRuntimeState()
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
    const tabPaths = this.host.options.tabBar.pagePaths
    const previousTab = previousPage && tabPaths.has(previousPage.path) ? previousPage : null
    const unloadedPageIds: string[] = []
    const oldStack = [...this.host.pageStack]
    if (previousTab) {
      this.host.triggerPageLifecycle(previousTab, 'onHide')
      previousTab.triggerPageLifetime('hide')
      this.host.options.render.triggerPageLifetime(previousTab.pageId, 'hide')
    }
    this.host.pageStack.length = 0
    this.host.setActivePage(null)
    for (const oldPage of oldStack) {
      if (oldPage === previousTab) continue
      // Tab pages stay cached between switches; only non-tab pages unload.
      if (tabPaths.has(oldPage.path)) continue
      this.host.destroyPage(oldPage, unloadedPageIds)
    }

    let target = this.host.tabPageCache.get(item.pagePath)
    let created = false
    if (!target) {
      target = this.host.createPageInstance(item.pagePath, {})
      created = true
      this.host.showPage(target)
    } else {
      this.host.pageStack.push(target)
      this.host.setActivePage(target)
      this.host.setCurrentPath(target.path)
      this.host.triggerPageLifecycle(target, 'onShow')
      target.triggerPageLifetime('show')
      this.host.options.render.triggerPageLifetime(target.pageId, 'show')
    }
    this.host.triggerPageLifecycle(target, 'onTabItemTap', [tapEvent])
    this.host.sendRuntimeState()
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
    if (delta >= this.host.pageStack.length) {
      throw new Error('Cannot navigate back beyond the first page')
    }
    const removed = this.host.pageStack.splice(-delta)
    const unloadedPageIds: string[] = []
    for (const page of removed.reverse()) {
      // A popped page is destroyed, not hidden. The component page lifetime
      // still ends so components can pause resources before detaching.
      this.host.destroyPage(page, unloadedPageIds)
    }
    const page = this.host.pageStack.at(-1)!
    this.host.setActivePage(page)
    this.host.setCurrentPath(page.path)
    this.host.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    this.host.options.render.triggerPageLifetime(page.pageId, 'show')
    this.host.sendRuntimeState()
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
    const page = requireActivePage(
      this.host.pageInstances,
      pageId,
      this.host.activePage,
    )
    if (!this.host.appVisible) return { status: 'hidden', pageId: page.pageId }
    this.host.setAppVisible(false)
    this.host.triggerPageLifecycle(page, 'onHide')
    page.triggerPageLifetime('hide')
    this.host.options.render.triggerPageLifetime(page.pageId, 'hide')
    // WeChat saves after onHide; a handler that mutates data still contributes.
    this.saveExitState(page)
    this.host.sendRuntimeState()
    return { status: 'hidden', pageId: page.pageId }
  }

  show(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(
      this.host.pageInstances,
      pageId,
      this.host.activePage,
    )
    if (this.host.appVisible) return { status: 'shown', pageId: page.pageId }
    this.host.setAppVisible(true)
    this.host.triggerPageLifecycle(page, 'onShow')
    page.triggerPageLifetime('show')
    this.host.options.render.triggerPageLifetime(page.pageId, 'show')
    this.host.sendRuntimeState()
    return { status: 'shown', pageId: page.pageId }
  }

  pullDownRefresh(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(
      this.host.pageInstances,
      pageId,
      this.host.activePage,
    )
    if (!this.host.appVisible) return { status: 'ignored', pageId: page.pageId }
    this.host.triggerPageLifecycle(page, 'onPullDownRefresh')
    return { status: 'refreshed', pageId: page.pageId }
  }

  async share(payload: {
    pageId?: string
    type?: 'appMessage' | 'timeline' | 'favorites'
    from?: 'button' | 'menu'
    target?: unknown
    webViewUrl?: string
  }): Promise<Record<string, unknown>> {
    const page = requireActivePage(
      this.host.pageInstances,
      payload.pageId,
      this.host.activePage,
    )
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
    const result = this.host.triggerPageLifecycle(page, phase, args)
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
    const page = requireActivePage(
      this.host.pageInstances,
      pageId,
      this.host.activePage,
    )
    const state = this.saveExitState(page)
    return { status: 'saved', state: cloneJsonSafe(state ?? null) }
  }

  /** Serializable state of the live page stack, for host-level restore. */
  snapshotState(): PageStateSnapshot[] {
    return snapshotPageStack(this.host.pageStack)
  }

  /** Apply a host-restored page state after the page has been recreated. */
  restoreState(
    pageId: string,
    data: Record<string, unknown>,
    savedExitState?: unknown,
    exitState?: unknown,
  ): Record<string, unknown> {
    return restorePageState(
      this.host.pageInstances,
      pageId,
      data,
      savedExitState,
      exitState,
    )
  }

  unload(pageId?: string): Record<string, unknown> {
    const page = requireActivePage(
      this.host.pageInstances,
      pageId,
      this.host.activePage,
    )
    const stackIndex = this.host.pageStack.indexOf(page)
    if (stackIndex >= 0) this.host.pageStack.splice(stackIndex, 1)
    this.host.destroyPage(page)
    if (this.host.activePage === page) {
      this.host.setActivePage(this.host.pageStack.at(-1) ?? null)
    }
    if (this.host.activePage) this.host.setCurrentPath(this.host.activePage.path)
    this.host.sendRuntimeState()
    return { status: 'unloaded', pageId: page.pageId }
  }

  resize(windowWidth: number, windowHeight: number): void {
    if (this.host.activePage) {
      const event = { size: { windowWidth, windowHeight } }
      this.host.triggerPageLifecycle(this.host.activePage, 'onResize', [event])
      // `pageLifetimes.resize` is delivered to the page root and every mounted
      // component of the visible page, matching WeChat's page lifetime table.
      this.host.activePage.triggerPageLifetime('resize', event)
      this.host.options.render.triggerPageLifetime(
        this.host.activePage.pageId,
        'resize',
        event,
      )
    }
    this.host.sendRuntimeState()
  }

  /** Host scroll/reachBottom/pullDownRefresh events are page-scoped. */
  pageEvent(
    event: 'pullDownRefresh' | 'scroll' | 'reachBottom',
    pageId?: string,
    payload?: { scrollTop?: number; scrollLeft?: number },
  ): void {
    const page = pageId ? this.host.pageInstances.get(pageId) : this.host.activePage
    if (!page || !this.host.appVisible || page !== this.host.activePage) return
    if (event === 'scroll') {
      this.host.triggerPageLifecycle(page, 'onPageScroll', [{
        scrollTop: Number(payload?.scrollTop ?? 0),
        scrollLeft: Number(payload?.scrollLeft ?? 0),
      }], undefined, false)
      return
    }
    if (event === 'reachBottom') {
      this.host.triggerPageLifecycle(page, 'onReachBottom')
      return
    }
    this.host.triggerPageLifecycle(page, 'onPullDownRefresh')
  }

  private assertRouteTarget(
    path: string,
    query: Record<string, string>,
    optionsForTarget: {
      allowTabBar: boolean
      isEntryPage?: boolean
    } = { allowTabBar: true },
  ): void {
    const { registry } = this.host.options
    if (!findPageArtifact(this.host.options.manifest, path)) {
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
    if (!optionsForTarget.allowTabBar && this.host.options.tabBar.pagePaths.has(path)) {
      throw new Error(`can not navigateTo a tabbar page: ${path}`)
    }
  }

  private resolveRoute(url: string): {
    path: string
    query: Record<string, string>
  } {
    const [rawPath, queryString] = url.split('?', 2)
    const path = rawPath!.startsWith('/')
      ? normalizeRoutePath(rawPath!.slice(1))
      : resolveComponentReference(this.host.currentPath, rawPath!)
    const query = Object.fromEntries(new URLSearchParams(queryString ?? ''))
    return { path, query }
  }

  private saveExitState(page: MiniProgramPageInstance): unknown {
    const state = this.host.triggerPageLifecycle(page, 'onSaveExitState')
    if (state !== undefined) page.savedExitState = cloneJsonSafe(state)
    return state
  }
}
