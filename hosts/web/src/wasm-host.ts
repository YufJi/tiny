import { createHostMessageChannelPair } from '@tiny/bridge'
import type { Transport, TransportFrame } from '@tiny/bridge'
import { normalizeTransportDiagnostic } from '@tiny/runtime'
import type {
  RuntimeDiagnostic,
  RuntimeManifest,
} from '@tiny/runtime'
import type {
  HostApiHandlers,
  StorageValues,
  SystemInfo,
} from '@tiny/api'
import type { SyncHostChannel } from '@tiny/api'
import { BROWSER_RUNTIME_NAMES } from './naming'
import { installCanvasHandoffRelay } from './canvas-relay'

/**
 * Minimal surface of the wasm-bindgen `WasmHostCore` class: only the two calls
 * the browser adapter drives. Page stack, app visibility and diagnostics arrive
 * as `HostAction`s from `handle_event`, so they need no extra methods.
 *
 * The browser adapter deliberately does not import the generated wasm module:
 * the devtool passes a factory so the bundle can load/instantiate wasm lazily
 * and tests can substitute a fake core.
 */
export interface WasmHostCoreLike {
  start(nowMs: number): string
  handle_event(eventJson: string, nowMs: number): string
}

export type WasmHostCoreFactory = (configJson: string) => Promise<WasmHostCoreLike>

export type WasmHostOptions = {
  appId: string
  manifest: RuntimeManifest
  serviceUrl: string
  renderUrl: string
  initialPath: string
  systemInfo?: Partial<SystemInfo>
  storage?: StorageValues
  container?: HTMLElement
  maxPageStack?: number
  apiHandlers: HostApiHandlers
  onState?: (state: unknown) => void
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
  /** Host-side request/response capabilities (e.g. the `<picker>` popover). */
  onHostRequest?: (
    method: string,
    payload: unknown,
    context: { pageId?: string },
  ) => Promise<unknown>
  /** Wait for the first page to be activated before launch resolves. */
  waitForReady?: boolean
}

type CoreAction =
  | { type: 'sendServiceFrame'; frame: TransportFrame }
  | { type: 'sendRenderFrame'; pageId: string; frame: TransportFrame }
  | { type: 'createPage'; pageId: string; path: string }
  | { type: 'activatePage'; pageId: string }
  | { type: 'destroyPage'; pageId: string }
  | { type: 'setAppVisible'; visible: boolean }
  | { type: 'updateUIState'; state: unknown }
  | { type: 'commandResult'; command: string; result: unknown }
  | { type: 'platformCall'; requestId: string; method: string; params: unknown; pageId?: string }
  | { type: 'renderHostRequest'; requestId: string; pageId: string; method: string; payload: unknown }
  | { type: 'diagnostic'; level: string; payload: Record<string, unknown> }

type PageSurface = {
  iframe: HTMLIFrameElement
  transport: Transport
}

/**
 * Browser RuntimeHost backed by the shared Rust HostCore (WASM).
 *
 * The class owns the browser-only pieces: service iframe, per-page render
 * iframes, MessageChannel transfers and Canvas handoff. All Bridge, page-stack,
 * navigation and Host API decisions live in `WasmHostCore`.
 *
 * It reports rather than retains: runtime state and diagnostics leave through
 * `onState` / `onDiagnostic`, and the caller decides whether to keep a history.
 */
export class WasmBrowserHost {
  private readonly options: WasmHostOptions
  private readonly factory: WasmHostCoreFactory
  private readonly container: HTMLElement
  private readonly ownsContainer: boolean
  private core: WasmHostCoreLike | null = null
  private serviceIframe: HTMLIFrameElement | null = null
  private serviceTransport: Transport | null = null
  private readonly serviceQueue: TransportFrame[] = []
  private serviceFlushTimer: ReturnType<typeof setTimeout> | undefined
  private readonly pages = new Map<string, PageSurface>()
  private readonly storage: StorageValues
  private activePageId: string | undefined
  private appVisible = true
  private removeCanvasRelay: (() => void) | undefined
  private disposed = false
  private ready = false
  private readyTimer: ReturnType<typeof setTimeout> | undefined
  private readyWaiters: Array<{
    resolve: () => void
    reject: (reason: unknown) => void
  }> = []
  private treeReady = false
  private treeReadyTimer: ReturnType<typeof setTimeout> | undefined
  private treeReadyWaiters: Array<{
    resolve: () => void
    reject: (reason: unknown) => void
  }> = []
  private commandWaiters = new Map<string, Array<{
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }>>()
  private pageWaiters = new Map<string, Array<{
    resolve: () => void
    reject: (reason: unknown) => void
  }>>()
  private pageTimers = new Map<string, ReturnType<typeof setTimeout>>()

