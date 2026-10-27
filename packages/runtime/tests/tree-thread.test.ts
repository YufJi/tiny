import { describe, expect, test } from 'vitest'
import { BridgeConnection, createInMemoryTransportPair } from '@tiny/bridge'
import { bootTreeThread } from '../src/tree-thread'
import type { RenderNode, RenderPatch } from '../src/tree/protocol'

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  children: [{ type: 'text', id: 'text', text: 'hello' }],
}

describe('tree thread', () => {
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
