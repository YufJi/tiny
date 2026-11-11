/**
 * Debugger session client.
 *
 * This is app-level policy: how much history the panel keeps, how a runtime
 * state snapshot becomes the panel's view model, and when a launch counts as
 * inspectable. The platform glue it drives (iframes, message ports, canvas
 * handoff, HostCore commands) lives in `@tiny/host-web`.
 */
import type { RuntimeDiagnostic, RuntimePageState, RuntimeTabBarState } from '@tiny/runtime'
import type { InspectNode } from '@tiny/runtime'
import type { RuntimeManifest } from '@tiny/runtime'
import type { StorageValues, SystemInfo } from '@tiny/api'
import { WasmBrowserHost, type WasmHostCoreFactory } from '@tiny/host-web'
import { createDevtoolApiHost } from './host-api'
import { projectComponentTree } from './componentTree'
import { pollHostPicker, showHostPicker, updateHostPicker } from './hostPicker'

export type DevtoolRuntimeStatus = 'idle' | 'connecting' | 'running' | 'terminated' | 'error'

export type DevtoolLifecycleEvent = {
  sequence: number
  phase: string
  pageId: string
  path: string
  visible: boolean
  timestamp: number
  extra?: Record<string, unknown>
}

export type DevtoolNavigationState = {
  title?: string
  backgroundColor?: string
  textStyle?: 'white' | 'black'
  loading?: boolean
}

export type DevtoolRuntimeState = {
  status: DevtoolRuntimeStatus
  currentPage?: string
  pageStack: string[]
  /** Every page in the stack with its own render frame and visibility. */
  pages: RuntimePageState[]
  /** Ordered page lifecycle timeline (onLoad/onShow/onReady/onHide/onUnload/...). */
  lifecycle: DevtoolLifecycleEvent[]
  /** Runtime overrides from `wx.setNavigationBar*` on the active page. */
  navigation?: DevtoolNavigationState
  /** Host-rendered pull-down refresh indicator is visible. */
  refreshing?: boolean
  /** `wx.hideShareMenu` / `wx.showShareMenu` state for the chrome menu. */
  shareMenuVisible?: boolean
  /** Native tab bar state for the active tab page, when the app declares one. */
  tabBar?: RuntimeTabBarState
  diagnostics: RuntimeDiagnostic[]
  /** Component-level projection of the active page's render tree. */
  tree?: InspectNode | null
  error?: string
}

export type DevtoolPageStateSnapshot = {
  pageId: string
  path: string
  query: Record<string, string>
  data: Record<string, unknown>
  savedExitState: unknown
}

export type DevtoolRuntimeOptions = {
  manifest: RuntimeManifest
  appId?: string
  serviceUrl: string
  renderUrl: string
  initialPath: string
  systemInfo?: Partial<SystemInfo>
  storage?: StorageValues
  container?: HTMLElement
  diagnosticLimit?: number
  lifecycleLimit?: number
  /** Maximum pages per mini program. Defaults to 10. */
  maxPageStack?: number
  /** Rust HostCore factory; the devtool loads the generated wasm module once. */
  wasmCoreFactory: WasmHostCoreFactory
}

export type DevtoolRuntimeListener = (state: DevtoolRuntimeState) => void

/**
 * One mini program as the debugger sees it. React and Redux only talk to this
 * client; it drives the host and projects its events into debugger state.
 */
export class DevtoolRuntimeClient {
  private readonly options: DevtoolRuntimeOptions
  private readonly listeners = new Set<DevtoolRuntimeListener>()
  private readonly navigationOverrides = new Map<string, DevtoolNavigationState>()
  private refreshTimer: ReturnType<typeof setTimeout> | undefined
  private wasmHost: WasmBrowserHost | null = null
  private container: HTMLElement | null = null
  private ownsContainer = false
  private launchPath: string
  private state: DevtoolRuntimeState = {
    status: 'idle',
    pageStack: [],
    pages: [],
    lifecycle: [],
    diagnostics: [],
  }

  constructor(options: DevtoolRuntimeOptions) {
    this.options = options
    this.launchPath = options.initialPath
  }

  getState(): DevtoolRuntimeState {
    return this.state
  }

  subscribe(listener: DevtoolRuntimeListener): () => void {
    this.listeners.add(listener)
    listener(this.state)
    return () => {
      this.listeners.delete(listener)
    }
  }

