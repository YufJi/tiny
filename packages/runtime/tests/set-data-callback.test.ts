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
import { TREE_PROTOCOL } from '../src/tree/protocol'
import type { RenderNode, RenderPatch } from '../src/tree/protocol'
import type { TreeRenderer } from '../src/tree/render/thread'
import { createHarnessRenderConnector } from './helpers/render-connector'
import { bootServiceThread } from './helpers/split-service'

const PAGE_PATH = 'pages/index/index'
const CARD_PATH = 'components/card/card'

const PAGE_WXML = '<view id="label" bindtap="onTap">{{ label }}</view><card />'
const CARD_WXML = '<view id="fire" bindtap="onFire">{{ text }}</view>'

const globalKeys = ['App', 'Page', 'Component', 'Behavior', 'getApp', 'wx'] as const
const originals = new Map<string, unknown>()
for (const key of globalKeys) originals.set(key, (globalThis as unknown as Record<string, unknown>)[key])
afterAll(() => {
  for (const [key, value] of originals) (globalThis as unknown as Record<string, unknown>)[key] = value
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

const tick = () => new Promise((resolve) => setTimeout(resolve, 20))

type LogicTreeHandle = {
  query(pageId: string, selector: string, all: boolean): Array<{ viewId?: string }>
}

type Rendered = {
  pageText: string
  componentText: string
  log: string[]
}

/**
 * Render-side stub that records what the render tree actually applied, so a
 * `setData` completion can be proven to observe the render state (and not just
 * the service data).
 */
function createRecordingRenderer(rendered: Rendered) {
  return {
    mount(_root: RenderNode) {},
    mountPage(request: { data?: Record<string, unknown> }) {
      if (typeof request.data?.label === 'string') rendered.pageText = request.data.label
    },
    setPageData(data: Record<string, unknown>) {
      if (typeof data.label === 'string') rendered.pageText = data.label
      rendered.log.push(`render:${rendered.pageText}`)
    },
    applyPageDataPatches(patches: Array<Record<string, unknown>>) {
      for (const patch of patches) {
        if (typeof patch.label === 'string') rendered.pageText = patch.label
      }
      rendered.log.push(`render:${rendered.pageText}`)
    },
    setComponentData(data: Record<string, Record<string, unknown>>) {
      for (const value of Object.values(data)) {
        if (value && typeof value.text === 'string') rendered.componentText = value.text
      }
      rendered.log.push(`component-data:${rendered.componentText}`)
      rendered.log.push(`render:${rendered.pageText}`)
    },
    applyPatches(patches: RenderPatch[]) {
      for (const patch of patches) {
        if (patch.type === 'text') rendered.pageText = patch.text
      }
      rendered.log.push(`render:${rendered.pageText}`)
    },
  }
}

function setup(rendered: Rendered, renderer: Partial<TreeRenderer> = {}) {
  const manifest = createManifest()
  const [hostService, serviceTransport] = createInMemoryTransportPair()
  const service = bootServiceThread({ transport: serviceTransport, manifest, initialPath: PAGE_PATH })
  const connector = createHarnessRenderConnector({
    manifest,
    artifacts: { templates: createTemplates() },
    initialPath: PAGE_PATH,
    renderer: { ...createRecordingRenderer(rendered), ...renderer },
  })
  const host = createTestHost({
    serviceTransport: hostService,
    renderConnector: connector,
    manifest,
    initialPath: PAGE_PATH,
  })
  return { manifest, service, connector, host }
}

/** Dispatch a `tap` from the render thread for a node the logic tree knows. */
async function tap(
  connector: ReturnType<typeof createHarnessRenderConnector>,
  pageId: string,
  selector: string,
): Promise<void> {
  const session = connector.session(pageId)!
  const tree = session.adapter as unknown as LogicTreeHandle
  const [node] = tree.query(pageId, selector, false)
  expect(node?.viewId, `logic node for ${selector}`).toBeTruthy()
  session.connection.sendEvent(
    TREE_PROTOCOL.domain,
    TREE_PROTOCOL.event,
    { id: node!.viewId, name: 'tap' },
    { pageId },
  )
  await tick()
}

describe('setData completion ordering', () => {
  test('page callback observes the render update, not only the service data', async () => {
    const rendered: Rendered = { pageText: '', componentText: '', log: [] }
    const { service, connector, host } = setup(rendered)
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { label: 'before' },
      onTap() {
        ;(this as unknown as {
          setData: (patch: Record<string, unknown>, callback?: () => void) => void
        }).setData({ label: 'after' }, () => {
          rendered.log.push(`callback:${rendered.pageText}`)
        })
        rendered.log.push('after-setData-call')
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { text: 'idle' },
      methods: { onFire() {} },
    })
    await host.bootstrap()
    await tick()
    const pageId = service.activePage!.pageId
    rendered.log.length = 0

    await tap(connector, pageId, '#label')

    // The data patch reaches the render thread before the completion runs, and
    // the callback sees the value the render tree applied.
    expect(rendered.log).toEqual(['after-setData-call', 'render:after', 'callback:after'])
    await host.close()
  })

  test('event-handler callback observes the component data patch', async () => {
    const rendered: Rendered = { pageText: '', componentText: '', log: [] }
    const { service, connector, host } = setup(rendered)
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { label: 'before' },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { text: 'idle' },
      methods: {
        onFire() {
          ;(this as unknown as {
            setData: (patch: Record<string, unknown>, callback?: () => void) => void
          }).setData({ text: 'fired' }, () => {
            rendered.log.push(`callback:${rendered.componentText}`)
          })
          rendered.log.push('after-setData-call')
        },
      },
    })
    await host.bootstrap()
    await tick()
    const pageId = service.activePage!.pageId
    rendered.log.length = 0

    await tap(connector, pageId, '#fire')

    // A template event runs in the logic tree with a glass method caller; its
    // `setData` completion still waits for the render-side data patch.
    expect(rendered.log).toEqual([
      'after-setData-call',
      'render:before',
      'component-data:fired',
      'render:before',
      'callback:fired',
    ])
    await host.close()
  })

  test('keeps callback order across consecutive and nested setData calls', async () => {
    const rendered: Rendered = { pageText: '', componentText: '', log: [] }
    const { service, connector, host } = setup(rendered)
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { label: 'before' },
      onTap() {
        const page = this as unknown as {
          setData: (patch: Record<string, unknown>, callback?: () => void) => void
        }
        page.setData({ label: 'one' }, () => {
          rendered.log.push('cb1')
          // A nested patch is its own render batch.
          page.setData({ label: 'two' }, () => rendered.log.push('cb2'))
        })
        page.setData({ other: 1 }, () => rendered.log.push('cb3'))
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { text: 'idle' },
      methods: { onFire() {} },
    })
    await host.bootstrap()
    await tick()
    const pageId = service.activePage!.pageId
    rendered.log.length = 0

    await tap(connector, pageId, '#label')
    await tick()

    // Both synchronous calls share the first batch and complete in call order;
    // the nested call waits for the second batch.
    expect(rendered.log).toEqual([
      'render:one',
      'cb1',
      'cb3',
      'render:two',
      'cb2',
    ])
    await host.close()
  })

  test('completes a setData issued during attach after the initial flow is applied', async () => {
    const rendered: Rendered = { pageText: '', componentText: '', log: [] }
    const { host } = setup(rendered)
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { label: 'before' },
      onTap() {},
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { text: 'idle' },
      lifetimes: {
        attached() {
          ;(this as unknown as {
            setData: (patch: Record<string, unknown>, callback?: () => void) => void
          }).setData({ text: 'attached' }, () => {
            rendered.log.push(`callback:${rendered.componentText}`)
          })
        },
      },
      methods: { onFire() {} },
    })
    await host.bootstrap()
    await tick()

    // The completion was queued before the page was registered as mounted, so
    // it rides on the initial `tree.flow` acknowledgement instead of a patch.
    expect(rendered.log).toContain('component-data:attached')
    expect(rendered.log.filter((entry) => entry === 'callback:attached')).toHaveLength(1)
    // A later `tree.ready` re-snapshot may re-send the same component data; the
    // completion must have observed the first applied flow.
    expect(rendered.log.indexOf('callback:attached')).toBeGreaterThan(
      rendered.log.indexOf('component-data:attached'),
    )
    await host.close()
  })

  test('acknowledges a failed render batch and reports it once', async () => {
    const rendered: Rendered = { pageText: '', componentText: '', log: [] }
    let failRender = false
    const { service, connector, host } = setup(rendered, {
      setPageData(data: Record<string, unknown>) {
        if (typeof data.label === 'string') rendered.pageText = data.label
        if (!failRender) return
        rendered.log.push('render-throw')
        throw new Error('render boom')
      },
    })
    const globalObject = globalThis as unknown as Record<string, unknown>
    ;(globalObject.App as (options: Record<string, unknown>) => unknown)({})
    ;(globalObject.Page as (options: Record<string, unknown>) => unknown)({
      data: { label: 'before' },
      onTap() {
        ;(this as unknown as {
          setData: (patch: Record<string, unknown>, callback?: () => void) => void
        }).setData({ label: 'after' }, () => rendered.log.push('callback'))
      },
    })
    ;(globalObject.Component as (options: Record<string, unknown>) => unknown)({
      data: { text: 'idle' },
      methods: { onFire() {} },
    })
    await host.bootstrap()
    await tick()
    const pageId = service.activePage!.pageId
    rendered.log.length = 0
    failRender = true

    await tap(connector, pageId, '#label')
    await tick()

    // A renderer failure still acknowledges the batch, so the completion runs
    // exactly once, and the failure surfaces through a diagnostic.
    expect(rendered.log).toEqual(['render-throw', 'callback'])
    expect(host.diagnostics.filter((entry) => entry.code === 'RENDER_PATCH_ERROR')).toHaveLength(1)
    await host.close()
  })
})
