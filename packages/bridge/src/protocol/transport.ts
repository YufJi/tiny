import { ProtocolError } from './errors';
import { PROTOCOL_VERSION, type ProtocolMessage, validateEnvelope } from './message';

export type TransportFrame = {
  protocolVersion: typeof PROTOCOL_VERSION;
  messages: ProtocolMessage[];
};

export type TransportFrameListener = (frame: TransportFrame) => void;

export interface Transport {
  send(frame: TransportFrame): void;
  onFrame(listener: TransportFrameListener): () => void;
  /**
   * Synchronously exchange one request frame with the peer.
   *
   * The host glue owns the implementation (MessagePort + injected function,
   * direct object bridge, native JSCore, …). A transport that cannot answer
   * synchronously throws `UNSUPPORTED_METHOD`; `BridgeConnection.callSync`
   * surfaces that error. This is a stable part of the JS bridge contract.
   */
  sendSync(frame: TransportFrame): TransportFrame;
  close(): void | Promise<void>;
}

/** Global handle injected by the host glue before the bridge connects. */
export const HOST_BRIDGE_GLOBAL = '__TINY_HOST_BRIDGE__';

export function installHostBridge(transport: Transport): void {
  (globalThis as unknown as Record<string, unknown>)[HOST_BRIDGE_GLOBAL] = transport;
}

export function getHostBridge(): Transport | undefined {
  return (globalThis as unknown as Record<string, unknown>)[HOST_BRIDGE_GLOBAL] as Transport | undefined;
}

export function createTransportFrame(messages: ProtocolMessage[]): TransportFrame {
  if (messages.length === 0) {
    throw new ProtocolError('INVALID_PAYLOAD', 'A transport frame must contain at least one message');
  }
  messages.forEach(validateEnvelope);
  return { protocolVersion: PROTOCOL_VERSION, messages };
}

export function validateTransportFrame(value: unknown): TransportFrame {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'Transport frame must be an object');
  }
  const frame = value as Record<string, unknown>;
  if (frame.protocolVersion !== PROTOCOL_VERSION) {
    throw new ProtocolError(
      'PROTOCOL_VERSION_MISMATCH',
      `Expected transport protocol version ${PROTOCOL_VERSION}, received ${String(frame.protocolVersion)}`
    );
  }
  if (!Array.isArray(frame.messages) || frame.messages.length === 0) {
    throw new ProtocolError('INVALID_ENVELOPE', 'Transport frame must contain a non-empty message array');
  }
  return {
    protocolVersion: PROTOCOL_VERSION,
    messages: frame.messages.map((message) => validateEnvelope(message)),
  };
}

type InMemoryPeer = {
  receive(frame: TransportFrame): void;
  closed: boolean;
};

class InMemoryTransport implements Transport {
  private readonly listeners = new Set<TransportFrameListener>();
  private peer: InMemoryPeer | null = null;
  closed = false;

  constructor(readonly name: string) {}

  attachPeer(peer: InMemoryPeer): void {
    this.peer = peer;
  }

  send(frame: TransportFrame): void {
    const validated = createTransportFrame(frame.messages);
    if (!this.peer || this.peer.closed) {
      throw new ProtocolError('TRANSPORT_CLOSED', `The ${this.name} transport peer is closed`);
    }
    this.peer.receive(validated);
  }

  receive(frame: TransportFrame): void {
    for (const listener of this.listeners) listener(frame);
  }

  close(): void {
    this.peer = null;
    this.closed = true;
  }

  onFrame(listener: TransportFrameListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  sendSync(_frame: TransportFrame): TransportFrame {
    throw new ProtocolError('UNSUPPORTED_METHOD', `The ${this.name} transport does not support synchronous calls`);
  }
}

export function createInMemoryTransportPair(): [Transport, Transport] {
  const first = new InMemoryTransport('first');
  const second = new InMemoryTransport('second');
  first.attachPeer(second);
  second.attachPeer(first);
  return [first, second];
}
