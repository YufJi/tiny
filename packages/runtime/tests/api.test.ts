import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { createInMemoryTransportPair } from '@tiny/bridge'
import type { Manifest } from '@tiny/compiler-next'
import { bootServiceThread } from '../src/service'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'

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

function createManifest(): Manifest {
  return {
    schemaVersion: 1,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [{
      path: PAGE_PATH,
      template: {
        path: PAGE_PATH,
        outputPath: 'templates.js',
        sourcePath: `${PAGE_PATH}.wxml`,
      },
      configuration: { path: PAGE_PATH, sourcePath: `${PAGE_PATH}.json`, effective: {} },
    }],
    components: [],
    styles: [],
    assets: [],
  }
}

function createTemplateRegistry() {
  const group = TmplGroup.newDev()
  group.addTmpl(PAGE_PATH, '<text>{{token}}</text>')
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

describe('P0 platform APIs', () => {
  test('uses host snapshots for sync reads and authoritative storage writes', async () => {
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest: createManifest(),
      initialPath: PAGE_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest: createManifest(),
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: PAGE_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest: createManifest(),
      initialPath: PAGE_PATH,
      systemInfo: { pixelRatio: 3, windowWidth: 390, windowHeight: 844 },
      storage: { token: 'initial' },
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { token: '', system: {} },
      onLoad() {
        this.setData({
          token: wx.getStorageSync('token'),
          system: wx.getSystemInfoSync(),
        })
        wx.setStorageSync('token', 'updated')
      },
    })

    await host.bootstrap()
    expect(service.activePage?.data.token).toBe('initial')
    expect(service.activePage?.data.system).toEqual({
      pixelRatio: 3,
      windowWidth: 390,
      windowHeight: 844,
    })
    expect(wx.getStorageSync('token')).toBe('updated')
    expect(host.apiRegistry.storage.token).toBe('updated')
    await host.close()
  })

  test('routes toast and navigation calls to host handlers', async () => {
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest: createManifest(),
      initialPath: PAGE_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest: createManifest(),
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: PAGE_PATH,
    })
    const navigationCalls: Array<Record<string, unknown>> = []
    const toastCalls: Array<Record<string, unknown>> = []
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest: createManifest(),
      initialPath: PAGE_PATH,
      apiHandlers: {
        'navigate.to': (params, context) => {
          navigationCalls.push({ ...params, pageId: context.pageId })
          return { errMsg: 'navigateTo:ok' }
        },
        'toast.show': (params, context) => {
          toastCalls.push({ ...params, pageId: context.pageId })
          return { errMsg: 'showToast:ok' }
        },
      },
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      methods: {
        async navigate() {
          await wx.navigateTo({ url: '/pages/next/next' })
        },
        async showToast() {
          await wx.showToast({ title: 'done' })
        },
      },
    })

    await host.bootstrap()
    await service.activePage?.invokeMethod('navigate')
    await service.activePage?.invokeMethod('showToast')
    expect(navigationCalls).toEqual([{ url: '/pages/next/next', pageId: 'page-1' }])
    expect(toastCalls).toEqual([{ title: 'done', pageId: 'page-1' }])
    await host.close()
  })
})