  constructor(
    options: WasmHostOptions,
    factory: WasmHostCoreFactory,
  ) {
    this.options = options
    this.factory = factory
    this.storage = options.storage ?? {}
    this.ownsContainer = !options.container
    this.container = options.container ?? document.createElement('div')
  }

  async launch(): Promise<void> {
    if (this.disposed) throw new Error('WasmBrowserHost is disposed')
    if (this.core) return
    if (this.ownsContainer) {
      this.container.className = 'tiny-wasm-host'
      this.container.style.width = '100%'
      this.container.style.height = '100%'
      document.body.appendChild(this.container)
    }
    ensureStackingContext(this.container)

    const channel = createHostMessageChannelPair()
    const iframe = createThreadIframe(BROWSER_RUNTIME_NAMES.serviceFrameClass, this.options.serviceUrl)
    this.serviceIframe = iframe
    this.serviceTransport = channel.hostTransport
    this.container.append(iframe)
    try {
      await waitForThreadReady(iframe, 'service')
    } catch (error) {
      iframe.remove()
      this.serviceIframe = null
      this.serviceTransport = null
      throw error
    }
    this.installSyncHost(iframe)
    iframe.contentWindow?.postMessage(
      { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'service' },
      '*',
      [channel.peerPort as unknown as Transferable],
    )
    this.serviceTransport.onFrame((frame) => {
      const actions = this.dispatch({ type: 'serviceFrame', frame: JSON.stringify(frame) })
      this.execute(actions)
    })
    this.removeCanvasRelay = installCanvasHandoffRelay({
      serviceIframe: iframe,
      getRenderIframe: (pageId) => {
        // The service may ask for a canvas while the previous tab page is
        // still the requested page id; the active surface owns the handoff.
        if (this.activePageId) return this.pages.get(this.activePageId)?.iframe
        return pageId ? this.pages.get(pageId)?.iframe : undefined
      },
      isRenderSource: (source) => {
        for (const page of this.pages.values()) {
          if (page.iframe.contentWindow === source) return true
        }
        return false
      },
    })

    // The service reads system/storage facts from the host on demand (sync
    // channel or api round-trip); the core config carries no snapshot.
    const config = JSON.stringify({
      appId: this.options.appId,
      manifest: this.options.manifest,
      initialPath: this.options.initialPath,
      maxPageStack: this.options.maxPageStack,
    })
    this.core = await this.factory(config)
    this.execute(this.core.start(nowMs()))
    if (this.options.waitForReady !== false) {
      await this.waitForReady()
      await this.waitForTree()
    }
  }

  get activePage(): string | undefined {
    return this.activePageId
  }

  async command(command: Record<string, unknown>): Promise<unknown> {
    const name = commandName(command)
    if (!name) {
      this.execute(this.dispatchEvent({ type: 'command', command }))
      return undefined
    }
    const promise = new Promise<unknown>((resolve, reject) => {
      const waiters = this.commandWaiters.get(name) ?? []
      waiters.push({ resolve, reject })
      this.commandWaiters.set(name, waiters)
    })
    const raw = this.dispatchEvent({ type: 'command', command })
    this.execute(raw)
    return promise
  }

