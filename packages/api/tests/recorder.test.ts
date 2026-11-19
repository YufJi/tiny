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

describe('recorder manager', () => {
  test('start forwards the recording options', async () => {
    const { host, calls } = createHost()
    const manager = host.getRecorderManager()
    await manager.start({ duration: 60000, sampleRate: 44100, format: 'mp3' })
    expect(calls[0]).toMatchObject({
      method: 'recorder.start',
      params: { duration: 60000, sampleRate: 44100, format: 'mp3' },
    })
  })

  test('pause/resume/stop reach the host', async () => {
    const { host, calls } = createHost()
    const manager = host.getRecorderManager()
    manager.pause()
    manager.resume()
    manager.stop()
    await Promise.resolve()
    expect(calls.map((call) => call.method)).toEqual([
      'recorder.pause',
      'recorder.resume',
      'recorder.stop',
    ])
  })

  test('host events reach the matching listeners', async () => {
    const { host, calls, events } = createHost()
    const manager = host.getRecorderManager()
    await manager.start({})
    const recorderId = String(calls[0].params.recorderId)

    const started: unknown[] = []
    const stopped: unknown[] = []
    manager.onStart((event: unknown) => started.push(event))
    manager.onStop((event: unknown) => stopped.push(event))

    events.emit('recorderStateChange', { recorderId, type: 'start' })
    events.emit('recorderStateChange', {
      recorderId,
      type: 'stop',
      tempFilePath: 'blob:rec',
      duration: 1200,
      fileSize: 42,
    })
    events.emit('recorderStateChange', { recorderId: 'other', type: 'start' })

    expect(started).toHaveLength(1)
    expect(stopped).toHaveLength(1)
    expect(stopped[0]).toMatchObject({ tempFilePath: 'blob:rec', duration: 1200 })
  })
})
