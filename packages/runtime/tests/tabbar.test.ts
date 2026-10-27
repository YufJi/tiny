import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'
import { bootServiceThread } from '../src/service'

const TODOS_PATH = 'pages/todos/todos'
const BAR_PATH = 'pages/bar/index'
const EXTRA_PATH = 'pages/extra/extra'

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
  group.addTmpl(TODOS_PATH, '<view>{{marker}}</view>')
  group.addTmpl(BAR_PATH, '<view>{{title}}</view>')
  group.addTmpl(EXTRA_PATH, '<view>extra</view>')
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

function createManifest(): Manifest {
  const page = (path: string): PageArtifact => ({
    path,
    bodyType: 'page',
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: { path, sourcePath: `${path}.json`, effective: {} },
  })
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    app: {
      path: 'app',
      configuration: {
        path: 'app',
        sourcePath: 'app.json',
        effective: {
          tabBar: {
            color: '#7A7E83',
            selectedColor: '#3CC51F',
            backgroundColor: '#FFFFFF',
            borderStyle: 'black',
            list: [
              {
                pagePath: TODOS_PATH,
                text: 'Todos',
                iconPath: 'assets/todo.png',
                selectedIconPath: 'assets/todo-active.png',
              },
              { pagePath: BAR_PATH, text: 'Chart' },
            ],
          },
        },
      },
    },
    pages: [page(TODOS_PATH), page(BAR_PATH), page(EXTRA_PATH)],
    components: [],
    styles: [],
    assets: [],
  }
}

async function tick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 10))
}

