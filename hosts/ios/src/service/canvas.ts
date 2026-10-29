import type {
  CanvasNodeHandle,
  CanvasNodeRequest,
  ServiceCanvasAdapter,
} from '@tiny/runtime'

/**
 * iOS Canvas 2D adapter.
 *
 * JavaScriptCore has no DOM or OffscreenCanvas, so the service thread keeps a
 * synchronous recorder. Draw calls are batched into a compact display list and
 * replayed against the real <canvas> inside the page render iframe.
 *
 * `measureText` is the one API that cannot be replayed asynchronously: ECharts
 * uses it during layout. It is served by a synchronous CoreText callback that
 * the native host installs as `__tinyCanvasMeasureText`.
 */

type HostGlobal = Record<string, any>
type CanvasOp = unknown[]
type CanvasState = Record<string, unknown>
type CanvasSend = (payload: Record<string, unknown>) => void

type GradientDescriptor = {
  type: 'gradient'
  id: string
  kind: 'linear' | 'radial'
  coords: number[]
  stops: Array<{ offset: number; color: string }>
}

type PatternDescriptor = {
  type: 'pattern'
  imageId: string
  repetition: string
}

type CanvasStyle = string | GradientDescriptor | PatternDescriptor

const host = globalThis as unknown as HostGlobal
const STYLE_PROPERTIES = [
  'fillStyle',
  'strokeStyle',
  'lineWidth',
  'lineCap',
  'lineJoin',
  'miterLimit',
  'globalAlpha',
  'globalCompositeOperation',
  'font',
  'textAlign',
  'textBaseline',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'lineDashOffset',
  'imageSmoothingEnabled',
] as const

const INITIAL_STATE: CanvasState = {
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  lineDashOffset: 0,
  imageSmoothingEnabled: true,
}

let operationId = 0
let warnedReadback = false

function nextId(prefix: string): string {
  operationId += 1
  return `${prefix}-${operationId.toString(36)}`
}

function pixelRatio(): number {
  const value = Number(host.__TINY_IOS__?.system?.pixelRatio)
  return Number.isFinite(value) && value > 0 ? value : 2
}

function parseFontSize(font: string): number {
  const match = /(\d+(?:\.\d+)?)px/i.exec(font)
  const size = match ? Number(match[1]) : 10
  return Number.isFinite(size) && size > 0 ? size : 10
}

function fallbackMetrics(font: string, text: string): Record<string, number> {
  const size = parseFontSize(font)
  const lines = String(text).split('\n')
  const width = Math.max(...lines.map((line) => line.length * size * 0.55), 0)
  return {
    width,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: width,
    actualBoundingBoxAscent: size * 0.8,
    actualBoundingBoxDescent: size * 0.2,
    fontBoundingBoxAscent: size * 0.9,
    fontBoundingBoxDescent: size * 0.25,
    emHeightAscent: size * 0.8,
    emHeightDescent: size * 0.2,
  }
}

function measureText(font: string, text: string): Record<string, number> {
  const fn = host.__tinyCanvasMeasureText
  if (typeof fn === 'function') {
    try {
      const value = fn(String(font), String(text))
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      if (parsed && typeof parsed === 'object' && Number.isFinite(Number(parsed.width))) {
        return parsed as Record<string, number>
      }
    } catch {
      // Fall through to the deterministic approximation below.
    }
  }
  return fallbackMetrics(font, text)
}

function serializeStyle(value: unknown): CanvasStyle {
  if (value instanceof RemoteGradient) {
    value.markUsed()
    return value.toDescriptor()
  }
  if (value instanceof RemotePattern) return value.toDescriptor()
  return String(value ?? '')
}

class RemoteGradient {
  readonly id = nextId('gradient')
  readonly stops: Array<{ offset: number; color: string }> = []
  private usedStyle: 'fillStyle' | 'strokeStyle' | undefined

  constructor(
    private readonly owner: RemoteCanvas2D,
    private readonly kind: 'linear' | 'radial',
    private readonly coords: number[],
  ) {}

  addColorStop(offset: unknown, color: unknown): void {
    const normalized = Math.max(0, Math.min(1, Number(offset) || 0))
    this.stops.push({ offset: normalized, color: String(color ?? '#000000') })
    if (this.usedStyle) this.owner.emitStyle(this.usedStyle)
  }

