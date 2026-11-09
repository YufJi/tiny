import { describe, expect, test } from 'vitest'
import { BridgeConnection } from '@tiny/bridge'
import { createHostMessageChannelPair, createMessagePortTransport } from '../src/message-port-transport'

describe('message-port transport glue', () => {
  test('performs a handshake over MessageChannel ports', async () => {
    const { hostTransport, peerPort } = createHostMessageChannelPair()
    const host = new BridgeConnection({
      localRole: 'host',
      peerRole: 'service',
      transport: hostTransport,
      respondToHello: false,
    })
    const service = new BridgeConnection({
      localRole: 'service',
      peerRole: 'host',
      transport: createMessagePortTransport(peerPort),
      capabilities: { runtime: 'glass-easel' },
    })
    const ready = await host.handshake()
    expect(ready.capabilities).toEqual({ runtime: 'glass-easel' })
    await host.close()
    await service.close()
  })
})