  async launch(): Promise<void> {
    if (this.state.status === 'running' || this.state.status === 'connecting') return
    this.navigationOverrides.clear()
    if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer)
    this.refreshTimer = undefined
    this.update({
      status: 'connecting',
      currentPage: undefined,
      pageStack: [],
      pages: [],
      lifecycle: [],
      navigation: undefined,
      refreshing: false,
      shareMenuVisible: true,
      tabBar: undefined,
      diagnostics: [],
      tree: undefined,
      error: undefined,
    })
    const container = this.options.container ?? document.createElement('div')
    if (!this.options.container) {
      container.className = 'tiny-devtool-runtime'
      container.style.width = '100%'
      container.style.height = '100%'
      document.body.appendChild(container)
      this.ownsContainer = true
    }
    this.container = container
    const storage = this.options.storage ?? {}
    const getSystemInfo = (): SystemInfo => {
      const facts = this.options.systemInfo ?? {}
      const width = this.container?.clientWidth ?? 0
      const height = this.container?.clientHeight ?? 0
      return {
        SDKVersion: '3.0.0',
        ...facts,
        pixelRatio: facts.pixelRatio
          ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio),
        windowWidth: width > 0 ? width : Number(facts.windowWidth ?? 0),
        windowHeight: height > 0 ? height : Number(facts.windowHeight ?? 0),
      }
    }
    try {
      const apiHost = createDevtoolApiHost({
        storage,
        getSystemInfo,
        onNavigation: (action, params) => this.applyNavigation(action, params),
        onShareMenu: (visible) => this.update({ shareMenuVisible: visible }),
      })
      this.wasmHost = new WasmBrowserHost({
        appId: this.options.appId ?? 'devtool',
        manifest: this.options.manifest,
        serviceUrl: this.options.serviceUrl,
        renderUrl: this.options.renderUrl,
        initialPath: this.launchPath,
        container,
        maxPageStack: this.options.maxPageStack,
        apiHandlers: apiHost.apiHandlers,
        syncApiHandlers: apiHost.syncApiHandlers,
        onState: (state) => {
          if (state && typeof state === 'object') this.record(state as RuntimeDiagnostic)
        },
        onDiagnostic: (diagnostic) => this.record(diagnostic),
        onHostRequest: (method, payload) => {
          if (method === 'showPicker') {
            return showHostPicker(payload as Parameters<typeof showHostPicker>[0], this.container)
          }
          if (method === 'updatePicker') {
            updateHostPicker(payload as Parameters<typeof updateHostPicker>[0])
            return Promise.resolve({ status: 'ok' })
          }
          if (method === 'pollPicker') {
            const sessionId = (payload as { sessionId?: string } | null)?.sessionId ?? ''
            return Promise.resolve(pollHostPicker(sessionId))
          }
          return Promise.reject(new Error(`unsupported host request: ${method}`))
        },
      }, this.options.wasmCoreFactory)
      await this.wasmHost.launch()
      // The service sends the post-ready tree snapshot asynchronously.
      await new Promise((resolve) => setTimeout(resolve, 300))
      this.update({ status: 'running' })
      await this.inspectTree()
    } catch (error) {
      const failedWasmHost = this.wasmHost
      this.wasmHost = null
      failedWasmHost?.dispose()
      const message = error instanceof Error ? error.message : String(error)
      this.update({ status: 'error', error: message })
      throw error
    }
  }

  async terminate(): Promise<void> {
    const wasmHost = this.wasmHost
    this.wasmHost = null
    if (wasmHost) {
      await wasmHost.command({ type: 'close' }).catch(() => undefined)
      wasmHost.dispose()
    }
    if (this.container && this.ownsContainer) {
      this.container.remove()
      this.container = null
      this.ownsContainer = false
    }
    this.update({
      status: 'terminated',
      currentPage: undefined,
      pageStack: [],
      pages: [],
      tabBar: undefined,
      tree: undefined,
    })
  }

  async reload(initialPath?: string): Promise<void> {
    if (initialPath) this.launchPath = initialPath
    await this.terminate()
    this.update({ status: 'idle' })
    await this.launch()
  }

  async navigate(url: string): Promise<string | undefined> {
    const result = await this.requireWasmHost().command({
      type: 'navigateTo',
      url,
    }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
    return result?.pageId
  }

  /** Capture page data and saved exit state before a debugger reload. */
  async snapshotPageState(): Promise<DevtoolPageStateSnapshot[]> {
    const result = await this.requireWasmHost().command({
      type: 'snapshotPageState',
    })
    return Array.isArray(result) ? result as DevtoolPageStateSnapshot[] : []
  }

  /** Apply a page snapshot after its page has been recreated. */
  async restorePageState(snapshot: DevtoolPageStateSnapshot): Promise<void> {
    await this.requireWasmHost().command({
      type: 'restorePageState',
      pageId: snapshot.pageId,
      data: snapshot.data ?? {},
      savedExitState: snapshot.savedExitState ?? null,
    })
  }

  async back(delta = 1): Promise<void> {
    const result = await this.requireWasmHost().command({
      type: 'navigateBack',
      delta,
    }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
  }

  /** Tap a native tab bar item; cached tab pages are shown without remounting. */
  async tapTab(index: number): Promise<void> {
    const item = this.state.tabBar?.items[index]
    if (!item) throw new Error(`tabBar item ${index} is not available`)
    const result = await this.requireWasmHost().command({
      type: 'switchTab',
      url: item.pagePath,
      index,
    }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
  }

  async inspectTree(pageId: string | undefined = this.activePageId ?? this.wasmHost?.activePage): Promise<InspectNode | null> {
    // Host inspection is page-scoped: no active page means there is nothing to
    // inspect yet (e.g. before the first page is ready).
    if (!pageId) {
      this.update({ tree: null })
      return null
    }
    const tree = await this.requireWasmHost().inspectTree(pageId) as InspectNode | null
    // The host reports the live render DOM; the panel only wants the
    // mini-program component levels (see `componentTree.ts`).
    const componentTree = projectComponentTree(tree)
    this.update({ tree: componentTree })
    return componentTree
  }

  async foreground(): Promise<void> {
    await this.requireWasmHost().command({ type: 'setPageVisible', visible: true })
  }

  async background(): Promise<void> {
    await this.requireWasmHost().command({ type: 'setPageVisible', visible: false })
  }

  /** Invoke the active page's `onShareAppMessage` / timeline / favorites hook. */
  async share(type: 'appMessage' | 'timeline' | 'favorites' = 'appMessage'): Promise<unknown> {
    return this.requireWasmHost().command({
      type: 'share',
      shareType: type,
      from: 'menu',
    })
  }

  /** Keep the configured system-info API and `onResize` in sync with host chrome. */
  async resize(width: number, height: number): Promise<void> {
    await this.requireWasmHost().command({ type: 'resize', width, height })
  }

  private get activePageId(): string | undefined {
    return this.state.pageStack.at(-1)
  }

  private requireWasmHost(): WasmBrowserHost {
    if (!this.wasmHost || this.state.status !== 'running') {
      throw new Error('runtime is not running')
    }
    return this.wasmHost
  }

  /**
   * `wx.setNavigationBar*` is page-scoped. Keep an override per page so going
   * back restores the title/color the page had before it was hidden.
   */
  private applyNavigation(
    action: 'title' | 'color' | 'loading',
    params: Record<string, unknown>,
  ): void {
    const page = this.state.currentPage
    if (!page) return
    const next: DevtoolNavigationState = { ...(this.navigationOverrides.get(page) ?? {}) }
    if (action === 'title' && typeof params.title === 'string') {
      next.title = params.title
    } else if (action === 'color') {
      if (typeof params.backgroundColor === 'string') next.backgroundColor = params.backgroundColor
      const front = String(params.frontColor ?? '').toLowerCase()
      if (front === '#ffffff') next.textStyle = 'white'
      else if (front === '#000000') next.textStyle = 'black'
    } else if (action === 'loading' && typeof params.visible === 'boolean') {
      next.loading = params.visible
    }
    this.navigationOverrides.set(page, next)
    this.update({ navigation: { ...next } })
  }

  private record(diagnostic: RuntimeDiagnostic): void {
    const limit = this.options.diagnosticLimit ?? 500
    const diagnostics = [...this.state.diagnostics, diagnostic].slice(-limit)
    const next: DevtoolRuntimeState = { ...this.state, diagnostics }
    if (diagnostic.code === 'RUNTIME_STATE') {
      const details = diagnostic.details as {
        pageStack?: string[]
        currentPage?: string
        pages?: RuntimePageState[]
        tabBar?: RuntimeTabBarState
      } | undefined
      if (Array.isArray(details?.pageStack)) next.pageStack = [...details.pageStack]
      if (typeof details?.currentPage === 'string') {
        if (details.currentPage !== this.state.currentPage) {
          const override = this.navigationOverrides.get(details.currentPage)
          next.navigation = override ? { ...override } : undefined
        }
        next.currentPage = details.currentPage
      }
      if (Array.isArray(details?.pages)) next.pages = details.pages.map((page) => ({ ...page }))
      if (details?.tabBar) next.tabBar = details.tabBar
    }
    if (diagnostic.code === 'PULL_DOWN_REFRESH_STOPPED') {
      if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer)
      this.refreshTimer = undefined
      next.refreshing = false
    }
    if (diagnostic.code === 'PAGE_LIFECYCLE') {
      const details = diagnostic.details as {
        pageId?: string
        path?: string
        phase?: string
        sequence?: number
        visible?: boolean
        extra?: Record<string, unknown>
      } | undefined
      if (details?.phase === 'onPullDownRefresh') {
        // `startPullDownRefresh` and the real pull gesture both land here. The
        // host has no stop signal (`stopPullDownRefresh` is replied to inside
        // HostCore), so keep the indicator for a short natural duration.
        next.refreshing = true
        if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer)
        this.refreshTimer = setTimeout(() => {
          this.refreshTimer = undefined
          this.update({ refreshing: false })
        }, 900)
      }
      if (details?.phase && details.pageId && details.path) {
        const limitLifecycle = this.options.lifecycleLimit ?? 300
        const event: DevtoolLifecycleEvent = {
          sequence: details.sequence ?? this.state.lifecycle.length + 1,
          phase: details.phase,
          pageId: details.pageId,
          path: details.path,
          visible: Boolean(details.visible),
          timestamp: diagnostic.timestamp,
          ...(details.extra ? { extra: details.extra } : {}),
        }
        next.lifecycle = [...this.state.lifecycle, event].slice(-limitLifecycle)
      }
    }
    this.update(next)
  }

  private update(patch: Partial<DevtoolRuntimeState>): void {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener(this.state)
  }
}
