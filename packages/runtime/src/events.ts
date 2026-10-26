export type SerializedEventNode = {
  id: string
  tag: string
  dataset: Record<string, unknown>
  class: string
  style: string
}

export type SerializedMiniProgramEvent = {
  componentId?: string
  handler: string
  type: string
  timeStamp: number
  detail: unknown
  bubbles: boolean
  composed: boolean
  capture: boolean
  stopped: boolean
  target: SerializedEventNode
  currentTarget: SerializedEventNode
  /**
   * Native-style touch fields. Built-in hosts deliver canvas touches through
   * event extras because WeChat canvas handlers read `event.touches` directly.
   */
  touches?: unknown
  changedTouches?: unknown
  componentData?: Record<string, unknown>
}

export function toJsonSafe(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null) return null
  const valueType = typeof value
  if (valueType === 'string' || valueType === 'boolean') return value
  if (valueType === 'number') return Number.isFinite(value) ? value : null
  if (valueType === 'undefined' || valueType === 'function' || valueType === 'bigint' || valueType === 'symbol') {
    return undefined
  }
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Map) return toJsonSafe([...value.entries()], seen)
  if (value instanceof Set) return toJsonSafe([...value.values()], seen)
  if (Array.isArray(value)) {
    if (seen.has(value)) return '[Circular]'
    seen.add(value)
    return value.map((item) => toJsonSafe(item, seen))
  }
  if (typeof value !== 'object') return null
  if (seen.has(value)) return '[Circular]'
  seen.add(value)
  const output: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const converted = toJsonSafe(item, seen)
    if (converted !== undefined) output[key] = converted
  }
  return output
}

/**
 * Marker for native events that a built-in component has already translated
 * into a mini-program-style event.
 *
 * A host can mark the original native event from its target-phase listener; the
 * render adapter then skips serializing the same native event again for page
 * handlers. Without this, a component that emits synthetic touch events would
 * deliver every touch twice.
 */
export const HANDLED_NATIVE_EVENT = Symbol.for('tiny.handledNativeEvent')

export function markNativeEventHandled(event: unknown): void {
  if (event && typeof event === 'object') {
    ;(event as Record<PropertyKey, unknown>)[HANDLED_NATIVE_EVENT] = true
  }
}

export function isNativeEventHandled(event: unknown): boolean {
  return Boolean(
    event
    && typeof event === 'object'
    && (event as Record<PropertyKey, unknown>)[HANDLED_NATIVE_EVENT],
  )
}
