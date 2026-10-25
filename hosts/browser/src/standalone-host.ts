import { createHostMessageChannelPair } from '@tiny/bridge'
import { createTinyRuntime, type TinyRuntimeHost } from '@tiny/runtime'
import type { RenderThreadConnector, RuntimeDiagnostic } from '@tiny/runtime'
import type { HostApiHandlers, RuntimeManifest, SystemInfoSnapshot, StorageSnapshot } from '@tiny/runtime'
import { createBrowserApiHandlers } from './api-handlers'

export type StandaloneRenderMode = 'single' | 'per-page'

export type StandaloneHostOptions = {
  manifest: RuntimeManifest
  serviceUrl: string
  renderUrl: string
  initialPath: string
  initialData?: Record<string, unknown>
  systemInfo?: Partial<SystemInfoSnapshot>
  storage?: StorageSnapshot
  container?: HTMLElement
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
  apiHandlers?: HostApiHandlers
  /**
   * `single` keeps one render iframe for the whole page stack (default).
   * `per-page` gives every page its own render iframe, preserving hidden page
   * DOM, scroll position and timers like a real WebView stack.
   */
  renderMode?: StandaloneRenderMode
}

export type StandaloneHost = {
  host: TinyRuntimeHost
  serviceIframe: HTMLIFrameElement
  /** The render iframe of the active page. */
  readonly renderIframe: HTMLIFrameElement | undefined
  /** Every live page render iframe, keyed by page ID. */
  readonly renderIframes: ReadonlyMap<string, HTMLIFrameElement>
  /** Close the runtime and remove every thread iframe. */
  dispose(): Promise<void>
}

export async function createStandaloneDualThreadHost(
  options: StandaloneHostOptions,
): Promise<StandaloneHost> {
  const container = options.container ?? document.body
  const perPage = options.renderMode === 'per-page'
  const serviceChannel = createHostMessageChannelPair()
  const serviceIframe = createIframe('tiny-runtime-service-frame', options.serviceUrl)
  const serviceReady = waitForThreadReady(serviceIframe, 'service')
  const renderChannel = perPage ? null : createHostMessageChannelPair()
  const renderIframe = perPage ? null : createIframe('tiny-runtime-render-frame', options.renderUrl)
  const renderReady = renderIframe ? waitForThreadReady(renderIframe, 'render') : null
  container.append(serviceIframe)
  if (renderIframe) container.append(renderIframe)
  try {
    await serviceReady
    if (renderReady) await renderReady
  } catch (error) {
    serviceIframe.remove()
    renderIframe?.remove()
    throw error
  }
  serviceIframe.contentWindow?.postMessage(
    { type: 'tiny-runtime-port', channel: 'service' },
    '*',
    [serviceChannel.peerPort as unknown as Transferable],
  )

  if (perPage) {
    return createPerPageHost(options, container, serviceIframe, serviceChannel.hostTransport)
  }
  if (!renderChannel || !renderIframe) throw new Error('render iframe was not created')
  renderIframe.contentWindow?.postMessage(
    { type: 'tiny-runtime-port', channel: 'render' },
    '*',
    [renderChannel.peerPort as unknown as Transferable],
  )

  const host = createTinyRuntime({
    serviceTransport: serviceChannel.hostTransport,
    renderTransport: renderChannel.hostTransport,
    manifest: options.manifest,
    initialPath: options.initialPath,
    initialData: options.initialData,
    systemInfo: options.systemInfo,
    storage: options.storage,
    onDiagnostic: options.onDiagnostic,
    apiHandlers: { ...createBrowserApiHandlers(), ...options.apiHandlers },
  })
  await Promise.all([host.service.handshake(), host.render.handshake()])
  const renderIframes = new Map<string, HTMLIFrameElement>()
  return {
    host,
    serviceIframe,
    get renderIframe() {
      return renderIframe
    },
    get renderIframes() {
      return renderIframes
    },
    async dispose() {
      await host.close()
      serviceIframe.remove()
      renderIframe.remove()
      renderIframes.clear()
    },
  }
}

