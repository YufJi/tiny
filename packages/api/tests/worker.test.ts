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

describe('createWorker', () => {
  test('creates a host worker and forwards postMessage', () => {
    const { host, calls } = createHost()
    const worker = host.createWorker('workers/fib/index.js')
    expect(calls[0]).toMatchObject({
      method: 'worker.create',
      params: { path: 'workers/fib/index.js' },
    })
    const workerId = String(calls[0].params.workerId)
    expect(workerId).toMatch(/^wx-worker-/)

    worker.postMessage({ n: 7 })
    expect(calls[1]).toMatchObject({
      method: 'worker.postMessage',
      params: { workerId, message: { n: 7 } },
    })
  })

  test('onMessage only receives replies for its own worker', () => {
    const { host, calls, events } = createHost()
    const worker = host.createWorker('workers/a.js')
    const workerId = String(calls[0].params.workerId)
    const received: unknown[] = []
    worker.onMessage((message: unknown) => received.push(message))

    events.emit('workerMessage', { workerId: 'other', message: 'ignored' })
    events.emit('workerMessage', { workerId, message: { result: 13 } })
    expect(received).toEqual([{ result: 13 }])
  })

  test('terminate stops delivery and tells the host', () => {
    const { host, calls, events } = createHost()
    const worker = host.createWorker('workers/a.js')
    const workerId = String(calls[0].params.workerId)
    const received: unknown[] = []
    worker.onMessage((message: unknown) => received.push(message))

    worker.terminate()
    expect(calls.at(-1)).toMatchObject({ method: 'worker.terminate', params: { workerId } })
    events.emit('workerMessage', { workerId, message: 'late' })
    expect(received).toEqual([])
  })

  test('offMessage removes a single listener', () => {
    const { host, calls, events } = createHost()
    const worker = host.createWorker('workers/a.js')
    const workerId = String(calls[0].params.workerId)
    const received: unknown[] = []
    const listener = (message: unknown) => received.push(message)
    worker.onMessage(listener)
    worker.offMessage(listener)
    events.emit('workerMessage', { workerId, message: 1 })
    expect(received).toEqual([])
  })
})
