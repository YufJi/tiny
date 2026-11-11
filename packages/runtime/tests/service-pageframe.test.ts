import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import type { TransportFrame } from '@tiny/bridge'
import { TREE_PROTOCOL } from '../src/tree/protocol'
import { createTestHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE = 'pages/index/index'

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
    path: PAGE,
    template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
    configuration: { path: PAGE, sourcePath: `${PAGE}.json`, effective: {} },
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

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE, '<view class="state">{{label}}</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`template not found: ${path}`)
      return (entry as (name?: string) => unknown)(name)
    },
  }
}

async function capturePatch(pageFrame: boolean): Promise<Record<string, unknown>> {
  const manifest = createManifest()
  const [hostService, serviceTransport] = createInMemoryTransportPair()
  const frames: TransportFrame[] = []
  const send = serviceTransport.send.bind(serviceTransport)
  serviceTransport.send = (frame) => {
    frames.push(frame)
    send(frame)
  }
  const service = bootServiceThread({
    transport: serviceTransport,
    manifest,
    initialPath: PAGE,
  })
  const connector = createHarnessRenderConnector({
    manifest,
    artifacts: { templates: createTemplates() },
    initialPath: PAGE,
  })
  const host = createTestHost({
    serviceTransport: hostService,
    renderConnector: connector,
    manifest,
    initialPath: PAGE,
    pageFrame,
  })
  const globalObject = globalThis as unknown as Record<string, unknown>
  ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
  ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
    data: { label: 'before' },
  })
  await host.bootstrap()
  frames.length = 0

  service.activePage?.setData({ label: 'after' })
  await new Promise((resolve) => setTimeout(resolve, 10))
  const patch = frames
    .flatMap((frame) => frame.messages)
    .find((message) => (
      message.domain === TREE_PROTOCOL.domain
      && message.method === TREE_PROTOCOL.patch
    ))
  expect(patch).toBeDefined()
  await host.close()
  return (patch?.payload ?? {}) as Record<string, unknown>
}

describe('service pageframe projection', () => {
  test('omits virtual-node patches when the render pageframe owns the diff', async () => {
    const payload = await capturePatch(true)
    expect(payload).not.toHaveProperty('patches')
    expect(payload).toHaveProperty('pageData')
  })

  test('keeps virtual-node patches for snapshot renderers', async () => {
    const payload = await capturePatch(false)
    expect(payload.patches).toEqual([
      expect.objectContaining({ type: 'text' }),
    ])
  })
})
