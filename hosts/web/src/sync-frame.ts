import {
  ProtocolError,
  createReply,
  createTransportFrame,
  toProtocolErrorPayload,
  validateTransportFrame,
} from '@tiny/bridge'
import type { ProtocolMessage, ProtocolReplyPayload, TransportFrame } from '@tiny/bridge'

/**
 * Answer one synchronous request frame.
 *
 * Browser host glue implements its injected handle's `sendSync` with this
 * helper: validate the `callSync` envelope, run the synchronous handler and
 * return a normal reply frame. Handler failures become error replies.
 */
export function answerSyncFrame(
  frame: TransportFrame,
  handler: (message: ProtocolMessage) => unknown,
): TransportFrame {
  const validated = validateTransportFrame(frame)
  if (validated.messages.length !== 1) {
    throw new ProtocolError('INVALID_ENVELOPE', 'A synchronous request must contain exactly one message')
  }
  const request = validated.messages[0]
  if (request.kind !== 'callSync') {
    throw new ProtocolError('INVALID_ENVELOPE', 'A synchronous request must use the callSync kind')
  }
  try {
    const result = handler(request)
    if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
      throw new ProtocolError('HANDLER_ERROR', 'A synchronous handler returned a promise')
    }
    // The host handler lives in another realm; frames need plain objects from
    // this realm, so normalise the result before framing it.
    const cloned = result === undefined ? undefined : JSON.parse(JSON.stringify(result)) as unknown
    const payload = (cloned === undefined ? { ok: true } : { ok: true, result: cloned }) as ProtocolReplyPayload<unknown>
    return createTransportFrame([createReply(request, payload)])
  } catch (error) {
    return createTransportFrame([createReply(request, { ok: false, error: toProtocolErrorPayload(error) })])
  }
}
