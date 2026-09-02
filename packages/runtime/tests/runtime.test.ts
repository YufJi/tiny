import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'
import { bootServiceThread } from '../src/service'

const PAGE_PATH = 'pages/index/index'
const WXML =
  '<scroll-view class="page"><view wx:if="{{visible}}" class="card {{className}}" style="color: red" data-id="card"><block wx:for="{{items}}" wx:key="*this"><text>{{item}}</text></block><text class="message">{{message}}</text><image src="/logo.png" /></view></scroll-view>'
const WXSS = '.page { width: 100rpx; } .card { color: red; }'

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
  const group = TmplGroup.new()
  group.addTmpl(PAGE_PATH, WXML)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const group = groupList[path]
      if (!group) throw new Error(`template not found: ${path}`)
      return group(name)
    },
  }
}

function createManifest(): Manifest {
  const pageStyle = {
    path: `${PAGE_PATH}.wxss`,
    sourcePath: `${PAGE_PATH}.wxss`,
    outputPath: `styles/${PAGE_PATH}.wxss.css`,
    sourceMapPath: `styles/${PAGE_PATH}.wxss.css.map`,
    lowPriorityPath: `styles/${PAGE_PATH}.wxss.low.css`,
    lowPrioritySourceMapPath: `styles/${PAGE_PATH}.wxss.low.css.map`,
    scope: 'tiny-page',
  }
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: {
      path: PAGE_PATH,
      outputPath: 'templates.js',
      sourcePath: `${PAGE_PATH}.wxml`,
    },
    style: { ...pageStyle },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: {},
    },
  }
  return {
    schemaVersion: 1,
    entries: {
      service: 'service.js',
      render: 'render.js',
      templates: 'templates.js',
    },
    pages: [page],
    components: [],
    styles: [{ ...pageStyle }],
    assets: [],
  }
}

describe('tiny runtime', () => {
  test('installs mini-program globals and captures page definitions', () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    const pageOptions = { data: { message: 'static' } }
    ;(globalObject.Page as (options: typeof pageOptions) => unknown)(pageOptions)
    expect(service.registry.pages.get(PAGE_PATH)).toBe(pageOptions)
    expect((globalObject.wx as Record<string, () => unknown>).getSystemInfoSync()).toMatchObject({
      pixelRatio: expect.any(Number),
    })
    void hostServiceTransport
  })

  test('boots a static page across host, service, and render connections', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    const appEvents: string[] = []
    const pageEvents: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({
      onLaunch: () => appEvents.push('launch'),
      onShow: () => appEvents.push('show'),
      onHide: () => appEvents.push('hide'),
    })
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: {
        message: 'initial',
        visible: false,
        items: [] as string[],
        className: '',
      },
      onLoad() {
        pageEvents.push('load')
        this.setData({
          visible: true,
          message: 'loaded',
          items: ['one', 'two'],
          className: 'active',
        })
      },
      onShow() {
        pageEvents.push('show')
      },
      onReady() {
        pageEvents.push('ready')
      },
    })
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: PAGE_PATH,
      loadStyle: (path) => (path.endsWith('.css') ? WXSS : ''),
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: PAGE_PATH,
      initialData: { message: 'Hello glass-easel' },
    })

    await Promise.all([host.service.handshake(), host.render.handshake()])
    const result = await host.bootstrap()
    expect(result.service).toMatchObject({ status: 'ready', currentPath: PAGE_PATH })
    expect(result.render).toMatchObject({ status: 'ready', currentPath: PAGE_PATH })
    expect(appEvents).toEqual(['launch', 'show'])
    expect(pageEvents).toEqual(['load', 'show', 'ready'])
    expect(service.activePage?.lifecycleEvents).toEqual(['onLoad', 'onShow', 'onReady'])

    const component = render.adapter.getMountedComponent(PAGE_PATH)
    expect(component).toBeDefined()
    const rendered = glassEasel.dumpElementToString(component!, true)
    expect(rendered).toContain('scroll-view')
    expect(rendered).toContain('view')
    expect(rendered).toContain('loaded')
    expect(rendered).toContain('image')

    const componentBeforeUpdate = component
    service.activePage?.setData({
      message: 'updated',
      'meta.count': 2,
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(render.adapter.getMountedComponent(PAGE_PATH)).toBe(componentBeforeUpdate)
    expect(componentBeforeUpdate?.data.message).toBe('updated')
    expect(componentBeforeUpdate?.data.meta).toEqual({ count: 2 })
    expect(glassEasel.dumpElementToString(componentBeforeUpdate!, true)).toContain('updated')

    await host.close()
    void service
  })
})
