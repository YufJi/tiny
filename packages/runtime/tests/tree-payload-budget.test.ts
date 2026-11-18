import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { createInMemoryTransportPair } from '@tiny/bridge'
import { createTestHost } from './support/host'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'
import type { TreePayloadInfo } from '../src/service/render-bridge/bridge'
import type { TreeRenderer } from '../src/render/thread'

const PAGE_PATH = 'pages/index/index'
const CARD_PATH = 'components/card/card'
const ITEM_COUNT = 2000

const PAGE_WXML = [
  '<view class="list">',
  '  <view wx:for="{{items}}" wx:key="id" class="row">{{item.text}}</view>',
  '  <view wx:if="{{showCard}}"><card label="{{label}}" /></view>',
  '</view>',
].join('')

const CARD_WXML = '<text class="card">{{label}}</text>'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) {
  originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
}
afterAll(() => {
  for (const [key, value] of originals) {
    ;(globalThis as unknown as Record<string, unknown>)[key] = value
  }
})

function artifact(path: string, using?: Record<string, string>): PageArtifact | ComponentArtifact {
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
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [artifact(PAGE_PATH, { card: `/${CARD_PATH}` })],
    components: [artifact(CARD_PATH)],
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
  group.addTmpl(PAGE_PATH, PAGE_WXML)
  group.addTmpl(CARD_PATH, CARD_WXML)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`template not found: ${path}`)
      return (entry as (inner: string) => unknown)(name)
    },
  }
}

const noopRenderer: Partial<TreeRenderer> = {
  mountPage() {},
  setPageData() {},
  applyPageDataPatches() {},
  setComponentData() {},
  applyComponentFlowDelta() {},
}

type Telemetry = {
  mount?: TreePayloadInfo
  patches: TreePayloadInfo[]
  deltaAdds: number
}

async function boot(options: { renderHints?: 'always' | 'mount-only' }): Promise<{
  page: { setData: (patch: Record<string, unknown>, callback?: () => void) => void }
  telemetry: Telemetry
  appliedPatches: Array<Array<Record<string, unknown>>>
  close: () => Promise<void>
}> {
  const manifest = createManifest()
  const telemetry: Telemetry = { patches: [], deltaAdds: 0 }
  const appliedPatches: Array<Array<Record<string, unknown>>> = []
  const [hostService, serviceTransport] = createInMemoryTransportPair()
  const service = bootServiceThread({
    transport: serviceTransport,
    manifest,
    initialPath: PAGE_PATH,
    treeProtocol: {
      ...(options.renderHints ? { renderHints: options.renderHints } : {}),
      onPayload: (info) => {
        if (info.kind === 'flow') telemetry.mount = info
        else telemetry.patches.push(info)
      },
    },
  })
  const connector = createHarnessRenderConnector({
    manifest,
    artifacts: { templates: createTemplates() },
    initialPath: PAGE_PATH,
    renderer: {
      ...noopRenderer,
      applyPageDataPatches: (patches) => appliedPatches.push(patches),
      applyComponentFlowDelta: (delta) => {
        for (const owner of delta.owners ?? []) {
          telemetry.deltaAdds += owner.add?.length ?? 0
        }
      },
    },
  })
  const host = createTestHost({
    serviceTransport: hostService,
    renderConnector: connector,
    manifest,
    initialPath: PAGE_PATH,
  })
  const globalObject = globalThis as unknown as Record<string, unknown>
  ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
  ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
    data: {
      items: Array.from({ length: ITEM_COUNT }, (_, index) => ({
        id: index,
        text: `row ${index}`,
      })),
      showCard: false,
      label: 'card',
    },
  })
  ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
    properties: { label: { type: String, value: '' } },
    data: { label: '' },
  })
  await host.bootstrap()
  await tick()
  const page = service.activePage as unknown as {
    setData: (patch: Record<string, unknown>, callback?: () => void) => void
  }
  return {
    page,
    telemetry,
    appliedPatches,
    close: () => host.close(),
  }
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 30))

function lastPatch(telemetry: Telemetry): TreePayloadInfo {
  const patch = telemetry.patches.at(-1)
  if (!patch) throw new Error('no tree.patch was sent')
  return patch
}

function ratio(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole
}

describe('tree payload budget', () => {
  test('an append on a 2000-row page stays under 5% of the mount payload', async () => {
    const run = await boot({})
    expect(run.telemetry.mount?.bytes ?? 0).toBeGreaterThan(100_000)

    run.page.setData({ 'items[1999].text': 'changed' })
    await tick()
    const dataPatch = lastPatch(run.telemetry)
    expect(dataPatch.hintsBytes).toBe(0)
    expect(dataPatch.componentFlowBytes).toBe(0)
    expect(ratio(dataPatch.bytes, run.telemetry.mount!.bytes)).toBeLessThan(0.05)

    // A component created by a structure change crosses as one identity, not
    // as the whole element tree.
    run.page.setData({ showCard: true })
    await tick()
    const structuralPatch = lastPatch(run.telemetry)
    expect(structuralPatch.hintsBytes).toBe(0)
    expect(run.telemetry.deltaAdds).toBe(1)
    expect(ratio(structuralPatch.bytes, run.telemetry.mount!.bytes)).toBeLessThan(0.05)
    await run.close()
  })

  test('the legacy renderHints mode is the payload the budget compares against', async () => {
    const run = await boot({ renderHints: 'always' })
    expect(run.telemetry.mount?.bytes ?? 0).toBeGreaterThan(100_000)

    run.page.setData({ showCard: true })
    await tick()
    const patch = lastPatch(run.telemetry)
    expect(patch.hintsBytes).toBeGreaterThan(100_000)
    // The old path re-sends (at least) the whole element tree, i.e. ~100% of
    // the mount payload for a one-element change.
    expect(ratio(patch.hintsBytes, run.telemetry.mount!.bytes)).toBeGreaterThan(0.5)
    await run.close()
  })

  test('a data-only batch carries the original setData patch, not page data', async () => {
    const run = await boot({})
    run.page.setData({ label: 'second' })
    await tick()
    const patch = lastPatch(run.telemetry)
    expect(patch.componentDataBytes).toBe(0)
    expect(patch.componentFlowBytes).toBe(0)
    expect(patch.pageDataBytes).toBeLessThan(100)
    // The render thread applied exactly the patch the page sent: no full page
    // data, no element tree.
    expect(run.appliedPatches).toEqual([[{ label: 'second' }]])
    await run.close()
  })
})
