import { createHostMessageChannelPair } from '@tiny/bridge'
import { createTinyRuntime, type TinyRuntimeHost } from '@tiny/runtime'
import type { RenderThreadConnector, RuntimeDiagnostic } from '@tiny/runtime'
import type { HostApiHandlers, RuntimeManifest, SystemInfoSnapshot, StorageSnapshot } from '@tiny/runtime'
import { createBrowserApiHandlers } from './api-handlers'
import { BROWSER_RUNTIME_NAMES } from './naming'

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
  /** Maximum pages per mini-program page stack. Defaults to 10. */
  maxPageStack?: number
}

/**
 * WeChat base-library level the browser host reports to mini-programs.
 * A host wrapping another engine should pass its own `systemInfo.SDKVersion`.
 */
export const BROWSER_SDK_VERSION = '3.0.0'

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
  const serviceChannel = createHostMessageChannelPair()
  const serviceIframe = createIframe(BROWSER_RUNTIME_NAMES.serviceFrameClass, options.serviceUrl)
  const serviceReady = waitForThreadReady(serviceIframe, 'service')
  container.append(serviceIframe)
  try {
    await serviceReady
  } catch (error) {
    serviceIframe.remove()
    throw error
  }
  serviceIframe.contentWindow?.postMessage(
    { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'service' },
    '*',
    [serviceChannel.peerPort as unknown as Transferable],
  )
  return createPerPageHost(options, container, serviceIframe, serviceChannel.hostTransport)
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
  const removeCanvasRelay = installCanvasHandoffRelay({
    serviceIframe,
    getRenderIframe: (pageId) => {
      if (pageId) return frames.get(pageId)
      if (activePageId) return frames.get(activePageId)
      return frames.values().next().value
    },
    isRenderSource: (source) => {
      for (const frame of frames.values()) {
        if (frame.contentWindow === source) return true
      }
      return false
    },
  })

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
        { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'render' },
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
    systemInfo: { SDKVersion: BROWSER_SDK_VERSION, ...options.systemInfo },
    storage: options.storage,
    onDiagnostic: options.onDiagnostic,
    maxPageStack: options.maxPageStack,
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
      removeCanvasRelay()
      await host.close()
      serviceIframe.remove()
      for (const frame of frames.values()) frame.remove()
      frames.clear()
    },
  }
}

export type CanvasHandoffRelayOptions = {
  serviceIframe: HTMLIFrameElement
  /** Resolve the render iframe for a page. */
  getRenderIframe: (pageId?: string) => HTMLIFrameElement | undefined
  isRenderSource: (source: MessageEventSource | null) => boolean
}

/**
 * Browser-host relay for the OffscreenCanvas handoff.
 *
 * The service thread asks its parent for a canvas handle; the parent forwards
 * the request to the render iframe that owns the page. The render iframe
 * transfers the OffscreenCanvas back through this relay.
 */
export function installCanvasHandoffRelay(
  options: CanvasHandoffRelayOptions,
): () => void {
  const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin
  const serviceWindow = options.serviceIframe.contentWindow
  const sendToService = (payload: Record<string, unknown>, transfer: Transferable[] = []): void => {
    try {
      serviceWindow?.postMessage(payload, targetOrigin, transfer)
    } catch {
      // The service iframe may already be gone.
    }
  }
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    const data = event.data as {
      type?: string
      token?: string
      status?: string
      pageId?: string
      offscreen?: OffscreenCanvas
    } | undefined
    if (!data?.type || !data.token) return
    if (event.source === serviceWindow && data.type === BROWSER_RUNTIME_NAMES.canvasRequest) {
      const renderWindow = options.getRenderIframe(data.pageId)?.contentWindow
      if (!renderWindow) {
        sendToService({
          type: BROWSER_RUNTIME_NAMES.canvasError,
          token: data.token,
          reason: 'render-not-found',
        })
        return
      }
      try {
        renderWindow.postMessage(data, targetOrigin)
      } catch {
        sendToService({
          type: BROWSER_RUNTIME_NAMES.canvasError,
          token: data.token,
          reason: 'render-post-failed',
        })
      }
      return
    }
    if (!options.isRenderSource(event.source)) return
    if (data.type === BROWSER_RUNTIME_NAMES.canvasHandoff) {
      if (data.status === 'transferred' && !data.offscreen) {
        sendToService({
          type: BROWSER_RUNTIME_NAMES.canvasError,
          token: data.token,
          reason: 'missing-offscreen',
        })
        return
      }
      const transfer = data.status === 'transferred' && data.offscreen
        ? [data.offscreen]
        : []
      sendToService(data as Record<string, unknown>, transfer)
      return
    }
    if (data.type === BROWSER_RUNTIME_NAMES.canvasError) {
      sendToService(data as Record<string, unknown>)
    }
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
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
  const iframe = createIframe(BROWSER_RUNTIME_NAMES.renderFrameClass, url.href)
  iframe.dataset.pageId = pageId
  iframe.dataset.state = 'hidden'
  iframe.name = `${BROWSER_RUNTIME_NAMES.renderFrameNamePrefix}${pageId}`
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
      if (data?.type !== BROWSER_RUNTIME_NAMES.runtimePortReady || data.channel !== channel) return
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
