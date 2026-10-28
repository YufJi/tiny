import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { createHarnessRenderConnector, harnessRenderView } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'
const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
})

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

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view class="target">one</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (inner: string) => unknown)(name)
    },
  }
}

describe('render host actions', () => {
  test('runs a navigator action through the host navigation API', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
    const renderConnector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
    })
    const render = harnessRenderView(renderConnector)
    const calls: Array<{ method: string; params: Record<string, unknown> }> = []
    const host = createTinyRuntime({
      serviceTransport: hostService,
      renderConnector,
      manifest,
      initialPath: PAGE_PATH,
      apiHandlers: {
        'navigate.to': (params: Record<string, unknown>) => {
          calls.push({ method: 'navigate.to', params })
          return { errMsg: 'navigateTo:ok' }
        },
        'navigate.back': (params: Record<string, unknown>) => {
          calls.push({ method: 'navigate.back', params })
          return { errMsg: 'navigateBack:ok' }
        },
        'navigate.switchTab': (params: Record<string, unknown>) => {
          calls.push({ method: 'navigate.switchTab', params })
          return { errMsg: 'switchTab:ok' }
        },
      },
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({ data: {} })
    await host.bootstrap()
    const pageId = service.activePage!.pageId

    const send = async (payload: Record<string, unknown>) => {
      render.connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.hostAction, payload, { pageId })
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    await send({ action: 'navigateTo', url: '/pages/detail/detail?from=list' })
    await send({ action: 'navigateBack', delta: 2 })
    await send({ action: 'switchTab', url: '/pages/tab/tab' })
    expect(calls).toEqual([
      { method: 'navigate.to', params: { url: '/pages/detail/detail?from=list' } },
      { method: 'navigate.back', params: { delta: 2 } },
      { method: 'navigate.switchTab', params: { url: '/pages/tab/tab' } },
    ])
    await host.close()
  })

  test('ignores unknown actions and reports exit as unsupported', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
    const renderConnector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
    })
    const render = harnessRenderView(renderConnector)
    const calls: string[] = []
    const host = createTinyRuntime({
      serviceTransport: hostService,
      renderConnector,
      manifest,
      initialPath: PAGE_PATH,
      apiHandlers: {
        'navigate.to': () => {
          calls.push('navigate.to')
          return { errMsg: 'navigateTo:ok' }
        },
      },
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({ data: {} })
    await host.bootstrap()
    const pageId = service.activePage!.pageId

    render.connection.sendEvent(
      TREE_PROTOCOL.domain,
      TREE_PROTOCOL.hostAction,
      { action: 'teleport', url: '/pages/a/a' },
      { pageId },
    )
    render.connection.sendEvent(
      TREE_PROTOCOL.domain,
      TREE_PROTOCOL.hostAction,
      { action: 'exit' },
      { pageId },
    )
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(calls).toEqual([])
    expect(service.pageStack).toHaveLength(1)
    await host.close()
  })
})
