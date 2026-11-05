import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_COMPONENT_STYLES } from '../src'
import {
  decodeRichTextSpace,
  isAllowedRichTextTag,
  isDroppedRichTextTag,
  RICH_TEXT_TAGS,
} from '../src/components/rich-text/content'
import { buildMediaQuery, matchesMediaQuery } from '../src/components/match-media'

describe('batch 1 built-ins', () => {
  test('registers rich-text, match-media, cover-view and cover-image', () => {
    for (const tag of ['rich-text', 'match-media', 'cover-view', 'cover-image']) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
  })

  test('cover-view keeps the reference internal class rules', () => {
    const style = BUILTIN_COMPONENT_STYLES.find((entry) => entry.tag === 'cover-view')?.content ?? ''
    expect(style).toContain('.tiny-builtin-cover-view--wx-cover-view')
    expect(style).toContain('height: 100%')
    expect(style).not.toContain('tiny-button:where')
  })

  test('rich-text keeps the documented tag subset and space modes', () => {
    expect(RICH_TEXT_TAGS.has('div')).toBe(true)
    expect(RICH_TEXT_TAGS.has('img')).toBe(true)
    expect(isAllowedRichTextTag('span')).toBe(true)
    expect(isAllowedRichTextTag('SCRIPT')).toBe(false)
    expect(isAllowedRichTextTag('iframe')).toBe(false)
    expect(isDroppedRichTextTag('script')).toBe(true)
    expect(isDroppedRichTextTag('style')).toBe(true)
    expect(isDroppedRichTextTag('section')).toBe(false)

    expect(decodeRichTextSpace('a b', 'nbsp')).toBe('a\u00a0b')
    expect(decodeRichTextSpace('a b', 'ensp')).toBe('a\u2002b')
    expect(decodeRichTextSpace('a b', 'emsp')).toBe('a\u2003b')
    expect(decodeRichTextSpace('a b', '')).toBe('a b')
  })

  test('match-media applies exact, range and orientation conditions', () => {
    const viewport = { width: 375, height: 812 }
    expect(matchesMediaQuery(viewport, {})).toBe(true)
    expect(matchesMediaQuery(viewport, { width: 375 })).toBe(true)
    expect(matchesMediaQuery(viewport, { width: 375, height: 812 })).toBe(true)
    expect(matchesMediaQuery(viewport, { width: 0, minWidth: 0 })).toBe(true)
    expect(matchesMediaQuery(viewport, { minWidth: 320, maxWidth: 400 })).toBe(true)
    expect(matchesMediaQuery(viewport, { minWidth: 400 })).toBe(false)
    expect(matchesMediaQuery(viewport, { maxWidth: 374 })).toBe(false)
    expect(matchesMediaQuery(viewport, { minHeight: 800 })).toBe(true)
    expect(matchesMediaQuery(viewport, { maxHeight: 800 })).toBe(false)

    expect(matchesMediaQuery(viewport, { orientation: 'portrait' })).toBe(true)
    expect(matchesMediaQuery(viewport, { orientation: 'landscape' })).toBe(false)
    expect(matchesMediaQuery({ width: 812, height: 375 }, { orientation: 'landscape' })).toBe(true)
    expect(matchesMediaQuery({ width: 375, height: 375 }, { orientation: 'portrait' })).toBe(true)
    expect(matchesMediaQuery({ width: 375, height: 375 }, { orientation: 'landscape' })).toBe(false)
  })

  test('match-media builds the reference media query and omits unset values', () => {
    expect(buildMediaQuery({})).toBe('')
    expect(buildMediaQuery({ width: 0, minWidth: 0, maxWidth: 0 })).toBe('')
    expect(buildMediaQuery({ minWidth: 200, maxWidth: 600 }))
      .toBe('(min-width: 200px) and (max-width: 600px)')
    expect(buildMediaQuery({ width: 375, height: 812, orientation: 'portrait' }))
      .toBe('(width: 375px) and (height: 812px) and (orientation: portrait)')
    expect(buildMediaQuery({ minHeight: 150, orientation: 'landscape' }))
      .toBe('(min-height: 150px) and (orientation: landscape)')
    expect(buildMediaQuery({ orientation: 'diagonal' })).toBe('')
  })
})
