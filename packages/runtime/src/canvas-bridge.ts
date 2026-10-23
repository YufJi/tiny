export type CanvasFrame = {
  canvasId: string
  dataUrl: string
  width: number
  height: number
}

export type BridgedCanvas = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  sendFrame: () => void
}

/**
 * Service-thread canvas that mirrors itself to the render thread as PNG
 * frames. Mini-program canvas libraries draw into the service thread; the
 * visible canvas lives in the render thread, so frames are forwarded over the
 * bridge after each batch of drawing calls.
 */
export function createBridgedCanvas(
  width: number,
  height: number,
  canvasId: string,
  send: (frame: CanvasFrame) => void,
): BridgedCanvas | null {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const target = canvas.getContext('2d')
  if (!target) return null

  let timer: ReturnType<typeof setTimeout> | null = null
  let lastSent = 0
  const sendFrame = () => {
    const id = canvasId || 'canvas'
    try {
      send({
        canvasId: id,
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      })
    } catch {
      // Snapshotting can fail while the canvas is being resized.
    }
  }
  const schedule = () => {
    if (timer) return
    const delay = Math.max(0, 50 - (Date.now() - lastSent))
    timer = setTimeout(() => {
      timer = null
      lastSent = Date.now()
      sendFrame()
    }, delay)
  }

  const wrapped = new Proxy(target, {
    get(object, property) {
      const value = (object as unknown as Record<string | symbol, unknown>)[property]
      if (typeof value === 'function') {
        return (...args: unknown[]) => {
          const result = (value as (...inner: unknown[]) => unknown).apply(object, args)
          schedule()
          return result
        }
      }
      return value
    },
    set(object, property, value) {
      ;(object as unknown as Record<string | symbol, unknown>)[property] = value
      schedule()
      return true
    },
  }) as CanvasRenderingContext2D

  Object.defineProperty(canvas, 'getContext', {
    configurable: true,
    value: (type: string) => (type === '2d' ? wrapped : null),
  })
  for (const dimension of ['width', 'height'] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, dimension)
    if (!descriptor?.get || !descriptor.set) continue
    Object.defineProperty(canvas, dimension, {
      configurable: true,
      get() {
        return descriptor.get!.call(canvas)
      },
      set(value: number) {
        descriptor.set!.call(canvas, value)
        schedule()
      },
    })
  }

  return { canvas, context: wrapped, sendFrame }
}

const LEGACY_STYLE_METHODS: Record<string, string> = {
  setFillStyle: 'fillStyle',
  setStrokeStyle: 'strokeStyle',
  setFontSize: 'font',
  setLineWidth: 'lineWidth',
  setGlobalAlpha: 'globalAlpha',
  setTextAlign: 'textAlign',
  setTextBaseline: 'textBaseline',
  setLineCap: 'lineCap',
  setLineJoin: 'lineJoin',
  setShadow: 'shadowColor',
}

/** Minimal `wx.createCanvasContext` facade over a bridged canvas. */
export function createLegacyCanvasContext(
  canvasId: string,
  send: (frame: CanvasFrame) => void,
  width = 300,
  height = 300,
): Record<string, unknown> | null {
  const bridged = createBridgedCanvas(width, height, canvasId, send)
  if (!bridged) return null
  const context = bridged.context
  const legacy: Record<string, unknown> = {
    draw: () => {
      bridged.sendFrame()
    },
  }
  for (const [method, property] of Object.entries(LEGACY_STYLE_METHODS)) {
    legacy[method] = (value: unknown) => {
      if (property === 'font' && typeof value === 'number') {
        context.font = `${value}px sans-serif`
      } else {
        ;(context as unknown as Record<string, unknown>)[property] = value
      }
    }
  }
  for (const method of [
    'fillRect', 'strokeRect', 'clearRect', 'beginPath', 'closePath',
    'moveTo', 'lineTo', 'arc', 'rect', 'fill', 'stroke', 'clip',
    'fillText', 'strokeText', 'translate', 'rotate', 'scale',
    'save', 'restore', 'drawImage',
  ]) {
    legacy[method] = (...args: unknown[]) => {
      const fn = (context as unknown as Record<string, (...inner: unknown[]) => unknown>)[method]
      if (typeof fn === 'function') fn.apply(context, args)
    }
  }
  return legacy
}
