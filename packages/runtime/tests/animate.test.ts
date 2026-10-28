import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import type { RenderAnimationRequest, RenderClearAnimationRequest } from '../src/tree/protocol'
import { createHarnessRenderConnector } from './helpers/render-connector'
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

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view class="target" id="target">one</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path](name)
    },
  }
}

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

async function boot(options: {
  pageOptions: Record<string, unknown>
  plays: RenderAnimationRequest[]
  clears: RenderClearAnimationRequest[]
}) {
  const manifest = createManifest()
  const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
  const service = bootServiceThread({
    transport: serviceTransport,
    manifest,
    initialPath: PAGE_PATH,
  })
  const renderConnector = createHarnessRenderConnector({
    manifest,
    artifacts: { templates: createTemplates() },
    initialPath: PAGE_PATH,
    renderer: {
      playAnimation: (request) => options.plays.push(request),
      clearAnimation: (request) => options.clears.push(request),
    },
  })
  const host = createTinyRuntime({
    serviceTransport: hostServiceTransport,
    renderConnector,
    manifest,
    initialPath: PAGE_PATH,
  })
  const globalObject = globalThis as unknown as Record<string, unknown>
  ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
  ;(globalObject.Page as (options: Record<string, unknown>) => unknown)(options.pageOptions)
  await host.bootstrap()
  return { host, service }
}

describe('this.animate', () => {
  test('forwards normalized keyframes and calls back when the animation ends', async () => {
    const plays: RenderAnimationRequest[] = []
    const clears: RenderClearAnimationRequest[] = []
    const { host, service } = await boot({
      plays,
      clears,
      pageOptions: {
        data: { done: false },
        onReady(this: {
          animate: (
            selector: string,
            keyframes: unknown[],
            duration: number,
            callback: () => void,
          ) => boolean
          setData: (patch: Record<string, unknown>) => void
        }) {
          this.animate(
            '.target',
            [{ rotate: 45, scale: [1, 1.5], opacity: 0.5, offset: 0.5, ease: 'ease-in' }],
            20,
            () => this.setData({ done: true }),
          )
        },
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(plays).toHaveLength(1)
    expect(plays[0]?.keyframes[0]).toMatchObject({
      transform: 'scale(1, 1.5) rotate(45deg)',
      opacity: 0.5,
      offset: 0.5,
      easing: 'ease-in',
    })
    expect(plays[0]?.duration).toBe(20)
    expect(service.activePage?.data.done).toBe(true)
    await host.close()
  })

  test('reports a missing selector instead of throwing', async () => {
    const plays: RenderAnimationRequest[] = []
    const clears: RenderClearAnimationRequest[] = []
    const { host, service } = await boot({
      plays,
      clears,
      pageOptions: {
        data: { called: false },
        onReady(this: {
          animate: (selector: string, keyframes: unknown[], duration: number, callback: () => void) => boolean
          clearAnimate: (selector: string, options: Record<string, unknown>) => boolean
          setData: (patch: Record<string, unknown>) => void
        }) {
          this.animate('.missing', [{ opacity: 0.5 }], 10, () => this.setData({ called: true }))
          this.clearAnimate('.missing', { opacity: true })
        },
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(plays).toHaveLength(0)
    expect(service.activePage?.data.called).toBe(false)
    expect(clears).toHaveLength(0)
    const codes = (host.diagnostics ?? []).map((diagnostic) => diagnostic.code)
    expect(codes.filter((code) => code === 'ANIMATION_TARGET_MISSING')).toHaveLength(1)
    await host.close()
  })

  test('clearAnimate cancels the tracked render animation', async () => {
    const plays: RenderAnimationRequest[] = []
    const clears: RenderClearAnimationRequest[] = []
    const { host } = await boot({
      plays,
      clears,
      pageOptions: {
        data: { cleared: false },
        onReady(this: {
          animate: (selector: string, keyframes: unknown[], duration: number) => boolean
          clearAnimation: (
            selector: string,
            options: Record<string, unknown>,
            callback: () => void,
          ) => boolean
          setData: (patch: Record<string, unknown>) => void
        }) {
          this.animate('#target', [{ opacity: 0.5 }], 1000)
          this.clearAnimation('#target', { opacity: true }, () => this.setData({ cleared: true }))
        },
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(plays).toHaveLength(1)
    expect(clears).toHaveLength(1)
    expect(clears[0]?.properties).toEqual(['opacity'])
    await host.close()
  })
})
