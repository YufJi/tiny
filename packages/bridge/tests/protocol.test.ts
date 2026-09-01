import { afterEach, describe, expect, test, vi } from 'vitest'
import { BridgeConnection } from '../src/protocol/connection'
import { ProtocolError } from '../src/protocol/errors'
import { assertJsonSafe } from '../src/protocol/json'
import { createMessage, validateEnvelope, type ProtocolMessage } from '../src/protocol/message'
import { createHostMessageChannelPair, createMessagePortTransport } from '../src/protocol/message-port-transport'
import { createInMemoryTransportPair } from '../src/protocol/transport'

function createConnectionPair() {
  const [hostTransport, serviceTransport] = createInMemoryTransportPair()
  const host = new BridgeConnection({
    localRole: 'host',
    peerRole: 'service',
    transport: hostTransport,
    respondToHello: false,
  })
  const service = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: serviceTransport,
  })
  return { host, service, hostTransport }
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('protocol envelopes', () => {
  test('creates and validates a versioned envelope', () => {
    const message = createMessage({
      kind: 'call',
      domain: 'api',
      method: 'storage.get',
      source: 'service',
      target: 'host',
      payload: { key: 'tiny' },
      pageId: 'page-1',
    })
    expect(message.protocolVersion).toBe(1)
    expect(validateEnvelope(message)).toBe(message)
  })

  test('rejects version, routing, and payload errors', () => {
    expect(() => validateEnvelope({ protocolVersion: 2 })).toThrow(ProtocolError)
    expect(() => createMessage({
      kind: 'call',
      domain: 'unknown' as never,
      method: 'test',
      source: 'service',
      target: 'host',
      payload: {},
    })).toThrow(ProtocolError)
    expect(() => createMessage({
      kind: 'call',
      domain: 'api',
      method: 'test',
      source: 'unknown' as never,
      target: 'host',
      payload: {},
    })).toThrow(ProtocolError)
    expect(() => validateEnvelope({
      protocolVersion: 1,
      messageId: 'msg',
      kind: 'reply',
      domain: 'api',
      method: 'test',
      source: 'host',
      target: 'service',
      payload: { ok: true, result: null },
      timestamp: Date.now(),
    })).toThrow(ProtocolError)
  })

  test('validates JSON-safe payloads', () => {
    expect(() => assertJsonSafe({ value: Number.NaN })).toThrow(ProtocolError)
    expect(() => assertJsonSafe({ value: undefined })).toThrow(ProtocolError)
    expect(() => assertJsonSafe({ value: new Date() })).toThrow(ProtocolError)
    expect(() => assertJsonSafe({ value: new Map() })).toThrow(ProtocolError)
    expect(() => assertJsonSafe({ value: () => null })).toThrow(ProtocolError)
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    expect(() => assertJsonSafe(cyclic)).toThrow(ProtocolError)
    expect(() => assertJsonSafe({ nested: { values: [1, 'two', false, null] } })).not.toThrow()
  })
})

describe('bridge connection', () => {
  test('performs host-to-service handshake', async () => {
    const { host, service } = createConnectionPair()
    const ready = await host.handshake({ compiler: 'glass-easel' })
    expect(ready.protocolVersion).toBe(1)
    expect(ready.role).toBe('service')
    expect(ready.capabilities).toEqual({})
    await host.close()
    await service.close()
  })

  test('correlates calls and structured replies', async () => {
    const { host, service, hostTransport } = createConnectionPair()
    const unregister = service.onCall('api', 'storage.get', async (message) => ({
      key: (message.payload as { key: string }).key,
      value: 'tiny',
    }))
    const result = await host.call<{ key: string; value: string }>(
      'api',
      'storage.get',
      { key: 'tiny' },
      { pageId: 'page-1' },
    )
    expect(result).toEqual({ key: 'tiny', value: 'tiny' })
    unregister()
    await expect(host.call('api', 'unknown', {})).rejects.toMatchObject({
      code: 'UNSUPPORTED_METHOD',
    })
    await host.close()
    await service.close()
  })

  test('times out calls without retry', async () => {
    const { host, service } = createConnectionPair()
    service.onCall('api', 'slow', () => new Promise(() => {}))
    await expect(host.call('api', 'slow', {}, { timeoutMs: 10 })).rejects.toMatchObject({
      code: 'TIMEOUT',
    })
    await host.close()
    await service.close()
  })

  test('fails pending calls when transport closes', async () => {
    const { host, service } = createConnectionPair()
    service.onCall('api', 'slow', () => new Promise(() => {}))
    const pending = host.call('api', 'slow', {})
    await host.close()
    await expect(pending).rejects.toMatchObject({ code: 'TRANSPORT_CLOSED' })
    await service.close()
  })

  test('batches data and event messages while preserving FIFO order', async () => {
    const { host, service, hostTransport } = createConnectionPair()
    const frames: ProtocolMessage[][] = []
    const received: number[] = []
    host.onEvent('data', 'setData', (message) => received.push((message.payload as { sequence: number }).sequence))
    const dispose = hostTransport.onFrame((frame) => frames.push(frame.messages))
    service.sendEvent('data', 'setData', { sequence: 1 }, { pageId: 'page-1' })
    service.sendEvent('data', 'setData', { sequence: 2 }, { pageId: 'page-1' })
    await settle()
    expect(frames).toHaveLength(1)
    expect(received).toEqual([1, 2])
    dispose()
    await host.close()
    await service.close()
  })

  test('immediately sends diagnostics after queued events', async () => {
    const { host, service } = createConnectionPair()
    const messages: ProtocolMessage[] = []
    host.onEvent('data', 'setData', () => {})
    host.onEvent('diagnostic', 'diagnostic.error', (message) => messages.push(message))
    service.sendEvent('data', 'setData', {}, { pageId: 'page-1' })
    service.sendDiagnostic('error', { code: 'TEST' }, 'page-1')
    await settle()
    expect(messages).toHaveLength(1)
    expect(messages[0]?.method).toBe('diagnostic.error')
    await host.close()
    await service.close()
  })
})

describe('message-port transport', () => {
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
