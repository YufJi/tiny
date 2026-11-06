import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { bootTreeThread } from '../src/tree/render/thread'
import { createRenderConnection } from './helpers/render-connection'
import { buildComponentFlow } from '../src/tree/flow'
import type { ComponentDefinitionPayload, RenderNode } from '../src/tree/protocol'

const CARD = 'components/card/card'

const definitions: Map<string, ComponentDefinitionPayload> = new Map([
  [CARD, {
    path: CARD,
    template: { path: `${CARD}.wxml` },
    properties: { label: { type: 'string', value: '' } },
    markers: { formField: true },
  }],
])

/** Service snapshot shape: the page root never carries a component marker. */
const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  children: [{
    type: 'element',
    id: 'view',
    tag: 'view',
    props: { class: 'page-view' },
    children: [
      {
        type: 'element',
        id: 'card',
        tag: 'card',
        component: true,
        componentPath: CARD,
        props: { label: 'x' },
        children: [{ type: 'element', id: 'inner', tag: 'text' }],
      },
      { type: 'text', id: 'text', text: 'hello' },
    ],
  }],
}

async function roundTrip(
  root: RenderNode,
  table: Map<string, ComponentDefinitionPayload>,
): Promise<RenderNode | undefined> {
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
    pagePath: 'pages/index/index',
    styles: [],
    messages: buildComponentFlow(root, table),
  }, { pageId: 'page-1' })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return mounted[0]
}

describe('component flow round trip', () => {
  test('the render mirror is structurally identical to the service snapshot', async () => {
    const mounted = await roundTrip(tree, definitions)
    expect(mounted).toEqual(tree)
  })

  test('component boundaries survive the bridge', async () => {
    const mounted = await roundTrip(tree, definitions)
    const view = mounted?.type === 'element' ? mounted.children?.[0] : undefined
    const card = view?.type === 'element' ? view.children?.[0] : undefined
    expect(card).toMatchObject({ type: 'element', tag: 'card', component: true, componentPath: CARD })
    // Built-in elements must not be mistaken for components.
    expect(view).toMatchObject({ type: 'element', tag: 'view' })
    expect(view?.type === 'element' ? view.component : undefined).toBeUndefined()
  })
})
