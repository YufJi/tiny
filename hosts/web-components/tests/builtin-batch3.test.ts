import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_HOST_STYLES } from '../src'

describe('batch 3 built-ins', () => {
  test('registers page-meta, navigation-bar and functional-page-navigator', () => {
    for (const tag of ['page-meta', 'navigation-bar', 'functional-page-navigator']) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
  })

  test('config nodes do not create a visible box', () => {
    // 2.33.0 declares no author CSS for page-meta.
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-page-meta {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-navigation-bar {\n  display: contents;')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-page-meta[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-navigation-bar[hidden]')
  })

  test('functional-page-navigator is a hoverable block link', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-functional-page-navigator {\n  display: block;')
    expect(BUILTIN_HOST_STYLES).toContain(
      'tiny-functional-page-navigator.functional-page-navigator-hover',
    )
  })
})