  markUsed(style?: 'fillStyle' | 'strokeStyle'): void {
    if (style) this.usedStyle = style
  }

  toDescriptor(): GradientDescriptor {
    return {
      type: 'gradient',
      id: this.id,
      kind: this.kind,
      coords: this.coords,
      stops: this.stops.slice(),
    }
  }
}

class RemotePattern {
  readonly id = nextId('pattern')

  constructor(
    private readonly imageId: string,
    private readonly repetition: string,
  ) {}

  toDescriptor(): PatternDescriptor {
    return {
      type: 'pattern',
      imageId: this.imageId,
      repetition: this.repetition,
    }
  }
}

class RemoteImage {
  readonly id = nextId('image')
  onload: ((event?: unknown) => void) | null = null
  onerror: ((event?: unknown) => void) | null = null
  width = 0
  height = 0
  complete = false
  private currentSource = ''

  constructor(private readonly recorder: RemoteCanvas2D) {}

  get src(): string {
    return this.currentSource
  }

  set src(value: string) {
    this.currentSource = String(value ?? '')
    this.recorder.emitImage(this.id, this.currentSource)
  }

  markLoaded(width: number, height: number): void {
    this.width = width
    this.height = height
    this.complete = true
    this.onload?.({ type: 'load', target: this })
  }

  markError(): void {
    this.onerror?.({ type: 'error', target: this })
  }
}

class RemoteCanvas2D {
  fillStyle: unknown
  strokeStyle: unknown
  lineWidth: unknown
  lineCap: unknown
  lineJoin: unknown
  miterLimit: unknown
  globalAlpha: unknown
  globalCompositeOperation: unknown
  font: unknown
  textAlign: unknown
  textBaseline: unknown
  shadowBlur: unknown
  shadowColor: unknown
  shadowOffsetX: unknown
  shadowOffsetY: unknown
  lineDashOffset: unknown
  imageSmoothingEnabled: unknown

  private ops: CanvasOp[] = []
  private timer: ReturnType<typeof setTimeout> | undefined
  private state: CanvasState = { ...INITIAL_STATE }
  private stateStack: CanvasState[] = []
  private lineDash: number[] = []
  private readonly emittedOnce = new Set<string>()

  width: number
  height: number

  constructor(
    private readonly send: CanvasSend,
    private readonly pageId: string,
    private readonly canvasId: string,
    width: number,
    height: number,
  ) {
    this.width = Math.max(0, Math.round(width) || 0)
    this.height = Math.max(0, Math.round(height) || 0)

    for (const property of STYLE_PROPERTIES) {
      Object.defineProperty(this, property, {
        configurable: true,
        enumerable: true,
        get: () => this.state[property],
        set: (value: unknown) => {
          if ((property === 'fillStyle' || property === 'strokeStyle')
            && value instanceof RemoteGradient) {
            value.markUsed(property)
          }
          this.state[property] = value
          this.push('set', property, serializeStyle(value))
        },
      })
    }
  }

  emitStyle(property: 'fillStyle' | 'strokeStyle'): void {
    this.push('set', property, serializeStyle(this.state[property]))
  }

  resize(width: number, height: number): void {
    const nextWidth = Math.max(0, Math.round(Number(width) || 0))
    const nextHeight = Math.max(0, Math.round(Number(height) || 0))
    if (nextWidth === this.width && nextHeight === this.height) return
    this.width = nextWidth
    this.height = nextHeight
    this.push('resize', nextWidth, nextHeight)
  }

  save(): void {
    this.stateStack.push({ ...this.state })
    this.push('save')
  }

  restore(): void {
    const previous = this.stateStack.pop()
    if (previous) this.state = previous
    this.push('restore')
  }

