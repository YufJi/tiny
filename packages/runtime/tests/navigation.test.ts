import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact, type StyleArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness as bootRenderThread } from './helpers/split-tree-harness'
import { bootServiceThread } from './helpers/split-service'

const TODOS_PATH = 'pages/todos/todos'
const ADD_TODO_PATH = 'pages/add-todo/add-todo'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originalGlobals = new Map<string, unknown>()
for (const key of globalKeys) {
  originalGlobals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
}

class RecordingBackend extends glassEasel.EmptyBackendContext {
  readonly styleSheetPaths: Array<{ path: string; scope?: number }> = []

  appendStyleSheetPath(path: string, styleScope?: number): number {
    this.styleSheetPaths.push({ path, scope: styleScope })
    return super.appendStyleSheetPath(path, styleScope)
  }
}

afterAll(() => {
  for (const [key, value] of originalGlobals) {
    (globalThis as unknown as Record<string, unknown>)[key] = value
  }
})

function createTemplateRegistry() {
  const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
  group.addTmpl(TODOS_PATH, '<view>{{marker}}</view>')
  group.addTmpl(ADD_TODO_PATH, '<view>{{from}}</view>')
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

function createNavigationManifest(): Manifest {
  const todos: PageArtifact = {
    path: TODOS_PATH,
    bodyType: 'page',
    template: { path: TODOS_PATH, outputPath: 'templates.js', sourcePath: `${TODOS_PATH}.wxml` },
    configuration: { path: TODOS_PATH, sourcePath: `${TODOS_PATH}.json`, effective: {} },
  }
  const addTodo: PageArtifact = {
    path: ADD_TODO_PATH,
    bodyType: 'component',
    template: { path: ADD_TODO_PATH, outputPath: 'templates.js', sourcePath: `${ADD_TODO_PATH}.wxml` },
    configuration: { path: ADD_TODO_PATH, sourcePath: `${ADD_TODO_PATH}.json`, effective: {} },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [todos, addTodo],
    components: [],
    styles: [],
    assets: [],
  }
}

describe('mini-program navigation', () => {
  test('pushes component-as-page, preserves state, and navigates back', async () => {
    const manifest = createNavigationManifest()
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
    const addTodoEvents: string[] = []
    const addTodoPageEvents: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { marker: '' },
      onLoad() {
        todosEvents.push('load')
        this.setData({ marker: 'kept' })
      },
      onShow() {
        todosEvents.push('show')
      },
      onHide() {
        todosEvents.push('hide')
      },
      onUnload() {
        todosEvents.push('unload')
      },
      async navigate() {
        await wx.navigateTo({ url: '../add-todo/add-todo?from=todos' })
      },
      async invalidNavigate() {
        await wx.navigateTo({ url: '/pages/missing/missing' })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      methods: {
        onLoad(query: Record<string, string>) {
          addTodoEvents.push(`load:${query.from}`)
        },
        onHide() {
          addTodoEvents.push('hide')
        },
        async back() {
          await wx.navigateBack()
        },
      },
      lifetimes: {
        attached() {
          addTodoEvents.push('attached')
        },
        ready() {
          addTodoEvents.push('ready')
        },
        detached() {
          addTodoEvents.push('detached')
        },
      },
      pageLifetimes: {
        show() {
          addTodoPageEvents.push('show')
        },
        hide() {
          addTodoPageEvents.push('hide')
        },
      },
    })

    await host.bootstrap()
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    service.activePage?.setData({ marker: 'kept' })
    await service.activePage?.invokeMethod('navigate')

    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH, ADD_TODO_PATH])
    expect(service.activePage?.query).toEqual({ from: 'todos' })
    expect(addTodoEvents).toEqual(['load:todos', 'attached', 'ready'])
    expect(todosEvents).toEqual(['load', 'show', 'hide'])
    expect(addTodoPageEvents).toEqual(['show'])
    expect(render.adapter.getMountedComponentByPageId('page-2')).toBeDefined()

    await service.activePage?.invokeMethod('back')
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(service.activePage?.data.marker).toBe('kept')
    expect(todosEvents).toEqual(['load', 'show', 'hide', 'show'])
    expect(addTodoEvents).toEqual(['load:todos', 'attached', 'ready', 'detached'])
    expect(addTodoPageEvents).toEqual(['show', 'hide'])
    expect(render.adapter.getMountedComponentByPageId('page-1')).toBeDefined()

    const lifecycleBeforeInvalidNavigation = [...service.activePage!.lifecycleEvents]
    await expect(service.activePage?.invokeMethod('invalidNavigate')).rejects.toMatchObject({
      code: 'HANDLER_ERROR',
    })
    // A failed navigation must not hide the page that is still on screen.
    expect(service.activePage?.lifecycleEvents).toEqual(lifecycleBeforeInvalidNavigation)

    await host.close()
  })

  test('delivers page scroll, reach-bottom, and resize lifecycles', async () => {
    const manifest = createNavigationManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: TODOS_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: TODOS_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: TODOS_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const lifecycles: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onPageScroll(event: { scrollTop: number }) {
        lifecycles.push(`scroll:${event.scrollTop}`)
      },
      onReachBottom() {
        lifecycles.push('reach-bottom')
      },
      onResize(event: { size: { windowWidth: number; windowHeight: number } }) {
        lifecycles.push(`resize:${event.size.windowWidth}x${event.size.windowHeight}`)
      },
      systemInfo() {
        return wx.getSystemInfoSync()
      },
    })

    await host.bootstrap()
    host.service.sendEvent('page', 'scroll', { scrollTop: 32 }, { pageId: 'page-1' })
    host.service.sendEvent('page', 'reachBottom', { scrollTop: 900 }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(lifecycles).toEqual(['scroll:32', 'reach-bottom'])

    await host.setWindowSize(320, 640)
    expect(lifecycles).toContain('resize:320x640')
    expect(service.activePage?.invokeMethod('systemInfo')).toMatchObject({
      windowWidth: 320,
      windowHeight: 640,
    })

    await host.close()
  })

  test('redirectTo replaces the current page instead of growing the stack', async () => {
    const manifest = createNavigationManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: TODOS_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: TODOS_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: TODOS_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const lifecycles: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onLoad() {
        lifecycles.push('load:todos')
      },
      onShow() {
        lifecycles.push('show:todos')
      },
      onUnload() {
        lifecycles.push('unload:todos')
      },
      async redirect() {
        await wx.redirectTo({ url: '../add-todo/add-todo?from=redirect' })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      methods: {
        onLoad(query: Record<string, string>) {
          lifecycles.push(`load:${query.from}`)
        },
        onShow() {
          lifecycles.push('show:add')
        },
        onUnload() {
          lifecycles.push('unload:add')
        },
      },
    })

    await host.bootstrap()
    const firstPageId = service.activePage!.pageId
    await service.activePage!.invokeMethod('redirect')

    expect(service.pageStack.map((page) => page.path)).toEqual([ADD_TODO_PATH])
    expect(service.activePage?.pageId).not.toBe(firstPageId)
    expect(service.activePage?.query).toEqual({ from: 'redirect' })
    expect(lifecycles).toEqual([
      'load:todos',
      'show:todos',
      'unload:todos',
      'load:redirect',
      'show:add',
    ])
    await host.close()
  })

  test('reLaunch clears every page, including hidden tab pages', async () => {
    const manifest = createNavigationManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: TODOS_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: TODOS_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: TODOS_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const lifecycles: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onLoad() {
        lifecycles.push('load:todos')
      },
      onUnload() {
        lifecycles.push('unload:todos')
      },
      async navigate() {
        await wx.navigateTo({ url: '../add-todo/add-todo' })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      methods: {
        onLoad() {
          lifecycles.push('load:add')
        },
        onUnload() {
          lifecycles.push('unload:add')
        },
        async relaunchHome() {
          await wx.reLaunch({ url: '/pages/todos/todos?from=relaunch' })
        },
      },
    })

    await host.bootstrap()
    await service.activePage!.invokeMethod('navigate')
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH, ADD_TODO_PATH])

    await service.activePage!.invokeMethod('relaunchHome')
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(service.activePage?.query).toEqual({ from: 'relaunch' })
    expect(lifecycles).toEqual([
      'load:todos',
      'load:add',
      'unload:add',
      'unload:todos',
      'load:todos',
    ])
    await host.close()
  })

  test('enforces the host-configured page stack limit', async () => {
    const manifest = createNavigationManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: TODOS_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: TODOS_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: TODOS_PATH,
      maxPageStack: 1,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const lifecycles: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      onHide() {
        lifecycles.push('hide')
      },
      async navigate() {
        await wx.navigateTo({ url: '../add-todo/add-todo' })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({})

    await host.bootstrap()
    await expect(service.activePage?.invokeMethod('navigate')).rejects.toMatchObject({
      code: 'HANDLER_ERROR',
    })
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(lifecycles).toEqual([])
    const state = host.diagnostics.filter((item) => item.code === 'RUNTIME_STATE').at(-1)
    expect(state?.details).toMatchObject({ maxPageStack: 1 })

    await host.close()
  })
})