  async inspectTree(pageId: string | undefined): Promise<unknown> {
    if (!pageId) return null
    await this.waitForPage(pageId)
    const tree = await this.command({ type: 'inspectTree', pageId })
    return tree
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.removeCanvasRelay?.()
    for (const page of this.pages.values()) {
      page.transport.close()
      page.iframe.remove()
    }
    this.pages.clear()
    if (this.serviceFlushTimer !== undefined) clearTimeout(this.serviceFlushTimer)
    this.serviceFlushTimer = undefined
    this.serviceQueue.length = 0
    this.serviceTransport?.close()
    this.serviceIframe?.remove()
    this.serviceIframe = null
    this.serviceTransport = null
    this.core = null
    if (this.readyTimer !== undefined) clearTimeout(this.readyTimer)
    this.readyTimer = undefined
    if (this.treeReadyTimer !== undefined) clearTimeout(this.treeReadyTimer)
    this.treeReadyTimer = undefined
    for (const waiter of this.readyWaiters.splice(0)) {
      waiter.reject(new Error('WasmBrowserHost disposed'))
    }
    for (const waiter of this.treeReadyWaiters.splice(0)) {
      waiter.reject(new Error('WasmBrowserHost disposed'))
    }
    for (const waiters of this.commandWaiters.values()) {
      for (const waiter of waiters) waiter.reject(new Error('WasmBrowserHost disposed'))
    }
    this.commandWaiters.clear()
    for (const waiters of this.pageWaiters.values()) {
      for (const waiter of waiters) waiter.reject(new Error('WasmBrowserHost disposed'))
    }
    this.pageWaiters.clear()
    for (const timer of this.pageTimers.values()) clearTimeout(timer)
    this.pageTimers.clear()
    if (this.ownsContainer) this.container.remove()
  }

  private dispatch(event: Record<string, unknown>): string {
    if (!this.core) return ''
    return this.core.handle_event(JSON.stringify(event), nowMs())
  }

  private dispatchEvent(event: Record<string, unknown>): string {
    return this.dispatch(event)
  }

  private execute(raw: string): void {
    if (!raw) return
    let actions: CoreAction[]
    try {
      actions = JSON.parse(raw) as CoreAction[]
    } catch (error) {
      this.report('error', `invalid HostCore action list: ${String(error)}`)
      return
    }
    for (const action of actions) {
      switch (action.type) {
        case 'sendServiceFrame':
          this.queueServiceFrame(action.frame)
          break
        case 'sendRenderFrame':
          if (
            this.activePageId === action.pageId
            && action.frame.messages.some((message) => (
              message.domain === 'tree' && (message.method === 'flow' || message.method === 'snapshot')
            ))
          ) {
            this.markTreeReady()
          }
          try {
            this.pages.get(action.pageId)?.transport.send(action.frame)
          } catch (error) {
            this.report('error', `sendRenderFrame failed: ${String(error)}`)
          }
          break
        case 'createPage':
          void this.createPage(action.pageId)
          break
        case 'activatePage':
          this.activatePage(action.pageId)
          this.markReady()
          break
        case 'destroyPage':
          this.destroyPage(action.pageId)
          break
        case 'setAppVisible':
          this.appVisible = action.visible
          this.updateVisibility()
          break
        case 'updateUIState':
          this.options.onState?.(action.state)
          break
        case 'commandResult':
          this.resolveCommand(action.command, action.result)
          break
        case 'platformCall':
          void this.runPlatformCall(action)
          break
        case 'renderHostRequest':
          void this.runHostRequest(action)
          break
        case 'diagnostic': {
          const payload = action.payload as {
            source?: RuntimeDiagnostic['source']
            pageId?: string
          }
          const diagnostic = normalizeTransportDiagnostic(
            action.payload,
            payload.source ?? 'host',
            payload.pageId,
            action.level as 'log' | 'warn' | 'error' | 'state',
          )
          this.options.onDiagnostic?.(diagnostic)
          break
        }
      }
    }
  }

  /**
   * The service sends `runtime.ready` from inside its Bridge hello handler,
   * before the rest of bootServiceThread has registered its control handlers.
   * Deferring the host's reply by one task avoids racing the bootstrap control.
   */
  private queueServiceFrame(frame: TransportFrame): void {
    this.serviceQueue.push(frame)
    if (this.serviceFlushTimer !== undefined) return
    this.serviceFlushTimer = setTimeout(() => {
      this.serviceFlushTimer = undefined
      const frames = this.serviceQueue.splice(0)
      for (const item of frames) {
        try {
          this.serviceTransport?.send(item)
        } catch (error) {
          this.report('error', `sendServiceFrame failed: ${String(error)}`)
        }
      }
    }, 0)
  }

