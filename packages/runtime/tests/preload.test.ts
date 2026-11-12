import { describe, expect, test } from 'vitest'
import { shouldPreloadRule } from '../src/service/app/preload'

describe('preloadRule network gate', () => {
  test('always preloads network:all', () => {
    expect(shouldPreloadRule({ network: 'all' }, undefined)).toBe(true)
    expect(shouldPreloadRule({ network: 'all' }, 'other')).toBe(true)
  })

  test('wifi rules require a wifi host fact', () => {
    expect(shouldPreloadRule({ network: 'wifi' }, 'wifi')).toBe(true)
    expect(shouldPreloadRule({ network: 'wifi' }, 'other')).toBe(false)
    expect(shouldPreloadRule({ network: 'wifi' }, undefined)).toBe(false)
  })
})