async function createPerPageHost(
  options: StandaloneHostOptions,
  container: HTMLElement,
  serviceIframe: HTMLIFrameElement,
  serviceTransport: ReturnType<typeof createHostMessageChannelPair>['hostTransport'],
): Promise<StandaloneHost> {
  ensureStackingContext(container)
  const frames = new Map<string, HTMLIFrameElement>()
  let activePageId: string | undefined
  let appVisible = true

  const updateVisibility = () => {
    for (const [pageId, frame] of frames) {
      const visible = appVisible && pageId === activePageId
      frame.style.visibility = visible ? 'visible' : 'hidden'
      frame.style.pointerEvents = visible ? 'auto' : 'none'
      frame.style.zIndex = visible ? '1' : '0'
      frame.dataset.state = visible ? 'active' : 'hidden'
      if (visible) frame.removeAttribute('aria-hidden')
      else frame.setAttribute('aria-hidden', 'true')
    }
  }

  const connector: RenderThreadConnector = {
    async connect(pageId) {
      const iframe = createRenderIframe(options.renderUrl, pageId)
      frames.set(pageId, iframe)
      container.append(iframe)
      updateVisibility()
      try {
        await waitForThreadReady(iframe, 'render')
      } catch (error) {
        frames.delete(pageId)
        iframe.remove()
        throw error
      }
      const channel = createHostMessageChannelPair()
      iframe.contentWindow?.postMessage(
        { type: 'tiny-runtime-port', channel: 'render' },
        '*',
        [channel.peerPort as unknown as Transferable],
      )
      return channel.hostTransport
    },
    activate(pageId) {
      activePageId = pageId
      updateVisibility()
    },
    disconnect(pageId) {
      const frame = frames.get(pageId)
      frames.delete(pageId)
      frame?.remove()
      if (activePageId === pageId) activePageId = undefined
      updateVisibility()
    },
    setAppVisible(visible) {
      appVisible = visible
      updateVisibility()
    },
  }

  const host = createTinyRuntime({
    serviceTransport,
    renderConnector: connector,
    manifest: options.manifest,
    initialPath: options.initialPath,
    initialData: options.initialData,
    systemInfo: options.systemInfo,
    storage: options.storage,
    onDiagnostic: options.onDiagnostic,
    apiHandlers: { ...createBrowserApiHandlers(), ...options.apiHandlers },
  })
  await host.service.handshake()

  return {
    host,
    serviceIframe,
    get renderIframe() {
      return activePageId ? frames.get(activePageId) : undefined
    },
    get renderIframes() {
      return frames
    },
    async dispose() {
      await host.close()
      serviceIframe.remove()
      for (const frame of frames.values()) frame.remove()
      frames.clear()
    },
  }
}

function createIframe(className: string, src: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.className = className
  iframe.setAttribute('title', 'Tiny runtime thread')
  iframe.src = src
  iframe.style.border = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  if (className.endsWith('service-frame')) {
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.position = 'absolute'
    iframe.style.opacity = '0'
  }
  return iframe
}

function createRenderIframe(renderUrl: string, pageId: string): HTMLIFrameElement {
  const url = new URL(renderUrl, window.location.href)
  url.searchParams.set('pageId', pageId)
  const iframe = createIframe('tiny-runtime-render-frame', url.href)
  iframe.dataset.pageId = pageId
  iframe.dataset.state = 'hidden'
  iframe.name = `tiny-render-${pageId}`
  iframe.title = `Tiny render thread ${pageId}`
  iframe.style.position = 'absolute'
  iframe.style.inset = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.visibility = 'hidden'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '0'
  iframe.style.background = '#fff'
  return iframe
}

function ensureStackingContext(container: HTMLElement): void {
  if (typeof getComputedStyle !== 'function') return
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative'
  }
}

function waitForThreadReady(
  iframe: HTMLIFrameElement,
  channel: 'service' | 'render',
  timeoutMs = 15_000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`runtime ${channel} thread did not report ready within ${timeoutMs}ms`))
    }, timeoutMs)
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; channel?: string } | undefined
      if (data?.type !== 'tiny-runtime-port-ready' || data.channel !== channel) return
      if (event.source !== iframe.contentWindow) return
      cleanup()
      resolve()
    }
    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
    window.addEventListener('message', onMessage)
  })
}
