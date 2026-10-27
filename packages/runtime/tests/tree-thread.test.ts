import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { bootTreeThread } from '../src/tree/render/thread'
import type { RenderNode, RenderPatch } from '../src/tree/protocol'

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  children: [{ type: 'text', id: 'text', text: 'hello' }],
}

describe('tree thread', () => {
  test('builds the render mirror from component-flow messages', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    bootTreeThread({
      transport: renderTransport,
      renderer: {
        mount: (root) => mounted.push(root),
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
      messages: [
        { type: 'define', path: 'components/card/card', definition: {} },
        { type: 'create-node', id: 'page', tag: 'page', index: 0 },
        { type: 'create-node', id: 'view', tag: 'view', parentId: 'page', index: 0 },
        { type: 'create-node', id: 'text', tag: '#text', parentId: 'view', index: 0, text: 'flow' },
        { type: 'create-node', id: 'card', tag: 'card', parentId: 'view', index: 1 },
        { type: 'props', id: 'card', props: { label: 'flow' } },
        { type: 'children', id: 'view', inserts: ['text', 'card'] },
        { type: 'ready' },
      ],
    }, { pageId: 'page-1' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mounted).toHaveLength(1)
    expect(mounted[0]).toMatchObject({
      type: 'element',
      id: 'page',
      children: [{
        type: 'element',
        id: 'view',
        children: [
          { type: 'text', id: 'text', text: 'flow' },
          { type: 'element', id: 'card', tag: 'card', props: { label: 'flow' } },
        ],
      }],
    })
  })

  test('receives snapshots/patches and sends render events', async () => {
    const [hostTransport, renderTransport] = createInMemoryTransportPair()
    const mounted: RenderNode[] = []
    const patches: RenderPatch[][] = []
    const events: unknown[] = []
    let emit: ((event: unknown) => void) | undefined

    bootTreeThread({
      transport: renderTransport,
      initialPageId: 'page-1',
      renderer: {
        mount: (root) => mounted.push(root),
        applyPatches: (value) => patches.push(value),
        setEventSink: (sink) => {
          emit = sink as (event: unknown) => void
        },
      },
    })
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'render',
      transport: hostTransport,
      respondToHello: false,
    })
    host.onEvent('tree', 'event', (message) => events.push(message.payload))
    await host.handshake()

    host.sendEvent('tree', 'snapshot', { root: tree }, { pageId: 'page-1' })
    host.sendEvent('tree', 'patch', {
      patches: [{ type: 'text', id: 'text', text: 'bye' }],
    }, { pageId: 'page-1' })
    emit?.({ id: 'button', name: 'tap', native: { clientX: 1 } })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mounted).toHaveLength(1)
    expect(patches[0]).toEqual([{ type: 'text', id: 'text', text: 'bye' }])
    expect(events[0]).toMatchObject({
      id: 'button',
      name: 'tap',
      pageId: 'page-1',
      native: { clientX: 1 },
    })
  })
})
