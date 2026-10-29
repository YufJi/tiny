import { describe, expect, test } from 'vitest'
import {
  BUILTIN_COMPONENT_TAGS,
  TINY_ENGINE_NAMING,
} from '../src'

describe('engine naming', () => {
  test('keeps WXS protocol names unique', () => {
    expect(new Set([
      TINY_ENGINE_NAMING.wxsRuntimeGlobal,
      TINY_ENGINE_NAMING.wxsEventHostGlobal,
      TINY_ENGINE_NAMING.wxsHandledField,
    ]).size).toBe(3)
  })

  test('uses the tiny host prefix for builtin tags', () => {
    expect(BUILTIN_COMPONENT_TAGS).toContain('view')
    expect(BUILTIN_COMPONENT_TAGS).toContain('scroll-view')
    expect(TINY_ENGINE_NAMING.hostTagPrefix).toBe('tiny-')
  })
})