  beginPath(): void { this.push('beginPath') }
  closePath(): void { this.push('closePath') }
  moveTo(x: number, y: number): void { this.push('moveTo', x, y) }
  lineTo(x: number, y: number): void { this.push('lineTo', x, y) }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.push('bezierCurveTo', cp1x, cp1y, cp2x, cp2y, x, y)
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.push('quadraticCurveTo', cpx, cpy, x, y)
  }
  arc(x: number, y: number, radius: number, start: number, end: number, ccw?: boolean): void {
    this.push('arc', x, y, radius, start, end, Boolean(ccw))
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.push('arcTo', x1, y1, x2, y2, radius)
  }
  rect(x: number, y: number, width: number, height: number): void {
    this.push('rect', x, y, width, height)
  }
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    start: number,
    end: number,
    ccw?: boolean,
  ): void {
    this.push('ellipse', x, y, radiusX, radiusY, rotation, start, end, Boolean(ccw))
  }
  fill(): void { this.push('fill') }
  stroke(): void { this.push('stroke') }
  clip(): void { this.push('clip') }
  fillRect(x: number, y: number, width: number, height: number): void {
    this.push('fillRect', x, y, width, height)
  }
  strokeRect(x: number, y: number, width: number, height: number): void {
    this.push('strokeRect', x, y, width, height)
  }
  clearRect(x: number, y: number, width: number, height: number): void {
    this.push('clearRect', x, y, width, height)
  }
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.push('fillText', text, x, y, maxWidth)
  }
  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    this.push('strokeText', text, x, y, maxWidth)
  }
  translate(x: number, y: number): void { this.push('translate', x, y) }
  rotate(angle: number): void { this.push('rotate', angle) }
  scale(x: number, y: number): void { this.push('scale', x, y) }
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.push('transform', a, b, c, d, e, f)
  }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.push('setTransform', a, b, c, d, e, f)
  }
  resetTransform(): void { this.push('resetTransform') }
  setLineDash(segments: number[]): void {
    this.lineDash = Array.isArray(segments) ? segments.map((value) => Number(value) || 0) : []
    this.push('setLineDash', this.lineDash)
  }
  getLineDash(): number[] {
    return this.lineDash.slice()
  }
  getTransform(): Record<string, number> {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }
  measureText(text: string): Record<string, number> {
    return measureText(String(this.state.font ?? INITIAL_STATE.font), String(text))
  }
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): RemoteGradient {
    return new RemoteGradient(this, 'linear', [x0, y0, x1, y1])
  }
  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): RemoteGradient {
    return new RemoteGradient(this, 'radial', [x0, y0, r0, x1, y1, r1])
  }
  createPattern(image: RemoteImage | { id?: string }, repetition: string): RemotePattern | null {
    const imageId = image instanceof RemoteImage ? image.id : String(image?.id ?? '')
    if (!imageId) return null
    return new RemotePattern(imageId, String(repetition ?? 'repeat'))
  }
  createImage(): RemoteImage {
    return new RemoteImage(this)
  }
  drawImage(image: RemoteImage | { id?: string }, ...args: number[]): void {
    const imageId = image instanceof RemoteImage ? image.id : String(image?.id ?? '')
    if (!imageId) return
    this.push('drawImage', imageId, ...args)
  }
  getImageData(x: number, y: number, width: number, height: number): Record<string, unknown> {
    if (!warnedReadback) {
      warnedReadback = true
      host.__tinyLog?.('warn', 'canvas.getImageData is not available on the iOS host yet')
    }
    return {
      width: Math.max(0, Math.round(width) || 0),
      height: Math.max(0, Math.round(height) || 0),
      data: new Uint8ClampedArray(Math.max(0, Math.round(width) * Math.round(height) * 4)),
    }
  }
  putImageData(): void {
    this.warnOnce('putImageData')
  }
  toDataURL(): string {
    this.warnOnce('toDataURL')
    return ''
  }
  isPointInPath(): boolean {
    this.warnOnce('isPointInPath')
    return false
  }
  isPointInStroke(): boolean {
    this.warnOnce('isPointInStroke')
    return false
  }

  emitImage(imageId: string, src: string): void {
    this.send({
      type: 'canvas',
      pageId: this.pageId,
      canvasId: this.canvasId,
      kind: 'image',
      imageId,
      src,
    })
  }

  flush(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    if (this.ops.length === 0) return
    const ops = this.ops.splice(0)
    this.send({
      type: 'canvas',
      pageId: this.pageId,
      canvasId: this.canvasId,
      kind: 'ops',
      ops,
      width: this.width,
      height: this.height,
      dpr: pixelRatio(),
    })
  }

  dispose(): void {
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = undefined
    this.ops.length = 0
    this.stateStack.length = 0
  }

  private push(name: string, ...args: unknown[]): void {
    this.ops.push([name, ...args])
    if (this.ops.length >= 256) {
      this.flush()
      return
    }
    if (this.timer !== undefined) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.flush()
    }, 0)
  }

  private warnOnce(name: string): void {
    if (this.emittedOnce.has(name)) return
    this.emittedOnce.add(name)
    host.__tinyLog?.('warn', `canvas.${name} is not supported on the iOS host yet`)
  }
}

