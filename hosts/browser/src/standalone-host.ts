import { createHostMessageChannelPair } from '@tiny/bridge'
import { createTinyRuntime, type TinyRuntimeHost } from '@tiny/runtime'
import type { RuntimeDiagnostic } from '@tiny/runtime'
import type { RuntimeManifest, SystemInfoSnapshot, StorageSnapshot } from '@tiny/runtime'

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
}

export type StandaloneHost = {
  host: TinyRuntimeHost
  serviceIframe: HTMLIFrameElement
  renderIframe: HTMLIFrameElement
}

export async function createStandaloneDualThreadHost(
  options: StandaloneHostOptions,
): Promise<StandaloneHost> {
  const serviceChannel = createHostMessageChannelPair()
  const renderChannel = createHostMessageChannelPair()
  const container = options.container ?? document.body

  const serviceIframe = createIframe('tiny-runtime-service-frame', options.serviceUrl)
  const renderIframe = createIframe('tiny-runtime-render-frame', options.renderUrl)
  const serviceReady = waitForThreadReady(serviceIframe, 'service')
  const renderReady = waitForThreadReady(renderIframe, 'render')
  container.append(serviceIframe, renderIframe)

  await Promise.all([serviceReady, renderReady])
  serviceIframe.contentWindow?.postMessage(
    { type: 'tiny-runtime-port', channel: 'service' },
    '*',
    [serviceChannel.peerPort as unknown as Transferable],
  )
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
  })
  await Promise.all([host.service.handshake(), host.render.handshake()])
  return { host, serviceIframe, renderIframe }
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
