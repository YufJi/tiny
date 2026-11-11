import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTestHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originalGlobals = new Map<string, unknown>()
for (const key of globalKeys) {
  originalGlobals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
}

afterAll(() => {
  for (const [key, value] of originalGlobals) {
    (globalThis as unknown as Record<string, unknown>)[key] = value
  }
})

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

function createTemplateRegistry() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view id="add" bindtap="add">{{text}}</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

describe('page instance fields', () => {
  test('copies non-lifecycle page options onto the page instance', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const renderConnector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: PAGE_PATH,
    })
    const host = createTestHost({
      serviceTransport: hostServiceTransport,
      renderConnector,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { text: '' },
      // WeChat copies plain instance fields (not just `data`) onto the page
      // instance; `add()` mutates `this.lines` directly.
      lines: ['first'],
      add(this: { lines: string[]; setData: (patch: Record<string, unknown>) => void }) {
        this.lines.push('second')
        this.setData({ text: this.lines.join('\n') })
      },
    })

    await host.bootstrap()
    const page = service.activePage!
    await page.invokeMethod('add')
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(page.data.text).toBe('first\nsecond')
    await host.close()
  })
})
