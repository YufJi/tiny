import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'
import { bootServiceThread } from '../src/service'

const TODOS_PATH = 'pages/todos/todos'
const ADD_TODO_PATH = 'pages/add-todo/add-todo'

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
  const group = TmplGroup.newDev()
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
    schemaVersion: 1,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
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
        onLoad(query: Record<string, string>) {
          addTodoEvents.push(`load:${query.from}`)
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
      methods: {
        async back() {
          await wx.navigateBack()
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
    expect(render.adapter.getMountedComponentByPageId('page-1')).toBeUndefined()

    await service.activePage?.invokeMethod('back')
    expect(service.pageStack.map((page) => page.path)).toEqual([TODOS_PATH])
    expect(service.activePage?.data.marker).toBe('kept')
    expect(todosEvents).toEqual(['load', 'show', 'hide', 'show'])
    expect(addTodoEvents).toEqual(['load:todos', 'attached', 'ready', 'detached'])
    expect(addTodoPageEvents).toEqual(['show', 'hide'])
    expect(render.adapter.getMountedComponentByPageId('page-1')).toBeDefined()
    expect(render.adapter.getMountedComponentByPageId('page-2')).toBeUndefined()

    await expect(service.activePage?.invokeMethod('invalidNavigate')).rejects.toMatchObject({
      code: 'HANDLER_ERROR',
    })

    await host.close()
  })
})
