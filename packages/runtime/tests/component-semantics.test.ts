import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootSplitTreeHarness as bootRenderThread } from './helpers/split-tree-harness'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'
const COMPONENT_PATH = 'components/semantic/semantic'
const PAGE_WXML = '<view><semantic id="semantic" value="{{value}}" /></view>'
const COMPONENT_WXML = '<view><text>{{derived}}</text><text>{{propertyObserved}}</text></view>'

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
  group.addTmpl(PAGE_PATH, PAGE_WXML)
  group.addTmpl(COMPONENT_PATH, COMPONENT_WXML)
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

function artifact(path: string, using?: Record<string, string>): PageArtifact {
  return {
    path,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: using ? { usingComponents: using } : { component: true },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [artifact(PAGE_PATH, { semantic: `/${COMPONENT_PATH}` })],
    components: [artifact(COMPONENT_PATH)],
    styles: [],
    assets: [],
  }
}

describe('component semantics', () => {
  test('merges behaviors, runs observers and property observers, and supports hasBehavior', async () => {
    const manifest = createManifest()
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
    const behavior = (globalObject.Behavior as (options: Record<string, unknown>) => unknown)({
      data: { fromBehavior: 'behavior-data' },
      methods: {
        behaviorMethod() {
          return `behavior:${this.data.value}`
        },
      },
      lifetimes: {
        attached() {
          this.setData({ attachedByBehavior: true })
        },
      },
    })
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { value: 'initial' },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      behaviors: [behavior],
      properties: {
        value: { type: String, value: '', observer: 'onValueChanged' },
      },
      data: { derived: '', propertyObserved: '' },
      observers: {
        value(value: string) {
          this.setData({ derived: `obs:${value}` })
        },
      },
      methods: {
        onValueChanged(value: string, oldValue: string) {
          this.setData({ propertyObserved: `${value}:${oldValue}` })
        },
      },
    })

    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 10))
    const component = render.adapter.getMountedComponentByComponentId('page-1:component-1') as unknown as {
      data: Record<string, unknown>
      hasBehavior: (behavior: unknown) => boolean
      behaviorMethod: () => string
      setData: (data: Record<string, unknown>) => void
    }
    expect(component).toBeDefined()
    expect(component.data).toMatchObject({
      fromBehavior: 'behavior-data',
      attachedByBehavior: true,
      value: 'initial',
    })
    expect(typeof component.hasBehavior).toBe('function')
    expect(component.behaviorMethod()).toBe('behavior:initial')

    service.activePage!.setData({ value: 'next' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(component.data.value).toBe('next')
    expect(component.data.derived).toBe('obs:next')
    expect(component.data.propertyObserved).toBe('next:initial')

    component.setData({ value: 'local' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(component.data.derived).toBe('obs:local')
    expect(component.data.propertyObserved).toBe('local:next')

    await host.close()
  })
})
