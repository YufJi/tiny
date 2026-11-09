import { describe, expect, test } from 'vitest'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import type { BridgeConnection } from '@tiny/bridge'
import { ComponentTree } from '../src/service/component-tree'
import { MiniProgramPageRegistry } from '../src/service/page-registry'
import { ServicePageStack } from '../src/service/page-stack'
import { ServiceTabBar } from '../src/service/tab-bar'
import type { ServiceRenderPort } from '../src/service/render/port'
import type { MiniProgramPageOptions } from '../src/service/types'

const PAGE_A = 'pages/a/a'
const PAGE_B = 'pages/b/b'

function pageArtifact(path: string): PageArtifact {
  return {
    path,
    bodyType: 'page',
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: { path, sourcePath: `${path}.json`, effective: {} },
  }
}

function createManifest(withTabBar = false): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [pageArtifact(PAGE_A), pageArtifact(PAGE_B)],
    components: [],
    styles: [],
    assets: [],
    ...(withTabBar
      ? {
          app: {
            path: 'app',
            configuration: {
              path: 'app.json',
              sourcePath: 'app.json',
              effective: {
                tabBar: {
                  list: [
                    { pagePath: PAGE_A, text: 'A' },
                    { pagePath: PAGE_B, text: 'B' },
                  ],
                },
              },
            },
          },
        }
      : {}),
  }
}

type FakeRender = ServiceRenderPort & {
  mounted: string[]
  unmounted: string[]
  synced: Array<{ pageId: string; patch: Record<string, unknown> }>
  lifetimes: Array<{ pageId: string; phase: 'show' | 'hide' }>
}

function createFakeRender(): FakeRender {
  const mounted: string[] = []
  const unmounted: string[] = []
  const synced: FakeRender['synced'] = []
  const lifetimes: FakeRender['lifetimes'] = []
  return {
    mounted,
    unmounted,
    synced,
    lifetimes,
    mountPage(page) {
      mounted.push(page.path)
    },
    unmountPage(pageId) {
      unmounted.push(pageId)
    },
    syncPageData(pageId, patch) {
      synced.push({ pageId, patch })
    },
    completeAfterRender(_pageId, callback) {
      // No render thread in the fake: keep the completion asynchronous.
      queueMicrotask(callback)
    },
    triggerPageLifetime(pageId, phase) {
      lifetimes.push({ pageId, phase })
    },
    selectComponents: () => [],
    relationNodes: () => [],
    pageSelectorQuery: () => ({}),
    pageIntersectionObserver: () => ({}),
    pageAnimate: () => false,
    pageClearAnimate: () => false,
  }
}

type DiagnosticRecord = {
  level: string
  payload: Record<string, unknown>
  pageId?: string
}

function createHarness(options: {
  maxPageStack?: number
  withTabBar?: boolean
} = {}) {
  const lifecycles: string[] = []
  const manifest = createManifest(options.withTabBar === true)
  const registry = new MiniProgramPageRegistry([PAGE_A, PAGE_B])
  const pageOptions = (tag: 'a' | 'b'): MiniProgramPageOptions => ({
    data: { tag },
    onLoad() {
      lifecycles.push(`${tag}:load`)
    },
    onShow() {
      lifecycles.push(`${tag}:show`)
    },
    onHide() {
      lifecycles.push(`${tag}:hide`)
    },
    onUnload() {
      lifecycles.push(`${tag}:unload`)
    },
    onPageScroll() {
      lifecycles.push(`${tag}:scroll`)
    },
    onReachBottom() {
      lifecycles.push(`${tag}:bottom`)
    },
    onPullDownRefresh() {
      lifecycles.push(`${tag}:pull`)
    },
  })
  registry.registerPage(pageOptions('a'))
  registry.registerPage(pageOptions('b'))

  const diagnostics: DiagnosticRecord[] = []
  const connection = {
    sendDiagnostic(level: string, payload: unknown, pageId?: string) {
      diagnostics.push({ level, payload: payload as Record<string, unknown>, pageId })
    },
  } as unknown as BridgeConnection
  const render = createFakeRender()
  const tabBar = new ServiceTabBar(manifest, () => {})
  const stack = new ServicePageStack({
    manifest,
    initialPath: PAGE_A,
    registry,
    render,
    componentTree: new ComponentTree(),
    connection,
    tabBar,
    ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
  })
  return { stack, render, diagnostics, lifecycles }
}

