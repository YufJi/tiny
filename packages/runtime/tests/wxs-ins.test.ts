import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread, lastLogicTree } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
  delete (globalThis as unknown as Record<string, unknown>).__tinyWxsArrayCtor
  delete (globalThis as unknown as Record<string, unknown>).__tinyWxsObjectCtor
})

const TEMPLATE = `
<wxs module="h">
exports.start = function (event, ins) {
  ins.callMethod('record', 'ins', typeof ins)
  ins.callMethod('record', 'instance', event.instance === ins)
  ins.callMethod('record', 'data', ins.getData().marker)
  ins.callMethod('record', 'dataset', ins.selectComponent('.box').getDataset().role)
  ins.selectComponent('.box').setStyle({ left: '42px', backgroundColor: '#00ff00' })
}
exports.plain = function () {
  exports.plainCalls = (exports.plainCalls || 0) + 1
}
</wxs>
<wxs module="ctor">
exports.probe = function () {
  var list = [];
  var object = {};
  globalThis.__tinyWxsArrayCtor = list.constructor;
  globalThis.__tinyWxsObjectCtor = object.constructor;
}
</wxs>
<view class="box" data-role="target" style="position: absolute; top: 5px;" bindtap="{{h.start}}">x</view>
<view class="plain" bindtap="onPlain">y</view>
<view class="ctor" bindtap="{{ctor.probe}}">z</view>
`

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, TEMPLATE)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (inner: string) => unknown)(name)
    },
  }
}

function createManifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    bodyType: 'page',
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    configuration: { path: PAGE_PATH, sourcePath: `${PAGE_PATH}.json`, effective: {} },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page],
    components: [],
    styles: [],
    assets: [],
  }
}

type RenderStyleNode = {
  tag: string
  props?: Record<string, unknown>
  children?: RenderStyleNode[]
}

function findNodeByClass(node: RenderStyleNode, className: string): RenderStyleNode | undefined {
  const classes = String(node.props?.class ?? '').split(/\s+/)
  if (classes.includes(className)) return node
  for (const child of node.children ?? []) {
    const match = findNodeByClass(child, className)
    if (match) return match
  }
  return undefined
}

describe('WXS event descriptor (ins)', () => {
  test('hands the handler an ins descriptor and merges setStyle into the render tree', async () => {
    const manifest = createManifest()
    const records: Array<[string, unknown]> = []
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_PATH,
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { marker: 'page-data' },
      record(this: unknown, name: string, value: unknown) {
        records.push([name, value])
      },
      onPlain() {
        records.push(['plain', true])
      },
    })
    await host.bootstrap()
    const pageId = service.activePage!.pageId
    const tree = lastLogicTree() as unknown as {
      query: (pageId: string, selector: string, all: boolean) => Array<{ viewId: string }>
      snapshotRenderTree: (pageId: string) => RenderStyleNode | null
    }

    const box = tree.query(pageId, '.box', false)[0]!
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: box.viewId,
      name: 'tap',
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(records).toEqual([
      ['ins', 'object'],
      ['instance', true],
      ['data', 'page-data'],
      ['dataset', 'target'],
    ])

    const rendered = tree.snapshotRenderTree(pageId)!
    const styled = findNodeByClass(rendered, 'box')!
    const style = String(styled.props?.style ?? '')
    expect(style).toContain('left: 42px')
    expect(style).toContain('background-color: #00ff00')
    // The WXML inline style survives: setStyle merges, it does not replace.
    expect(style).toContain('position: absolute')
    expect(style).toContain('top: 5px')

    // A plain `bindtap="method"` binding must not be wrapped: it still gets the
    // page method, and the WXS handler is only invoked through its own binding.
    const plain = tree.query(pageId, '.plain', false)[0]!
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: plain.viewId,
      name: 'tap',
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(records.at(-1)).toEqual(['plain', true])

    // WXS sees type names through .constructor, while host JS keeps the real
    // intrinsic constructor.
    const ctor = tree.query(pageId, '.ctor', false)[0]!
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: ctor.viewId,
      name: 'tap',
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
    const globals = globalThis as unknown as Record<string, unknown>
    expect(globals.__tinyWxsArrayCtor).toBe('Array')
    expect(globals.__tinyWxsObjectCtor).toBe('Object')
    expect([].constructor).toBe(Array)
    await host.close()
  })
})
