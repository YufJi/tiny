import { describe, expect, test } from 'vitest'
import { createWorkerHandlers, WORKER_BOOTSTRAP, wrapWorkerSource } from '../src/workers'

type FakeWorker = {
  source: string
  posted: unknown[]
  onmessage: ((event: { data?: unknown }) => void) | null
  terminated: boolean
  postMessage(message: unknown): void
  terminate(): void
}

function createFakeSpawn() {
  const workers: FakeWorker[] = []
  const spawn = (source: string) => {
    const worker: FakeWorker = {
      source,
      posted: [],
      onmessage: null,
      terminated: false,
      postMessage(message) {
        worker.posted.push(message)
      },
      terminate() {
        worker.terminated = true
      },
    }
    workers.push(worker)
    return worker
  }
  return { workers, spawn }
}

describe('worker handlers', () => {
  test('wraps the script with the worker bootstrap and relays replies', async () => {
    const emitted: Array<{ name: string; payload?: unknown }> = []
    const { workers, spawn } = createFakeSpawn()
    const handlers = createWorkerHandlers({
      resolveWorkerUrl: (path) => `/app/${path}`,
      emit: (name, payload) => emitted.push({ name, payload }),
      fetchSource: async () => 'worker.onMessage(() => {})',
      spawn,
    })

    await expect(handlers['worker.create']({ workerId: 'w1', path: 'workers/a.js' })).resolves.toEqual({
      errMsg: 'createWorker:ok',
    })
    expect(workers[0].source.startsWith(WORKER_BOOTSTRAP)).toBe(true)
    expect(workers[0].source).toContain('worker.onMessage')

    workers[0].onmessage?.({ data: { __tinyWorker: true, data: { result: 1 } } })
    expect(emitted).toEqual([{
      name: 'workerMessage',
      payload: { workerId: 'w1', message: { result: 1 } },
    }])
  })

  test('queues messages that arrive before the worker is ready', async () => {
    const { workers, spawn } = createFakeSpawn()
    const handlers = createWorkerHandlers({
      resolveWorkerUrl: (path) => path,
      emit: () => undefined,
      fetchSource: async () => '',
      spawn,
    })
    handlers['worker.postMessage']({ workerId: 'w2', message: { early: true } })
    await handlers['worker.create']({ workerId: 'w2', path: 'workers/a.js' })
    expect(workers[0].posted).toEqual([{ __tinyWorkerHost: true, data: { early: true } }])
  })

  test('reports a missing script instead of hanging', async () => {
    const handlers = createWorkerHandlers({
      resolveWorkerUrl: (path) => path,
      emit: () => undefined,
      fetchSource: async () => {
        throw new Error('HTTP 404 for workers/missing.js')
      },
    })
    await expect(handlers['worker.create']({ workerId: 'w3', path: 'workers/missing.js' })).resolves.toEqual({
      errMsg: 'createWorker:fail HTTP 404 for workers/missing.js',
    })
  })

  test('terminate drops the worker', async () => {
    const { workers, spawn } = createFakeSpawn()
    const handlers = createWorkerHandlers({
      resolveWorkerUrl: (path) => path,
      emit: () => undefined,
      fetchSource: async () => '',
      spawn,
    })
    await handlers['worker.create']({ workerId: 'w4', path: 'workers/a.js' })
    handlers['worker.terminate']({ workerId: 'w4' })
    expect(workers[0].terminated).toBe(true)
    handlers['worker.postMessage']({ workerId: 'w4', message: 1 })
    expect(workers[0].posted).toHaveLength(0)
  })

  test('wrapWorkerSource keeps the user code after the bootstrap', () => {
    expect(wrapWorkerSource('self.x = 1')).toBe(`${WORKER_BOOTSTRAP}\nself.x = 1`)
  })
})
