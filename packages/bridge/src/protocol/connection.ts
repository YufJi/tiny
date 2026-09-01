import { ProtocolError, toProtocolErrorPayload } from './errors';
import {
  createMessage,
  createReply,
  PROTOCOL_VERSION,
  type ProtocolDomain,
  type ProtocolKind,
  type ProtocolMessage,
  type ProtocolReplyPayload,
  type ProtocolRole,
  validateEnvelope,
} from './message';
import { createTransportFrame, type Transport, type TransportFrame, validateTransportFrame } from './transport';

export type ProtocolCallHandler = (message: ProtocolMessage) => unknown | Promise<unknown>;

export type ProtocolEventHandler = (message: ProtocolMessage) => void;

export type ConnectionOptions = {
  localRole: ProtocolRole;
  peerRole: ProtocolRole;
  transport: Transport;
  defaultTimeoutMs?: number;
  capabilities?: Record<string, unknown>;
  respondToHello?: boolean;
};

type PendingCall = {
  resolve: (value: unknown) => void;
  reject: (error: ProtocolError) => void;
  timer?: ReturnType<typeof setTimeout>;
};

type ReadyWaiter = {
  resolve: (value: Record<string, unknown>) => void;
  reject: (error: ProtocolError) => void;
};

export class BridgeConnection {
  readonly localRole: ProtocolRole;
  readonly peerRole: ProtocolRole;
  private readonly transport: Transport;
  private readonly defaultTimeoutMs: number;
  private readonly capabilities: Record<string, unknown>;
  private readonly callHandlers = new Map<string, ProtocolCallHandler>();
  private readonly eventHandlers = new Map<string, ProtocolEventHandler>();
  private readonly pendingCalls = new Map<string, PendingCall>();
  private readonly batchedMessages = new Map<string, ProtocolMessage[]>();
  private readonly removeFrameListener: () => void;
  private closed = false;
  private flushScheduled = false;
  private readyWaiter: ReadyWaiter | null = null;

  constructor(options: ConnectionOptions) {
    this.localRole = options.localRole;
    this.peerRole = options.peerRole;
    this.transport = options.transport;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 10_000;
    this.capabilities = options.capabilities ?? {};
    this.removeFrameListener = this.transport.onFrame((frame) => this.handleFrame(frame));

    if (options.respondToHello ?? this.localRole !== 'host') {
      this.onCall('runtime', 'hello', async () => {
        const payload = this.handshakePayload();
        await this.control('runtime', 'ready', payload);
        return payload;
      });
    } else {
      this.onControl('runtime', 'ready', async (message) => {
        const payload = message.payload as Record<string, unknown>;
        this.readyWaiter?.resolve(payload);
        this.readyWaiter = null;
        return { accepted: true };
      });
    }
  }

  async handshake(capabilities: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    if (this.localRole !== 'host') {
      throw new ProtocolError('INVALID_ENVELOPE', 'Only the host can initiate a handshake');
    }

    const ready = new Promise<Record<string, unknown>>((resolve, reject) => {
      this.readyWaiter = { resolve, reject };
    });
    try {
      await this.call('runtime', 'hello', {
        protocolVersion: PROTOCOL_VERSION,
        role: this.localRole,
        capabilities: { ...this.capabilities, ...capabilities },
      });
      return await ready;
    } catch (error) {
      this.readyWaiter?.reject(
        error instanceof ProtocolError ? error : new ProtocolError('HANDLER_ERROR', String(error))
      );
      this.readyWaiter = null;
      throw error;
    }
  }

  call<T>(
    domain: ProtocolDomain,
    method: string,
    payload?: unknown,
    options: { pageId?: string; timeoutMs?: number } = {}
  ): Promise<T> {
    return this.request('call', domain, method, payload, options);
  }

  control<T>(
    domain: ProtocolDomain,
    method: string,
    payload?: unknown,
    options: { pageId?: string; timeoutMs?: number } = {}
  ): Promise<T> {
    return this.request('control', domain, method, payload, options);
  }

