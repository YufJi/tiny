import { describe, test, expect } from 'vitest'
import { TmplGroup } from '../src/group'

describe('script dependencies — external script', () => {
  const SRC_A = `<wxs module="modA" src="/script/a" /> <wxs module="modB" src="../script/b" /> {{ modA.a + modB.b }}`
  const SRC_SCRIPT = `(function(){return 0})()`

  test('scriptDependencies lists referenced scripts', () => {
    const group = TmplGroup.new()
    group.addTmpl('tmpl/a', SRC_A)
    group.addScript('script/a', SRC_SCRIPT)
    group.addScript('script/b', SRC_SCRIPT)
    expect(group.getScriptDependencies('tmpl/a')).toEqual(['script/a', 'script/b'])
  })
})

describe('script dependencies — inline script', () => {
  const SRC_A = `<div>{{ modA.hi }}</div> <wxs module="modA"> exports.hi = 1 < 2 </wxs> <wxs module="modB" />`

  test('scriptDependencies empty for inline scripts', () => {
    const group = TmplGroup.new()
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.getScriptDependencies('tmpl/a')).toHaveLength(0)
  })

  test('inlineScriptModuleNames returns module names', () => {
    const group = TmplGroup.new()
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.inlineScriptModuleNames('tmpl/a')).toEqual(['modA', 'modB'])
  })

  test('inlineScriptContent returns script content', () => {
    const group = TmplGroup.new()
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.inlineScriptContent('tmpl/a', 'modA')).toBe(' exports.hi = 1 < 2 ')
    expect(group.inlineScriptContent('tmpl/a', 'modB')).toBe('')
  })

  test('setInlineScriptContent updates script content', () => {
    const group = TmplGroup.new()
    group.addTmpl('tmpl/a', SRC_A)
    group.setInlineScriptContent('tmpl/a', 'modA', 'exports.hi = 42')
    expect(group.inlineScriptContent('tmpl/a', 'modA')).toBe('exports.hi = 42')
  })
})

describe('script — addScript and getScript', () => {
  test('addScript and getScript work', () => {
    const group = TmplGroup.new()
    group.addScript('scripts/foo', 'exports.x = 1')
    expect(group.getScript('scripts/foo')).toBe('exports.x = 1')
  })

  test('getScript throws for unknown script', () => {
    const group = TmplGroup.new()
    expect(() => group.getScript('nonexistent')).toThrow()
  })

  test('removeScript removes script', () => {
    const group = TmplGroup.new()
    group.addScript('s', 'code')
    expect(group.removeScript('s')).toBe(true)
    expect(() => group.getScript('s')).toThrow()
  })
})

describe('script — code generation with WXS runtime', () => {
  test('getTmplGenObjectGroups includes WXS runtime when scripts exist', () => {
    const SRC = `<wxs module="mod">exports.x = 1</wxs>{{mod.x}}`
    const group = TmplGroup.new()
    group.addTmpl('t', SRC)
    const output = group.getTmplGenObjectGroups()
    expect(typeof output).toBe('string')
    expect(output).toContain('modules')
  })
})
