import { createMessagePortTransport, type MessagePortLike } from '@tiny/bridge'
import type { Transport } from '@tiny/bridge'

export type RuntimePortChannel = 'service' | 'render'

export type RuntimePortMessage = {
  type: 'tiny-runtime-port'
  channel: RuntimePortChannel
}

export type RuntimePortReadyMessage = {
  type: 'tiny-runtime-port-ready'
  channel: RuntimePortChannel
}

export function listenForRuntimePort(
  channel: RuntimePortChannel,
  callback: (transport: Transport) => void,
): () => void {
  const listener = (event: MessageEvent) => {
    const data = event.data as RuntimePortMessage | undefined
    if (data?.type !== 'tiny-runtime-port' || data.channel !== channel) return
    const port = event.ports[0]
    if (!port) return
    callback(createMessagePortTransport(port as unknown as MessagePortLike))
  }
  window.addEventListener('message', listener)
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'tiny-runtime-port-ready', channel }, '*')
  }
  return () => window.removeEventListener('message', listener)
}
