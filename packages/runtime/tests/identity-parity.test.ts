import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from '../src/service/render/component-schema'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { buildComponentDefinitions } from '../src/service/render/definition-payload'
import { buildComponentFlow } from '../src/tree/flow'
import { bootTreeThread } from '../src/tree/render/thread'
import { createRenderConnection } from './helpers/render-connection'
import type { RenderNode } from '../src/tree/protocol'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import type { MiniProgramComponentSchema } from '../src/types'

const PAGE = 'pages/index/index'
const CARD = 'components/card/card'
const BADGE = 'components/badge/badge'

const PAGE_WXML = [
  '<view class="page">',
  '  <card id="card" label="{{ label }}" data-kind="primary"><text>slotted</text></card>',
  '  <image id="logo" src="/logo.png" />',
  '</view>',
].join('')
const CARD_WXML = '<view class="card"><text>{{ label }}</text><badge id="badge" /><slot /></view>'
const BADGE_WXML = '<text class="badge">badge</text>'

function artifact(path: string, using?: Record<string, string>): ComponentArtifact {
  return {
    path,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: using ? { usingComponents: using } : { component: true, usingComponents: {} },
    },
  }
}

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE, PAGE_WXML)
  group.addTmpl(CARD, CARD_WXML)
  group.addTmpl(BADGE, BADGE_WXML)
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

function createManifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE,
    template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
    configuration: {
      path: PAGE,
      sourcePath: `${PAGE}.json`,
      effective: { usingComponents: { card: `/${CARD}` } },
    },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page],
    components: [
      artifact(CARD, { badge: `/${BADGE}` }),
      artifact(BADGE),
    ],
    styles: [
      { path: `${CARD}.wxss`, outputPath: 'components/card/card.css', scope: 'tiny-components-card-card' },
    ],
    assets: [],
  }
}

function createSchemas(manifest: Manifest): MiniProgramComponentSchema[] {
  const definitions = new Map([
    [CARD, normalizeComponentDefinition({ properties: { label: { type: String, value: '' } } }, CARD)],
    [BADGE, normalizeComponentDefinition({}, BADGE)],
  ])
  return buildComponentSchemas(manifest.components, definitions)
}

