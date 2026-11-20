import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { ComponentCommandRequest, ComponentCommandResult } from '@tiny/runtime'

/**
 * Component commands the render tree is allowed to forward (ADR-0023).
 *
 * The whitelist is the security boundary: a context API can only call methods
 * listed for its tag, and every tag is registered deliberately.
 */
export const COMPONENT_COMMANDS: Record<string, readonly string[]> = {
  [`${TINY_ENGINE_NAMING.hostTagPrefix}map`]: ['getCenterLocation', 'moveToLocation', 'getScale'],
}

/** Minimal element surface used by the dispatcher (testable without a DOM). */
export type CommandElement = {
  tagName: string
  dispatchEvent(event: unknown): boolean
}

type CommandDetail = {
  method: string
  args?: unknown
  reply(value: unknown): void
  fail(message: string): void
}

const COMMAND_EVENT = 'tiny:command'

export function invokeComponentCommand(
  element: CommandElement | null,
  request: ComponentCommandRequest,
): ComponentCommandResult {
  if (!element) return { status: 'not-found' }
  const allowed = COMPONENT_COMMANDS[element.tagName.toLowerCase()]
  const method = String(request.method ?? '')
  if (!allowed || !allowed.includes(method)) {
    return { status: 'unsupported-method', method }
  }
  let replied = false
  let value: unknown
  let failure: string | undefined
  const detail: CommandDetail = {
    method,
    args: request.args,
    reply: (result) => {
      replied = true
      value = result
    },
    fail: (message) => {
      replied = true
      failure = message
    },
  }
  const event = typeof CustomEvent === 'function'
    ? new CustomEvent(COMMAND_EVENT, { detail })
    : { type: COMMAND_EVENT, detail }
  element.dispatchEvent(event)
  if (!replied) return { status: 'unsupported-method', method }
  if (failure !== undefined) return { status: 'error', message: failure }
  return { status: 'ok', value }
}
