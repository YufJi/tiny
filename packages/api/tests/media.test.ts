import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost(handlers: Record<string, (params: Record<string, unknown>) => unknown>) {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return handlers[method]?.(params)
    },
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

describe('media picker', () => {
  test('chooseImage forwards the count and returns host paths', async () => {
    const { host, calls } = createHost({
      'media.chooseImage': (params) => ({
        tempFilePaths: [`blob:${String(params.count)}`],
        tempFiles: [{ path: `blob:${String(params.count)}`, size: 3 }],
        errMsg: 'chooseImage:ok',
      }),
    })
    const result = await host.chooseImage({ count: 2, sizeType: ['compressed'] })
    expect(result.tempFilePaths).toEqual(['blob:2'])
    expect(calls[0]).toMatchObject({
      method: 'media.chooseImage',
      params: { count: 2, sizeType: ['compressed'] },
    })
  })

  test('chooseMedia keeps the WeChat result shape', async () => {
    const { host } = createHost({
      'media.chooseMedia': () => ({
        type: 'image',
        tempFiles: [{ tempFilePath: 'blob:1', size: 4, fileType: 'image' }],
        errMsg: 'chooseMedia:ok',
      }),
    })
    const result = await host.chooseMedia({ count: 1, mediaType: ['image'] })
    expect(result.type).toBe('image')
    expect(result.tempFiles).toHaveLength(1)
  })

  test('previewImage forwards urls and current', async () => {
    const { host, calls } = createHost({
      'media.previewImage': () => ({ errMsg: 'previewImage:ok' }),
    })
    await host.previewImage({ urls: ['blob:1', 'blob:2'], current: 'blob:2' })
    expect(calls[0].params).toMatchObject({ urls: ['blob:1', 'blob:2'], current: 'blob:2' })
  })

  test('getImageInfo forwards src and a failure reaches fail', async () => {
    const { host } = createHost({
      'media.getImageInfo': (params) => (
        params.src === 'missing'
          ? { errMsg: 'getImageInfo:fail not found' }
          : { width: 10, height: 20, path: String(params.src), errMsg: 'getImageInfo:ok' }
      ),
    })
    await expect(host.getImageInfo({ src: 'blob:ok' })).resolves.toMatchObject({
      width: 10,
      height: 20,
      errMsg: 'getImageInfo:ok',
    })

    const failures: unknown[] = []
    await host.getImageInfo({ src: 'missing', fail: (value: unknown) => failures.push(value) })
    expect(failures).toHaveLength(1)
  })
})
