import { describe, expect, test } from 'vitest'
import { cloneJsonSafe } from '../src/data'

describe('cloneJsonSafe', () => {
  test('keeps a missing value undefined', () => {
    expect(cloneJsonSafe(undefined)).toBeUndefined()
  })

  test('drops undefined object fields like JSON serialization', () => {
    expect(cloneJsonSafe({ present: 1, missing: undefined })).toEqual({ present: 1 })
  })
})
