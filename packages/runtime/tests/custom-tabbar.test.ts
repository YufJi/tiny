import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  TINY_ENGINE_NAMING,
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTestHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/home/home'
const TAB_BAR_PATH = 'custom-tab-bar/index'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])

afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
})

function createTemplates(pageTemplate = '<view>home</view><custom-tab-bar />') {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, pageTemplate)
  group.addTmpl(TAB_BAR_PATH, '<view id="bar">{{selected}}</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`template not found: ${path}`)
      return (entry as (name?: string) => unknown)(name)
    },
  }
}

function createManifest(custom = true): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { usingComponents: { 'custom-tab-bar': `/${TAB_BAR_PATH}` } },
    },
  }
  const component: ComponentArtifact = {
    path: TAB_BAR_PATH,
    template: { path: TAB_BAR_PATH, outputPath: 'templates.js', sourcePath: `${TAB_BAR_PATH}.wxml` },
    configuration: {
      path: TAB_BAR_PATH,
      sourcePath: `${TAB_BAR_PATH}.json`,
      effective: { component: true },
    },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    app: {
      path: 'app',
      configuration: {
        path: 'app',
        sourcePath: 'app.json',
        effective: {
          tabBar: {
            custom,
            list: [{ pagePath: PAGE_PATH, text: 'Home' }],
          },
        },
      },
    },
    pages: [page],
    components: [component],
    styles: [],
    assets: [],
  }
}

describe('custom tabBar service tree', () => {
  test('resolves getTabBar() and getTabBar(callback) from the page logic tree', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplates() },
      initialPath: PAGE_PATH,
    })
    const host = createTestHost({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const records: unknown[] = []
    let tabBarHandle: unknown
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    globalObject[TINY_ENGINE_NAMING.entryPathHint] = TAB_BAR_PATH
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { selected: 0 },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onShow(this: {
        getTabBar: (callback?: (tabBar: unknown) => void) => unknown
      }) {
        const direct = this.getTabBar()
        tabBarHandle = direct
        records.push(['direct', Boolean(direct)])
        const returned = this.getTabBar((tabBar) => {
          records.push(['callback', Boolean(tabBar)])
          ;(tabBar as { setData: (patch: Record<string, unknown>) => void })
            .setData({ selected: 1 })
        })
        records.push(['returned', Boolean(returned)])
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(records).toEqual([
      ['direct', true],
      ['callback', true],
      ['returned', true],
    ])
    expect((tabBarHandle as { data: { selected: number } }).data.selected).toBe(1)
    await host.close()
  })

  test('waits for a conditionally created tabBar before invoking the callback', async () => {
    // Keep this path page-owned: the service only creates a separate tab root
    // when `tabBar.custom` is enabled.
    const manifest = createManifest(false)
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: {
        templates: createTemplates(
          '<view>home {{showBar}}</view><custom-tab-bar wx:if="{{showBar}}" />',
        ),
      },
      initialPath: PAGE_PATH,
    })
    const host = createTestHost({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const records: string[] = []
    let tabBarHandle: unknown
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    globalObject[TINY_ENGINE_NAMING.entryPathHint] = TAB_BAR_PATH
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { selected: 0 },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { showBar: false },
      onLoad(this: {
        getTabBar: (callback?: (tabBar: unknown) => void) => unknown
      }) {
        const returned = this.getTabBar((tabBar) => {
          tabBarHandle = tabBar
          records.push('callback')
        })
        records.push(returned === null ? 'pending' : 'ready')
      },
      onReady(this: { setData: (patch: Record<string, unknown>) => void }) {
        this.setData({ showBar: true })
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(records).toEqual(['pending', 'callback'])
    expect((tabBarHandle as { data: { selected: number } }).data.selected).toBe(0)
    await host.close()
  })

  test('mounts a custom tabBar as a page-owned separate root', async () => {
    const manifest = createManifest()
    const [hostService, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const mountedTabBars: unknown[] = []
    const connector = createHarnessRenderConnector({
      manifest,
      artifacts: {
        templates: createTemplates('<view>home</view>'),
      },
      initialPath: PAGE_PATH,
      renderer: {
        mountTabBar: (root) => mountedTabBars.push(root),
      },
    })
    const host = createTestHost({
      serviceTransport: hostService,
      renderConnector: connector,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const records: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    globalObject[TINY_ENGINE_NAMING.entryPathHint] = TAB_BAR_PATH
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { selected: 0 },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onLoad(this: {
        getTabBar: (callback?: (tabBar: unknown) => void) => unknown
      }) {
        records.push(this.getTabBar() ? 'direct' : 'missing')
        const returned = this.getTabBar((tabBar) => {
          records.push(tabBar ? 'callback' : 'missing-callback')
        })
        records.push(returned ? 'returned' : 'null')
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(records).toEqual(['direct', 'callback', 'returned'])
    expect(mountedTabBars.length).toBeGreaterThan(0)
    await host.close()
  })
})
