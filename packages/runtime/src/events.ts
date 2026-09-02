export type SerializedEventNode = {
  id: string
  tag: string
  dataset: Record<string, unknown>
  class: string
  style: string
}

export type SerializedMiniProgramEvent = {
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
