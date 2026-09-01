import { describe, test, expect } from 'vitest'
import { TmplGroup } from '../src/group'

describe('TmplGroup — basic include', () => {
  const SRC_A = `<b a="{{a}}" /> <template name="a" />`
  const SRC_B = `<c a="{{a}}"> <include src="b/.././a" /> </c>`

  test('directDependencies with include', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', SRC_A)
    group.addTmpl('b', SRC_B)
    expect(group.getDirectDependencies('a')).toEqual([])
    expect(group.getDirectDependencies('b')).toEqual(['a'])
  })
})

describe('TmplGroup — basic import', () => {
  const SRC_A = `<b a="{{a}}" /> <template name="aa"><d a1="{{bb}}" a2="{{a}}" /></template>`
  const SRC_B = `<c a="{{a}}"> <import src="/a" /> <template is="aa" data="{{ bb: a + 1, cc: false }}" /> </c>`

  test('directDependencies with import', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', SRC_A)
    group.addTmpl('b', SRC_B)
    expect(group.getDirectDependencies('a')).toEqual([])
    expect(group.getDirectDependencies('b')).toEqual(['a'])
  })
})

describe('TmplGroup — code generation', () => {
  test('getTmplGenObject returns a string', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div class="foo">hello</div>')
    const output = group.getTmplGenObject('a')
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  test('getTmplGenObjectGroups returns a string', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div>{{msg}}</div>')
    group.addTmpl('b', '<span>world</span>')
    const output = group.getTmplGenObjectGroups()
    expect(typeof output).toBe('string')
    expect(output.length).toBeGreaterThan(0)
  })

  test('procgen accepts and reuses the official binding-map argument', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div>{{msg}}</div>')
    const output = group.getTmplGenObjectGroups()
    expect(output).toContain('R,C,D,U,A')
    expect(output).toContain('A||{')
    expect(output).toContain('return {C:')
  })

  test('getRuntimeString returns runtime code', () => {
    const group = TmplGroup.new()
    const runtime = group.getRuntimeString()
    expect(typeof runtime).toBe('string')
    expect(runtime).toContain('function')
  })

  test('getRuntimeVarList returns array of identifiers', () => {
    const list = TmplGroup.getRuntimeVarList()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })
})

describe('TmplGroup — addTmpl and getTree', () => {
  test('addTmpl returns no errors for valid template', () => {
    const group = TmplGroup.new()
    const errors = group.addTmpl('a', '<div>hello world</div>')
    expect(errors).toEqual([])
  })

  test('getTree throws for unknown path', () => {
    const group = TmplGroup.new()
    expect(() => group.getTree('nonexistent')).toThrow()
  })

  test('removeTmpl removes template', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div/>')
    expect(group.removeTmpl('a')).toBe(true)
    expect(() => group.getTree('a')).toThrow()
  })

  test('directDependencies empty for standalone template', () => {
    const group = TmplGroup.new()
    group.addTmpl('a', '<div>{{a}}</div>')
    expect(group.getDirectDependencies('a')).toEqual([])
  })
})

describe('TmplGroup — importGroup', () => {
  test('importGroup merges templates', () => {
    const g1 = TmplGroup.new()
    g1.addTmpl('a', '<div/>')
    const g2 = TmplGroup.new()
    g2.addTmpl('b', '<span/>')
    g1.importGroup(g2)
    expect(() => g1.getTree('a')).not.toThrow()
    expect(() => g1.getTree('b')).not.toThrow()
  })
})