  sendEvent(domain: ProtocolDomain, method: string, payload?: unknown, options: { pageId?: string } = {}): void {
    const message = createMessage({
      kind: 'event',
      domain,
      method,
      source: this.localRole,
      target: this.peerRole,
      payload,
      pageId: options.pageId,
    });
    const key = `${message.source}:${message.pageId ?? ''}`;
    const queue = this.batchedMessages.get(key) ?? [];
    queue.push(message);
    this.batchedMessages.set(key, queue);
    this.scheduleFlush();
  }

  sendDiagnostic(level: 'log' | 'warn' | 'error' | 'state', payload: unknown, pageId?: string): void {
    this.sendNow(
      createMessage({
        kind: 'event',
        domain: 'diagnostic',
        method: `diagnostic.${level}`,
        source: this.localRole,
        target: this.peerRole,
        payload,
        pageId,
      })
    );
  }

  async flush(): Promise<void> {
    if (this.batchedMessages.size === 0) return;
    const messages = [...this.batchedMessages.values()].flat();
    this.batchedMessages.clear();
    this.sendFrame(messages);
  }

  close(): void | Promise<void> {
    if (this.closed) return this.transport.close();
    this.closed = true;
    this.removeFrameListener();
    this.batchedMessages.clear();
    const transportError = new ProtocolError('TRANSPORT_CLOSED', 'The bridge transport is closed');
    for (const pending of this.pendingCalls.values()) {
      if (pending.timer) clearTimeout(pending.timer);
      pending.reject(transportError);
    }
    this.pendingCalls.clear();
    this.readyWaiter?.reject(transportError);
    this.readyWaiter = null;
    return this.transport.close();
  }

