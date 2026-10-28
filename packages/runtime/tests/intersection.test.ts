import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness } from './helpers/split-tree-harness'
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

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view class="target">one</view><view class="target">two</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
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

describe('intersection observers', () => {
  test('delivers render intersections back to page callbacks', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const rect = () => ({ left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40 })
    const observedCounts: number[] = []
    bootSplitTreeHarness({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
      renderer: {
        observeIntersection: (request, emit) => {
          observedCounts.push(request.viewIds.length)
          emit(request.viewIds.map((viewId) => ({
            viewId,
            boundingClientRect: rect(),
            intersectionRect: rect(),
            relativeRect: rect(),
            intersectionRatio: 0.5,
            time: 1,
          })))
          return () => {}
        },
      },
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
      data: {
        ratio: null as number | null,
        defaultCount: 0,
        allCount: 0,
      },
      onReady() {
        this.createIntersectionObserver({ thresholds: [0.5] })
          .relativeToViewport()
          .observe('.target', (entry: { intersectionRatio: number }) => {
            this.setData({
              ratio: entry.intersectionRatio,
              defaultCount: (this.data.defaultCount ?? 0) + 1,
            })
          })
        this.createIntersectionObserver({ thresholds: [0.5], observeAll: true })
          .relativeToViewport()
          .observe('.target', () => {
            this.setData({ allCount: (this.data.allCount ?? 0) + 1 })
          })
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(service.activePage?.data.ratio).toBe(0.5)
    await host.close()
  })

  test('wx.createIntersectionObserver scopes to the page instance it receives', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const rect = () => ({ left: 0, top: 0, right: 100, bottom: 40, width: 100, height: 40 })
    const observedCounts: number[] = []
    bootSplitTreeHarness({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
      renderer: {
        observeIntersection: (request, emit) => {
          observedCounts.push(request.viewIds.length)
          emit(request.viewIds.map((viewId) => ({
            viewId,
            boundingClientRect: rect(),
            intersectionRect: rect(),
            relativeRect: rect(),
            intersectionRatio: 0.25,
            time: 1,
          })))
          return () => {}
        },
      },
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const wx = globalObject.wx as {
      createIntersectionObserver: (
        component?: unknown,
        options?: Record<string, unknown>,
      ) => { relativeToViewport: (margins?: unknown) => { observe: (selector: string, callback: (entry: { intersectionRatio: number }) => void) => void } }
    }
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { ratio: null as number | null },
      onReady() {
        wx.createIntersectionObserver(this, { thresholds: [0.5] })
          .relativeToViewport()
          .observe('.target', (entry) => {
            this.setData({ ratio: entry.intersectionRatio })
          })
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(observedCounts).toEqual([1])
    expect(service.activePage?.data.ratio).toBe(0.25)
    await host.close()
  })
})