class RemoteCanvasNode {
  constructor(private readonly recorder: RemoteCanvas2D) {}

  get width(): number { return this.recorder.width }
  set width(value: number) { this.recorder.resize(Number(value) || 0, this.recorder.height) }
  get height(): number { return this.recorder.height }
  set height(value: number) { this.recorder.resize(this.recorder.width, Number(value) || 0) }

  getContext(type: string): RemoteCanvas2D | null {
    return type === '2d' ? this.recorder : null
  }

  createImage(): RemoteImage {
    return this.recorder.createImage()
  }

  toDataURL(): string {
    return this.recorder.toDataURL()
  }
}

class RemoteLegacyContext {
  constructor(private readonly recorder: RemoteCanvas2D) {}

  private chain(): this { return this }

  setFillStyle(value: unknown): this {
    this.recorder.fillStyle = value
    return this
  }
  setStrokeStyle(value: unknown): this {
    this.recorder.strokeStyle = value
    return this
  }
  setLineWidth(value: unknown): this {
    this.recorder.lineWidth = Number(value) || 1
    return this
  }
  setLineCap(value: unknown): this {
    this.recorder.lineCap = String(value ?? 'butt')
    return this
  }
  setLineJoin(value: unknown): this {
    this.recorder.lineJoin = String(value ?? 'miter')
    return this
  }
  setGlobalAlpha(value: unknown): this {
    this.recorder.globalAlpha = Number(value)
    return this
  }
  setTextAlign(value: unknown): this {
    this.recorder.textAlign = String(value ?? 'start')
    return this
  }
  setTextBaseline(value: unknown): this {
    this.recorder.textBaseline = String(value ?? 'alphabetic')
    return this
  }
  setFontSize(value: unknown): this {
    this.recorder.font = `${Number(value) || 10}px sans-serif`
    return this
  }
  setShadow(offsetX: unknown, offsetY: unknown, blur: unknown, color: unknown): this {
    this.recorder.shadowOffsetX = Number(offsetX) || 0
    this.recorder.shadowOffsetY = Number(offsetY) || 0
    this.recorder.shadowBlur = Number(blur) || 0
    this.recorder.shadowColor = String(color ?? 'rgba(0, 0, 0, 0)')
    return this
  }

  fillRect(...args: number[]): this {
    ;(this.recorder.fillRect as (...inner: number[]) => void)(...args)
    return this
  }
  strokeRect(...args: number[]): this {
    ;(this.recorder.strokeRect as (...inner: number[]) => void)(...args)
    return this
  }
  clearRect(...args: number[]): this {
    ;(this.recorder.clearRect as (...inner: number[]) => void)(...args)
    return this
  }
  beginPath(): this { this.recorder.beginPath(); return this }
  closePath(): this { this.recorder.closePath(); return this }
  moveTo(x: number, y: number): this { this.recorder.moveTo(x, y); return this }
  lineTo(x: number, y: number): this { this.recorder.lineTo(x, y); return this }
  arc(x: number, y: number, r: number, start: number, end: number, ccw?: boolean): this {
    this.recorder.arc(x, y, r, start, end, ccw)
    return this
  }
  rect(x: number, y: number, w: number, h: number): this { this.recorder.rect(x, y, w, h); return this }
  fill(): this { this.recorder.fill(); return this }
  stroke(): this { this.recorder.stroke(); return this }
  clip(): this { this.recorder.clip(); return this }
  fillText(...args: [string, number, number, number?]): this {
    this.recorder.fillText(...args)
    return this
  }
  strokeText(...args: [string, number, number, number?]): this {
    this.recorder.strokeText(...args)
    return this
  }
  translate(x: number, y: number): this { this.recorder.translate(x, y); return this }
  rotate(angle: number): this { this.recorder.rotate(angle); return this }
  scale(x: number, y: number): this { this.recorder.scale(x, y); return this }
  save(): this { this.recorder.save(); return this }
  restore(): this { this.recorder.restore(); return this }
  drawImage(image: RemoteImage | { id?: string }, ...args: number[]): this {
    this.recorder.drawImage(image, ...args)
    return this
  }
  setLineDash(segments: number[]): this {
    this.recorder.setLineDash(segments)
    return this
  }
  getLineDash(): number[] {
    return this.recorder.getLineDash()
  }

