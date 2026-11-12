import { describe, expect, test } from 'vitest'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import type { BridgeConnection } from '@tiny/bridge'
import { MiniProgramPageRegistry } from '../src/service/page/registry'
import { ServicePageStack } from '../src/service/page/stack'
import { ServiceTabBar } from '../src/service/app/tab-bar'
import type { ServiceRenderPort } from '../src/service/render-bridge/port'
import type { MiniProgramPageOptions } from '../src/service/page/types'

const PAGE_A = 'pages/a/a'
const PAGE_B = 'pages/b/b'

function pageArtifact(path: string): PageArtifact {
  return {
    path,
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
  withExitState?: boolean
  initialExitState?: unknown
} = {}) {
  const lifecycles: string[] = []
  const loadExitStates: unknown[] = []
  const manifest = createManifest(options.withTabBar === true)
  const registry = new MiniProgramPageRegistry([PAGE_A, PAGE_B])
  const pageOptions = (tag: 'a' | 'b'): MiniProgramPageOptions => ({
    data: { tag },
    onLoad() {
      lifecycles.push(`${tag}:load`)
      loadExitStates.push((this as unknown as { exitState?: unknown }).exitState)
    },
    onShow() {
      lifecycles.push(`${tag}:show`)
    },
    onHide() {
      lifecycles.push(`${tag}:hide`)
      if (options.withExitState) this.data.tag = `${tag}:hidden`
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
    ...(options.withExitState
      ? {
          onSaveExitState() {
            lifecycles.push(`${tag}:save-exit`)
            return { tag: this.data.tag }
          },
        }
      : {}),
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
    connection,
    tabBar,
    ...(options.maxPageStack !== undefined ? { maxPageStack: options.maxPageStack } : {}),
    ...(Object.prototype.hasOwnProperty.call(options, 'initialExitState')
      ? { initialExitState: options.initialExitState }
      : {}),
  })
  return { stack, render, diagnostics, lifecycles, loadExitStates }
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

  test('snapshots and restores page data and saveExitState', () => {
    const harness = createHarness()
    harness.stack.start()
    const page = harness.stack.activePage!
    page.setData({ tag: 'dirty', nested: { count: 2 } })
    page.savedExitState = { scrollTop: 48 }

    const snapshot = harness.stack.snapshotState()
    expect(snapshot).toHaveLength(1)
    expect(snapshot[0]).toMatchObject({
      pageId: page.pageId,
      path: PAGE_A,
      data: { tag: 'dirty', nested: { count: 2 } },
      savedExitState: { scrollTop: 48 },
      exitState: null,
    })

    const restored = harness.stack.restoreState(
      page.pageId,
      { tag: 'restored', extra: true },
      { scrollTop: 12 },
    )
    expect(restored).toMatchObject({
      status: 'restored',
      pageId: page.pageId,
      data: { tag: 'restored', extra: true, nested: { count: 2 } },
    })
    expect(page.data).toMatchObject({ tag: 'restored', extra: true })
    expect(page.savedExitState).toEqual({ scrollTop: 12 })
    expect(page.exitState).toEqual({ scrollTop: 12 })
    expect(harness.render.synced.at(-1)).toMatchObject({
      pageId: page.pageId,
      patch: { tag: 'restored', extra: true },
    })
    expect(harness.stack.restoreState('missing', {})).toMatchObject({ status: 'missing' })
  })

  test('loads initial exit state before onLoad and consumes it once', () => {
    const harness = createHarness({ initialExitState: { draft: 'before-launch' } })
    harness.stack.start()
    expect(harness.loadExitStates).toEqual([{ draft: 'before-launch' }])
    expect(harness.stack.activePage?.exitState).toEqual({ draft: 'before-launch' })

    harness.stack.navigateTo(`/${PAGE_B}`)
    expect(harness.loadExitStates).toEqual([{ draft: 'before-launch' }, undefined])
    expect(harness.stack.activePage?.exitState).toBeUndefined()
  })

  test('saves exit state after onHide so onHide mutations are included', () => {
    const harness = createHarness({ withExitState: true })
    harness.stack.start()
    harness.stack.hide()

    expect(harness.lifecycles.slice(-2)).toEqual(['a:hide', 'a:save-exit'])
    expect(harness.stack.activePage?.savedExitState).toEqual({ tag: 'a:hidden' })
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
