import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { resolveRouteUrl } from '../src/service/route'
import { createServiceRouter } from '../src/service/router'
import { createTestHost } from './support/host'
import type { TestRuntimeHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread, lastLogicTree } from './helpers/split-service'
import type { ServiceThreadRuntime } from '../src/service/types'

const TODOS = 'pages/todos/todos'
const NEXT = 'pages/todos/next/next'
const TODO_DETAIL = 'pages/todos/detail/detail'
const CARD = 'components/card/card'
const CARD_DETAIL = 'components/card/detail/detail'

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

function page(path: string, usingComponents: Record<string, string> = {}): PageArtifact {
  return {
    path,
    bodyType: 'page',
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: { usingComponents },
    },
  }
}

function component(path: string): ComponentArtifact {
  return {
    path,
    bodyType: 'component',
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: { component: true },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [
      page(TODOS, { card: `/${CARD}` }),
      page(NEXT),
      page(TODO_DETAIL),
      page(CARD_DETAIL),
    ],
    components: [component(CARD)],
    styles: [],
    assets: [],
  }
}

function createTemplateRegistry() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(TODOS, [
    '<card id="card" />',
    '<view id="page-router" bindtap="pageRouterTap">r</view>',
    '<view id="wx-nav" bindtap="wxNavTap">w</view>',
  ].join(''))
  group.addTmpl(NEXT, '<view>next</view>')
  group.addTmpl(TODO_DETAIL, '<view>todo detail</view>')
  group.addTmpl(CARD, [
    '<view id="card-router" bindtap="componentRouterTap">c</view>',
    '<view id="card-page-router" bindtap="componentPageRouterTap">p</view>',
  ].join(''))
  group.addTmpl(CARD_DETAIL, '<view>card detail</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

type PageOptions = Record<string, unknown>
type ComponentOptions = Record<string, unknown>

type Harness = {
  host: TestRuntimeHost
  service: ServiceThreadRuntime
  dispatch(pageId: string, selector: string): Promise<void>
  back(): Promise<unknown>
}

/**
 * Boot one service thread. `Page()`/`Component()` registration is positional,
 * so the arrays must follow manifest order: TODOS, NEXT, TODO_DETAIL,
 * CARD_DETAIL and then CARD.
 */
async function boot(pages: PageOptions[], components: ComponentOptions[] = []): Promise<Harness> {
  const manifest = createManifest()
  const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
  const service = bootServiceThread({
    transport: serviceTransport,
    manifest,
    initialPath: TODOS,
  })
  const renderConnector = createHarnessRenderConnector({
    manifest,
    artifacts: { templates: createTemplateRegistry() },
    initialPath: TODOS,
  })
  const host = createTestHost({
    serviceTransport: hostServiceTransport,
    renderConnector,
    manifest,
    initialPath: TODOS,
  })
  const globalObject = globalThis as unknown as Record<string, unknown>
  ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
  for (const options of pages) {
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)(options)
  }
  for (const options of components) {
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)(options)
  }
  await host.bootstrap()
  const logic = () => lastLogicTree() as unknown as {
    query: (pageId: string, selector: string, all: boolean) => Array<{ viewId: string }>
  }
  return {
    host,
    service,
    async dispatch(pageId, selector) {
      const node = logic().query(pageId, selector, false)[0]
      expect(node, `node ${selector}`).toBeDefined()
      host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
        id: node!.viewId,
        name: 'tap',
        native: {},
      }, { pageId })
      await new Promise((resolve) => setTimeout(resolve, 20))
    },
    async back() {
      return host.apiRegistry.handlers['navigate.back']?.({ delta: 1 }, { pageId: service.activePage?.pageId })
    },
  }
}

describe('route resolution', () => {
  test('resolves relative urls against the base path', () => {
    expect(resolveRouteUrl('pages/todos/todos', './next/next?x=1'))
      .toBe('/pages/todos/next/next?x=1')
    expect(resolveRouteUrl('components/card/card', '../detail/detail'))
      .toBe('/components/detail/detail')
    expect(resolveRouteUrl('pages/todos/todos', '/abs/page')).toBe('/abs/page')
    // Protocol URLs are absolute and must not be rewritten.
    expect(resolveRouteUrl('pages/todos/todos', 'wx://inner-page')).toBe('wx://inner-page')
    expect(resolveRouteUrl('pages/todos/todos', 'plugin://p/page')).toBe('plugin://p/page')
  })

  test('router methods rewrite a copy of the caller params', () => {
    const calls: Array<Record<string, unknown>> = []
    const router = createServiceRouter(() => ({
      navigateTo: (params: unknown) => {
        calls.push(params as Record<string, unknown>)
        return (params as Record<string, unknown>).url
      },
      navigateBack: () => 'back',
    }), 'pages/a/a')
    expect(router.navigateTo({ url: './b?from=x' })).toBe('/pages/a/b?from=x')
    // No url: the params are forwarded untouched, exactly like `wx.navigateTo`.
    expect(router.navigateTo()).toBeUndefined()
    expect(router.navigateBack({ delta: 2 })).toBe('back')
    expect(calls[0]).toEqual({ url: '/pages/a/b?from=x' })
    expect(calls[1]).toEqual({})
  })
})

