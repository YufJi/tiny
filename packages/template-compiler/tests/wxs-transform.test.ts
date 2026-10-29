import { describe, expect, test } from 'vitest'
import { transformWxsSource } from '../src/wxs/transform'

describe('WXS compiler transform', () => {
  test('rewrites free globals and constructor reads', () => {
    const source = [
      'var max = Math.max(1, 2)',
      'var pattern = getRegExp("a+", "g")',
      'var type = list.constructor',
      'var objectType = ({}).constructor',
    ].join('\n')
    const output = transformWxsSource(source).code
    expect(output).toContain('__wxs.globals.Math.max(1, 2)')
    expect(output).toContain('__wxs.getRegExp("a+", "g")')
    expect(output).toContain('__wxs.ctor(list)')
    expect(output).toContain('__wxs.ctor(({}))')
  })

  test('leaves declarations, parameters, properties and strings alone', () => {
    const source = [
      'function outer(Math) {',
      '  var list = { constructor: 1, value: Math }',
      '  return list.constructor + "Math.constructor"',
      '}',
      'module.exports = { outer: outer }',
    ].join('\n')
    const output = transformWxsSource(source).code
    expect(output).toContain('function outer(Math)')
    expect(output).toContain('constructor: 1')
    expect(output).toContain('__wxs.ctor(list)')
    expect(output).toContain('"Math.constructor"')
  })

  test('keeps assignments to constructor untouched', () => {
    const source = 'var object = {}; object.constructor = 1'
    const output = transformWxsSource(source).code
    expect(output).toContain('object.constructor = 1')
    expect(output).not.toContain('__wxs.ctor(object) =')
  })

  test('reports the WXS source in the map', () => {
    const result = transformWxsSource('var value = Math.PI', 'pages/index/utils.wxs')
    expect(result.map).toContain('pages/index/utils.wxs')
  })
})
