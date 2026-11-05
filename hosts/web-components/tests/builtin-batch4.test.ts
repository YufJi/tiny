import { describe, expect, test } from 'vitest'
import { BUILTIN_COMPONENT_TAGS } from '@tiny/manifest'
import { BUILTIN_COMPONENT_STYLES, BUILTIN_HOST_STYLES } from '../src'

function componentStyle(tag: string): string {
  return BUILTIN_COMPONENT_STYLES.find((entry) => entry.tag === tag)?.content ?? ''
}

describe('batch 4 media built-ins', () => {
  test('registers video and map', () => {
    expect(BUILTIN_COMPONENT_TAGS).toContain('video')
    expect(BUILTIN_COMPONENT_TAGS).toContain('map')
  })

  test('video keeps the WeChat default box and a native video element', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-video {\n  background: #000;')
    expect(BUILTIN_HOST_STYLES).toContain('height: 225px;')
    expect(BUILTIN_HOST_STYLES).toContain('width: 300px;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-video[hidden]')
    expect(componentStyle('video')).toContain('#video')
    expect(componentStyle('video')).toContain('wx-video-slot')
  })

  test('registers the remaining media and web-view tags', () => {
    for (const tag of ['audio', 'web-view']) {
      expect(BUILTIN_COMPONENT_TAGS).toContain(tag)
    }
    expect(BUILTIN_HOST_STYLES).toContain('tiny-audio {')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-web-view {')
  })

  test('map uses the default box and a marker layer', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-map {\n  display: block;\n  height: 150px;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-map[hidden]')
    expect(componentStyle('map')).toContain('#markers')
    expect(componentStyle('map')).toContain('wx-map-marker')
  })
})
