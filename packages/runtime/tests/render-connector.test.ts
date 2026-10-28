import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { createHarnessRenderConnector, harnessRenderView } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE_A = 'pages/a/a'
const PAGE_B = 'pages/b/b'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
})

function page(path: string): PageArtifact {
  return {
    path,
    bodyType: 'page',
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: { path, sourcePath: `${path}.json`, effective: {} },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page(PAGE_A), page(PAGE_B)],
    components: [],
    styles: [],
    assets: [],
  }
}

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_A, '<view class="a">A</view>')
  group.addTmpl(PAGE_B, '<view class="b">B</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (inner: string) => unknown)(name)
    },
  }
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 10))

describe('render connector', () => {
  test('opens one render thread per page and tears it down on navigateBack', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_A })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_A,
    })
    const render = harnessRenderView(connector)
    const host = createTinyRuntime({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_A,
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: {},
      onReady() {
        this.setData({ ready: true })
      },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: {},
      onLoad(query: Record<string, string>) {
        this.setData({ from: query.from ?? '' })
      },
    })
    await host.bootstrap()
    const wx = globalObject.wx as {
      navigateTo: (options: { url: string }) => Promise<unknown>
      navigateBack: () => Promise<unknown>
    }

    const firstPageId = service.activePage!.pageId
    expect(connector.connected).toEqual([firstPageId])
    expect(connector.activePageId()).toBe(firstPageId)
    const firstConnection = connector.session(firstPageId)!.connection
    expect(render.adapter.getMountedComponent(PAGE_A)).toBeDefined()

    await wx.navigateTo({ url: '/pages/b/b?from=a' })
    await tick()
    const secondPageId = service.activePage!.pageId
    expect(service.pageStack.map((entry) => entry.path)).toEqual([PAGE_A, PAGE_B])
    expect(connector.connected).toEqual([firstPageId, secondPageId])
    expect(connector.activePageId()).toBe(secondPageId)
    // Each page owns its render thread: a new page never reuses the previous one.
    expect(connector.session(secondPageId)!.connection).not.toBe(firstConnection)
    expect(service.activePage?.data.from).toBe('a')

    await wx.navigateBack()
    await tick()
    expect(service.pageStack.map((entry) => entry.path)).toEqual([PAGE_A])
    expect(connector.activePageId()).toBe(firstPageId)
    expect(connector.session(secondPageId)).toBeUndefined()
    await host.close()
  })

  test('parks tree messages for a page that opens later, and reports a message without a page id', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_A })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_A,
    })
    const host = createTinyRuntime({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_A,
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({ data: {} })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({ data: {} })
    await host.bootstrap()
    const before = host.diagnostics.length

    // The service mounts a page and emits its first flow inside its bootstrap
    // control, before the host can open the render thread; that message must
    // be parked for page-2 instead of dropped.
    service.connection.sendEvent(
      TREE_PROTOCOL.domain,
      TREE_PROTOCOL.flow,
      { pageId: 'page-2', messages: [], styles: [] },
      { pageId: 'page-2' },
    )
    await tick()
    expect(host.diagnostics.slice(before)).toEqual([])

    // A page-scoped message with no page id is a protocol bug: report it.
    service.connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.patch, { patches: [] })
    await tick()
    expect(host.diagnostics.slice(before)).toMatchObject([
      {
        severity: 'warning',
        code: 'RENDER_SESSION_MISSING',
        details: { method: 'tree.patch', pageId: null, reason: 'missing-page-id' },
      },
    ])
    await host.close()
  })
})