describe('ServicePageStack', () => {
  test('starts the entry page, mounts it and projects runtime state', () => {
    const harness = createHarness()
    harness.stack.start()

    expect(harness.stack.pageStack.map((page) => page.path)).toEqual([PAGE_A])
    expect(harness.stack.activePage?.data.tag).toBe('a')
    expect(harness.render.mounted).toEqual([PAGE_A])
    expect(harness.lifecycles).toEqual(['a:load', 'a:show'])
    expect(harness.diagnostics.some((item) => item.payload.code === 'RUNTIME_STATE')).toBe(true)
  })

  test('syncs setData through the render port without owning the logic tree', () => {
    const harness = createHarness()
    harness.stack.start()
    harness.stack.activePage!.setData({ tag: 'changed' })

    expect(harness.render.synced).toEqual([
      { pageId: harness.stack.activePage!.pageId, patch: { tag: 'changed' } },
    ])
  })

  test('navigateTo/navigateBack keep lifecycle order and render mount state', () => {
    const harness = createHarness()
    harness.stack.start()
    const firstPageId = harness.stack.activePage!.pageId

    const navigated = harness.stack.navigateTo('/pages/b/b?from=a')
    expect(navigated).toMatchObject({
      status: 'navigated',
      path: PAGE_B,
      query: { from: 'a' },
    })
    expect(harness.stack.pageStack.map((page) => page.path)).toEqual([PAGE_A, PAGE_B])
    expect(harness.render.mounted).toEqual([PAGE_A, PAGE_B])
    expect(harness.lifecycles).toEqual([
      'a:load',
      'a:show',
      'a:hide',
      'b:load',
      'b:show',
    ])
    const secondPageId = harness.stack.activePage!.pageId

    harness.stack.navigateBack(1)
    expect(harness.stack.pageStack.map((page) => page.path)).toEqual([PAGE_A])
    expect(harness.stack.activePage?.pageId).toBe(firstPageId)
    expect(harness.render.unmounted).toEqual([secondPageId])
    expect(harness.lifecycles).toEqual([
      'a:load',
      'a:show',
      'a:hide',
      'b:load',
      'b:show',
      'b:unload',
      'a:show',
    ])
  })

  test('rejects navigation beyond maxPageStack before hiding the current page', () => {
    const harness = createHarness({ maxPageStack: 1 })
    harness.stack.start()

    expect(() => harness.stack.navigateTo('/pages/b/b')).toThrow(/page stack limit/)
    expect(harness.lifecycles).toEqual(['a:load', 'a:show'])
    expect(harness.render.mounted).toEqual([PAGE_A])
  })

  test('delivers page events only while the app is visible and the page is active', () => {
    const harness = createHarness()
    harness.stack.start()
    harness.stack.hide()

    harness.stack.pageEvent('scroll', undefined, { scrollTop: 10 })
    harness.stack.pageEvent('pullDownRefresh')
    expect(harness.lifecycles).not.toContain('a:scroll')
    expect(harness.lifecycles).not.toContain('a:pull')

    harness.stack.show()
    harness.stack.pageEvent('scroll', undefined, { scrollTop: 10 })
    harness.stack.pageEvent('reachBottom')
    expect(harness.lifecycles).toContain('a:scroll')
    expect(harness.lifecycles).toContain('a:bottom')
  })

  test('switchTab caches tab pages instead of mounting them twice', () => {
    const harness = createHarness({ withTabBar: true })
    harness.stack.start()
    const firstPageId = harness.stack.activePage!.pageId

    harness.stack.switchTab({ index: 1 })
    expect(harness.stack.activePage?.path).toBe(PAGE_B)
    expect(harness.render.mounted).toEqual([PAGE_A, PAGE_B])

    harness.stack.switchTab({ index: 0 })
    expect(harness.stack.activePage?.path).toBe(PAGE_A)
    expect(harness.stack.activePage?.pageId).toBe(firstPageId)
    expect(harness.render.mounted).toEqual([PAGE_A, PAGE_B])
    expect(harness.render.unmounted).toEqual([])
  })
})
