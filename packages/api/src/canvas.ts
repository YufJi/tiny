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
