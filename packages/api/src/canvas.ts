import type { ApiHost, ApiContext } from './context'
import { createAnimationStub } from './animation'

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
    createCanvasContext: (canvasId: unknown = 'canvas') => {
      const legacy = context.canvas?.createLegacyCanvasContext(
        String(canvasId || 'canvas'),
        { pageId: context.pageId },
      )
      return legacy ?? createCanvasContextStub()
    },
  }
}

function createCanvasContextStub(): Record<string, unknown> {
  return new Proxy({}, {
    get: () => () => undefined,
    set: () => true,
  })
}
