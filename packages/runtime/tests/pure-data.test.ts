import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderThread } from '../src/render'
import { bootServiceThread } from '../src/service'
import type { InspectNode } from '../src/glass-easel-adapter'

const PAGE_PATH = 'pages/index/index'
const COMPONENT_PATH = 'components/pure/pure'

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

function createManifest(componentEffective: Record<string, unknown>): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    bodyType: 'page',
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { usingComponents: { 'pure-box': `/${COMPONENT_PATH}` } },
    },
  }
  const component: PageArtifact = {
    path: COMPONENT_PATH,
    bodyType: 'component',
    template: {
      path: COMPONENT_PATH,
      outputPath: 'templates.js',
      sourcePath: `${COMPONENT_PATH}.wxml`,
    },
    configuration: {
      path: COMPONENT_PATH,
      sourcePath: `${COMPONENT_PATH}.json`,
      effective: { component: true, ...componentEffective },
    },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [page],
    components: [component],
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
  group.addTmpl(PAGE_PATH, '<view><pure-box /></view>')
  group.addTmpl(
    COMPONENT_PATH,
    '<view><text class="public">{{visible}}</text><text class="private">{{_hidden}}</text></view>',
  )
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

function collectText(node: InspectNode | null): string[] {
  if (!node) return []
  const text = node.type === 'text' && node.text ? [node.text] : []
  return [...text, ...node.children.flatMap((child) => collectText(child))]
}

async function boot(componentEffective: Record<string, unknown>) {
  const manifest = createManifest(componentEffective)
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
  ;(globalObject.App as (value: Record<string, unknown>) => unknown)({})
  ;(globalObject.Page as (value: Record<string, unknown>) => unknown)({})
  ;(globalObject.Component as (value: Record<string, unknown>) => unknown)({
    options: { pureDataPattern: /^_/ },
    data: { visible: 'shown', _hidden: 'secret' },
    observers: {
      _hidden(value: string) {
        this.setData({ observed: value })
      },
    },
  })

  await host.bootstrap()
  await new Promise((resolve) => setTimeout(resolve, 10))
  return { host, service, render }
}

describe('pureDataPattern', () => {
  test('keeps matching fields out of WXML while service data and observers still see them', async () => {
    const { host, service, render } = await boot({})
    expect(collectText(render.adapter.inspectTree())).toEqual(['shown'])
    const component = service.componentInstances.get('page-1:component-1')!
    expect(component.data._hidden).toBe('secret')

    component.setData({ _hidden: 'next' })
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(component.data._hidden).toBe('next')
    expect(component.data.observed).toBe('next')
    expect(collectText(render.adapter.inspectTree())).toEqual(['shown'])
    await host.close()
  })

  test('reads the pattern from component JSON when JS does not set it', async () => {
    const manifest = createManifest({ pureDataPattern: '^_' })
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
    ;(globalObject.App as (value: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (value: Record<string, unknown>) => unknown)({})
    ;(globalObject.Component as (value: Record<string, unknown>) => unknown)({
      data: { visible: 'shown', _hidden: 'secret' },
    })
    await host.bootstrap()
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(collectText(render.adapter.inspectTree())).toEqual(['shown'])
    expect(service.componentInstances.get('page-1:component-1')!.data._hidden).toBe('secret')
    await host.close()
  })
})
