/**
 * Render-side Canvas 2D surface for the iOS host.
 *
 * The service thread records Canvas 2D calls and sends compact display lists
 * through the native relay. This module finds the real <canvas> in the page
 * iframe and replays those calls with the WebKit 2D context.
 */

type CanvasCommand = {
  type?: string
  pageId?: string
  canvasId?: string
  kind?: 'ops' | 'image' | 'release'
  ops?: unknown[]
  width?: number
  height?: number
  dpr?: number
  imageId?: string
  src?: string
}

type Surface = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  images: Map<string, HTMLImageElement>
  sized: boolean
  history: CanvasCommand[]
  replacementTimer?: ReturnType<typeof setTimeout>
}

const surfaces = new Map<string, Surface>()
const waiting = new Map<string, CanvasCommand[]>()
const retryTimers = new Map<string, ReturnType<typeof setTimeout>>()
let installed = false

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value)
  return value.replace(/["\\]/g, '\\$&')
}

function findCanvas(canvasId: string): HTMLCanvasElement | null {
  const id = String(canvasId || '')
  if (id) {
    const byAttribute = document.querySelector<HTMLCanvasElement>(
      `canvas[canvas-id="${cssEscape(id)}"]`,
    )
    if (byAttribute) return byAttribute
    const host = document.getElementById(id)
    const nested = host?.querySelector('canvas')
    if (nested) return nested
  }
  return document.querySelector<HTMLCanvasElement>('canvas')
}

function createSurface(canvas: HTMLCanvasElement): Surface | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  return { canvas, ctx, images: new Map(), sized: false, history: [] }
}

function ensureSized(surface: Surface, command: CanvasCommand): void {
  const width = Math.max(1, Math.round(Number(command.width) || surface.canvas.clientWidth || 300))
  const height = Math.max(1, Math.round(Number(command.height) || surface.canvas.clientHeight || 150))
  if (surface.sized && surface.canvas.width === width && surface.canvas.height === height) return
  surface.canvas.width = width
  surface.canvas.height = height
  surface.sized = true
  const ctx = surface.canvas.getContext('2d')
  if (ctx) surface.ctx = ctx
}

function resolveStyle(surface: Surface, value: unknown): string | CanvasGradient | CanvasPattern {
  if (!value || typeof value !== 'object') return String(value ?? '')
  const descriptor = value as {
    type?: string
    kind?: 'linear' | 'radial'
    coords?: number[]
    stops?: Array<{ offset?: number; color?: string }>
    imageId?: string
    repetition?: string
  }
  if (descriptor.type === 'gradient') {
    const coords = (descriptor.coords ?? []).map((item) => Number(item) || 0)
    let gradient: CanvasGradient
    if (descriptor.kind === 'radial') {
      gradient = surface.ctx.createRadialGradient(
        coords[0] ?? 0,
        coords[1] ?? 0,
        coords[2] ?? 0,
        coords[3] ?? 0,
        coords[4] ?? 0,
        coords[5] ?? 0,
      )
    } else {
      gradient = surface.ctx.createLinearGradient(
        coords[0] ?? 0,
        coords[1] ?? 0,
        coords[2] ?? 0,
        coords[3] ?? 0,
      )
    }
    for (const stop of descriptor.stops ?? []) {
      try {
        gradient.addColorStop(Number(stop.offset) || 0, String(stop.color ?? '#000000'))
      } catch {
        // Ignore a malformed stop; the rest of the canvas can still render.
      }
    }
    return gradient
  }
  if (descriptor.type === 'pattern') {
    const image = descriptor.imageId ? surface.images.get(descriptor.imageId) : undefined
    if (!image) return 'rgba(0, 0, 0, 0)'
    try {
      return surface.ctx.createPattern(image, descriptor.repetition || 'repeat') ?? 'rgba(0, 0, 0, 0)'
    } catch {
      return 'rgba(0, 0, 0, 0)'
    }
  }
  return String(value)
}

