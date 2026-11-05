import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_HOST_STYLES } from '../src'

describe('batch 3 built-ins', () => {
  test('registers page-meta and navigation-bar', () => {
    for (const tag of ['page-meta', 'navigation-bar']) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
  })

  test('config nodes do not create a visible box', () => {
    // 2.33.0 declares no author CSS for page-meta or navigation-bar.
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-page-meta {')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-navigation-bar {')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-page-meta[hidden]')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-navigation-bar[hidden]')
  })

})
