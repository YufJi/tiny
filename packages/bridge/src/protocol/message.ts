import type { ProtocolErrorPayload } from './errors';
import { ProtocolError } from './errors';
import { assertJsonSafe } from './json';

export const PROTOCOL_VERSION = 1;

export type ProtocolRole = 'host' | 'service' | 'render' | 'devtool';
export type ProtocolKind = 'call' | 'reply' | 'event' | 'control';
export type ProtocolDomain = 'runtime' | 'page' | 'data' | 'event' | 'api' | 'diagnostic';

export type ProtocolReplyPayload<T> = { ok: true; result: T } | { ok: false; error: ProtocolErrorPayload };

export type ProtocolMessage<T = unknown> = {
  protocolVersion: typeof PROTOCOL_VERSION;
  messageId: string;
  kind: ProtocolKind;
  domain: ProtocolDomain;
  method: string;
  source: ProtocolRole;
  target: ProtocolRole;
  payload: T;
  pageId?: string;
  replyTo?: string;
  timestamp: number;
};

export type ProtocolMessageInput<T> = Omit<ProtocolMessage<T>, 'protocolVersion' | 'messageId' | 'timestamp'>;

const ROLES: ProtocolRole[] = ['host', 'service', 'render', 'devtool'];
const KINDS: ProtocolKind[] = ['call', 'reply', 'event', 'control'];
const DOMAINS: ProtocolDomain[] = ['runtime', 'page', 'data', 'event', 'api', 'diagnostic'];

let messageIdCounter = 0;

export function createMessageId(): string {
  messageIdCounter = (messageIdCounter + 1) % Number.MAX_SAFE_INTEGER;
  const random = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10);
  return `msg-${Date.now().toString(36)}-${messageIdCounter.toString(36)}-${random}`;
}

export function createMessage<T>(input: ProtocolMessageInput<T>): ProtocolMessage<T> {
  const message: ProtocolMessage<T> = {
    ...input,
    protocolVersion: PROTOCOL_VERSION,
    messageId: createMessageId(),
    timestamp: Date.now(),
  };
  validateEnvelope(message);
  return message;
}

export function isEnvelope(value: unknown): value is ProtocolMessage {
  return validateEnvelope(value) !== undefined;
}

export function validateEnvelope(value: unknown): ProtocolMessage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'Protocol message must be an object');
  }

  const message = value as Record<string, unknown>;
  if (message.protocolVersion !== PROTOCOL_VERSION) {
    throw new ProtocolError(
      'PROTOCOL_VERSION_MISMATCH',
      `Expected protocol version ${PROTOCOL_VERSION}, received ${String(message.protocolVersion)}`
    );
  }
  if (!isNonEmptyString(message.messageId)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'messageId must be a non-empty string');
  }
  if (!KINDS.includes(message.kind as ProtocolKind)) {
    throw new ProtocolError('INVALID_ENVELOPE', `Unsupported message kind: ${String(message.kind)}`);
  }
  if (!DOMAINS.includes(message.domain as ProtocolDomain)) {
    throw new ProtocolError('INVALID_ENVELOPE', `Unsupported message domain: ${String(message.domain)}`);
  }
  if (!isNonEmptyString(message.method)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'method must be a non-empty string');
  }
  if (!ROLES.includes(message.source as ProtocolRole)) {
    throw new ProtocolError('INVALID_ENVELOPE', `Unsupported source role: ${String(message.source)}`);
  }
  if (!ROLES.includes(message.target as ProtocolRole)) {
    throw new ProtocolError('INVALID_ENVELOPE', `Unsupported target role: ${String(message.target)}`);
  }
  if (typeof message.timestamp !== 'number' || !Number.isFinite(message.timestamp)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'timestamp must be a finite number');
  }
  if (message.pageId !== undefined && !isNonEmptyString(message.pageId)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'pageId must be a non-empty string when present');
  }
  if (message.replyTo !== undefined && !isNonEmptyString(message.replyTo)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'replyTo must be a non-empty string when present');
  }
  if (message.kind === 'reply' && !isNonEmptyString(message.replyTo)) {
    throw new ProtocolError('INVALID_ENVELOPE', 'reply messages require replyTo');
  }

  assertJsonSafe(message.payload);
  return value as ProtocolMessage;
}

export function createReply<T>(
  request: ProtocolMessage,
  payload: ProtocolReplyPayload<T>
): ProtocolMessage<ProtocolReplyPayload<T>> {
  return createMessage({
    kind: 'reply',
    domain: request.domain,
    method: request.method,
    source: request.target,
    target: request.source,
    payload,
    pageId: request.pageId,
    replyTo: request.messageId,
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
