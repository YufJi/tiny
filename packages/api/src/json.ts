/**
 * Clone a value on the JSON boundary.
 *
 * Mini-program API parameters and results are plain JSON, and the service must
 * never hand callers a live reference into a runtime-owned snapshot (or let
 * callers mutate the value of a bridge payload after the call).
 */
export function cloneJsonSafe<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}
