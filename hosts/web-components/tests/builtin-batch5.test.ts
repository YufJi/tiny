import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_HOST_STYLES } from '../src'

describe('batch 5 open-capability built-ins', () => {
  test('registers every open-capability tag', () => {
    for (const tag of [
      'ad', 'ad-custom', 'official-account', 'official-account-publish',
      'open-data', 'reward', 'store-coupon', 'store-gift', 'store-home',
      'store-product', 'web-view',
    ]) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
  })

  test('all 59 real tags are registered', () => {
    expect(BUILTIN_COMPONENT_TAGS).toHaveLength(59)
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('aria-component')
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('selection')
    expect(BUILTIN_COMPONENT_TAGS).toContain('grid-view')
  })

  test('open-capability hosts keep stable placeholder boxes', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-ad {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-ad-custom {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-official-account {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-official-account-publish {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-open-data {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-reward {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-store-coupon {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-store-gift {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-store-home {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-store-product {')
  })
})
