import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness as bootRenderThread } from './helpers/split-tree-harness'
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

function createTemplateRegistry() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view>{{draft}}</view>')
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
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: PAGE_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const appEvents: string[] = []
    const shareCalls: Array<Record<string, unknown>> = []
    const themeCalls: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({
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

    await host.pullDownRefresh()
    expect(appEvents.filter((event) => event === 'pulled')).toHaveLength(2)

    await expect(host.share('appMessage')).resolves.toMatchObject({
      status: 'shared',
      type: 'appMessage',
      handled: true,
      share: { title: 'share-title', path: '/pages/index/index?from=share' },
    })
    await expect(host.share('timeline')).resolves.toMatchObject({
      share: { title: 'timeline-title', query: 'from=timeline' },
    })
    await expect(host.share('favorites')).resolves.toMatchObject({
      share: { title: 'favorite-title' },
    })
    expect(shareCalls).toEqual([
      { type: 'appMessage', from: 'menu' },
      { type: 'timeline' },
      { type: 'favorites', webViewUrl: undefined },
    ])

    await host.service.control('page', 'hide', {}, { pageId: page.pageId })
    host.setAppVisible(false)
    expect(appEvents).toContain('save-exit-state')
    await expect(host.saveExitState()).resolves.toMatchObject({
      status: 'saved',
      state: { data: { draft: 'draft' } },
    })

    await expect(host.setTheme('dark')).resolves.toMatchObject({
      status: 'theme-changed',
      theme: 'dark',
    })
    expect(themeCalls).toEqual(['dark'])
    expect(appEvents).toContain('theme:dark')

    await expect(page.invokeMethod('missing')).rejects.toMatchObject({ code: 'HANDLER_ERROR' })
    expect(appEvents).toContain('not-found:pages/missing/missing')

    host.service.sendEvent('event', 'dispatch', { handler: 'boom' }, { pageId: page.pageId })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(appEvents.some((event) => event.startsWith('error:boom'))).toBe(true)

    service.notifyUnhandledRejection(new Error('rejected'), Promise.resolve())
    expect(appEvents).toContain('rejection:rejected')
    await host.close()
  })
})
