import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  let polls = 0
  const connection = {
    sendDiagnostic: () => undefined,
    call: async (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      if (method === 'network.taskProgress') {
        polls += 1
        return { loaded: polls * 25, total: 100, done: polls >= 2 }
      }
      if (method === 'network.uploadFile') {
        await wait(120)
        return { statusCode: 200, data: '{"ok":true}', errMsg: 'uploadFile:ok' }
      }
      if (method === 'network.downloadFile') {
        await wait(120)
        return { tempFilePath: 'blob:downloaded', statusCode: 200, errMsg: 'downloadFile:ok' }
      }
      if (method === 'network.abortTask') return { errMsg: 'abortTask:ok' }
      return {}
    },
    callSync: () => undefined,
  }
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
  }
}

describe('file transfer tasks', () => {
  test('uploadFile reports progress and resolves through success', async () => {
    const { host, calls } = createHost()
    const progress: Array<{ progress: number }> = []
    const successes: unknown[] = []
    const task = host.uploadFile({
      url: 'https://example.com/upload',
      filePath: 'blob:1',
      name: 'file',
      success: (value: unknown) => successes.push(value),
    })
    task.onProgressUpdate((event: { progress: number }) => progress.push(event))
    await wait(200)

    expect(calls.some((call) => call.method === 'network.uploadFile')).toBe(true)
    expect(calls.some((call) => call.method === 'network.taskProgress')).toBe(true)
    expect(progress.length).toBeGreaterThan(0)
    expect(progress[0].progress).toBe(25)
    expect(successes).toHaveLength(1)
    expect(successes[0]).toMatchObject({ statusCode: 200 })
  })

  test('downloadFile returns a host temp path', async () => {
    const { host } = createHost()
    const successes: Array<{ tempFilePath?: string }> = []
    host.downloadFile({
      url: 'https://example.com/file.png',
      success: (value: { tempFilePath?: string }) => successes.push(value),
    })
    await wait(170)
    expect(successes[0].tempFilePath).toBe('blob:downloaded')
  })

  test('abort cancels the host transfer and stops polling', async () => {
    const { host, calls } = createHost()
    const task = host.uploadFile({ url: 'https://example.com/upload', filePath: 'blob:1' })
    task.abort()
    await wait(20)
    expect(calls.map((call) => call.method)).toContain('network.abortTask')
  })
})
