import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { TREE_PROTOCOL, type RenderEventGeometry } from '../src/tree/protocol'
import { bootSplitTreeHarness } from './helpers/split-tree-harness'
import { bootServiceThread, lastLogicTree } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'
const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
})

function createTemplates(body: string) {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, body)
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

type EventShape = {
  currentTarget?: Record<string, unknown>
  target?: Record<string, unknown>
  stopPropagation?: () => void
}

async function boot(body: string, pageOptions: Record<string, unknown>) {
  const manifest = createManifest()
  const [hostService, serviceTransport] = createInMemoryTransportPair()
  const [hostRender, renderTransport] = createInMemoryTransportPair()
  const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
  bootSplitTreeHarness({
    transport: renderTransport,
    manifest,
    artifacts: { templates: createTemplates(body) },
    initialPath: PAGE_PATH,
  })
  const host = createTinyRuntime({
    serviceTransport: hostService,
    renderTransport: hostRender,
    manifest,
    initialPath: PAGE_PATH,
  })
  const globalObject = globalThis as unknown as Record<string, unknown>
  ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
  ;(globalObject.Page as (options: Record<string, unknown>) => unknown)(pageOptions)
  await host.bootstrap()
  const pageId = service.activePage!.pageId
  const logic = lastLogicTree() as unknown as {
    query: (pageId: string, selector: string, all: boolean) => Array<{ viewId: string }>
  }
  const dispatch = async (
    selector: string,
    payload: Partial<{
      name: string
      target: RenderEventGeometry
      currentTarget: RenderEventGeometry
    }> = {},
  ) => {
    const node = logic.query(pageId, selector, false)[0]
    expect(node, `node ${selector}`).toBeDefined()
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: node!.viewId,
      name: payload.name ?? 'tap',
      ...(payload.target ? { target: payload.target } : {}),
      ...(payload.currentTarget ? { currentTarget: payload.currentTarget } : {}),
    }, { pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  return { host, service, dispatch }
}

const NESTED = '<view id="outer" bindtap="outer"><view id="inner" bindtap="inner">x</view></view>'

describe('event dispatch', () => {
  test('a nested tap bubbles from the target binding to its ancestors once each', async () => {
    const calls: string[] = []
    const { host, dispatch } = await boot(NESTED, {
      data: {},
      outer() { calls.push('outer') },
      inner() { calls.push('inner') },
    })
    await dispatch('#inner')
    expect(calls).toEqual(['inner', 'outer'])
    calls.length = 0
    await dispatch('#outer')
    expect(calls).toEqual(['outer'])
    await host.close()
  })

  test('stopPropagation ends the bubble at the current binding', async () => {
    const calls: string[] = []
    const { host, dispatch } = await boot(NESTED, {
      data: {},
      outer() { calls.push('outer') },
      inner(event: EventShape) {
        calls.push('inner')
        event.stopPropagation?.()
      },
    })
    await dispatch('#inner')
    expect(calls).toEqual(['inner'])
    await host.close()
  })

  test('exposes target/currentTarget geometry on the dispatched event', async () => {
    const seen: Array<{
      currentLeft: unknown
      currentTop: unknown
      targetTop: unknown
      width: unknown
    }> = []
    const { host, dispatch } = await boot(NESTED, {
      data: {},
      outer() {},
      inner(event: EventShape) {
        seen.push({
          currentLeft: event.currentTarget?.offsetLeft,
          currentTop: event.currentTarget?.offsetTop,
          targetTop: event.target?.offsetTop,
          width: event.currentTarget?.offsetWidth,
        })
      },
    })
    await dispatch('#inner', {
      currentTarget: {
        viewId: 'view-inner',
        offsetLeft: 12,
        offsetTop: 34,
        offsetWidth: 56,
        offsetHeight: 78,
      },
    })
    expect(seen).toEqual([{ currentLeft: 12, currentTop: 34, targetTop: 34, width: 56 }])
    await host.close()
  })

  test('a second dispatch refreshes the geometry it carries', async () => {
    const seen: number[] = []
    const { host, dispatch } = await boot(NESTED, {
      data: {},
      outer() {},
      inner(event: EventShape) {
        seen.push(Number(event.currentTarget?.offsetTop))
      },
    })
    await dispatch('#inner', {
      currentTarget: { viewId: 'view-inner', offsetLeft: 0, offsetTop: 10, offsetWidth: 1, offsetHeight: 1 },
    })
    await dispatch('#inner', {
      currentTarget: { viewId: 'view-inner', offsetLeft: 0, offsetTop: 20, offsetWidth: 1, offsetHeight: 1 },
    })
    expect(seen).toEqual([10, 20])
    await host.close()
  })
})
