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

  test('chooseVideo and getVideoInfo forward through the host', async () => {
    const { host, calls } = createHost({
      'media.chooseVideo': () => ({
        tempFilePath: 'blob:v',
        duration: 3,
        size: 1024,
        width: 640,
        height: 360,
        errMsg: 'chooseVideo:ok',
      }),
      'media.getVideoInfo': (params) => ({
        width: 640,
        height: 360,
        duration: 3,
        path: String(params.src),
        errMsg: 'getVideoInfo:ok',
      }),
    })
    await expect(host.chooseVideo({ maxDuration: 60 })).resolves.toMatchObject({
      tempFilePath: 'blob:v',
      duration: 3,
    })
    await expect(host.getVideoInfo({ src: 'blob:v' })).resolves.toMatchObject({
      path: 'blob:v',
      width: 640,
    })
    expect(calls.map((call) => call.method)).toEqual(['media.chooseVideo', 'media.getVideoInfo'])
  })

  test('previewMedia and album saves keep the callback contract', async () => {
    const { host, calls } = createHost({
      'media.previewMedia': () => ({ errMsg: 'previewMedia:ok' }),
      'media.saveImageToPhotosAlbum': () => ({ errMsg: 'saveImageToPhotosAlbum:ok' }),
      'media.saveVideoToPhotosAlbum': () => ({ errMsg: 'saveVideoToPhotosAlbum:fail not supported' }),
    })
    await host.previewMedia({ sources: [{ url: 'blob:1', type: 'image' }], current: 0 })
    await expect(host.saveImageToPhotosAlbum({ filePath: 'blob:1' })).resolves.toMatchObject({
      errMsg: 'saveImageToPhotosAlbum:ok',
    })

    const failures: unknown[] = []
    await host.saveVideoToPhotosAlbum({ filePath: 'blob:v', fail: (value: unknown) => failures.push(value) })
    expect(failures).toHaveLength(1)
    expect(calls.map((call) => call.method)).toEqual([
      'media.previewMedia',
      'media.saveImageToPhotosAlbum',
      'media.saveVideoToPhotosAlbum',
    ])
  })

  test('canvasToTempFilePath exports a canvas node through the host', async () => {
    const { host, calls } = createHost({
      'media.dataUrlToTempFile': () => ({ tempFilePath: 'blob:canvas', errMsg: 'canvasToTempFilePath:ok' }),
    })
    const canvas = { toDataURL: (type: string) => `data:${type};base64,AAAA` }
    const result = await host.canvasToTempFilePath({ canvas, fileType: 'jpg', quality: 0.8 })
    expect(result).toMatchObject({ tempFilePath: 'blob:canvas' })
    expect(calls[0]).toMatchObject({
      method: 'media.dataUrlToTempFile',
      params: { dataUrl: 'data:image/jpg;base64,AAAA', fileType: 'jpg', quality: 0.8 },
    })
  })

  test('canvasToTempFilePath fails honestly for a canvasId-only call', async () => {
    const { host } = createHost({})
    const failures: Array<{ errMsg?: string }> = []
    await host.canvasToTempFilePath({ canvasId: 'chart', fail: (value: { errMsg?: string }) => failures.push(value) })
    expect(failures).toHaveLength(1)
    expect(failures[0].errMsg).toContain('canvasToTempFilePath:fail')
  })

  test('chooseMessageFile and compressImage forward their parameters', async () => {
    const { host, calls } = createHost({
      'media.chooseMessageFile': () => ({
        tempFiles: [{ path: 'blob:doc', size: 3, name: 'a.pdf', type: 'application/pdf' }],
        errMsg: 'chooseMessageFile:ok',
      }),
      'media.compressImage': (params) => ({
        tempFilePath: 'blob:small',
        errMsg: 'compressImage:ok',
        quality: params.quality,
      }),
    })
    await expect(host.chooseMessageFile({ count: 5 })).resolves.toMatchObject({
      tempFiles: [{ name: 'a.pdf' }],
    })
    await expect(host.compressImage({ src: 'blob:big', quality: 70 })).resolves.toMatchObject({
      tempFilePath: 'blob:small',
    })
    expect(calls.map((call) => call.method)).toEqual([
      'media.chooseMessageFile',
      'media.compressImage',
    ])
  })
})
