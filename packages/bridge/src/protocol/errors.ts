export type ProtocolErrorCode =
  | 'HANDLER_ERROR'
  | 'INVALID_ENVELOPE'
  | 'INVALID_PAYLOAD'
  | 'PROTOCOL_VERSION_MISMATCH'
  | 'TRANSPORT_CLOSED'
  | 'TIMEOUT'
  | 'UNSUPPORTED_METHOD';

export type ProtocolErrorPayload = {
  code: ProtocolErrorCode | string;
  message: string;
  details?: unknown;
};

export class ProtocolError extends Error {
  readonly code: ProtocolErrorCode | string;
  readonly details?: unknown;

  constructor(code: ProtocolErrorCode | string, message: string, details?: unknown) {
    super(message);
    this.name = 'ProtocolError';
    this.code = code;
    this.details = details;
  }
}

export function toProtocolErrorPayload(error: unknown): ProtocolErrorPayload {
  if (error instanceof ProtocolError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    };
  }
  return {
    code: 'HANDLER_ERROR',
    message: error instanceof Error ? error.message : String(error),
  };
}
