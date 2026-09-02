import { createHostMessageChannelPair } from '@tiny/bridge'
import { createTinyRuntime, type TinyRuntimeHost } from './host'
import type { RuntimeManifest } from './types'

export type StandaloneHostOptions = {
  manifest: RuntimeManifest
  serviceUrl: string
  renderUrl: string
  initialPath: string
  initialData?: Record<string, unknown>
  container?: HTMLElement
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

  const serviceIframe = createIframe('tiny-runtime-service-frame')
  const renderIframe = createIframe('tiny-runtime-render-frame')
  serviceIframe.src = options.serviceUrl
  renderIframe.src = options.renderUrl
  container.append(serviceIframe, renderIframe)

  await Promise.all([waitForLoad(serviceIframe), waitForLoad(renderIframe)])
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
  })
  await Promise.all([host.service.handshake(), host.render.handshake()])
  return { host, serviceIframe, renderIframe }
}

function createIframe(className: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe')
  iframe.className = className
  iframe.setAttribute('title', 'Tiny runtime thread')
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

function waitForLoad(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    iframe.addEventListener('load', () => resolve(), { once: true })
  })
}
