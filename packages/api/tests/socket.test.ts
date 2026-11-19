import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost, createGlobalEventHub } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const events = createGlobalEventHub()
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve({ errMsg: `${method}:ok` })
    },
    callSync: () => undefined,
  }
  const context = {
    connection,
    events,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    events,
  }
}

const tick = () => Promise.resolve()

describe('web sockets', () => {
  test('connectSocket talks to the host and returns a task', async () => {
    const { host, calls } = createHost()
    const task = host.connectSocket({
      url: 'wss://example.com/ws',
      protocols: ['chat'],
      header: { token: 'x' },
    })
    await tick()
    expect(calls[0]).toMatchObject({
      method: 'socket.connect',
      params: {
        url: 'wss://example.com/ws',
        protocols: ['chat'],
        header: { token: 'x' },
      },
    })
    expect(typeof task.send).toBe('function')
    expect(typeof task.onMessage).toBe('function')
  })

  test('task events are filtered by socket id', async () => {
    const { host, calls, events } = createHost()
    const task = host.connectSocket({ url: 'wss://example.com/ws' })
    await tick()
    const socketId = String(calls[0].params.socketId)
    const messages: string[] = []
    task.onMessage((event: { data: string }) => messages.push(event.data))

    events.emit('socketMessage', { socketId, data: 'hello', isBuffer: false })
    events.emit('socketMessage', { socketId: 'other', data: 'nope', isBuffer: false })
    expect(messages).toEqual(['hello'])
  })

  test('global socket handlers receive every socket event', async () => {
    const { host, calls, events } = createHost()
    host.connectSocket({ url: 'wss://example.com/ws' })
    await tick()
    const socketId = String(calls[0].params.socketId)
    const seen: unknown[] = []
    host.onSocketOpen((event: unknown) => seen.push(event))
    events.emit('socketOpen', { socketId, header: {} })
    expect(seen).toHaveLength(1)
  })

  test('task send and close reach the host', async () => {
    const { host, calls } = createHost()
    const task = host.connectSocket({ url: 'wss://example.com/ws' })
    await tick()
    const socketId = String(calls[0].params.socketId)

    task.send({ data: 'ping' })
    task.send({ data: new Uint8Array([1, 2, 3]).buffer })
    task.close({ code: 1001, reason: 'bye' })
    await tick()

    expect(calls[1]).toMatchObject({ method: 'socket.send', params: { socketId, data: 'ping' } })
    expect(calls[2]).toMatchObject({
      method: 'socket.send',
      params: { socketId, data: 'AQID', isBuffer: true },
    })
    expect(calls[3]).toMatchObject({
      method: 'socket.close',
      params: { socketId, code: 1001, reason: 'bye' },
    })
  })

  test('global send fails without a socket instead of throwing', async () => {
    const { host } = createHost()
    const failures: Array<{ errMsg?: string }> = []
    await host.sendSocketMessage({ data: 'x', fail: (value: { errMsg?: string }) => failures.push(value) })
    expect(failures[0]?.errMsg).toContain('sendSocketMessage:fail')
  })
})
