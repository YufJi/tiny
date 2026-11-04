import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import {
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from '../src'
import { BUILTIN_BEHAVIOR_IDS } from '../src/behaviors'
import { computePageContainerClass } from '../src/components/page-container'

function componentStyle(tag: string): string {
  return BUILTIN_COMPONENT_STYLES.find((entry) => entry.tag === tag)?.content ?? ''
}

describe('batch 2 built-ins', () => {
  test('registers page-container, root-portal, selection and movable/keyboard tags', () => {
    for (const tag of [
      'page-container', 'root-portal', 'selection',
      'movable-area', 'movable-view', 'keyboard-accessory',
    ]) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
    // `aria-component` is an accessibility documentation page, not a tag.
    expect(BUILTIN_COMPONENT_TAGS).not.toContain('aria-component')
  })

  test('page-container builds the reference popup classes and styles', () => {
    expect(computePageContainerClass('popup', ['bottom', { round: true }]).trim())
      .toBe('weui-popup--bottom weui-popup--round')
    expect(computePageContainerClass('popup', ['top', { round: false }]).trim())
      .toBe('weui-popup--top')
    const pageContainerStyle = componentStyle('page-container')
    expect(pageContainerStyle).toContain('weui-popup--bottom')
    expect(pageContainerStyle).toContain('weui-overlay')
    // Scoped internal selectors must match the prefixed runtime classes; a
    // host-tag ancestor here would never carry the builtin scope marker.
    expect(pageContainerStyle).toContain('.tiny-builtin-page-container--weui-popup')
    expect(pageContainerStyle).not.toContain('tiny-page-container:where')
    // WeChat 2.30.1 declares no author host/hidden rule for page-container.
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-page-container[hidden]')
  })

  test('movable components share the positioning behaviors', () => {
    expect(BUILTIN_BEHAVIOR_IDS.positioningTarget).toBe('tiny-positioning-target')
    expect(BUILTIN_BEHAVIOR_IDS.positioningContainer).toBe('tiny-positioning-container')
    expect(BUILTIN_BEHAVIOR_IDS.native).toBe('tiny-native')
    expect(BUILTIN_BEHAVIOR_IDS.nativeCover).toBe('tiny-native-cover')
    expect(BUILTIN_BEHAVIOR_IDS.nativeHover).toBe('tiny-native-hover')
  })

  test('movable and keyboard tags expose their default boxes', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-area {\n  display: block;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-area[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-view {\n  display: inline-block;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-view[hidden]')
    // WeChat 2.30.1 has no touch-action declaration on movable-view.
    expect(componentStyle('movable-view')).toBe('')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-keyboard-accessory[hidden]')
    expect(componentStyle('keyboard-accessory')).toContain('position: fixed')
  })

  test('root-portal and selection expose their host rules', () => {
    // WeChat 2.30.1 declares no author styles for root-portal/content.
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-root-portal {')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-root-portal[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-selection {\n  display: block;\n  user-select: text;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-selection[disable-context-menu]')
  })
})
