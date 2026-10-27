import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness as bootRenderThread } from './helpers/split-tree-harness'
import { bootServiceThread } from './helpers/split-service'

const HOME_PATH = 'pages/index/index'
const FORM_PATH = 'pages/form/form'
const CHILD_PATH = 'components/child/child'

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
  group.addTmpl(HOME_PATH, '<view>home</view>')
  group.addTmpl(FORM_PATH, '<view>{{paramA}}/{{paramB}}/{{loadValue}}/{{observed}}/{{fromBehavior}}</view><child id="child" />')
  group.addTmpl(CHILD_PATH, '<view>child</view>')
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

function artifact(path: string, bodyType: 'page' | 'component', using?: Record<string, string>): PageArtifact {
  return {
    path,
    bodyType,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: using ? { usingComponents: using } : {},
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [
      artifact(HOME_PATH, 'page'),
      artifact(FORM_PATH, 'component', { child: `/${CHILD_PATH}` }),
    ],
    components: [artifact(CHILD_PATH, 'component')],
    styles: [],
    assets: [],
  }
}

describe('Component-as-page', () => {
  test('supports properties from query, methods lifecycles, behaviors, observers and relations', async () => {
    const manifest = createManifest()
    const [hostServiceTransport, serviceTransport] = createInMemoryTransportPair()
    const [hostRenderTransport, renderTransport] = createInMemoryTransportPair()
    const service = bootServiceThread({
      transport: serviceTransport,
      manifest,
      initialPath: HOME_PATH,
    })
    const render = bootRenderThread({
      transport: renderTransport,
      manifest,
      artifacts: { templates: createTemplateRegistry() },
      initialPath: HOME_PATH,
    })
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderTransport: hostRenderTransport,
      manifest,
      initialPath: HOME_PATH,
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    const lifecycle: string[] = []
    const pageLifetimes: string[] = []
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      async open() {
        await wx.navigateTo({ url: '/pages/form/form?paramA=123&paramB=xyz' })
      },
    })

    const behavior = (globalObject.Behavior as (options: Record<string, unknown>) => unknown)({
      data: { fromBehavior: 'B' },
      lifetimes: {
        created() {
          lifecycle.push('behavior-created')
        },
        attached() {
          lifecycle.push('behavior-attached')
          this.setData({ behaviorAttached: true })
        },
        detached() {
          lifecycle.push('behavior-detached')
        },
      },
      methods: {
        behaviorMethod() {
          return 'behavior-method'
        },
      },
      observers: {
        paramA(value: number) {
          this.setData({ behaviorObserved: `b:${value}` })
        },
      },
      pageLifetimes: {
        show() {
          pageLifetimes.push('behavior-show')
        },
        hide() {
          pageLifetimes.push('behavior-hide')
        },
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      behaviors: [behavior],
      properties: {
        paramA: Number,
        paramB: String,
      },
      methods: {
        onLoad(query: Record<string, string>) {
          lifecycle.push('onLoad')
          this.setData({ loadValue: query.paramB })
        },
        onShow() {
          lifecycle.push('onShow')
        },
        onReady() {
          lifecycle.push('onReady')
          this.setData({
            selectedInReady: Boolean(this.selectComponent('#child')),
            relationInReady: this.getRelationNodes('/components/child/child').length,
          })
        },
        onHide() {
          lifecycle.push('onHide')
        },
        onUnload() {
          lifecycle.push('onUnload')
        },
        customMethod() {
          return 'custom'
        },
      },
      observers: {
        'paramA, paramB'(paramA: number, paramB: string) {
          this.setData({ observed: `${paramA}:${paramB}` })
        },
      },
      pageLifetimes: {
        show() {
          pageLifetimes.push('show')
        },
        hide() {
          pageLifetimes.push('hide')
        },
      },
      relations: {
        '/components/child/child': {
          type: 'child',
          linked(target: { componentId: string }) {
            this.setData({ linked: true, linkedId: target.componentId })
          },
          unlinked() {
            this.setData({ linked: false })
          },
        },
      },
      options: { styleIsolation: 'shared' },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      options: { addGlobalClass: true },
      relations: {
        '/pages/form/form': {
          type: 'parent',
          linked() {
            this.setData({ linked: true })
          },
        },
      },
    })

    const bootstrapped = await host.bootstrap()
    const componentPageOptions = (bootstrapped.service.pageComponents as Array<{
      path: string
      options?: Record<string, unknown>
    }>).find((item) => item.path === FORM_PATH)?.options
    expect(componentPageOptions).toMatchObject({
      styleIsolation: 'shared',
      explicitStyleIsolation: true,
    })
    await service.activePage?.invokeMethod('open')
    await new Promise((resolve) => setTimeout(resolve, 20))
    const page = service.activePage!
    expect(page.path).toBe(FORM_PATH)
    expect(page.data).toMatchObject({
      paramA: 123,
      paramB: 'xyz',
      loadValue: 'xyz',
      observed: '123:xyz',
      fromBehavior: 'B',
      behaviorAttached: true,
      behaviorObserved: 'b:123',
      selectedInReady: true,
      relationInReady: 1,
    })
    expect(page.properties).toMatchObject({ paramA: 123, paramB: 'xyz' })
    expect(page.hasBehavior(behavior)).toBe(true)
    expect(page.invokeMethod('customMethod')).toBe('custom')
    expect(page.invokeMethod('behaviorMethod')).toBe('behavior-method')
    expect(page.selectComponent('#child')).toBeTruthy()
    const child = (render.adapter.getComponentSnapshot() as Array<{ componentId: string; path: string }>)
      .find((item) => item.path === CHILD_PATH)!
    const childRender = render.adapter.getMountedComponentByComponentId(child.componentId)!
    expect(childRender.getComponentOptions().extraStyleScope).toBeGreaterThan(0)
    expect(() => page.triggerEvent('page-event')).not.toThrow()
    expect(lifecycle).toEqual(expect.arrayContaining([
      'behavior-created',
      'behavior-attached',
      'onLoad',
      'onShow',
      'onReady',
    ]))
    expect(pageLifetimes).toEqual(expect.arrayContaining(['show', 'behavior-show']))
    const mounted = render.adapter.getMountedComponentByPageId(page.pageId)
    expect(mounted).toBeDefined()
    expect(glassEasel.dumpElementToString(mounted!, true)).toContain('123/xyz')

    page.setData({ paramA: 5 })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(page.data.observed).toBe('5:xyz')
    expect(page.data.behaviorObserved).toBe('b:5')

    await host.service.control('page', 'hide', { pageId: page.pageId })
    await host.service.control('page', 'show', { pageId: page.pageId })
    expect(lifecycle).toEqual(expect.arrayContaining(['onHide', 'onShow']))
    expect(pageLifetimes).toEqual(expect.arrayContaining(['show', 'hide', 'behavior-hide']))

    await host.service.control('page', 'navigateBack', { delta: 1 })
    expect(lifecycle).toEqual(expect.arrayContaining(['onUnload', 'behavior-detached']))
    expect(page.getRelationNodes('/components/child/child')).toHaveLength(0)

    await host.close()
  })
})