async function mountThroughThread(root: RenderNode, definitions: ReturnType<typeof buildComponentDefinitions>) {
  const [hostTransport, renderTransport] = createInMemoryTransportPair()
  const mounted: RenderNode[] = []
  bootTreeThread({
    connection: createRenderConnection(renderTransport),
    renderer: {
      mount: (node) => mounted.push(node),
      applyPatches: () => {},
    },
  })
  const host = new BridgeConnection({
    localRole: 'host',
    peerRole: 'render',
    transport: hostTransport,
    respondToHello: false,
  })
  await host.handshake()
  host.sendEvent('tree', 'flow', {
    pageId: 'page-1',
    pagePath: PAGE,
    styles: [],
    messages: buildComponentFlow(root, definitions),
  }, { pageId: 'page-1' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return mounted[0]
}

type Identity = {
  id: string
  tag: string
  component: boolean
  componentPath?: string
  props: string
  events: string
  scopes: string
}

/** Structural identity of a tree, in document order. */
function identities(node: RenderNode | undefined, out: Identity[] = []): Identity[] {
  if (!node) return out
  if (node.type === 'text') {
    out.push({ id: node.id, tag: '#text', component: false, props: '', events: '', scopes: '' })
    return out
  }
  out.push({
    id: node.id,
    tag: node.tag,
    component: node.component === true,
    ...(node.componentPath ? { componentPath: node.componentPath } : {}),
    props: JSON.stringify(node.props ?? {}),
    events: JSON.stringify(node.events ?? []),
    scopes: JSON.stringify([node.scopes ?? [], node.scopeChain ?? []]),
  })
  for (const child of node.children ?? []) identities(child, out)
  return out
}

describe('identity parity', () => {
  test('service snapshot and render mirror agree node by node', async () => {
    const manifest = createManifest()
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
    })
    tree.registerComponentSchemas(createSchemas(manifest))
    const snapshot = tree.mountPage(PAGE, { label: 'hello' }, 'page-1')
    await tree.glass.whenRendered()
    expect(snapshot).toBeTruthy()

    const definitions = buildComponentDefinitions(
      createSchemas(manifest),
      new Map([
        [CARD, normalizeComponentDefinition({ properties: { label: { type: String, value: '' } } }, CARD)],
        [BADGE, normalizeComponentDefinition({}, BADGE)],
      ]),
      manifest.styles,
    )
    const mirror = await mountThroughThread(snapshot!, definitions)

    const service = identities(snapshot)
    const render = identities(mirror)
    expect(render.map((item) => item.id)).toEqual(service.map((item) => item.id))
    expect(render).toEqual(service)
    // The boundary is part of the identity, not an accident of the tag name.
    // `badge` lives inside card's shadow tree, which the render thread
    // evaluates, so only the page-level component boundary is serialized.
    expect(service.filter((item) => item.component).map((item) => item.componentPath))
      .toEqual([CARD])
  })

  test('dispatches a forwarded template handler on the service component', async () => {
    const manifest = createManifest()
    const handled: unknown[] = []
    const definitions = new Map([
      [CARD, normalizeComponentDefinition({
        properties: { label: { type: String, value: '' } },
        methods: {
          onTap(event: unknown) {
            handled.push(event)
          },
        },
      }, CARD)],
      [BADGE, normalizeComponentDefinition({}, BADGE)],
    ])
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))
    const snapshot = tree.mountPage(PAGE, { label: 'hello' }, 'page-2')
    await tree.glass.whenRendered()

    const findCard = (node: RenderNode | undefined): RenderNode | undefined => {
      if (!node || node.type !== 'element') return undefined
      if (node.tag === 'card' && node.component) return node
      for (const child of node.children ?? []) {
        const found = findCard(child)
        if (found) return found
      }
      return undefined
    }
    const card = findCard(snapshot)
    expect(card?.type).toBe('element')

    const ran = tree.dispatchTemplateHandler({
      componentId: card!.id,
      handler: 'onTap',
      name: 'tap',
      detail: { x: 3 },
      id: 'card',
      dataset: { kind: 'primary' },
    })
    expect(ran).toBe(true)
    expect(handled).toHaveLength(1)
    expect(handled[0]).toMatchObject({
      type: 'tap',
      detail: { x: 3 },
      currentTarget: { id: 'card', dataset: { kind: 'primary' } },
    })
  })

  test('component data is sent as a per-component patch', async () => {
    const manifest = createManifest()
    const definitions = new Map([
      [CARD, normalizeComponentDefinition({
        properties: { label: { type: String, value: '' } },
        methods: {
          rename(this: { setData: (patch: Record<string, unknown>) => void }, event: unknown) {
            this.setData({ label: (event as { detail?: { label?: string } }).detail?.label ?? '' })
          },
        },
      }, CARD)],
      [BADGE, normalizeComponentDefinition({}, BADGE)],
    ])
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))
    tree.mountPage(PAGE, { label: 'first' }, 'page-3')
    await tree.glass.whenRendered()
    tree.seedComponentData('page-3')

    // Nothing changed: no component needs a patch.
    expect(tree.updateComponentData('page-3')).toEqual({})

    const card = findComponent(tree.snapshotRenderTree('page-3'), 'card')
    expect(card?.type).toBe('element')
    tree.dispatchTemplateHandler({
      componentId: card!.id,
      handler: 'rename',
      name: 'tap',
      detail: { label: 'second' },
    })
    await tree.glass.whenRendered()

    const patch = tree.updateComponentData('page-3')
    const ids = Object.keys(patch)
    expect(ids).toHaveLength(1)
    // Only the card consumed the setData; the badge data is unchanged.
    expect(ids[0]).toBe(card!.id)
    expect(patch[ids[0]!]).toMatchObject({ label: 'second' })

    // A second update without a data change stays empty.
    expect(tree.updateComponentData('page-3')).toEqual({})
  })
})

function findComponent(node: RenderNode | null | undefined, tag: string): RenderNode | undefined {
  if (!node || node.type !== 'element') return undefined
  if (node.tag === tag && node.component) return node
  for (const child of node.children ?? []) {
    const found = findComponent(child, tag)
    if (found) return found
  }
  return undefined
}
