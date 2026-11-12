export type DataPatch = Record<string, unknown>

export function cloneJsonSafe<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Clone mini-program data without dropping function values. Function values
 * stay in the logic layer; bridge payloads are sanitized separately.
 */
export function cloneDataValue<T>(value: T): T {
  if (typeof value === 'function') return value
  if (Array.isArray(value)) return value.map((item) => cloneDataValue(item)) as T
  if (value && typeof value === 'object') {
    if (value instanceof Date) return new Date(value.getTime()) as T
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      result[key] = cloneDataValue(item)
    }
    return result as T
  }
  return value
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