function applyCommand(surface: Surface, command: CanvasCommand, record = true): void {
  const { ctx } = surface
  ensureSized(surface, command)
  if (record) {
    surface.history.push(command)
    if (surface.history.length > 8) surface.history.shift()
  }

  if (command.kind === 'image' && command.imageId && command.src) {
    const image = new Image()
    image.onload = () => {
      surface.images.set(command.imageId!, image)
    }
    image.onerror = () => {
      console.warn(`[tiny ios] canvas image failed: ${command.src}`)
    }
    image.src = command.src
    return
  }

  for (const raw of command.ops ?? []) {
    if (!Array.isArray(raw) || raw.length === 0) continue
    const [name, ...args] = raw as [string, ...unknown[]]
    try {
      switch (name) {
        case 'set': {
          const [property, value] = args as [string, unknown]
          if (property === 'fillStyle' || property === 'strokeStyle') {
            ;(ctx as unknown as Record<string, unknown>)[property] = resolveStyle(surface, value)
          } else {
            ;(ctx as unknown as Record<string, unknown>)[property] = value
          }
          break
        }
        case 'resize': {
          const width = Number(args[0]) || 0
          const height = Number(args[1]) || 0
          if (width > 0 && height > 0) {
            surface.canvas.width = width
            surface.canvas.height = height
            surface.sized = true
          }
          break
        }
        case 'setLineDash':
          ctx.setLineDash((args[0] as number[]) ?? [])
          break
        case 'drawImage': {
          const image = surface.images.get(String(args[0] ?? ''))
          if (!image) break
          const rest = args.slice(1) as number[]
          if (rest.length >= 8) {
            ctx.drawImage(image, rest[0], rest[1], rest[2], rest[3], rest[4], rest[5], rest[6], rest[7])
          } else if (rest.length >= 4) {
            ctx.drawImage(image, rest[0], rest[1], rest[2], rest[3])
          } else if (rest.length >= 2) {
            ctx.drawImage(image, rest[0], rest[1])
          }
          break
        }
        case 'fillText':
        case 'strokeText': {
          const [text, x, y, maxWidth] = args as [string, number, number, number?]
          if (maxWidth !== undefined && maxWidth !== null) {
            ;(ctx as unknown as Record<string, (...inner: unknown[]) => void>)[name](
              text, x, y, maxWidth,
            )
          } else {
            ;(ctx as unknown as Record<string, (...inner: unknown[]) => void>)[name](text, x, y)
          }
          break
        }
        default: {
          const method = (ctx as unknown as Record<string, unknown>)[name]
          if (typeof method === 'function') {
            ;(method as (...inner: unknown[]) => void).apply(ctx, args)
          }
          break
        }
      }
    } catch (error) {
      console.warn(`[tiny ios] canvas op ${name} failed: ${String(error)}`)
    }
  }
}

function releaseSurface(canvasId: string): void {
  surfaces.delete(canvasId)
  waiting.delete(canvasId)
  const timer = retryTimers.get(canvasId)
  if (timer) clearTimeout(timer)
  retryTimers.delete(canvasId)
  const surface = surfaces.get(canvasId)
  if (surface?.replacementTimer) clearTimeout(surface.replacementTimer)
}

function enqueue(command: CanvasCommand): void {
  const canvasId = String(command.canvasId || 'canvas')
  if (command.kind === 'release') {
    releaseSurface(canvasId)
    return
  }
  const current = surfaces.get(canvasId)
  if (current && (!current.canvas.isConnected || current.canvas.getContext('2d') !== current.ctx)) {
    surfaces.delete(canvasId)
  }
  const surface = surfaces.get(canvasId) ?? (() => {
    const canvas = findCanvas(canvasId)
    if (!canvas) return null
    const created = createSurface(canvas)
    if (created) surfaces.set(canvasId, created)
    return created
  })()

  if (!surface) {
    const queue = waiting.get(canvasId) ?? []
    queue.push(command)
    if (queue.length > 256) queue.splice(0, queue.length - 256)
    waiting.set(canvasId, queue)
    if (!retryTimers.has(canvasId)) {
      retryTimers.set(canvasId, setTimeout(() => {
        retryTimers.delete(canvasId)
        const pending = waiting.get(canvasId) ?? []
        waiting.delete(canvasId)
        for (const item of pending) enqueue(item)
      }, 50))
    }
    return
  }

  const pending = waiting.get(canvasId)
  if (pending) {
    waiting.delete(canvasId)
    for (const item of pending) applyCommand(surface, item)
  }
  applyCommand(surface, command)
  if (surface.replacementTimer) return
  surface.replacementTimer = setTimeout(() => {
    surface.replacementTimer = undefined
    if (surface.canvas.isConnected) return
    const replacement = findCanvas(canvasId)
    if (!replacement) return
    const next = createSurface(replacement)
    if (!next) return
    surfaces.set(canvasId, next)
    const history = surface.history.slice()
    next.history = history.slice()
    for (const item of history) applyCommand(next, item, false)
  }, 200)
}

export function installRemoteCanvas(): void {
  if (installed) return
  installed = true
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    const data = event.data as { type?: string; command?: CanvasCommand } | undefined
    if (data?.type !== 'tiny-ios-canvas' || !data.command) return
    enqueue(data.command)
  })
}
