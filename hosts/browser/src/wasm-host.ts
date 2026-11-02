import { createHostMessageChannelPair } from '@tiny/bridge'
import type { Transport, TransportFrame } from '@tiny/bridge'
import type {
  HostApiHandlers,
  RuntimeDiagnostic,
  RuntimeManifest,
  StorageSnapshot,
  SystemInfoSnapshot,
} from '@tiny/runtime'
import { createBrowserApiHandlers } from './api-handlers'
import { BROWSER_RUNTIME_NAMES } from './naming'
import { installCanvasHandoffRelay } from './standalone-host'

/**
 * Minimal surface of the wasm-bindgen `WasmHostCore` class.
 *
 * The browser adapter deliberately does not import the generated wasm module:
 * the devtool passes a factory so the bundle can load/instantiate wasm lazily
 * and tests can substitute a fake core.
 */
export interface WasmHostCoreLike {
  start(nowMs: number): string
  handle_event(eventJson: string, nowMs: number): string
  set_app_visible(visible: boolean): string
  page_stack_json(): string
  diagnostics_json(): string
}

export type WasmHostCoreFactory = (configJson: string) => Promise<WasmHostCoreLike>

export type WasmHostOptions = {
  appId: string
  manifest: RuntimeManifest
  serviceUrl: string
  renderUrl: string
  initialPath: string
  systemInfo?: Partial<SystemInfoSnapshot>
  storage?: StorageSnapshot
  container?: HTMLElement
  maxPageStack?: number
  apiHandlers?: HostApiHandlers
  onState?: (state: unknown) => void
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
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
  private activePageId: string | undefined
  private appVisible = true
  private removeCanvasRelay: (() => void) | undefined
  private disposed = false
  private commandWaiters = new Map<string, Array<{
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }>>()

  constructor(
    options: WasmHostOptions,
    factory: WasmHostCoreFactory,
  ) {
    this.options = options
    this.factory = factory
    this.ownsContainer = !options.container
    this.container = options.container ?? document.createElement('div')
  }

  get renderFrameCount(): number {
    return this.pages.size
  }

  get renderIframes(): ReadonlyMap<string, HTMLIFrameElement> {
    const result = new Map<string, HTMLIFrameElement>()
    for (const [pageId, page] of this.pages) result.set(pageId, page.iframe)
    return result
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
    iframe.contentWindow?.postMessage(
      { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'service' },
      '*',
      [channel.peerPort as unknown as Transferable],
    )
    this.serviceTransport.onFrame((frame) => {
      this.execute(this.dispatch({ type: 'serviceFrame', frame: JSON.stringify(frame) }))
    })
    this.removeCanvasRelay = installCanvasHandoffRelay({
      serviceIframe: iframe,
      getRenderIframe: (pageId) => {
        if (pageId) return this.pages.get(pageId)?.iframe
        return this.activePageId ? this.pages.get(this.activePageId)?.iframe : undefined
      },
      isRenderSource: (source) => {
        for (const page of this.pages.values()) {
          if (page.iframe.contentWindow === source) return true
        }
        return false
      },
    })

    const config = JSON.stringify({
      appId: this.options.appId,
      manifest: this.options.manifest,
      initialPath: this.options.initialPath,
      systemInfo: {
        SDKVersion: '3.0.0',
        ...this.options.systemInfo,
      },
      storage: this.options.storage ?? {},
      maxPageStack: this.options.maxPageStack,
    })
    this.core = await this.factory(config)
    this.execute(this.core.start(nowMs()))
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
    this.execute(this.dispatchEvent({ type: 'command', command }))
    return promise
  }

  async inspectTree(pageId: string | undefined): Promise<unknown> {
    if (!pageId) return null
    return this.command({ type: 'inspectTree', pageId })
  }

  async setAppVisible(visible: boolean): Promise<void> {
    this.appVisible = visible
    if (!this.core) return
    this.execute(this.core.set_app_visible(visible))
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
    for (const waiters of this.commandWaiters.values()) {
      for (const waiter of waiters) waiter.reject(new Error('WasmBrowserHost disposed'))
    }
    this.commandWaiters.clear()
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
        case 'diagnostic':
          this.report(action.level, JSON.stringify(action.payload))
          break
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

  private async runPlatformCall(action: Extract<CoreAction, { type: 'platformCall' }>): Promise<void> {
    const handlers = {
      ...createBrowserApiHandlers(),
      ...this.options.apiHandlers,
      ...storageHandlers(this.options.storage ?? {}),
    }
    const handler = handlers[action.method]
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

function storageHandlers(storage: StorageSnapshot): HostApiHandlers {
  const values = { ...storage }
  return {
    'storage.get': (params) => ({ value: values[String(params.key)] }),
    'storage.set': (params) => {
      values[String(params.key)] = params.value
      return { errMsg: 'setStorageSync:ok' }
    },
    'storage.remove': (params) => {
      delete values[String(params.key)]
      return { errMsg: 'removeStorageSync:ok' }
    },
    'storage.clear': () => {
      for (const key of Object.keys(values)) delete values[key]
      return { errMsg: 'clearStorageSync:ok' }
    },
    'storage.info': () => ({
      keys: Object.keys(values),
      currentSize: JSON.stringify(values).length,
      limitSize: 10240,
    }),
  }
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