  private async createPage(pageId: string): Promise<void> {
    if (this.pages.has(pageId)) {
      this.activePageId = pageId
      this.dispatchEvent({ type: 'pageReady', pageId })
      this.updateVisibility()
      return
    }
    const iframe = createRenderIframe(this.options.renderUrl, pageId)
    this.pages.set(pageId, {
      iframe,
      transport: {
        send() {},
        close() {},
        onFrame: () => () => {},
      },
    })
    this.container.append(iframe)
    this.updateVisibility()
    try {
      await waitForThreadReady(iframe, 'render')
    } catch (error) {
      this.pages.delete(pageId)
      iframe.remove()
      this.dispatchEvent({
        type: 'pageFailed',
        pageId,
        error: error instanceof Error ? error.message : String(error),
      })
      return
    }
    const channel = createHostMessageChannelPair()
    iframe.contentWindow?.postMessage(
      { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'render' },
      '*',
      [channel.peerPort as unknown as Transferable],
    )
    const surface = this.pages.get(pageId)
    if (!surface) {
      channel.hostTransport.close()
      iframe.remove()
      return
    }
    surface.transport = channel.hostTransport
    channel.hostTransport.onFrame((frame) => {
      this.execute(this.dispatchEvent({
        type: 'renderFrame',
        pageId,
        frame: JSON.stringify(frame),
      }))
    })
    try {
      this.execute(this.dispatchEvent({ type: 'pageReady', pageId }))
    } catch (error) {
      this.report('error', `page ready dispatch failed: ${String(error)}`)
    }
    this.updateVisibility()
  }

  private activatePage(pageId: string): void {
    this.activePageId = pageId
    this.updateVisibility()
    this.resolvePage(pageId)
  }

