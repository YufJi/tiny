import { afterAll, describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest, type PageArtifact } from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTinyRuntime } from '../src/host'
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

function createTemplateRegistry(): { groupList: Record<string, unknown>; content: (path: string, name?: string) => unknown } {
  const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
  group.addTmpl(PAGE_PATH, '<unknown-widget id="unknown" />')
  const generated = group.getTmplGenObjectGroups()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
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
          'unknown-widget': './components/unknown/unknown',
        },
      },
      usingComponentsSource: {
        'unknown-widget': 'global',
      },
    },
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

describe('runtime diagnostics', () => {
  test('collects unsupported capabilities, runtime state, and unsupported APIs', async () => {
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
    const reported: string[] = []
    const host = createTinyRuntime({
      serviceTransport: hostServiceTransport,
      renderConnector,
      manifest,
      initialPath: PAGE_PATH,
      onDiagnostic: (diagnostic) => reported.push(diagnostic.code),
    })

    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      methods: {
        callUnsupportedApi() {
          wx.makeTea()
        },
      },
    })

    await host.bootstrap()
    await service.activePage?.invokeMethod('callUnsupportedApi')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(host.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(expect.arrayContaining([
      'UNSUPPORTED_COMPONENT',
      'UNSUPPORTED_API',
      'RUNTIME_STATE',
    ]))
    expect(reported).toEqual(expect.arrayContaining(['UNSUPPORTED_API']))

    const state = host.diagnostics.find((diagnostic) => diagnostic.code === 'RUNTIME_STATE')
    expect(state?.details).toMatchObject({
      pageStack: ['page-1'],
      currentPage: PAGE_PATH,
      transport: 'connected',
    })

    await host.close()
  })
})