describe('tabBar runtime', () => {
  test('switches cached tab pages, updates tabBar APIs, and drives onTabItemTap', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: TODOS_PATH,
    })
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: TODOS_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: TODOS_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const todosEvents: string[] = []
    const barEvents: string[] = []
    const extraEvents: string[] = []
    const tapEvents: Array<{ page: string; index: number; pagePath: string; text: string }> = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { marker: 'fresh' },
      onLoad() {
        todosEvents.push('load')
      },
      onShow() {
        todosEvents.push('show')
      },
      onHide() {
        todosEvents.push('hide')
      },
      onTabItemTap(event: { index: number; pagePath: string; text: string }) {
        tapEvents.push({ page: TODOS_PATH, ...event })
      },
      switchToBar() {
        return wx.switchTab({ url: '/pages/bar/index' })
      },
      tapCurrent() {
        return wx.switchTab({ url: '/pages/todos/todos' })
      },
      openExtra() {
        return wx.navigateTo({ url: '/pages/extra/extra' })
      },
      badNavigate() {
        return wx.navigateTo({ url: '/pages/bar/index' })
      },
      badSwitch() {
        return wx.switchTab({ url: '/pages/extra/extra' })
      },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { title: 'chart' },
      onLoad() {
        barEvents.push('load')
      },
      onShow() {
        barEvents.push('show')
      },
      onHide() {
        barEvents.push('hide')
      },
      onTabItemTap(event: { index: number; pagePath: string; text: string }) {
        tapEvents.push({ page: BAR_PATH, ...event })
      },
      switchToTodos() {
        return wx.switchTab({ url: '/pages/todos/todos' })
      },
      tapCurrent() {
        return wx.switchTab({ url: '/pages/bar/index' })
      },
      setStyle() {
        return wx.setTabBarStyle({
          selectedColor: '#FF0000',
          backgroundColor: '#000000',
          borderStyle: 'white',
        })
      },
      setItem() {
        return wx.setTabBarItem({ index: 1, text: 'Graph' })
      },
      setBadge() {
        return wx.setTabBarBadge({ index: 0, text: '9' })
      },
      removeBadge() {
        return wx.removeTabBarBadge({ index: 0 })
      },
      showRedDot() {
        return wx.showTabBarRedDot({ index: 1 })
      },
      hideRedDot() {
        return wx.hideTabBarRedDot({ index: 1 })
      },
      hideTabBar() {
        return wx.hideTabBar()
      },
      showTabBar() {
        return wx.showTabBar()
      },
      badNavigate() {
        return wx.navigateTo({ url: '/pages/bar/index' })
      },
      badSwitch() {
        return wx.switchTab({ url: '/pages/extra/extra' })
      },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onUnload() {
        extraEvents.push('unload')
      },
      switchToBar() {
        return wx.switchTab({ url: '/pages/bar/index' })
      },
    })

    await host.bootstrap()
    const latestState = () => host.diagnostics.filter((item) => item.code === 'RUNTIME_STATE').at(-1)
    const latestTabBar = () => (latestState()?.details as {
      tabBar?: {
        visible: boolean
        selectedIndex: number
        selectedColor: string
        backgroundColor: string
        borderStyle: string
        items: Array<{ index: number; text: string; badge?: string; redDot: boolean }>
      }
    } | undefined)?.tabBar

    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(latestTabBar()).toMatchObject({
      visible: true,
      selectedIndex: 0,
      selectedColor: '#3CC51F',
      borderStyle: 'black',
    })
    expect(latestTabBar()?.items.map((item) => item.text)).toEqual(['Todos', 'Chart'])
    expect(tapEvents).toEqual([])

    const todosPage = service.activePage!
    todosPage.setData({ marker: 'kept' })
    const result = await todosPage.invokeMethod('switchToBar') as { errMsg?: string }
    await tick()
    expect(result?.errMsg ?? '').not.toContain(':fail')
    expect(service.pageStack.map((page) => page.path)).toEqual([BAR_PATH])
    expect(barEvents).toEqual(['load', 'show'])
    expect(todosEvents).toEqual(['load', 'show', 'hide'])
    expect(tapEvents).toEqual([{
      page: BAR_PATH,
      index: 1,
      pagePath: BAR_PATH,
      text: 'Chart',
    }])
    expect(latestTabBar()).toMatchObject({ visible: true, selectedIndex: 1 })
    expect(render.adapter.getMountedComponentByPageId('page-2')).toBeDefined()
    expect(render.adapter.getMountedComponentByPageId('page-1')).toBeUndefined()

    const barPage = service.activePage!
    await barPage.invokeMethod('setStyle')
    await barPage.invokeMethod('setItem')
    await barPage.invokeMethod('setBadge')
    await barPage.invokeMethod('showRedDot')
    await tick()
    expect(latestTabBar()).toMatchObject({
      selectedColor: '#FF0000',
      backgroundColor: '#000000',
      borderStyle: 'white',
    })
    expect(latestTabBar()?.items[0]).toMatchObject({ badge: '9' })
    expect(latestTabBar()?.items[1]).toMatchObject({ text: 'Graph', redDot: true })

    await barPage.invokeMethod('removeBadge')
    await barPage.invokeMethod('hideRedDot')
    await barPage.invokeMethod('hideTabBar')
    await tick()
    expect(latestTabBar()?.visible).toBe(false)
    expect(latestTabBar()?.items[0].badge).toBeUndefined()
    expect(latestTabBar()?.items[1].redDot).toBe(false)
    await barPage.invokeMethod('showTabBar')
    await tick()
    expect(latestTabBar()?.visible).toBe(true)

    await barPage.invokeMethod('switchToTodos')
    await tick()
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(service.activePage?.data.marker).toBe('kept')
    expect(todosEvents).toEqual(['load', 'show', 'hide', 'show'])
    expect(tapEvents.at(-1)).toMatchObject({ page: TODOS_PATH, index: 0, text: 'Todos' })
    expect(latestTabBar()).toMatchObject({ visible: true, selectedIndex: 0 })
    expect(render.adapter.getMountedComponentByPageId('page-1')).toBeDefined()

    // Tapping the active tab only fires onTabItemTap.
    const tapCount = tapEvents.length
    await todosPage.invokeMethod('tapCurrent')
    await tick()
    expect(todosEvents).toEqual(['load', 'show', 'hide', 'show'])
    expect(tapEvents.length).toBe(tapCount + 1)
    expect(tapEvents.at(-1)).toMatchObject({ page: TODOS_PATH, index: 0 })

    await todosPage.invokeMethod('openExtra')
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH, EXTRA_PATH])
    expect(latestTabBar()?.visible).toBe(false)
    const extraPage = service.activePage!
    await extraPage.invokeMethod('switchToBar')
    await tick()
    expect(extraEvents).toEqual(['unload'])
    expect(service.pageStack.map((page) => page.path)).toEqual([BAR_PATH])
    expect(latestTabBar()).toMatchObject({ visible: true, selectedIndex: 1 })
    expect(barEvents.filter((event) => event === 'load')).toHaveLength(1)

    await expect(barPage.invokeMethod('badNavigate')).rejects.toMatchObject({ code: 'HANDLER_ERROR' })
    const badSwitch = await barPage.invokeMethod('badSwitch') as { errMsg?: string }
    expect(badSwitch.errMsg ?? '').toContain('switchTab:fail')
    expect(service.pageStack.map((page) => page.path)).toEqual([BAR_PATH])

    await host.close()
  })
})
