import { describe, expect, test } from 'vitest'
import { createPersistentStorage } from '../src/storage-area'
import type { StorageBackend } from '../src/storage-area'

function createBackend(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed))
  const backend: StorageBackend = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
  return { backend, values }
}

describe('persistent storage', () => {
  test('flushes writes and reads them back in a new session', () => {
    const { backend, values } = createBackend()
    const first = createPersistentStorage('tiny.storage.demo', backend)
    first.values.token = 'abc'
    first.flush()

    const second = createPersistentStorage('tiny.storage.demo', backend)
    expect(second.values.token).toBe('abc')
    expect(values.size).toBe(1)
  })

  test('keeps apps isolated by key', () => {
    const { backend } = createBackend()
    const a = createPersistentStorage('tiny.storage.a', backend)
    a.values.token = 'a'
    a.flush()
    const b = createPersistentStorage('tiny.storage.b', backend)
    expect(b.values.token).toBeUndefined()
  })

  test('falls back to memory for corrupt data or a missing backend', () => {
    const { backend } = createBackend({ 'tiny.storage.corrupt': '{not json' })
    expect(createPersistentStorage('tiny.storage.corrupt', backend).values).toEqual({})
    expect(createPersistentStorage('tiny.storage.none', undefined).values).toEqual({})
  })
})
