import { ProtocolError } from '@tiny/bridge'
import { createTransportFrame } from '@tiny/bridge'
import type { Transport, TransportFrame } from '@tiny/bridge'
import { validateTransportFrame } from '@tiny/bridge'

export type MessagePortLike = {
  postMessage(message: unknown): void;
  start?(): void;
  close?(): void;
  onmessage: ((event: { data: unknown }) => void) | null;
};

export type MessagePortTransportOptions = {
  closePort?: boolean;
  /** Host glue supplies the frame-level synchronous exchange when it can. */
  sendSync?: (frame: TransportFrame) => TransportFrame;
};

export function createMessagePortTransport(
  port: MessagePortLike,
  options: MessagePortTransportOptions = {}
): Transport {
  let closed = false;
  const listeners = new Set<(frame: TransportFrame) => void>();
  const closePort = options.closePort ?? true;
  const sendSync = options.sendSync;

  port.onmessage = (event) => {
    if (closed) return;
    const frame = validateTransportFrame(event.data);
    for (const listener of listeners) listener(frame);
  };
  port.start?.();

  return {
    send(frame) {
      if (closed) throw new ProtocolError('TRANSPORT_CLOSED', 'The message-port transport is closed');
      port.postMessage(createTransportFrame(frame.messages));
    },
    close() {
      if (closed) return;
      closed = true;
      port.onmessage = null;
      if (closePort) port.close?.();
    },
    onFrame(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    sendSync(frame) {
      if (!sendSync) {
        throw new ProtocolError('UNSUPPORTED_METHOD', 'The message-port transport has no synchronous path');
      }
      return sendSync(frame);
    },
  };
}

export type HostMessageChannelPair = {
  hostTransport: Transport;
  peerPort: MessagePortLike;
};

export function createHostMessageChannelPair(options: MessagePortTransportOptions = {}): HostMessageChannelPair {
  const MessageChannelConstructor = globalThis.MessageChannel;
  if (!MessageChannelConstructor) {
    throw new ProtocolError('TRANSPORT_CLOSED', 'MessageChannel is unavailable in this environment');
  }
  const channel = new MessageChannelConstructor();
  return {
    hostTransport: createMessagePortTransport(channel.port1 as unknown as MessagePortLike, options),
    peerPort: channel.port2 as unknown as MessagePortLike,
  };
}
