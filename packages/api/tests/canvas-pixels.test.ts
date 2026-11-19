import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown> }> = []
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params })
      return Promise.resolve({})
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

function createCanvas() {
  const writes: Array<{ data: Uint8ClampedArray; x: number; y: number }> = []
  const context = {
    getImageData(x: number, y: number, width: number, height: number) {
      return {
        data: new Uint8ClampedArray(width * height * 4).fill(7),
        width,
        height,
        x,
        y,
      }
    },
    createImageData(width: number, height: number) {
      return { data: new Uint8ClampedArray(width * height * 4), width, height }
    },
    putImageData(image: { data: Uint8ClampedArray }, x: number, y: number) {
      writes.push({ data: image.data, x, y })
    },
  }
  return { canvas: { getContext: () => context }, writes }
}

describe('canvas pixels', () => {
  test('canvasGetImageData returns the raw pixels', async () => {
    const { host } = createHost()
    const { canvas } = createCanvas()
    const result = await host.canvasGetImageData({ canvas, x: 0, y: 0, width: 2, height: 2 })
    expect(result).toMatchObject({
      width: 2,
      height: 2,
      errMsg: 'canvasGetImageData:ok',
    })
    expect(result.data).toBeInstanceOf(Uint8ClampedArray)
    expect(result.data).toHaveLength(16)
  })

  test('canvasPutImageData writes the bytes into the context', async () => {
    const { host } = createHost()
    const { canvas, writes } = createCanvas()
    await expect(host.canvasPutImageData({
      canvas,
      x: 1,
      y: 2,
      width: 1,
      height: 1,
      data: new Uint8ClampedArray([1, 2, 3, 255]),
    })).resolves.toEqual({ errMsg: 'canvasPutImageData:ok' })
    expect(writes[0]).toMatchObject({ x: 1, y: 2 })
    expect([...writes[0].data]).toEqual([1, 2, 3, 255])
  })

  test('a missing canvas node fails through the callback', async () => {
    const { host } = createHost()
    const failures: Array<{ errMsg?: string }> = []
    await host.canvasGetImageData({
      width: 1,
      height: 1,
      fail: (value: { errMsg?: string }) => failures.push(value),
    })
    expect(failures[0]?.errMsg).toContain('canvasGetImageData:fail')
  })
})
