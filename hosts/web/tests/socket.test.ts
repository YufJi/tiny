import { describe, expect, test } from 'vitest'
import { createSocketHandlers } from '../src/socket'

type Listener = (event: unknown) => void

function createFakeSocket() {
  const listeners = new Map<string, Set<Listener>>()
  const sent: Array<string | ArrayBuffer> = []
  let closed = false
  const socket = {
    sent,
    get closed() {
      return closed
    },
    send(data: string | ArrayBuffer) {
      sent.push(data)
    },
    close() {
      closed = true
      dispatch('close', { code: 1000, reason: 'bye' })
    },
    addEventListener(type: string, listener: Listener) {
      const set = listeners.get(type) ?? new Set<Listener>()
      set.add(listener)
      listeners.set(type, set)
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.get(type)?.delete(listener)
    },
  }
  const dispatch = (type: string, event: unknown): void => {
    for (const listener of [...(listeners.get(type) ?? [])]) listener(event)
  }
  return { socket, dispatch, sent }
}

function createHandlers() {
  const emitted: Array<{ name: string; payload?: Record<string, unknown> }> = []
  const fake = createFakeSocket()
  const handlers = createSocketHandlers({
    emit: (name, payload) => emitted.push({ name, payload: payload as Record<string, unknown> }),
    createWebSocket: () => fake.socket,
  })
  return { handlers, ...fake, emitted }
}

describe('socket handlers', () => {
  test('relays open, message, error and close', () => {
    const { handlers, dispatch, emitted } = createHandlers()
    expect(handlers['socket.connect']({
      socketId: 's1',
      url: 'wss://example.com/ws',
    })).toEqual({ errMsg: 'connectSocket:ok' })

    dispatch('open', {})
    dispatch('message', { data: 'hello' })
    dispatch('message', { data: new Uint8Array([1, 2, 3]).buffer })
    dispatch('error', new Error('boom'))
    dispatch('close', { code: 1001, reason: 'bye' })

    expect(emitted.map((entry) => entry.name)).toEqual([
      'socketOpen',
      'socketMessage',
      'socketMessage',
      'socketError',
      'socketClose',
    ])
    expect(emitted[1].payload).toEqual({ socketId: 's1', data: 'hello', isBuffer: false })
    expect(emitted[2].payload).toEqual({ socketId: 's1', data: 'AQID', isBuffer: true })
    expect(emitted[4].payload).toMatchObject({ socketId: 's1', code: 1001, reason: 'bye' })
  })

  test('sends text and binary frames', () => {
    const { handlers, sent } = createHandlers()
    handlers['socket.connect']({ socketId: 's2', url: 'wss://example.com/ws' })
    handlers['socket.send']({ socketId: 's2', data: 'ping' })
    handlers['socket.send']({ socketId: 's2', data: 'AQID', isBuffer: true })
    expect(sent[0]).toBe('ping')
    expect(sent[1]).toBeInstanceOf(ArrayBuffer)
    expect([...new Uint8Array(sent[1] as ArrayBuffer)]).toEqual([1, 2, 3])
  })

  test('a constructor failure is reported instead of thrown', () => {
    const handlers = createSocketHandlers({
      emit: () => undefined,
      createWebSocket: () => {
        throw new Error('blocked by policy')
      },
    })
    expect(handlers['socket.connect']({ socketId: 's3', url: 'wss://example.com/ws' })).toEqual({
      errMsg: 'connectSocket:fail blocked by policy',
    })
  })

  test('sending on an unknown socket fails instead of throwing', () => {
    const handlers = createSocketHandlers({ emit: () => undefined, createWebSocket: () => createFakeSocket().socket })
    expect(handlers['socket.send']({ socketId: 'missing', data: 'x' })).toMatchObject({
      errMsg: 'sendSocketMessage:fail socket is not connected',
    })
  })
})
