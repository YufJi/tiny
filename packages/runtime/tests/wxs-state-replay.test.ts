import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { TINY_ENGINE_NAMING, WECHAT_RUNTIME_COMPATIBILITY, type Manifest } from '@tiny/manifest'
import {
  createDefaultWxsCompiler,
  createPageScopedWxsRuntime,
  wxsPageScopeKey,
} from '@tiny/wxs-runtime'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import type { RenderNode } from '../src/tree/protocol'
import { replayWxsHandler } from '../src/service/render/wxs-host'

const PAGE = 'pages/replay/replay'
const STATE = 'wxs/replay-state.wxs'

const globals = globalThis as unknown as Record<string, unknown>
const previousRuntime = globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal]

afterAll(() => {
  if (previousRuntime === undefined) delete globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal]
  else globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = previousRuntime
})

function textOf(node: RenderNode | null): string {
  if (!node) return ''
  if (node.type === 'text') return node.text
  return (node.children ?? []).map((child) => textOf(child)).join('')
}

describe('WXS state replay', () => {
  test('mirrors a render handler into the page expression runtime', async () => {
    const wxsRuntime = createPageScopedWxsRuntime({
      compile: createDefaultWxsCompiler(),
    })
    globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = wxsRuntime
    const group = TmplGroup.newDev({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addScript(STATE, `
var count = 0
function hit() {
  count += 1
  return count
}
function peek() {
  return 'peek:' + count
}
module.exports = { hit: hit, peek: peek }
`)
    group.addTmpl(PAGE, `
<wxs module="state" src="/${STATE}" />
<text class="state">state:{{state.peek()}}:{{tick}}</text>
<view class="hit" bindtap="{{state.hit}}"></view>
`)
    const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
    const templates = {
      groupList,
      content(path: string, name = '') {
        return (groupList[path] as (inner?: string) => unknown)(name)
      },
    }
    const manifest: Manifest = {
      schemaVersion: 2,
      runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
      entries: { service: 'service.js', templates: 'templates.js' },
      pages: [{
        path: PAGE,
        template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
        configuration: { path: PAGE, sourcePath: `${PAGE}.json`, effective: {} },
      }],
      components: [],
      styles: [],
      assets: [],
    }
    const tree = new LogicTreeAdapter({ manifest, templates, wxsRuntime })
    tree.mountPage(PAGE, {}, 'page-1')
    await tree.glass.whenRendered()
    expect(textOf(tree.snapshotRenderTree('page-1'))).toContain('state:peek:0')

    const target = tree.query('page-1', '.hit', false)[0]!
    const event = {
      viewId: target.viewId,
      name: 'tap',
      pageId: 'page-1',
    }
    const options = {
      getLogicTree: () => tree,
      getPage: () => ({
        data: {},
        invokeMethod: () => undefined,
      }),
      requestRenderUpdate: () => {},
      wxsRuntime,
    }
    replayWxsHandler(tree, 'page-1', {
      moduleId: STATE,
      exportPath: ['hit'],
    }, event, options)
    expect(wxsRuntime.invokeScoped!(
      wxsPageScopeKey('page-1'),
      STATE,
      ['peek'],
      [],
    )).toBe('peek:1')

    tree.applyPageData('page-1', { tick: 1 })
    await tree.glass.whenRendered()
    expect(textOf(tree.snapshotRenderTree('page-1'))).toContain('state:peek:1')
  })
})
