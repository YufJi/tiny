export type DataPatch = Record<string, unknown>

export function cloneJsonSafe<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Clone mini-program data without dropping function values or Date prototypes.
 *
 * This is Tiny's `dataDeepCopy: "simple"` implementation (P0-10): WeChat copies
 * component/page data on `setData`, so mutating the object passed by the caller
 * afterwards must not change the rendered data. Function values stay in the
 * logic layer (the bridge sanitizes separately) and Dates are cloned instead of
 * being flattened to `{}`. Recursive data is preserved via `seen` rather than
 * overflowing the stack.
 */
export function cloneDataValue<T>(value: T, seen: WeakMap<object, unknown> = new WeakMap()): T {
  if (typeof value === 'function') return value
  if (!value || typeof value !== 'object') return value
  const cached = seen.get(value as object)
  if (cached !== undefined) return cached as T
  if (value instanceof Date) return new Date(value.getTime()) as T
  if (Array.isArray(value)) {
    const result: unknown[] = []
    seen.set(value, result)
    for (const item of value) result.push(cloneDataValue(item, seen))
    return result as T
  }
  const result: Record<string, unknown> = {}
  seen.set(value as object, result)
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    result[key] = cloneDataValue(item, seen)
  }
  return result as T
}

export function applyDataPatch(data: Record<string, unknown>, patch: DataPatch): Record<string, unknown> {
  for (const [path, value] of Object.entries(patch)) {
    writeDataPath(data, parseDataPath(path), value)
  }
  return data
}

export function parseDataPath(path: string): (string | number)[] {
  const result: (string | number)[] = []
  const segmentPattern = /([^.[\]]+)|\[(\d+)\]/g
  let match = segmentPattern.exec(path)
  while (match) {
    if (match[1] !== undefined) result.push(match[1])
    else if (match[2] !== undefined) result.push(Number(match[2]))
    match = segmentPattern.exec(path)
  }
  if (result.length === 0) throw new Error(`Invalid data path: ${path}`)
  return result
}

export function readDataPath(data: unknown, path: string | readonly (string | number)[]): unknown {
  const segments = typeof path === 'string' ? parseDataPath(path) : path
  let cursor: unknown = data
  for (const segment of segments) {
    if (cursor === null || cursor === undefined) return undefined
    if (typeof segment === 'number') {
      if (!Array.isArray(cursor)) return undefined
      cursor = cursor[segment]
    } else {
      if (typeof cursor !== 'object') return undefined
      cursor = (cursor as Record<string, unknown>)[segment]
    }
  }
  return cursor
}

function writeDataPath(
  data: Record<string, unknown>,
  path: (string | number)[],
  value: unknown,
): void {
  let cursor: Record<string, unknown> = data
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index]!
    const nextKey = path[index + 1]!
    if (!(key in cursor) || typeof cursor[key] !== 'object' || cursor[key] === null) {
      cursor[key] = typeof nextKey === 'number' ? [] : {}
    }
    cursor = cursor[key] as Record<string, unknown>
  }
  const finalKey = path.at(-1)!
  cursor[finalKey] = value
}