describe('page router', () => {
  test('resolves relative routes against the owning page and exposes route/options', async () => {
    const seen: string[] = []
    const harness = await boot([
      {
        onLoad(this: {
          route?: unknown
          __route__?: unknown
          options?: unknown
          router?: unknown
          pageRouter?: unknown
          getOpenerEventChannel(): { on?: unknown }
        }) {
          seen.push(`route:${String(this.route)}:${String(this.__route__)}`)
          seen.push(`options:${JSON.stringify(this.options)}`)
          seen.push(`same-router:${this.router === this.pageRouter}`)
          const channel = this.getOpenerEventChannel()
          seen.push(`entry-channel:${typeof channel}/${String(channel.on)}`)
        },
        routerNavigate(this: { router: { navigateTo(params: unknown): unknown } }) {
          return this.router.navigateTo({ url: './next/next?from=router' })
        },
        wxNavigate() {
          return wx.navigateTo({ url: './next/next?from=wx' })
        },
        pageRouterNavigate(this: { pageRouter: { navigateTo(params: unknown): unknown } }) {
          return this.pageRouter.navigateTo({ url: './detail/detail' })
        },
      },
      {},
      {},
      {},
    ])

    expect(seen).toEqual([
      'route:pages/todos/todos:pages/todos/todos',
      'options:{}',
      'same-router:true',
      // WeChat returns an empty object for a page that was not opened by
      // navigateTo; the launch page has no opener.
      'entry-channel:object/undefined',
    ])

    const todos = harness.service.activePage!
    await todos.invokeMethod('routerNavigate')
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS, NEXT])
    expect(harness.service.activePage?.query).toEqual({ from: 'router' })

    // `wx.navigateTo` resolves against the active page (now NEXT), so the same
    // relative URL points at a route that does not exist. The router keeps the
    // base of the page that owns it, which is exactly the documented difference.
    await expect(todos.invokeMethod('wxNavigate')).rejects.toMatchObject({
      code: 'HANDLER_ERROR',
    })
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS, NEXT])

    await todos.invokeMethod('pageRouterNavigate')
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([
      TODOS,
      NEXT,
      TODO_DETAIL,
    ])

    await harness.host.close()
  })
})

describe('component routers', () => {
  test('this.router uses the component path, this.pageRouter the page path', async () => {
    const facts: string[] = []
    const harness = await boot([{}, {}, {}, {}], [{
      methods: {
        componentRouterTap(this: { router: { navigateTo(params: unknown): unknown } }) {
          return this.router.navigateTo({ url: './detail/detail' })
        },
        componentPageRouterTap(this: { pageRouter: { navigateTo(params: unknown): unknown } }) {
          return this.pageRouter.navigateTo({ url: './detail/detail' })
        },
      },
      lifetimes: {
        ready(this: {
          route?: unknown
          router?: unknown
          pageRouter?: unknown
          getOpenerEventChannel(): unknown
        }) {
          facts.push(`route:${String(this.route)}`)
          facts.push(`channel:${String(this.getOpenerEventChannel())}`)
          facts.push(`different-routers:${this.router === this.pageRouter}`)
        },
      },
    }])

    expect(facts).toEqual([
      'route:undefined',
      'channel:undefined',
      'different-routers:false',
    ])

    const pageId = harness.service.activePage!.pageId
    await harness.dispatch(pageId, '#card-router')
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS, CARD_DETAIL])

    await harness.back()
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS])

    await harness.dispatch(pageId, '#card-page-router')
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS, TODO_DETAIL])

    await harness.host.close()
  })
})

describe('EventChannel', () => {
  test('connects the opener and the opened page in both directions', async () => {
    const log: string[] = []
    let openerChannel: Record<string, unknown> | undefined
    let successResult: Record<string, unknown> | undefined
    const harness = await boot([
      {
        openWithChannel() {
          return new Promise((resolve) => {
            wx.navigateTo({
              url: './next/next?from=channel',
              events: {
                pageLoaded(data: { step: number }) {
                  log.push(`events:pageLoaded:${data.step}`)
                },
              },
              success: (result: Record<string, unknown>) => {
                successResult = result
                log.push(`success:${String(result.errMsg)}`)
                openerChannel = result.eventChannel as Record<string, unknown>
                ;(openerChannel as unknown as {
                  emit(name: string, payload: unknown): void
                  once(name: string, handler: (payload: { late: boolean }) => void): void
                }).emit('fromOpener', { n: 1 })
                ;(openerChannel as unknown as {
                  once(name: string, handler: (payload: { late: boolean }) => void): void
                }).once('afterRegister', (data) => log.push(`opener:afterRegister:${data.late}`))
                resolve(result)
              },
              fail: (error: { errMsg: string }) => {
                log.push(`fail:${error.errMsg}`)
                resolve(error)
              },
              complete: () => log.push('complete'),
            })
          })
        },
      },
      {
        onLoad(this: {
          getOpenerEventChannel(): {
            on(name: string, handler: (payload: { n: number }) => void): void
            emit(name: string, payload: unknown): void
          }
        }) {
          const channel = this.getOpenerEventChannel()
          log.push(`page-load:${typeof channel.emit}/${typeof channel.on}`)
          channel.on('fromOpener', (data) => log.push(`page:fromOpener:${data.n}`))
          // Emitted before the opener receives the channel in its success
          // callback: the opener's cache replays it when it registers.
          channel.emit('pageLoaded', { step: 1 })
          channel.emit('afterRegister', { late: true })
        },
      },
      {},
      {},
    ])

    const todos = harness.service.activePage!
    await todos.invokeMethod('openWithChannel')

    expect(log).toEqual([
      'page-load:function/function',
      'events:pageLoaded:1',
      'success:navigateTo:ok',
      'page:fromOpener:1',
      'opener:afterRegister:true',
      'complete',
    ])
    expect(successResult).toMatchObject({ errMsg: 'navigateTo:ok', path: NEXT })
    expect(Object.keys(openerChannel ?? {}).sort()).toEqual(['emit', 'off', 'on', 'once'])
    expect(harness.service.pageStack.map((entry) => entry.path)).toEqual([TODOS, NEXT])

    await harness.host.close()
  })
})
