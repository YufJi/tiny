import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'
import { bootServiceThread } from '../src/service'

const PAGE_PATH = 'pages/index/index'
const COMPONENT_PATH = 'components/badge/badge'
const PAGE_WXML =
  '<view class="page"><badge id="badge" text="{{badgeText}}" bindchange="onBadgeChange">slot content</badge><text class="detail">{{badgeDetail}}</text></view>'
const BADGE_WXML = '<view class="badge"><text>{{text}}:{{count}}</text><slot /></view>'

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
  group.addTmpl(PAGE_PATH, PAGE_WXML)
  group.addTmpl(COMPONENT_PATH, BADGE_WXML)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const componentGroup = groupList[path]
      if (!componentGroup) throw new Error(`template not found: ${path}`)
      return componentGroup(name)
    },
  }
}

function createComponentManifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: {
      path: PAGE_PATH,
      outputPath: 'templates.js',
      sourcePath: `${PAGE_PATH}.wxml`,
    },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: {
        usingComponents: {
          badge: './components/badge/badge',
        },
      },
      usingComponentsSource: {
        badge: 'global',
      },
    },
  }
  return {
    schemaVersion: 1,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [page],
    components: [{
      path: COMPONENT_PATH,
      template: {
        path: COMPONENT_PATH,
        outputPath: 'templates.js',
        sourcePath: `${COMPONENT_PATH}.wxml`,
      },
      configuration: {
        path: COMPONENT_PATH,
        sourcePath: `${COMPONENT_PATH}.json`,
        effective: { component: true },
      },
    }],
    styles: [],
    assets: [],
  }
}

describe('mini-program custom components', () => {
  test('supports properties, slots, lifetimes, and custom events', async () => {
    const manifest = createComponentManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: PAGE_PATH,
    })
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      backend: new glassEasel.EmptyBackendContext(),
      initialPath: PAGE_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: PAGE_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const componentEvents: string[] = []
    const pageLifetimeEvents: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { badgeText: 'badge', badgeDetail: '' },
      onBadgeChange(event: { detail: { count: number } }) {
        this.setData({ badgeDetail: `changed:${event.detail.count}` })
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      properties: {
        text: {
          type: String,
          value: 'default',
        },
      },
      data: { count: 0 },
      lifetimes: {
        created: () => componentEvents.push('created'),
        attached: () => componentEvents.push('attached'),
        ready: () => componentEvents.push('ready'),
        detached: () => componentEvents.push('detached'),
      },
      pageLifetimes: {
        show: () => pageLifetimeEvents.push('show'),
        hide: () => pageLifetimeEvents.push('hide'),
      },
      methods: {
        increment() {
          const nextCount = (this.data.count as number) + 1
          this.setData({ count: nextCount })
          this.triggerEvent('change', { count: nextCount }, { bubbles: true })
        },
      },
    })

    const result = await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.service.componentSchemas).toHaveLength(1)
    expect(result.service.componentSchemas[0]).toMatchObject({
      componentId: 'component-1',
      path: COMPONENT_PATH,
      properties: { text: { type: 'string', value: 'default' } },
    })

    const badge = service.componentInstances.get(COMPONENT_PATH)
    expect(badge).toBeDefined()
    const renderBadge = render.adapter.getMountedComponentByComponentId('component-1')
    expect(renderBadge).toBeDefined()
    const rendered = glassEasel.dumpElementToString(renderBadge!, true)
    expect(rendered).toContain('badge:0')
    expect(rendered).toContain('slot content')

    badge?.invokeMethod('increment')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(badge?.data).toMatchObject({ count: 1 })
    expect(renderBadge?.data.count).toBe(1)
    expect(renderBadge?.data.text).toBe('badge')
    expect(glassEasel.dumpElementToString(renderBadge!, true)).toContain('badge:1')
    expect(glassEasel.dumpElementToString(renderBadge!, true)).toContain('slot content')
    expect(componentEvents).toEqual(expect.arrayContaining(['created', 'attached', 'ready']))

    await host.service.control('page', 'hide', { pageId: result.service.pageId })
    await host.service.control('page', 'show', { pageId: result.service.pageId })
    expect(pageLifetimeEvents).toEqual(['hide', 'show'])

    await host.close()
  })
})
