import { describe, expect, test, vi } from 'vitest'
import {
  createDefaultWxsCompiler,
  createWxsRuntime,
  transformWxsSource,
  wxsCtor,
} from '../src/index'

const runtime = (overrides: Partial<Parameters<typeof createWxsRuntime>[0]> = {}) =>
  createWxsRuntime({
    compile: createDefaultWxsCompiler(),
    ...overrides,
  })

describe('wxsCtor', () => {
  test('reports WXS type names', () => {
    expect(wxsCtor([])).toBe('Array')
    expect(wxsCtor({})).toBe('Object')
    expect(wxsCtor('x')).toBe('String')
    expect(wxsCtor(1)).toBe('Number')
    expect(wxsCtor(true)).toBe('Boolean')
    expect(wxsCtor(null)).toBe('Null')
    expect(wxsCtor(undefined)).toBe('Undefined')
  })
})

describe('transformWxsSource', () => {
  test('rewrites constructor reads and leaves strings/comments alone', () => {
    const source = [
      'var a = list.constructor',
      'var b = "list.constructor"',
      '// list.constructor',
      '/* list.constructor */',
      'var c = options[0].constructor',
    ].join('\n')
    const output = transformWxsSource(source)
    expect(output).toContain('__wxs.ctor(list)')
    expect(output).toContain('__wxs.ctor(options[0])')
    expect(output).toContain('"list.constructor"')
    expect(output).toContain('// list.constructor')
    expect(output).toContain('/* list.constructor */')
  })

  test('does not rewrite assignments', () => {
    expect(transformWxsSource('foo.constructor = 1')).toBe('foo.constructor = 1')
  })
})

describe('createWxsRuntime', () => {
  test('loads a module lazily and exposes the Q.S-compatible accessor', () => {
    const wxs = runtime()
    const load = wxs.register('utils', 'module.exports = { add: function (a, b) { return a + b } }')
    expect(() => load()).not.toThrow()
    expect(wxs.require('utils').add).toBeTypeOf('function')
    expect(wxs.invoke('utils', ['add'], [2, 3])).toBe(5)
  })

  test('applies WXS constructor semantics', () => {
    const wxs = runtime()
    wxs.register(
      'ctor',
      'module.exports = { array: [].constructor, object: ({}).constructor }',
    )
    expect(wxs.require('ctor')).toEqual({ array: 'Array', object: 'Object' })
  })

  test('provides getRegExp and getDate', () => {
    const wxs = runtime()
    wxs.register(
      'types',
      'module.exports = { re: getRegExp("a+", "g"), date: getDate(2020, 0, 1).getFullYear() }',
    )
    const exports = wxs.require('types')
    expect(exports.re).toBeInstanceOf(RegExp)
    expect(exports.date).toBe(2020)
  })

  test('caches module exports', () => {
    const wxs = runtime()
    let loads = 0
    wxs.register('once', 'var value = 1; module.exports = { value: value }')
    const first = wxs.require('once')
    const second = wxs.require('once')
    expect(first).toBe(second)
    loads += 1
    expect(loads).toBe(1)
  })

  test('resolves relative requires from the module id', () => {
    const wxs = runtime()
    wxs.register('pkg/wxs/utils', 'module.exports = { value: 7 }')
    wxs.register('pkg/wxs/main', 'module.exports = require("./utils")')
    expect(wxs.require('pkg/wxs/main')).toEqual({ value: 7 })
  })

  test('supports circular dependencies with partial exports', () => {
    const wxs = runtime()
    wxs.register(
      'a',
      'var b = require("b"); module.exports = { name: "a", seen: b.name }',
    )
    wxs.register(
      'b',
      'var a = require("a"); module.exports = { name: "b", seen: a.name || "partial" }',
    )
    expect(wxs.require('a')).toEqual({ name: 'a', seen: 'b' })
    expect(wxs.require('b')).toEqual({ name: 'b', seen: 'partial' })
  })

  test('reports compile and invoke errors', () => {
    const onError = vi.fn()
    const wxs = runtime({
      compile: () => {
        throw new Error('compile failed')
      },
      onError,
    })
    wxs.register('bad', 'module.exports = {}')
    expect(() => wxs.require('bad')).toThrow('compile failed')
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      { moduleId: 'bad', phase: 'compile' },
    )

    const runError = runtime()
    runError.register('handler', 'module.exports = { run: function () { throw new Error("boom") } }')
    expect(() => runError.invoke('handler', ['run'], [])).toThrow('boom')
  })

  test('rejects invoke targets that are not functions', () => {
    const wxs = runtime()
    wxs.register('utils', 'module.exports = { value: 1 }')
    expect(() => wxs.invoke('utils', ['value'], [])).toThrow('not a function')
  })
})