  draw(_reserve?: unknown, callback?: unknown): this {
    this.recorder.flush()
    const done = typeof callback === 'function'
      ? callback
      : typeof _reserve === 'function' ? _reserve : undefined
    if (done) setTimeout(done, 0)
    return this
  }

  chainState(): this { return this.chain() }
}

type CanvasEntry = {
  recorder: RemoteCanvas2D
  node: RemoteCanvasNode
  legacy: RemoteLegacyContext
  legacyFacade: Record<string, unknown>
}

function createLegacyFacade(legacy: RemoteLegacyContext): Record<string, unknown> {
  const facade: Record<string, unknown> = {}
  const methods = [
    'fillRect', 'strokeRect', 'clearRect', 'beginPath', 'closePath', 'moveTo', 'lineTo',
    'arc', 'rect', 'fill', 'stroke', 'clip', 'fillText', 'strokeText', 'translate',
    'rotate', 'scale', 'save', 'restore', 'drawImage', 'setLineDash', 'getLineDash',
    'setFillStyle', 'setStrokeStyle', 'setLineWidth', 'setLineCap', 'setLineJoin',
    'setGlobalAlpha', 'setTextAlign', 'setTextBaseline', 'setFontSize', 'setShadow',
    'draw',
  ]
  for (const name of methods) {
    const method = (legacy as unknown as Record<string, unknown>)[name]
    if (typeof method !== 'function') continue
    facade[name] = (...args: unknown[]) => {
      ;(method as (...inner: unknown[]) => unknown).apply(legacy, args)
      return facade
    }
  }
  return facade
}

export function createRemoteCanvasAdapter(send: CanvasSend): ServiceCanvasAdapter {
  const entries = new Map<string, CanvasEntry>()

  const keyFor = (pageId: string | undefined, canvasId: string): string => (
    `${pageId ?? ''}:${canvasId || 'canvas'}`
  )

  const ensure = (pageId: string | undefined, canvasId: string, width = 0, height = 0): CanvasEntry => {
    const key = keyFor(pageId, canvasId)
    const existing = entries.get(key)
    if (existing) {
      if (width > 0 || height > 0) existing.recorder.resize(width || existing.recorder.width, height || existing.recorder.height)
      return existing
    }
    const recorder = new RemoteCanvas2D(send, pageId ?? '', canvasId || 'canvas', width, height)
    const node = new RemoteCanvasNode(recorder)
    const legacy = new RemoteLegacyContext(recorder)
    const entry: CanvasEntry = {
      recorder,
      node,
      legacy,
      legacyFacade: createLegacyFacade(legacy),
    }
    entries.set(key, entry)
    return entry
  }

  return {
    createLegacyCanvasContext(canvasId, request = {}) {
      return ensure(request.pageId, canvasId).legacyFacade
    },
    acquireCanvasNode(request: CanvasNodeRequest) {
      const entry = ensure(
        request.pageId,
        request.canvasId,
        request.width,
        request.height,
      )
      return entry.node as unknown as CanvasNodeHandle
    },
    releaseCanvasNode(request) {
      const keys = request.canvasId
        ? [keyFor(request.pageId, request.canvasId)]
        : Array.from(entries.keys()).filter((key) => key.startsWith(`${request.pageId ?? ''}:`))
      for (const key of keys) {
        const entry = entries.get(key)
        if (!entry) continue
        entry.recorder.dispose()
        entry.recorder.flush()
        send({
          type: 'canvas',
          pageId: request.pageId ?? '',
          canvasId: request.canvasId ?? '',
          kind: 'release',
        })
        entries.delete(key)
      }
    },
  }
}
