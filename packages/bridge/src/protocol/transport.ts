import { ProtocolError } from './errors';
import { PROTOCOL_VERSION, type ProtocolMessage, validateEnvelope } from './message';

export type TransportFrame = {
  protocolVersion: typeof PROTOCOL_VERSION;
  messages: ProtocolMessage[];
};

export type TransportFrameListener = (frame: TransportFrame) => void;

export interface Transport {
  send(frame: TransportFrame): void;
  close(): void | Promise<void>;
  onFrame(listener: TransportFrameListener): () => void;
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
}

export function createInMemoryTransportPair(): [Transport, Transport] {
  const first = new InMemoryTransport('first');
  const second = new InMemoryTransport('second');
  first.attachPeer(second);
  second.attachPeer(first);
  return [first, second];
}
