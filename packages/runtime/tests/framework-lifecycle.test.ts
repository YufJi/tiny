import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { PAGE_CONTROL, RUNTIME_CONTROL, TREE_PROTOCOL } from '../src/tree-protocol/protocol'
import { createTestHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread, lastLogicTree } from './helpers/split-service'

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
  const page: PageArtifact = {
    path: PAGE_PATH,
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

function createTemplateRegistry() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view id="boom" bindtap="boom">{{draft}}</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

describe('page and app lifecycle hooks', () => {
  test('delivers pull-down, share, save-exit-state, theme and app error hooks', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const renderConnector = createHarnessRenderConnector({
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: PAGE_PATH,
    })
    const host = createTestHost({
      serviceTransport: hostServiceTransport,
      renderConnector,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const appEvents: string[] = []
    const shareCalls: Array<Record<string, unknown>> = []
    const themeCalls: string[] = []
    const networkCalls: Array<Record<string, unknown>> = []
    const notFoundCalls: Array<Record<string, unknown>> = []
    const resizeCalls: Array<Record<string, unknown>> = []
    const errorCalls: Array<Record<string, unknown>> = []
    const rejectionCalls: Array<Record<string, unknown>> = []
    const appShowCalls: unknown[] = []
    const appHideCalls: unknown[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({
      onShow() {
        appEvents.push('show')
      },
      onHide() {
        appEvents.push('hide')
      },
      onError(message: string) {
        appEvents.push(`error:${message}`)
      },
      onPageNotFound(info: { path: string }) {
        appEvents.push(`not-found:${info.path}`)
      },
      onUnhandledRejection(info: { reason: unknown }) {
        appEvents.push(`rejection:${(info.reason as Error).message}`)
      },
      onThemeChange(info: { theme: string }) {
        appEvents.push(`theme:${info.theme}`)
      },
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { draft: 'draft' },
      onLoad() {
        wx.onThemeChange((info: { theme: string }) => themeCalls.push(info.theme))
        wx.onNetworkStatusChange((info: Record<string, unknown>) => networkCalls.push(info))
        wx.onPageNotFound((info: Record<string, unknown>) => notFoundCalls.push(info))
        wx.onWindowResize((info: Record<string, unknown>) => resizeCalls.push(info))
        wx.onError((info: Record<string, unknown>) => errorCalls.push(info))
        wx.onUnhandledRejection((info: Record<string, unknown>) => rejectionCalls.push(info))
        wx.onAppShow((info: unknown) => appShowCalls.push(info))
        wx.onAppHide((info: unknown) => appHideCalls.push(info))
      },
      onPullDownRefresh() {
        appEvents.push('pulled')
      },
      onShareAppMessage(options: { from: string }) {
        shareCalls.push({ type: 'appMessage', from: options.from })
        return { title: 'share-title', path: '/pages/index/index?from=share' }
      },
      onShareTimeline() {
        shareCalls.push({ type: 'timeline' })
        return { title: 'timeline-title', query: 'from=timeline' }
      },
      onAddToFavorites(options: { webViewUrl?: string }) {
        shareCalls.push({ type: 'favorites', webViewUrl: options.webViewUrl })
        return { title: 'favorite-title' }
      },
      onSaveExitState() {
        appEvents.push('save-exit-state')
        return { data: { draft: this.data.draft } }
      },
      async refresh() {
        await wx.startPullDownRefresh()
      },
      async missing() {
        await wx.navigateTo({ url: '/pages/missing/missing' })
      },
      boom() {
        throw new Error('boom')
      },
    })

    await host.bootstrap()
    const page = service.activePage!
    await page.invokeMethod('refresh')
    expect(appEvents).toContain('pulled')

    await host.pullDownRefresh(page.pageId)
    expect(appEvents.filter((event) => event === 'pulled')).toHaveLength(2)

    await expect(host.share(page.pageId, 'appMessage')).resolves.toMatchObject({
      status: 'shared',
      type: 'appMessage',
      handled: true,
      share: { title: 'share-title', path: '/pages/index/index?from=share' },
    })
    await expect(host.share(page.pageId, 'timeline')).resolves.toMatchObject({
      share: { title: 'timeline-title', query: 'from=timeline' },
    })
    await expect(host.share(page.pageId, 'favorites')).resolves.toMatchObject({
      share: { title: 'favorite-title' },
    })
    expect(shareCalls).toEqual([
      { type: 'appMessage', from: 'menu' },
      { type: 'timeline' },
      { type: 'favorites', webViewUrl: undefined },
    ])

    await host.service.control(PAGE_CONTROL.domain, PAGE_CONTROL.hide, {}, { pageId: page.pageId })
    host.setAppVisible(false)
    host.service.sendEvent('event', 'global', { name: 'appHide' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(appEvents).toContain('hide')
    expect(appHideCalls).toHaveLength(1)
    host.service.sendEvent('event', 'global', { name: 'appShow', payload: { scene: 1001 } })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(appEvents).toContain('show')
    expect(appShowCalls).toEqual([{ scene: 1001 }])
    expect(appEvents).toContain('save-exit-state')
    await expect(host.saveExitState(page.pageId)).resolves.toMatchObject({
      status: 'saved',
      state: { data: { draft: 'draft' } },
    })

    await expect(host.setTheme('dark', page.pageId)).resolves.toMatchObject({
      status: 'theme-changed',
      theme: 'dark',
    })
    expect(themeCalls).toEqual(['dark'])
    expect(appEvents).toContain('theme:dark')

    host.service.sendEvent('event', 'global', {
      name: 'networkStatusChange',
      payload: { isConnected: false, networkType: 'none' },
    })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(networkCalls).toEqual([{ isConnected: false, networkType: 'none' }])

    await host.service.control(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.resize, { windowWidth: 400, windowHeight: 300 }, { pageId: page.pageId })
    expect(resizeCalls).toEqual([{ size: { windowWidth: 400, windowHeight: 300 } }])

    await expect(page.invokeMethod('missing')).rejects.toMatchObject({ code: 'HANDLER_ERROR' })
    expect(appEvents).toContain('not-found:pages/missing/missing')
    expect(notFoundCalls).toContainEqual({
      path: 'pages/missing/missing',
      query: {},
      isEntryPage: false,
    })

    const logic = lastLogicTree() as { query: (pageId: string, selector: string, all: boolean) => Array<{ viewId: string }> }
    const boomNode = logic.query('page-1', '#boom', false)[0]
    expect(boomNode).toBeDefined()
    host.service.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.event, {
      id: boomNode!.viewId,
      name: 'tap',
    }, { pageId: page.pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(appEvents.some((event) => event.startsWith('error:boom'))).toBe(true)
    expect(errorCalls.some((info) => String(info.message).includes('boom'))).toBe(true)

    service.notifyUnhandledRejection(new Error('rejected'), Promise.resolve())
    expect(appEvents).toContain('rejection:rejected')
    expect(rejectionCalls.some((info) => (info.reason as Error).message === 'rejected')).toBe(true)
    await host.close()
  })
})
