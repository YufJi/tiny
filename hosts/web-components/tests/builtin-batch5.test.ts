import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_HOST_STYLES } from '../src'

describe('batch 5 tag inventory', () => {
  test('all 39 real tags are registered', () => {
    expect(BUILTIN_COMPONENT_TAGS).toHaveLength(39)
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('aria-component')
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('selection')
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('editor')
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('editor-portal')
    expect(BUILTIN_COMPONENT_TAGS).toContain('grid-view')
    for (const tag of [
      'ad', 'ad-custom', 'camera', 'channel-live', 'channel-video',
      'keyboard-accessory', 'live-player', 'live-pusher', 'official-account',
      'official-account-publish', 'open-data', 'store-coupon', 'store-gift',
      'store-home', 'store-product', 'voip-room', 'reward', 'functional-page-navigator',
    ]) {
      expect(BUILTIN_COMPONENT_TAGS).not.toContain(tag)
    }
  })

})
