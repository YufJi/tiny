import type { Transport, TransportFrame } from '@tiny/bridge'
import { createMessagePortTransport, type MessagePortLike } from './message-port-transport'
import { BROWSER_RUNTIME_NAMES } from './naming'

export type RuntimePortChannel = 'service' | 'render'

export type RuntimePortMessage = {
  type: typeof BROWSER_RUNTIME_NAMES.runtimePort
  channel: RuntimePortChannel
}

export type RuntimePortOptions = {
  sendSync?: (frame: TransportFrame) => TransportFrame
}

export function listenForRuntimePort(
  channel: RuntimePortChannel,
  callback: (transport: Transport) => void,
  options: RuntimePortOptions = {},
): () => void {
  const listener = (event: MessageEvent) => {
    const data = event.data as RuntimePortMessage | undefined
    if (data?.type !== BROWSER_RUNTIME_NAMES.runtimePort || data.channel !== channel) return
    const port = event.ports[0]
    if (!port) return
    callback(createMessagePortTransport(port as unknown as MessagePortLike, options))
  }
  window.addEventListener('message', listener)
  if (window.parent !== window) {
    window.parent.postMessage({
      type: BROWSER_RUNTIME_NAMES.runtimePortReady,
      channel,
    }, '*')
  }
  return () => window.removeEventListener('message', listener)
}