  private waitForPage(pageId: string, timeoutMs = 10_000): Promise<void> {
    if (this.activePageId === pageId) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject }
      const waiters = this.pageWaiters.get(pageId) ?? []
      waiters.push(waiter)
      this.pageWaiters.set(pageId, waiters)
      this.pageTimers.set(pageId, setTimeout(() => {
        this.pageTimers.delete(pageId)
        const pending = this.pageWaiters.get(pageId) ?? []
        this.pageWaiters.set(pageId, pending.filter((item) => item !== waiter))
        reject(new Error(`page did not become active within ${timeoutMs}ms: ${pageId}`))
      }, timeoutMs))
    })
  }

  private resolvePage(pageId: string): void {
    const timer = this.pageTimers.get(pageId)
    if (timer) clearTimeout(timer)
    this.pageTimers.delete(pageId)
    const waiters = this.pageWaiters.get(pageId)
    this.pageWaiters.delete(pageId)
    for (const waiter of waiters ?? []) waiter.resolve()
  }

  private waitForReady(timeoutMs = 15_000): Promise<void> {
    if (this.ready) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject }
      this.readyWaiters.push(waiter)
      this.readyTimer = setTimeout(() => {
        this.readyWaiters = this.readyWaiters.filter((item) => item !== waiter)
        reject(new Error(`WasmHostCore did not activate a page within ${timeoutMs}ms`))
      }, timeoutMs)
    })
  }

  private waitForTree(timeoutMs = 15_000): Promise<void> {
    if (this.treeReady) return Promise.resolve()
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject }
      this.treeReadyWaiters.push(waiter)
      this.treeReadyTimer = setTimeout(() => {
        this.treeReadyWaiters = this.treeReadyWaiters.filter((item) => item !== waiter)
        reject(new Error(`WasmHostCore did not mount a render tree within ${timeoutMs}ms`))
      }, timeoutMs)
    })
  }

  private markTreeReady(): void {
    if (this.treeReady) return
    this.treeReady = true
    if (this.treeReadyTimer !== undefined) clearTimeout(this.treeReadyTimer)
    this.treeReadyTimer = undefined
    for (const waiter of this.treeReadyWaiters.splice(0)) waiter.resolve()
  }

  private markReady(): void {
    if (this.ready) return
    this.ready = true
    if (this.readyTimer !== undefined) clearTimeout(this.readyTimer)
    this.readyTimer = undefined
    for (const waiter of this.readyWaiters.splice(0)) waiter.resolve()
  }

  private destroyPage(pageId: string): void {
    const page = this.pages.get(pageId)
    if (!page) return
    page.transport.close()
    page.iframe.remove()
    this.pages.delete(pageId)
    if (this.activePageId === pageId) this.activePageId = undefined
    this.updateVisibility()
  }

  private updateVisibility(): void {
    for (const [pageId, page] of this.pages) {
      const visible = this.appVisible && pageId === this.activePageId
      page.iframe.style.visibility = visible ? 'visible' : 'hidden'
      page.iframe.style.pointerEvents = visible ? 'auto' : 'none'
      page.iframe.style.zIndex = visible ? '1' : '0'
      page.iframe.dataset.state = visible ? 'active' : 'hidden'
      if (visible) page.iframe.removeAttribute('aria-hidden')
      else page.iframe.setAttribute('aria-hidden', 'true')
    }
  }

  /**
   * Install the synchronous channel `*Sync` APIs use. Called after the service
   * frame reports ready and before its port arrives, so no app code can run
   * before the channel exists. The channel is a same-origin function reference,
   * which is why a `MessagePort` (asynchronous) cannot serve this role.
   */
  private installSyncHost(iframe: HTMLIFrameElement): void {
    const target = iframe.contentWindow as (Window & { __tinySyncHost?: SyncHostChannel }) | null
    if (!target) return
    const channel: SyncHostChannel = {
      call: (domain, method, payload) => {
        if (domain !== 'api') throw new Error(`unsupported sync host domain: ${domain}`)
        return this.runSyncHostCall(method, payload)
      },
    }
    try {
      target.__tinySyncHost = channel
    } catch (error) {
      this.report('error', `failed to install the synchronous host channel: ${describeError(error)}`)
    }
  }

  /** Synchronous host state, mirroring what the asynchronous API handlers use. */
  private runSyncHostCall(method: string, payload: Record<string, unknown>): unknown {
    switch (method) {
      case 'system.info':
        return this.systemInfoSnapshot()
      case 'storage.get':
        return { value: toPlainValue(this.storage[String(payload.key)]) }
      case 'storage.set':
        this.storage[String(payload.key)] = toPlainValue(payload.value) as never
        return { errMsg: 'setStorageSync:ok' }
      case 'storage.remove':
        delete this.storage[String(payload.key)]
        return { errMsg: 'removeStorageSync:ok' }
      case 'storage.clear':
        for (const key of Object.keys(this.storage)) delete this.storage[key]
        return { errMsg: 'clearStorageSync:ok' }
      case 'storage.info':
        return {
          keys: Object.keys(this.storage),
          currentSize: JSON.stringify(this.storage).length,
          limitSize: 10240,
        }
      default:
        throw new Error(`unsupported synchronous host API: ${method}`)
    }
  }

  /** Live host facts: device identity plus the current runtime surface size. */
  private systemInfoSnapshot(): Record<string, unknown> {
    const facts = this.options.systemInfo ?? {}
    const liveWidth = this.container.clientWidth
    const liveHeight = this.container.clientHeight
    return toPlainValue({
      SDKVersion: '3.0.0',
      ...facts,
      pixelRatio: facts.pixelRatio ?? (typeof window === 'undefined' ? 1 : window.devicePixelRatio),
      windowWidth: liveWidth > 0 ? liveWidth : Number(facts.windowWidth ?? 0),
      windowHeight: liveHeight > 0 ? liveHeight : Number(facts.windowHeight ?? 0),
    }) as Record<string, unknown>
  }

  private async runPlatformCall(action: Extract<CoreAction, { type: 'platformCall' }>): Promise<void> {
    if (action.method === 'system.info') {
      // Host-owned facts: the same snapshot the synchronous channel serves.
      this.finishPlatformCall(action.requestId, this.systemInfoSnapshot())
      return
    }
    const handler = this.options.apiHandlers[action.method]
    if (typeof handler !== 'function') {
      this.finishPlatformCall(action.requestId, undefined, `unsupported host API: ${action.method}`)
      return
    }
    try {
      const result = await handler(
        (action.params ?? {}) as Record<string, unknown>,
        { pageId: action.pageId },
      )
      this.finishPlatformCall(action.requestId, result)
    } catch (error) {
      this.finishPlatformCall(
        action.requestId,
        undefined,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  private async runHostRequest(action: Extract<CoreAction, { type: 'renderHostRequest' }>): Promise<void> {
    try {
      let result: unknown
      if (!this.options.onHostRequest) {
        throw new Error(`unsupported host request: ${action.method}`)
      }
      result = await this.options.onHostRequest(action.method, action.payload, { pageId: action.pageId })
      this.finishRenderHostRequest(action.requestId, result)
    } catch (error) {
      this.finishRenderHostRequest(
        action.requestId,
        undefined,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  private finishRenderHostRequest(requestId: string, result?: unknown, error?: string): void {
    this.execute(this.dispatchEvent({
      type: 'renderHostResult',
      requestId,
      ...(error ? { error } : { result }),
    }))
  }

  private finishPlatformCall(requestId: string, result?: unknown, error?: string): void {
    this.execute(this.dispatchEvent({
      type: 'platformResult',
      requestId,
      ...(error ? { error } : { result }),
    }))
  }

  private resolveCommand(command: string, result: unknown): void {
    const waiters = this.commandWaiters.get(command)
    if (!waiters?.length) return
    this.commandWaiters.delete(command)
    const error = result && typeof result === 'object'
      ? (result as { error?: { message?: string } }).error
      : undefined
    if (error) {
      for (const waiter of waiters) waiter.reject(new Error(error.message ?? `${command} failed`))
      return
    }
    for (const waiter of waiters) waiter.resolve(result)
  }

  private report(level: string, message: string): void {
    this.options.onDiagnostic?.({
      severity: level === 'error' ? 'error' : 'warning',
      code: 'WASM_HOST',
      message,
      source: 'host',
      timestamp: Date.now(),
    })
  }
}

function commandName(command: Record<string, unknown>): string | undefined {
  const type = command.type
  if (typeof type !== 'string') return undefined
  return type === 'navigateTo' || type === 'navigateBack' || type === 'switchTab'
    || type === 'redirectTo' || type === 'reLaunch' || type === 'inspectTree'
    ? type
    : undefined
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function ensureStackingContext(container: HTMLElement): void {
  if (typeof getComputedStyle !== 'function') return
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
}

function createThreadIframe(className: string, src: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.className = className
  iframe.title = 'Tiny runtime thread'
  iframe.src = src
  iframe.style.border = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.position = 'absolute'
  iframe.style.opacity = '0'
  iframe.setAttribute('aria-hidden', 'true')
  return iframe
}

function createRenderIframe(renderUrl: string, pageId: string): HTMLIFrameElement {
  const url = new URL(renderUrl, window.location.href)
  url.searchParams.set('pageId', pageId)
  const iframe = document.createElement('iframe')
  iframe.className = BROWSER_RUNTIME_NAMES.renderFrameClass
  iframe.dataset.pageId = pageId
  iframe.dataset.state = 'hidden'
  iframe.title = `Tiny render thread ${pageId}`
  iframe.src = url.href
  iframe.style.position = 'absolute'
  iframe.style.inset = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = '0'
  iframe.style.background = '#fff'
  iframe.style.visibility = 'hidden'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '0'
  return iframe
}

function waitForThreadReady(
  iframe: HTMLIFrameElement,
  channel: 'service' | 'render',
  timeoutMs = 15_000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error(`runtime ${channel} thread did not report ready within ${timeoutMs}ms`))
    }, timeoutMs)
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; channel?: string } | undefined
      if (data?.type !== BROWSER_RUNTIME_NAMES.runtimePortReady || data.channel !== channel) return
      if (event.source !== iframe.contentWindow) return
      cleanup()
      resolve()
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
    window.addEventListener('message', onMessage)
  })
}

/** JSON-round-trip a value so no reference crosses the iframe realm boundary. */
function toPlainValue<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
