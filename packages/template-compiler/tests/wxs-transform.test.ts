import { describe, expect, test } from 'vitest'
import { TmplGroup } from '../src/group'
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


describe('WXS module table', () => {
  test('contains transformed external and inline modules', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript('wxs/utils.wxs', 'module.exports = { max: Math.max(1, 2) }')
    group.addTmpl(
      'pages/index/index',
      '<wxs module="inline">exports.ctor = [].constructor</wxs><view>{{inline.ctor}}</view>',
    )
    const table = group.getWxsModuleTable()
    const external = table.modules.find((module) => module.id === 'wxs/utils.wxs')
    const inline = table.modules.find((module) => module.id === 'pages/index/index#inline')
    expect(external?.code).toContain('__wxs.globals.Math.max')
    expect(external?.map).toContain('wxs/utils.wxs')
    expect(inline?.code).toContain('__wxs.ctor([])')
  })
})


describe('WXS event metadata', () => {
  test('emits a render event descriptor for a static WXS handler', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript('wxs/utils.wxs', 'module.exports = { tap: function () {} }')
    group.addTmpl(
      'pages/index/index',
      '<wxs module="utils" src="/wxs/utils.wxs" />'
        + '<view bindtap="{{utils.tap}}" catchtouchmove="{{utils.tap}}" />',
    )
    const output = group.getTmplGenObjectGroups()
    expect(output).toContain('wx-tiny-wxs-events')
    expect(output).toContain('\\"moduleId\\":\\"wxs/utils.wxs\\"')
    expect(output).toContain('\\"exportPath\\":[\\"tap\\"]')
    expect(output).toContain('\\"catch\\":true')
  })

  test('does not emit metadata for a dynamic non-WXS binding', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addTmpl('pages/index/index', '<view bindtap="onTap" />')
    expect(group.getTmplGenObjectGroups()).not.toContain('wx-tiny-wxs-events')
  })
})


describe('WXS change:prop metadata', () => {
  test('emits a prop observer descriptor', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript('wxs/utils.wxs', 'module.exports = { observe: function () {} }')
    group.addTmpl(
      'pages/index/index',
      '<wxs module="utils" src="/wxs/utils.wxs" />'
        + '<view change:prop="{{utils.observe}}" prop="{{value}}" />',
    )
    const output = group.getTmplGenObjectGroups()
    expect(output).toContain('wx-tiny-wxs-props')
    expect(output).toContain('\\"prop\\":\\"prop\\"')
    expect(output).toContain('\\"moduleId\\":\\"wxs/utils.wxs\\"')
  })
})


describe('WXS custom component events', () => {
  test('keeps custom component WXS events on the service path', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript('wxs/utils.wxs', 'module.exports = { tap: function () {} }')
    group.addTmpl(
      'pages/index/index',
      '<wxs module="utils" src="/wxs/utils.wxs" />'
        + '<my-comp bindtap="{{utils.tap}}" />',
    )
    const output = group.getTmplGenObjectGroups()
    expect(output).not.toContain('wx-tiny-wxs-events')
    expect(output).toContain('R.v(')
  })
})


describe('WXS custom component change:prop', () => {
  test('keeps custom component prop observers on the service path', () => {
    const group = TmplGroup.new({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript('wxs/utils.wxs', 'module.exports = { observe: function () {} }')
    group.addTmpl(
      'pages/index/index',
      '<wxs module="utils" src="/wxs/utils.wxs" />'
        + '<my-comp change:label="{{utils.observe}}" label="{{value}}" />',
    )
    const output = group.getTmplGenObjectGroups()
    expect(output).not.toContain('wx-tiny-wxs-props')
    expect(output).toContain('R.p(')
  })
})