  private request<T>(
    kind: Extract<ProtocolKind, 'call' | 'control'>,
    domain: ProtocolDomain,
    method: string,
    payload: unknown,
    options: { pageId?: string; timeoutMs?: number }
  ): Promise<T> {
    const message = createMessage({
      kind,
      domain,
      method,
      source: this.localRole,
      target: this.peerRole,
      payload,
      pageId: options.pageId,
    });

    return new Promise<T>((resolve, reject) => {
      const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
      const pending: PendingCall = {
        resolve: (value) => resolve(value as T),
        reject,
      };
      if (timeoutMs > 0) {
        pending.timer = setTimeout(() => {
          this.pendingCalls.delete(message.messageId);
          reject(new ProtocolError('TIMEOUT', `${domain}.${method} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }
      this.pendingCalls.set(message.messageId, pending);

      try {
        this.sendNow(message);
      } catch (error) {
        if (pending.timer) clearTimeout(pending.timer);
        this.pendingCalls.delete(message.messageId);
        reject(error instanceof ProtocolError ? error : new ProtocolError('HANDLER_ERROR', String(error)));
      }
    });
  }

  onCall(domain: ProtocolDomain, method: string, handler: ProtocolCallHandler): () => void {
    return this.registerCallHandler('call', domain, method, handler);
  }

  onControl(domain: ProtocolDomain, method: string, handler: ProtocolCallHandler): () => void {
    return this.registerCallHandler('control', domain, method, handler);
  }

  onEvent(domain: ProtocolDomain, method: string, handler: ProtocolEventHandler): () => void {
    const key = this.handlerKey('event', domain, method);
    this.eventHandlers.set(key, handler);
    return () => this.eventHandlers.delete(key);
  }

  private registerCallHandler(
    kind: Extract<ProtocolKind, 'call' | 'control'>,
    domain: ProtocolDomain,
    method: string,
    handler: ProtocolCallHandler
  ): () => void {
    const key = this.handlerKey(kind, domain, method);
    this.callHandlers.set(key, handler);
    return () => this.callHandlers.delete(key);
  }

  private handlerKey(kind: ProtocolKind, domain: ProtocolDomain, method: string): string {
    return `${kind}:${domain}:${method}`;
  }

  private handleFrame(value: unknown): void {
    if (this.closed) return;
    let frame: TransportFrame;
    try {
      frame = this.validateIncomingFrame(value);
    } catch (error) {
      this.handleProtocolError(error);
      return;
    }

    for (const message of frame.messages) {
      try {
        this.handleMessage(message);
      } catch (error) {
        this.handleProtocolError(error);
      }
    }
  }

  private validateIncomingFrame(value: unknown): TransportFrame {
    if (value && typeof value === 'object' && (value as Record<string, unknown>).protocolVersion !== PROTOCOL_VERSION) {
      throw new ProtocolError('PROTOCOL_VERSION_MISMATCH', `Expected protocol version ${PROTOCOL_VERSION}`);
    }
    return this.transportFrameOf(value);
  }

  private transportFrameOf(value: unknown): TransportFrame {
    return validateTransportFrame(value);
  }

  private handleMessage(message: ProtocolMessage): void {
    const validated = validateEnvelope(message);
    if (validated.target !== this.localRole || validated.source !== this.peerRole) {
      throw new ProtocolError('INVALID_ENVELOPE', 'Message source or target does not match the connection');
    }

    if (validated.kind === 'reply') {
      this.handleReply(validated as ProtocolMessage<ProtocolReplyPayload<unknown>>);
      return;
    }

    if (validated.kind === 'event') {
      const handler = this.eventHandlers.get(this.handlerKey('event', validated.domain, validated.method));
      if (!handler) {
        this.emitDiagnostic('warn', {
          code: 'UNSUPPORTED_METHOD',
          message: `No event handler for ${validated.domain}.${validated.method}`,
        });
        return;
      }
      handler(validated);
      return;
    }

    const handler = this.callHandlers.get(this.handlerKey(validated.kind, validated.domain, validated.method));
    if (!handler) {
      this.reply(validated, {
        ok: false,
        error: { code: 'UNSUPPORTED_METHOD', message: `No handler for ${validated.domain}.${validated.method}` },
      });
      return;
    }

    void Promise.resolve()
      .then(() => handler(validated))
      .then((result) => {
        this.reply(validated, { ok: true, result });
      })
      .catch((error) => {
        this.reply(validated, { ok: false, error: toProtocolErrorPayload(error) });
      });
  }

  private handleReply(message: ProtocolMessage<ProtocolReplyPayload<unknown>>): void {
    const pending = message.replyTo ? this.pendingCalls.get(message.replyTo) : undefined;
    if (!pending) return;
    if (pending.timer) clearTimeout(pending.timer);
    this.pendingCalls.delete(message.replyTo!);

    const payload = message.payload;
    if (!payload || typeof payload !== 'object' || typeof (payload as Record<string, unknown>).ok !== 'boolean') {
      pending.reject(new ProtocolError('INVALID_PAYLOAD', 'Reply payload is malformed'));
      return;
    }
    if (payload.ok) pending.resolve(payload.result);
    else pending.reject(new ProtocolError(payload.error.code, payload.error.message, payload.error.details));
  }

  private reply(message: ProtocolMessage, payload: ProtocolReplyPayload<unknown>): void {
    this.sendNow(createReply(message, payload));
  }

  private scheduleFlush(): void {
    if (this.flushScheduled) return;
    this.flushScheduled = true;
    queueMicrotask(() => {
      this.flushScheduled = false;
      void this.flush();
    });
  }

  private sendNow(message: ProtocolMessage): void {
    this.sendFrame([message]);
  }

  private sendFrame(messages: ProtocolMessage[]): void {
    if (this.closed) throw new ProtocolError('TRANSPORT_CLOSED', 'The bridge connection is closed');
    this.transport.send(createTransportFrame(messages));
  }

  private handleProtocolError(error: unknown): void {
    const payload = toProtocolErrorPayload(error);
    this.emitDiagnostic('error', payload);
    if (payload.code === 'PROTOCOL_VERSION_MISMATCH') void this.close();
  }

  private emitDiagnostic(level: 'log' | 'warn' | 'error' | 'state', payload: unknown): void {
    try {
      this.sendDiagnostic(level, payload);
    } catch {
      // Avoid diagnostics recursion when the transport is unavailable.
    }
  }

  private handshakePayload(): Record<string, unknown> {
    return {
      protocolVersion: PROTOCOL_VERSION,
      role: this.localRole,
      capabilities: this.capabilities,
    };
  }
}
