import type { RuntimeDiagnostic } from './diagnostics'
import type { HostApiHandler, RuntimeManifest, StorageSnapshot, SystemInfoSnapshot } from './types'
import { createStandaloneDualThreadHost, type StandaloneHost } from './standalone-host'

export type DevtoolRuntimeStatus = 'idle' | 'connecting' | 'running' | 'terminated' | 'error'

export type DevtoolRuntimeState = {
  status: DevtoolRuntimeStatus
  currentPage?: string
  pageStack: string[]
  diagnostics: RuntimeDiagnostic[]
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
      diagnostics: [],
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
        onDiagnostic: (diagnostic) => this.record(diagnostic),
      })
      await this.host.host.bootstrap()
      this.update({ status: 'running' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.update({ status: 'error', error: message })
      throw error
    }
  }

  async terminate(): Promise<void> {
    const host = this.host
    this.host = null
    if (host) {
      await host.host.close()
      host.serviceIframe.remove()
      host.renderIframe.remove()
    }
    if (this.container && this.ownsContainer) {
      this.container.remove()
      this.container = null
      this.ownsContainer = false
    }
    this.update({ status: 'terminated' })
  }

  async reload(): Promise<void> {
    await this.terminate()
    this.update({ status: 'idle' })
    await this.launch()
  }

  async navigate(url: string): Promise<void> {
    const handler = this.requireHandler('navigate.to')
    await handler({ url }, { pageId: this.activePageId })
  }

  async back(delta = 1): Promise<void> {
    const handler = this.requireHandler('navigate.back')
    await handler({ delta }, { pageId: this.activePageId })
  }

  async foreground(): Promise<void> {
    const host = this.requireHost()
    await host.host.service.control('page', 'show', {}, { pageId: this.activePageId })
  }

  async background(): Promise<void> {
    const host = this.requireHost()
    await host.host.service.control('page', 'hide', {}, { pageId: this.activePageId })
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
      const details = diagnostic.details as { pageStack?: string[]; currentPage?: string } | undefined
      if (Array.isArray(details?.pageStack)) next.pageStack = [...details.pageStack]
      if (typeof details?.currentPage === 'string') next.currentPage = details.currentPage
    }
    this.update(next)
  }

  private update(patch: Partial<DevtoolRuntimeState>): void {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) listener(this.state)
  }
}
