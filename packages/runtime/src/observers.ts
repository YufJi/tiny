import { parseDataPath, readDataPath } from './data'
import type { NormalizedObserver } from './component-definition'

export type ObserverHost = {
  data: Record<string, unknown>
  invokeMethod: (name: string, args?: unknown[]) => unknown
  onError: (code: string, message: string, details?: unknown) => void
  observerDepth: number
}

const MAX_OBSERVER_DEPTH = 20

export function runObservers(
  host: ObserverHost,
  observers: readonly NormalizedObserver[],
  changedPaths: readonly string[],
  oldData?: Record<string, unknown>,
): void {
  if (host.observerDepth >= MAX_OBSERVER_DEPTH) {
    host.onError('OBSERVER_RECURSION_LIMIT', 'Observer recursion limit reached.', {
      depth: host.observerDepth,
    })
    return
  }
  host.observerDepth += 1
  try {
    for (const observer of observers) {
      if (!matchesChangedPaths(observer, changedPaths)) continue
      invokeObserver(host, observer, oldData)
    }
  } finally {
    host.observerDepth -= 1
  }
}

export function invokeObserver(
  host: ObserverHost,
  observer: NormalizedObserver,
  oldData?: Record<string, unknown>,
): void {
  const args = readObserverValues(host.data, observer, oldData)
  try {
    if (typeof observer.handler === 'string') {
      host.invokeMethod(observer.handler, args)
    } else {
      observer.handler.apply(host, args)
    }
  } catch (error) {
    host.onError('OBSERVER_ERROR', error instanceof Error ? error.message : String(error), {
      key: observer.key,
      paths: observer.paths,
    })
  }
}

export function matchesChangedPaths(
  observer: NormalizedObserver,
  changedPaths: readonly string[],
): boolean {
  for (const observerPath of observer.paths) {
    for (const changedPath of changedPaths) {
      if (matchesPath(observerPath, changedPath)) return true
    }
  }
  return false
}

function matchesPath(observerPath: string, changedPath: string): boolean {
  const observer = parseObserverPath(observerPath)
  const changed = safeParsePath(changedPath)
  if (!changed) return false
  if (observer.wildcardRoot) return true
  if (observer.wildcardTail) {
    return isPrefix(observer.base, changed) || isPrefix(changed, observer.base)
  }
  return isPrefix(observer.base, changed) || isPrefix(changed, observer.base)
}

function readObserverValues(
  data: Record<string, unknown>,
  observer: NormalizedObserver,
  oldData?: Record<string, unknown>,
): unknown[] {
  const values = observer.paths.map((path) => readObserverValue(data, path))
  if (observer.kind === 'property' && observer.propertyName) {
    const oldValue = oldData ? readDataPath(oldData, observer.propertyName) : undefined
    return [values[0], oldValue]
  }
  return values
}

function readObserverValue(data: Record<string, unknown>, path: string): unknown {
  const parsed = parseObserverPath(path)
  if (parsed.wildcardRoot) return data
  if (parsed.wildcardTail) return readDataPath(data, parsed.base)
  return readDataPath(data, parsed.base)
}

function parseObserverPath(path: string): {
  base: (string | number)[]
  wildcardRoot: boolean
  wildcardTail: boolean
} {
  if (path === '**') return { base: [], wildcardRoot: true, wildcardTail: true }
  if (path.endsWith('.**')) {
    const base = path.slice(0, -3)
    return { base: safeParsePath(base) ?? [], wildcardRoot: false, wildcardTail: true }
  }
  return { base: safeParsePath(path) ?? [], wildcardRoot: false, wildcardTail: false }
}

function safeParsePath(path: string): (string | number)[] | null {
  try {
    return parseDataPath(path)
  } catch {
    return null
  }
}

function isPrefix(prefix: readonly (string | number)[], value: readonly (string | number)[]): boolean {
  if (prefix.length > value.length) return false
  for (let index = 0; index < prefix.length; index += 1) {
    if (String(prefix[index]) !== String(value[index])) return false
  }
  return true
}
