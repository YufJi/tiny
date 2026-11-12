import type { NormalizedObserver } from './types'
import { isPlainObject } from './object'

export function normalizeObservers(
  raw: unknown,
): Array<Omit<NormalizedObserver, 'key'>> {
  const observers: Array<Omit<NormalizedObserver, 'key'>> = []
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!isPlainObject(item)) continue
      const fields = item.fields
      const handler = item.observer
      if (typeof fields !== 'string') continue
      if (typeof handler !== 'function' && typeof handler !== 'string') continue
      observers.push({
        paths: splitObserverPaths(fields),
        kind: 'observer',
        handler: handler as string | ((...args: unknown[]) => unknown),
      })
    }
    return observers
  }
  if (!isPlainObject(raw)) return observers
  for (const [fields, handler] of Object.entries(raw)) {
    if (typeof handler !== 'function' && typeof handler !== 'string') continue
    observers.push({
      paths: splitObserverPaths(fields),
      kind: 'observer',
      handler: handler as string | ((...args: unknown[]) => unknown),
    })
  }
  return observers
}

function splitObserverPaths(fields: string): string[] {
  return fields
    .split(',')
    .map((path) => path.trim())
    .filter((path) => path.length > 0)
}
