import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/wxs-runtime'
import { TmplGroup } from '../src/group'

const runtime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
const globalObject = globalThis as unknown as { __tinyWxsRuntime?: unknown }
beforeAll(() => {
  globalObject.__tinyWxsRuntime = runtime
})
afterAll(() => {
  delete globalObject.__tinyWxsRuntime
  runtime.dispose()
})

describe('script dependencies — external script', () => {
  const SRC_A = `<wxs module="modA" src="/script/a" /> <wxs module="modB" src="../script/b" /> {{ modA.a + modB.b }}`
  const SRC_SCRIPT = `(function(){return 0})()`

  test('scriptDependencies lists referenced scripts', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('tmpl/a', SRC_A)
    group.addScript('script/a', SRC_SCRIPT)
    group.addScript('script/b', SRC_SCRIPT)
    expect(group.getScriptDependencies('tmpl/a')).toEqual(['script/a', 'script/b'])
  })
})

describe('script dependencies — inline script', () => {
  const SRC_A = `<div>{{ modA.hi }}</div> <wxs module="modA"> exports.hi = 1 < 2 </wxs> <wxs module="modB" />`

  test('scriptDependencies empty for inline scripts', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.getScriptDependencies('tmpl/a')).toHaveLength(0)
  })

  test('inlineScriptModuleNames returns module names', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.inlineScriptModuleNames('tmpl/a')).toEqual(['modA', 'modB'])
  })

  test('inlineScriptContent returns script content', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('tmpl/a', SRC_A)
    expect(group.inlineScriptContent('tmpl/a', 'modA')).toBe(' exports.hi = 1 < 2 ')
    expect(group.inlineScriptContent('tmpl/a', 'modB')).toBe('')
  })

  test('setInlineScriptContent updates script content', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('tmpl/a', SRC_A)
    group.setInlineScriptContent('tmpl/a', 'modA', 'exports.hi = 42')
    expect(group.inlineScriptContent('tmpl/a', 'modA')).toBe('exports.hi = 42')
  })
})

describe('script — addScript and getScript', () => {
  test('addScript and getScript work', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addScript('scripts/foo', 'exports.x = 1')
    expect(group.getScript('scripts/foo')).toBe('exports.x = 1')
  })

  test('getScript throws for unknown script', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    expect(() => group.getScript('nonexistent')).toThrow()
  })

  test('removeScript removes script', () => {
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addScript('s', 'code')
    expect(group.removeScript('s')).toBe(true)
    expect(() => group.getScript('s')).toThrow()
  })
})

describe('script — code generation with WXS runtime', () => {
  test('getTmplGenObjectGroups includes WXS runtime when scripts exist', () => {
    const SRC = `<wxs module="mod">exports.x = 1</wxs>{{mod.x}}`
    const group = TmplGroup.new({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('t', SRC)
    const output = group.getTmplGenObjectGroups()
    expect(typeof output).toBe('string')
    expect(output).toContain('__tinyWxsRuntime')
  })
})

describe('script — WXS runs as sloppy script inside the strict bundle', () => {
  // The template artifact is an ES module, so everything in it is strict.
  // WeChat's WXS is sloppy script: an undeclared assignment such as
  // `var a = b = 7` must create a binding instead of throwing.
  const PROC_GEN_STUB = () => ({
    c() {}, d() {}, e() {}, ei() {}, i() {}, l() {}, m() {}, p() {},
    r() {}, s() {}, w() {}, wi() {}, y() {}, wl() {},
    a() {},
    setEventListenerWrapper() {},
    setFnFilter() {},
    shadowRoot: { getSlotMode: () => 0 },
    procGen: () => () => ({}),
  })

  const runTemplatesStrict = (source: string): Record<string, (name: string) => unknown> => {
    // Equivalent to importing the artifact as an ES module: the module body is
    // strict, which used to leak into the generated WXS functions.
    const groupList = new Function(`"use strict"; return (${source})`)() as Record<
      string,
      (name: string) => (renderer: unknown, ...rest: unknown[]) => unknown
    >
    return groupList
  }

  const evaluate = (group: TmplGroup, path: string): void => {
    const groupList = runTemplatesStrict(group.getTmplGenObjectGroups())
    const procGen = groupList[path]!('') as (renderer: unknown, ...rest: unknown[]) => unknown
    procGen(PROC_GEN_STUB(), {}, undefined, undefined, undefined)
  }

  const globals = globalThis as unknown as Record<string, unknown>
  afterEach(() => {
    delete globals.__tinyWxsInlineProbe
    delete globals.__tinyWxsExternalProbe
  })

  test('an inline WXS module may assign to an undeclared name', () => {
    const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl(
      'pages/x/x',
      '<view>{{ mod.top }}</view><wxs module="mod">var a = b = 7\nglobalThis.__tinyWxsInlineProbe = b</wxs>',
    )
    expect(() => evaluate(group, 'pages/x/x')).not.toThrow()
    expect(globals.__tinyWxsInlineProbe).toBe(7)
  })

  test('an external WXS file may assign to an undeclared name', () => {
    const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addScript('scripts/movable', 'var lastLeft = lastTop = 50\nglobalThis.__tinyWxsExternalProbe = lastTop')
    group.addTmpl('pages/y/y', '<view>{{ mod.top }}</view><wxs module="mod" src="/scripts/movable" />')
    expect(() => evaluate(group, 'pages/y/y')).not.toThrow()
    expect(globals.__tinyWxsExternalProbe).toBe(50)
  })

  test('inline WXS is registered through the Q helper, not the shadowed D', () => {
    const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
    group.addTmpl('pages/z/z', '<view>{{ mod.top }}</view><wxs module="mod">exports.top = 1</wxs>')
    const output = group.getTmplGenObjectGroups()
    expect(output).toContain('Q.S(')
    expect(output).not.toContain('(require,exports,module)=>{exports.top')
  })
})
