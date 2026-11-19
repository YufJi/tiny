import { describe, expect, test } from 'vitest'
import { createTempFileRegistry } from '../src/media-files'
import { createNetworkHandlers } from '../src/network-tasks'

function createRegistry() {
  let counter = 0
  return createTempFileRegistry(() => `blob:test/${++counter}`)
}

describe('network handlers', () => {
  test('downloadFile stores the body as a temp file and marks the task done', async () => {
    const registry = createRegistry()
    const handlers = createNetworkHandlers({ registry })
    const result = await handlers['network.downloadFile']({
      taskId: 'task-1',
      url: 'data:text/plain;base64,aGVsbG8=',
    })
    expect(result.errMsg).toBe('downloadFile:ok')
    expect(result.tempFilePath).toBe('blob:test/1')
    expect(result.statusCode).toBe(200)
    expect(registry.get('blob:test/1')?.size).toBe(5)

    expect(handlers['network.taskProgress']({ taskId: 'task-1' })).toMatchObject({
      loaded: 5,
      done: true,
    })
  })

  test('uploadFile fails honestly when the host has no XMLHttpRequest', async () => {
    const registry = createRegistry()
    registry.add(new Blob(['abc']), 'a.txt')
    const handlers = createNetworkHandlers({ registry })
    const result = await handlers['network.uploadFile']({
      taskId: 'task-2',
      url: 'https://example.com/upload',
      filePath: 'blob:test/1',
      name: 'file',
    })
    expect(String(result.errMsg)).toContain('uploadFile:fail')
  })

  test('uploadFile rejects an unknown temp file', async () => {
    const handlers = createNetworkHandlers({ registry: createRegistry() })
    await expect(handlers['network.uploadFile']({
      taskId: 'task-3',
      url: 'https://example.com/upload',
      filePath: 'blob:missing',
    })).resolves.toMatchObject({ errMsg: expect.stringContaining('temp file not found') })
  })

  test('abortTask marks the record done', async () => {
    const registry = createRegistry()
    registry.add(new Blob(['abc']), 'a.txt')
    const handlers = createNetworkHandlers({ registry })
    const download = handlers['network.downloadFile']({
      taskId: 'task-4',
      url: 'data:text/plain;base64,aGVsbG8=',
    })
    handlers['network.abortTask']({ taskId: 'task-4' })
    await download
    expect(handlers['network.taskProgress']({ taskId: 'task-4' })).toMatchObject({ done: true })
  })
})
