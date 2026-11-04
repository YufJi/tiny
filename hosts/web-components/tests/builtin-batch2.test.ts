import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import {
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from '../src'
import {
  normalizePageContainerPosition,
  pageContainerStartTransform,
} from '../src/components/page-container'

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

  test('page-container normalizes positions and hides the host', () => {
    expect(normalizePageContainerPosition('top')).toBe('top')
    expect(normalizePageContainerPosition('right')).toBe('right')
    expect(normalizePageContainerPosition('nope')).toBe('bottom')
    expect(normalizePageContainerPosition(undefined)).toBe('bottom')
    expect(pageContainerStartTransform('bottom')).toBe('translate3d(0, 100%, 0)')
    expect(pageContainerStartTransform('top')).toBe('translate3d(0, -100%, 0)')
    expect(pageContainerStartTransform('right')).toBe('translate3d(100%, 0, 0)')
    expect(pageContainerStartTransform('center')).toBe('scale(0.7)')
    expect(componentStyle('page-container')).toContain('weui-popup--bottom')
    expect(componentStyle('page-container')).toContain('weui-overlay')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-page-container[hidden]')
  })

  test('movable and keyboard tags expose their default boxes', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-area {\n  display: block;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-area[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-view {\n  display: inline-block;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-movable-view[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('touch-action: none')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-keyboard-accessory[hidden]')
    expect(componentStyle('keyboard-accessory')).toContain('position: fixed')
  })

  test('root-portal and selection expose their host rules', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-root-portal {\n  display: contents;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-root-portal[hidden]')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-selection {\n  display: block;\n  user-select: text;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-selection[disable-context-menu]')
  })
})
