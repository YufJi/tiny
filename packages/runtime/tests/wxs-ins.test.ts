import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTestHost } from './support/host'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread, lastLogicTree } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
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
exports.input = function (event, ins) {
  ins.callMethod('record', 'input', event.detail.value)
}
</wxs>
<view class="box" data-role="target" style="position: absolute; top: 5px;" bindlongpress="{{h.start}}">x</view>
<view class="plain" bindtap="onPlain">y</view>
<input id="wxs-input" bindinput="{{h.input}}" />
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

describe('WXS event dispatch side', () => {
  test('does not run WXS handlers in the logic tree', async () => {
    const manifest = createManifest()
    const records: Array<[string, unknown]> = []
    const bindings: Array<{ event: string; moduleId?: string }> = []
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
      renderer: {
        setWxsBinding: (binding) => bindings.push(binding),
      },
    })
    const host = createTestHost({
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
    expect(bindings).toContainEqual(expect.objectContaining({
      event: 'input',
      moduleId: `${PAGE_PATH}#h`,
    }))
    const tree = lastLogicTree() as unknown as {
      query: (pageId: string, selector: string, all: boolean) => Array<{ viewId: string }>
    }

    // A WXS-bound event dispatched in the logic tree must not invoke the WXS
    // handler there: WeChat runs it in the view, and the logic-tree listener is
    // a placeholder (`Q.B`) so `catch` still shapes service-side bubbling.
    const box = tree.query(pageId, '.box', false)[0]!
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: box.viewId,
      name: 'longpress',
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(records).toEqual([])

    // Plain method bindings keep their service-side dispatch.
    const plain = tree.query(pageId, '.plain', false)[0]!
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: plain.viewId,
      name: 'tap',
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(records.at(-1)).toEqual(['plain', true])
    await host.close()
  })
})
