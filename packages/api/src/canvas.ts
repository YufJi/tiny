import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { ApiHost, ApiContext } from './context'
import { createAnimationStub } from './animation'
import { callHost, runApi } from './run-api'

/**
 * Canvas and animation handles.
 *
 * A legacy canvas context is delegated to the host adapter when one exists;
 * hosts without one get a callable stub. Keeping both here means the kernel
 * never learns about the canvas API shape.
 */
export function createCanvasApi(context: ApiContext): ApiHost {
  return {
    createAnimation: (options: unknown = {}) => createAnimationStub(options),
    createContext: () => createCanvasContextStub(),
    createOffscreenCanvas: (params: unknown = {}) => {
      const options = (params ?? {}) as { width?: unknown; height?: unknown; type?: unknown }
      const canvas = context.canvas?.createOffscreenCanvas?.({
        width: Number(options.width ?? 0),
        height: Number(options.height ?? 0),
        ...(typeof options.type === 'string' ? { type: options.type } : {}),
      })
      if (!canvas) {
        context.connection.sendDiagnostic('warn', {
          code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
          message: `${context.apiName}.createOffscreenCanvas is not available on this host`,
        }, context.pageId)
        return null
      }
      return canvas
    },
    canvasGetImageData: (params: unknown = {}) => runApi(
      params,
      'canvasGetImageData',
      () => readCanvasPixels(params),
    ),
    canvasPutImageData: (params: unknown = {}) => runApi(
      params,
      'canvasPutImageData',
      () => writeCanvasPixels(params),
    ),
    canvasToTempFilePath: (params: unknown = {}) => runApi(
      params,
      'canvasToTempFilePath',
      () => exportCanvasToTempFile(context, params as Record<string, unknown>),
    ),
    createCanvasContext: (canvasId: unknown = 'canvas') => {
      const legacy = context.canvas?.createLegacyCanvasContext(
        String(canvasId || 'canvas'),
        { pageId: context.pageId },
      )
      return legacy ?? createCanvasContextStub()
    },
  }
}

type Canvas2DLike = {
  getImageData?: (x: number, y: number, width: number, height: number) => {
    data: Uint8ClampedArray
    width: number
    height: number
  }
  putImageData?: (image: { data: Uint8ClampedArray }, x: number, y: number) => void
  createImageData?: (width: number, height: number) => {
    data: Uint8ClampedArray
    width: number
    height: number
  }
}

function canvasContext2d(canvas: unknown): Canvas2DLike {
  const node = canvas as { getContext?: (type: string) => unknown } | undefined
  if (!node || typeof node.getContext !== 'function') {
    throw new Error('a canvas node from createSelectorQuery().node() is required')
  }
  const context = node.getContext('2d') as Canvas2DLike | null
  if (!context) throw new Error('the canvas has no 2d context')
  return context
}

function readCanvasPixels(params: unknown): Record<string, unknown> {
  const options = (params ?? {}) as Record<string, unknown>
  const width = Number(options.width ?? 0)
  const height = Number(options.height ?? 0)
  if (width <= 0 || height <= 0) throw new Error('width and height must be positive')
  const context = canvasContext2d(options.canvas)
  if (typeof context.getImageData !== 'function') throw new Error('getImageData is unavailable')
  const image = context.getImageData(Number(options.x ?? 0), Number(options.y ?? 0), width, height)
  return {
    data: image.data,
    width: image.width,
    height: image.height,
    errMsg: 'canvasGetImageData:ok',
  }
}

function writeCanvasPixels(params: unknown): Record<string, unknown> {
  const options = (params ?? {}) as Record<string, unknown>
  const width = Number(options.width ?? 0)
  const height = Number(options.height ?? 0)
  if (width <= 0 || height <= 0) throw new Error('width and height must be positive')
  const context = canvasContext2d(options.canvas)
  if (typeof context.putImageData !== 'function') throw new Error('putImageData is unavailable')
  const image = typeof context.createImageData === 'function'
    ? context.createImageData(width, height)
    : typeof ImageData === 'undefined' ? undefined : new ImageData(width, height)
  if (!image) throw new Error('ImageData is unavailable in this runtime')
  const bytes = pixelBytes(options.data)
  image.data.set(bytes.subarray(0, image.data.length))
  context.putImageData(image, Number(options.x ?? 0), Number(options.y ?? 0))
  return { errMsg: 'canvasPutImageData:ok' }
}

function pixelBytes(value: unknown): Uint8ClampedArray {
  if (value instanceof Uint8ClampedArray) return value
  if (value instanceof Uint8Array) return new Uint8ClampedArray(value)
  if (value instanceof ArrayBuffer) return new Uint8ClampedArray(value)
  if (Array.isArray(value)) return new Uint8ClampedArray(value as number[])
  throw new Error('data must be a pixel array or ArrayBuffer')
}

/**
 * WeChat accepts either a canvas node (from `createSelectorQuery().node()`) or
 * a `canvasId`. Only the node path can be exported today: the legacy context
 * facade buffers draw calls and never hands back the backing surface. A
 * `canvasId` call therefore fails instead of returning an empty file.
 */
async function exportCanvasToTempFile(
  context: ApiContext,
  params: Record<string, unknown>,
): Promise<unknown> {
  const fileType = String(params.fileType ?? 'png')
  const quality = params.quality === undefined ? 1 : Number(params.quality)
  const dataUrl = readCanvasDataUrl(params.canvas, fileType, quality)
  if (!dataUrl) {
    throw new Error(params.canvasId
      ? 'canvasToTempFilePath needs a canvas node; canvasId export is not supported by this host'
      : 'canvasToTempFilePath needs a canvas node')
  }
  return callHost(context, 'media.dataUrlToTempFile', { dataUrl, fileType, quality })
}

function readCanvasDataUrl(canvas: unknown, fileType: string, quality: number): string | undefined {
  if (!canvas || typeof canvas !== 'object') return undefined
  const toDataURL = (canvas as { toDataURL?: unknown }).toDataURL
  if (typeof toDataURL !== 'function') return undefined
  const value = (toDataURL as (type?: string, quality?: number) => unknown)
    .call(canvas, `image/${fileType}`, quality)
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function createCanvasContextStub(): Record<string, unknown> {
  return new Proxy({}, {
    get: () => () => undefined,
    set: () => true,
  })
}
