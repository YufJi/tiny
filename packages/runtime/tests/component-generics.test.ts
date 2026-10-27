import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
import { bootRenderHarness as bootRenderThread } from './helpers/render-harness'
import { bootServiceThread } from '../src/service'
import type { InspectNode } from '../src/glass-easel-adapter'

const PAGE_PATH = 'pages/index/index'
const GROUP_PATH = 'components/group/group'
const RADIO_PATH = 'components/radio/radio'

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

function createTemplateRegistry(pageMarkup: string) {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, pageMarkup)
  group.addTmpl(GROUP_PATH, '<view class="group"><selectable label="{{label}}" /><text>{{label}}</text></view>')
  group.addTmpl(RADIO_PATH, '<text class="radio">{{label}}</text>')
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

function artifact(
  path: string,
  bodyType: 'page' | 'component',
  effective: Record<string, unknown>,
): PageArtifact {
  return {
    path,
    bodyType,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: { path, sourcePath: `${path}.json`, effective },
  }
}

function createManifest(options: {
  pageMarkup: string
  groupGenerics: Record<string, unknown>
  pageUsing: Record<string, string>
}): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [artifact(PAGE_PATH, 'page', { usingComponents: options.pageUsing })],
    components: [
      artifact(GROUP_PATH, 'component', {
        component: true,
        componentGenerics: options.groupGenerics,
      }),
      artifact(RADIO_PATH, 'component', { component: true }),
    ],
    styles: [],
    assets: [],
  }
}

function collectText(node: InspectNode | null): string[] {
  if (!node) return []
  const text = node.type === 'text' && node.text ? [node.text] : []
  return [...text, ...node.children.flatMap((child) => collectText(child))]
}

async function boot(options: {
  pageMarkup: string
  groupGenerics: Record<string, unknown>
  pageUsing: Record<string, string>
  registerComponents: () => void
}) {
  const manifest = createManifest(options)
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
    artifacts: { templates: createTemplateRegistry(options.pageMarkup) },
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
  ;(globalObject.Page as (value: Record<string, unknown>) => unknown)({
    data: { value: 'page' },
  })
  options.registerComponents()

  await host.bootstrap()
  await new Promise((resolve) => setTimeout(resolve, 10))
  return { host, service, render }
}

describe('componentGenerics (abstract nodes)', () => {
  test('instantiates the component supplied by generic:alias', async () => {
    const { host, service, render } = await boot({
      pageMarkup: '<view><selectable-group label="hello" generic:selectable="custom-radio" /></view>',
      pageUsing: {
        'selectable-group': `/${GROUP_PATH}`,
        'custom-radio': `/${RADIO_PATH}`,
      },
      groupGenerics: { selectable: true },
      registerComponents() {
        const component = (globalThis as unknown as Record<string, unknown>).Component as
          (value: Record<string, unknown>) => unknown
        component({
          properties: { label: { type: String, value: '' } },
        })
        component({
          properties: { label: { type: String, value: '' } },
        })
      },
    })

    const paths = [...service.componentInstances.values()].map((component) => component.path)
    expect(paths).toContain(RADIO_PATH)
    expect(collectText(render.adapter.inspectTree())).toContain('hello')
    await host.close()
  })

  test('uses the componentGenerics default when no generic:alias is supplied', async () => {
    const { host, service, render } = await boot({
      pageMarkup: '<view><selectable-group label="fallback" /></view>',
      pageUsing: { 'selectable-group': `/${GROUP_PATH}` },
      groupGenerics: { selectable: { default: `/${RADIO_PATH}` } },
      registerComponents() {
        const component = (globalThis as unknown as Record<string, unknown>).Component as
          (value: Record<string, unknown>) => unknown
        component({
          properties: { label: { type: String, value: '' } },
        })
        component({
          properties: { label: { type: String, value: '' } },
        })
      },
    })

    const paths = [...service.componentInstances.values()].map((component) => component.path)
    expect(paths).toContain(RADIO_PATH)
    expect(collectText(render.adapter.inspectTree())).toContain('fallback')
    await host.close()
  })
})
