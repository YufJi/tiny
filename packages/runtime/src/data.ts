export type DataPatch = Record<string, unknown>

export function cloneJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function applyDataPatch(data: Record<string, unknown>, patch: DataPatch): Record<string, unknown> {
  for (const [path, value] of Object.entries(patch)) {
    writeDataPath(data, parseDataPath(path), value)
  }
  return data
}

function parseDataPath(path: string): (string | number)[] {
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
