import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness as bootRenderThread } from './helpers/split-tree-harness'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'
const PANEL_PATH = 'components/panel/panel'
const CHILD_PATH = 'components/child/child'
const PAGE_WXML = '<view><panel id="panel" class="panel"><child id="direct" class="direct" /></panel></view>'
const PANEL_WXML = '<view><child id="inner" class="inner" /></view>'

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

function createTemplateRegistry() {
  const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
  group.addTmpl(PAGE_PATH, PAGE_WXML)
  group.addTmpl(PANEL_PATH, PANEL_WXML)
  group.addTmpl(CHILD_PATH, '<view>child</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const componentGroup = groupList[path]
      if (!componentGroup) throw new Error(`template not found: ${path}`)
      return componentGroup(name)
    },
  }
}

function artifact(path: string, using?: Record<string, string>): PageArtifact {
  return {
    path,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: using ? { usingComponents: using } : { component: true },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [artifact(PAGE_PATH, { panel: `/${PANEL_PATH}` })],
    components: [
      artifact(PANEL_PATH, { child: `/${CHILD_PATH}` }),
      artifact(CHILD_PATH),
    ],
    styles: [],
    assets: [],
  }
}

describe('selectComponent', () => {
  test('selects from page and component scopes', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: PAGE_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { selected: '', inner: '', owner: '', all: 0 },
      onReady() {
        const panel = this.selectComponent('#panel') as {
          data: { label: string }
          selectComponent(selector: string): {
            data: { label: string }
            selectOwnerComponent(): { data: { label: string } } | null
          } | null
        } | null
        const inner = panel?.selectComponent('#inner') ?? null
        const owner = inner?.selectOwnerComponent() ?? null
        const deep = this.selectComponent('panel >>> .inner') as { data: { label: string } } | null
        this.setData({
          selected: panel?.data.label ?? 'missing',
          inner: inner?.data.label ?? 'missing',
          owner: owner?.data.label ?? 'missing',
          all: this.selectAllComponents('.inner').length,
          deep: deep?.data.label ?? 'missing',
        })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { label: 'panel' },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { label: 'child' },
    })

    const result = await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const page = service.activePage!
    expect(page.data.selected).toBe('panel')
    expect(page.data.inner).toBe('child')
    expect(page.data.owner).toBe('panel')
    expect(page.data.all).toBe(0)
    expect((render.adapter.getComponentSnapshot() as Array<{ path: string }>).map((item) => item.path)).toContain(CHILD_PATH)
    expect(result.service.componentSchemas).toHaveLength(2)
    await host.close()
  })
})
