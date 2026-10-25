import type { RuntimeDiagnostic, RuntimePageState } from '@tiny/runtime'
import type { InspectNode } from '@tiny/runtime'
import type { HostApiHandler, RuntimeManifest, StorageSnapshot, SystemInfoSnapshot } from '@tiny/runtime'
import { createStandaloneDualThreadHost, type StandaloneHost } from './standalone-host'

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
  diagnostics: RuntimeDiagnostic[]
  tree?: InspectNode | null
  error?: string
}

export type DevtoolRuntimeOptions = {
  manifest: RuntimeManifest
  serviceUrl: string
  renderUrl: string
  initialPath: string
  systemInfo?: Partial<SystemInfoSnapshot>
  storage?: StorageSnapshot
  container?: HTMLElement
  diagnosticLimit?: number
  lifecycleLimit?: number
  /** Defaults to one render iframe per page; set `single` for a shared frame. */
  renderMode?: 'single' | 'per-page'
}

export type DevtoolRuntimeListener = (state: DevtoolRuntimeState) => void

/**
 * Host adapter for the debugger. React and Redux only talk to this client;
 * it owns the iframe host, protocol messages, and state projection.
 */
export class DevtoolRuntimeClient {
  private readonly options: DevtoolRuntimeOptions
  private readonly listeners = new Set<DevtoolRuntimeListener>()
  private host: StandaloneHost | null = null
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

  get renderFrameCount(): number {
    return this.host?.renderIframes.size ?? 0
  }

  async launch(): Promise<void> {
    if (this.state.status === 'running' || this.state.status === 'connecting') return
    this.update({
      status: 'connecting',
      currentPage: undefined,
      pageStack: [],
      pages: [],
      lifecycle: [],
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
      this.host = await createStandaloneDualThreadHost({
        manifest: this.options.manifest,
        serviceUrl: this.options.serviceUrl,
        renderUrl: this.options.renderUrl,
        initialPath: this.options.initialPath,
        systemInfo: this.options.systemInfo,
        storage: this.options.storage,
        container,
        renderMode: this.options.renderMode ?? 'per-page',
        onDiagnostic: (diagnostic) => this.record(diagnostic),
      })
      await this.host.host.bootstrap()
      this.update({ status: 'running' })
      await this.inspectTree()
    } catch (error) {
      const failedHost = this.host
      this.host = null
      if (failedHost) await failedHost.dispose().catch(() => {})
      const message = error instanceof Error ? error.message : String(error)
      this.update({ status: 'error', error: message })
      throw error
    }
  }

  async terminate(): Promise<void> {
    const host = this.host
    this.host = null
    if (host) {
      await host.dispose()
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
      tree: undefined,
    })
  }

  async reload(): Promise<void> {
    await this.terminate()
    this.update({ status: 'idle' })
    await this.launch()
  }

  async navigate(url: string): Promise<void> {
    const handler = this.requireHandler('navigate.to')
    const result = await handler({ url }, { pageId: this.activePageId }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
  }

  async back(delta = 1): Promise<void> {
    const handler = this.requireHandler('navigate.back')
    const result = await handler({ delta }, { pageId: this.activePageId }) as { pageId?: string } | undefined
    await this.inspectTree(result?.pageId)
  }

  async inspectTree(pageId: string | undefined = this.activePageId): Promise<InspectNode | null> {
    const host = this.requireHost()
    const tree = await host.host.inspectTree(pageId) as InspectNode | null
    this.update({ tree })
    return tree
  }

  async foreground(): Promise<void> {
    const host = this.requireHost()
    await host.host.service.control('page', 'show', {}, { pageId: this.activePageId })
    host.host.setAppVisible(true)
  }

  async background(): Promise<void> {
    const host = this.requireHost()
    await host.host.service.control('page', 'hide', {}, { pageId: this.activePageId })
    host.host.setAppVisible(false)
  }

  /** Keep `wx.getSystemInfoSync()` and `onResize` in sync with host chrome. */
  async resize(width: number, height: number): Promise<void> {
    const host = this.requireHost()
    await host.host.setWindowSize(width, height)
  }

  private get activePageId(): string | undefined {
    return this.state.pageStack.at(-1)
  }

  private requireHost(): StandaloneHost {
    if (!this.host || this.state.status !== 'running') {
      throw new Error('runtime is not running')
    }
    return this.host
  }

  private requireHandler(method: string): HostApiHandler {
    const handler = this.requireHost().host.apiRegistry.handlers[method]
    if (typeof handler !== 'function') throw new Error(`missing host handler: ${method}`)
    return handler
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
      } | undefined
      if (Array.isArray(details?.pageStack)) next.pageStack = [...details.pageStack]
      if (typeof details?.currentPage === 'string') next.currentPage = details.currentPage
      if (Array.isArray(details?.pages)) next.pages = details.pages.map((page) => ({ ...page }))
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
