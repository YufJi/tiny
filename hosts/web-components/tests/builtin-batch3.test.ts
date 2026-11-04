import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_COMPONENT_STYLES, BUILTIN_HOST_STYLES } from '../src'

describe('batch 3 built-ins', () => {
  test('registers page-meta, navigation-bar and functional-page-navigator', () => {
    for (const tag of ['page-meta', 'navigation-bar', 'functional-page-navigator']) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
  })

  test('editor and editor-portal expose their default structure', () => {
    expect(BUILTIN_COMPONENT_TAGS).toContain('editor')
    expect(BUILTIN_COMPONENT_TAGS).toContain('editor-portal')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-editor {\n  box-sizing: border-box;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-editor[hidden]')
    const editorStyle = BUILTIN_COMPONENT_STYLES.find((entry) => entry.tag === 'editor')?.content ?? ''
    expect(editorStyle).toContain('#editor')
    expect(editorStyle).toContain('ql-blank')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-editor-portal {\n  display: contents;')
  })

  test('config nodes do not create a visible box', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-page-meta {\n  display: contents;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-navigation-bar {\n  display: contents;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-page-meta[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-navigation-bar[hidden]')
  })

  test('functional-page-navigator is a hoverable block link', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-functional-page-navigator {\n  display: block;')
    expect(BUILTIN_HOST_STYLES).toContain(
      'tiny-functional-page-navigator.functional-page-navigator-hover',
    )
  })
})
