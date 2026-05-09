import { describe, test, expect } from 'vitest'
import { TmplGroup } from '../src/group'

describe('stringify — basic', () => {
  test('stringifyTmpl returns null for unknown path', () => {
    const group = TmplGroup.new()
    expect(group.stringifyTmpl('nonexistent')).toBeNull()
  })

  test('stringifyTmpl returns string for known template', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div class="foo">hello</div>')
    const result = group.stringifyTmpl('a')
    expect(typeof result).toBe('string')
    expect(result).not.toBeNull()
  })

  test('stringifyTmpl roundtrips basic element', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div><span>text</span></div>')
    const result = group.stringifyTmpl('a')
    expect(result).toContain('<div>')
    expect(result).toContain('<span>')
    expect(result).toContain('</div>')
  })
})
