/**
 * Debugger session client.
 *
 * This is app-level policy: how much history the panel keeps, how a runtime
 * state snapshot becomes the panel's view model, and when a launch counts as
 * inspectable. The platform glue it drives (iframes, message ports, canvas
 * handoff, HostCore commands) lives in `@tiny/host-browser`.
 */
import type { RuntimeDiagnostic, RuntimePageState, RuntimeTabBarState } from '@tiny/runtime'
import type { InspectNode } from '@tiny/runtime'
import type { RuntimeManifest, StorageSnapshot, SystemInfoSnapshot } from '@tiny/runtime'
import { WasmBrowserHost, type WasmHostCoreFactory } from '@tiny/host-browser'
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

export type DevtoolRuntimeState = {
  status: DevtoolRuntimeStatus
  currentPage?: string
  pageStack: string[]
  /** Every page in the stack with its own render frame and visibility. */
  pages: RuntimePageState[]
  /** Ordered page lifecycle timeline (onLoad/onShow/onReady/onHide/onUnload/...). */
  lifecycle: DevtoolLifecycleEvent[]
  /** Native tab bar state for the active tab page, when the app declares one. */
  tabBar?: RuntimeTabBarState
  diagnostics: RuntimeDiagnostic[]
  tree?: InspectNode | null
  error?: string
}

export type DevtoolRuntimeOptions = {
  manifest: RuntimeManifest
  appId?: string
  serviceUrl: string
  renderUrl: string
  initialPath: string
  systemInfo?: Partial<SystemInfoSnapshot>
  storage?: StorageSnapshot
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
  private wasmHost: WasmBrowserHost | null = null
  private container: HTMLElement | null = null
  private ownsContainer = false
  private state: DevtoolRuntimeState = {
    status: 'idle',
    pageStack: [],
    pages: [],
    lifecycle: [],
    diagnostics: [],
  }

  constructor(options: DevtoolRuntimeOptions) {
    this.options = options
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
    this.update({
      status: 'connecting',
      currentPage: undefined,
      pageStack: [],
      pages: [],
      lifecycle: [],
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
    try {
      this.wasmHost = new WasmBrowserHost({
        appId: this.options.appId ?? 'devtool',
        manifest: this.options.manifest,
        serviceUrl: this.options.serviceUrl,
        renderUrl: this.options.renderUrl,
        initialPath: this.options.initialPath,
        systemInfo: this.options.systemInfo,
        storage: this.options.storage,
        container,
        maxPageStack: this.options.maxPageStack,
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

  async reload(): Promise<void> {
    await this.terminate()
    this.update({ status: 'idle' })
    await this.launch()
  }

  async navigate(url: string): Promise<void> {
    const result = await this.requireWasmHost().command({
      type: 'navigateTo',
      url,
    }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
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
    this.update({ tree })
    return tree
  }

  async foreground(): Promise<void> {
    await this.requireWasmHost().command({ type: 'setPageVisible', visible: true })
  }

  async background(): Promise<void> {
    await this.requireWasmHost().command({ type: 'setPageVisible', visible: false })
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
      if (typeof details?.currentPage === 'string') next.currentPage = details.currentPage
      if (Array.isArray(details?.pages)) next.pages = details.pages.map((page) => ({ ...page }))
      if (details?.tabBar) next.tabBar = details.tabBar
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
