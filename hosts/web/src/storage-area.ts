import type { StorageValues } from '@tiny/api'

/**
 * Persistent `wx.*Storage` area for a browser host.
 *
 * The mini program expects storage to survive a reload; the host keeps the
 * values in a JSON blob so writes stay a single synchronous operation. A host
 * without `localStorage` (SSR, sandboxed iframe) degrades to memory.
 */
export type StorageBackend = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type PersistentStorage = {
  values: StorageValues
  flush: () => void
}

export function createPersistentStorage(
  key: string,
  backend: StorageBackend | undefined = defaultBackend(),
): PersistentStorage {
  const values: StorageValues = readValues(backend, key)
  return {
    values,
    flush: () => {
      if (!backend) return
      try {
        backend.setItem(key, JSON.stringify(values))
      } catch {
        // A full or unavailable storage area must not break the mini program.
      }
    },
  }
}

function readValues(backend: StorageBackend | undefined, key: string): StorageValues {
  if (!backend) return {}
  try {
    const raw = backend.getItem(key)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as StorageValues
  } catch {
    return {}
  }
}

function defaultBackend(): StorageBackend | undefined {
  const candidate = (globalThis as { localStorage?: StorageBackend }).localStorage
  return candidate && typeof candidate.getItem === 'function' ? candidate : undefined
}
