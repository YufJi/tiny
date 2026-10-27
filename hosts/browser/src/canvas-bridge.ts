import type {
  CanvasMeasurement,
  CanvasNodeHandle,
  CanvasNodeRequest,
  ServiceCanvasAdapter,
} from '@tiny/runtime'
import { BROWSER_RUNTIME_NAMES } from './naming'

type CanvasImageOptions = {
  resolveAssetUrl?: (src: string) => string | undefined
}

function postTargetOrigin(): string {
  return window.location.origin === 'null' ? '*' : window.location.origin
}

function isSameOrigin(origin: string): boolean {
  return origin === window.location.origin
}

function createFrameScheduler(afterFrame: () => void): {
  requestFrame: (callback: FrameRequestCallback) => number
  cancelFrame: (handle: number) => void
  dispose: () => void
} {
  const handles = new Set<number>()
  let disposed = false
  const cancelFrame = (handle: number): void => {
    if (!handle) return
    handles.delete(handle)
    if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(handle)
      return
    }
    clearTimeout(handle as unknown as ReturnType<typeof setTimeout>)
  }
  const requestFrame = (callback: FrameRequestCallback): number => {
    if (disposed || typeof callback !== 'function') return 0
    const run = (time: number) => {
      handles.delete(handle)
      if (disposed) return
      callback(time)
      afterFrame()
    }
    const handle = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame(run)
      : setTimeout(() => run(Date.now()), 16) as unknown as number
    handles.add(handle)
    return handle
  }
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    for (const handle of Array.from(handles)) cancelFrame(handle)
    handles.clear()
  }
  return { requestFrame, cancelFrame, dispose }
}

function createCanvasImageFactory(options: CanvasImageOptions): () => HTMLImageElement {
  return () => {
    const image = new Image()
    const nativeDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')
    let source = ''
    Object.defineProperty(image, 'src', {
      configurable: true,
      enumerable: true,
      get: () => source,
      set(value: string) {
        source = String(value)
        let resolved = source
        try {
          resolved = options.resolveAssetUrl?.(source) || source
        } catch {
          resolved = source
        }
        if (nativeDescriptor?.set) nativeDescriptor.set.call(image, resolved)
        else image.setAttribute('src', resolved)
      },
    })
    return image
  }
}

export function measureBrowserCanvas(selector?: string, canvasId?: string): CanvasMeasurement {
  if (typeof document === 'undefined') return { width: 300, height: 150 }
  const element = findBrowserCanvas(selector, canvasId)
  if (!element) return { width: 0, height: 0, hasCanvas: false }
  let rect = element.getBoundingClientRect()
  if (element.tagName.toLowerCase() === 'canvas' && element.parentElement) {
    const parentRect = element.parentElement.getBoundingClientRect()
    if (parentRect.width > 0 && parentRect.height > 0) rect = parentRect
  }
  const measured: CanvasMeasurement = {
    width: rect.width > 0 ? Math.round(rect.width) : 300,
    height: rect.height > 0 ? Math.round(rect.height) : 150,
    hasCanvas: true,
  }
  const host = element.closest(BROWSER_RUNTIME_NAMES.canvasHostTag)
  const resolvedId = element.getAttribute('canvas-id') || host?.id || element.id || canvasId
  if (resolvedId) measured.canvasId = resolvedId
  return measured
}

function findBrowserCanvas(selector?: string, canvasId?: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  const fromId = (id?: string): HTMLCanvasElement | null => {
    if (!id) return null
    for (const candidate of Array.from(document.querySelectorAll('canvas[canvas-id]'))) {
      if (candidate.getAttribute('canvas-id') === id) return candidate as HTMLCanvasElement
    }
    const host = document.getElementById(id)
    if (!host) return null
    if (host.tagName.toLowerCase() === 'canvas') return host as HTMLCanvasElement
    return host.querySelector('canvas') as HTMLCanvasElement | null
  }
  if (selector) {
    let target: Element | null = null
    try {
      target = document.querySelector(selector)
    } catch {
      target = null
    }
    if (target) {
      const targetCanvas = target.tagName.toLowerCase() === 'canvas'
        ? target as HTMLCanvasElement
        : target.querySelector('canvas') as HTMLCanvasElement | null
      if (!targetCanvas) return null
      // A canvas-id is unique per page, while `.ec-canvas` can match several
      // charts. Prefer the explicit id when the selector resolves a canvas host.
      return fromId(canvasId) ?? targetCanvas
    }
    // Component-scoped class selectors (`.ec-canvas`) do not match the scoped
    // host class in the DOM, but the component's canvas-id still identifies it.
    return fromId(canvasId)
  }
  return fromId(canvasId) ?? document.querySelector('canvas')
}

function createOffscreenCanvasNode(
  offscreen: OffscreenCanvas,
  width: number,
  height: number,
  options: CanvasImageOptions,
): { node: CanvasNodeHandle; dispose: () => void } {
  offscreen.width = Math.max(1, Math.round(width))
  offscreen.height = Math.max(1, Math.round(height))
  const exportCanvas = document.createElement('canvas')
  const createImage = createCanvasImageFactory(options)
  const { requestFrame, cancelFrame, dispose } = createFrameScheduler(() => undefined)
  const node: Record<string, unknown> = {
    getContext(type: string, attributes?: unknown) {
      const context = (offscreen as unknown as {
        getContext: (type: string, attributes?: unknown) => unknown
      }).getContext(type, attributes)
      return context ?? null
    },
    createImage,
    requestAnimationFrame: requestFrame,
    cancelAnimationFrame: cancelFrame,
    toDataURL(...args: unknown[]) {
      try {
        exportCanvas.width = offscreen.width
        exportCanvas.height = offscreen.height
        const context = exportCanvas.getContext('2d')
        if (!context) return ''
        context.clearRect(0, 0, exportCanvas.width, exportCanvas.height)
        context.drawImage(offscreen, 0, 0)
        const [type, quality] = args as [string?, number?]
        return exportCanvas.toDataURL(type ?? 'image/png', quality)
      } catch {
        return ''
      }
    },
  }
  Object.defineProperties(node, {
    width: {
      configurable: true,
      enumerable: true,
      get: () => offscreen.width,
      set: (value: number) => {
        offscreen.width = Math.max(1, Math.round(Number(value) || 1))
      },
    },
    height: {
      configurable: true,
      enumerable: true,
      get: () => offscreen.height,
      set: (value: number) => {
        offscreen.height = Math.max(1, Math.round(Number(value) || 1))
      },
    },
  })
  return {
    node: node as unknown as CanvasNodeHandle,
    dispose: () => {
      dispose()
      exportCanvas.width = 0
      exportCanvas.height = 0
    },
  }
}

export type CanvasHandoffResult =
  | { status: 'transferred'; offscreen: OffscreenCanvas; surfaceId?: string }
  | { status: 'already'; surfaceId?: string }
  | { status: 'error'; reason?: string }

export type CanvasHandoffRequest = {
  type: typeof BROWSER_RUNTIME_NAMES.canvasRequest
  token: string
  pageId?: string
  selector?: string
  canvasId: string
  width: number
  height: number
}

const pendingHandoffs = new Map<string, CanvasHandoffResult>()
const handoffWaiters = new Map<string, {
  resolve: (value: CanvasHandoffResult) => void
  timer: ReturnType<typeof setTimeout>
}>()
let offscreenReceiverInstalled = false

function resolveHandoff(token: string, result: CanvasHandoffResult): void {
  const waiter = handoffWaiters.get(token)
  if (!waiter) {
    pendingHandoffs.set(token, result)
    return
  }
  clearTimeout(waiter.timer)
  handoffWaiters.delete(token)
  waiter.resolve(result)
}

/** Install the service-side receiver for canvas handoff responses. */
export function installOffscreenCanvasReceiver(): void {
  if (offscreenReceiverInstalled || typeof window === 'undefined') return
  offscreenReceiverInstalled = true
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    if (!isSameOrigin(event.origin)) return
    const data = event.data as {
      type?: string
      token?: string
      status?: string
      surfaceId?: string
      offscreen?: OffscreenCanvas
      reason?: string
    } | undefined
    if (!data?.type || !data.token) return
    if (data.type === BROWSER_RUNTIME_NAMES.canvasError) {
      resolveHandoff(data.token, { status: 'error', reason: data.reason })
      return
    }
    if (data.type !== BROWSER_RUNTIME_NAMES.canvasHandoff) return
    if (data.status === 'transferred' && data.offscreen) {
      resolveHandoff(data.token, {
        status: 'transferred',
        offscreen: data.offscreen,
        surfaceId: data.surfaceId,
      })
      return
    }
    if (data.status === 'already') {
      resolveHandoff(data.token, { status: 'already', surfaceId: data.surfaceId })
    }
  })
}

/** Wait for the host response that belongs to a service-side handoff token. */
export function takeCanvasHandoff(
  token: string,
  timeoutMs = 5000,
): Promise<CanvasHandoffResult> {
  const existing = pendingHandoffs.get(token)
  if (existing) {
    pendingHandoffs.delete(token)
    return Promise.resolve(existing)
  }
  installOffscreenCanvasReceiver()
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      handoffWaiters.delete(token)
      resolve({ status: 'error', reason: 'timeout' })
    }, timeoutMs)
    handoffWaiters.set(token, { resolve, timer })
  })
}

function requestCanvasHandoff(
  request: Omit<CanvasHandoffRequest, 'type'>,
): Promise<CanvasHandoffResult> {
  if (typeof window === 'undefined' || window.parent === window) {
    return Promise.resolve({ status: 'error', reason: 'no-parent' })
  }
  installOffscreenCanvasReceiver()
  try {
    window.parent.postMessage(
      { type: BROWSER_RUNTIME_NAMES.canvasRequest, ...request } satisfies CanvasHandoffRequest,
      postTargetOrigin(),
    )
  } catch {
    return Promise.resolve({ status: 'error', reason: 'post-failed' })
  }
  // The receiver stores a response that arrives before the waiter is created.
  return takeCanvasHandoff(request.token)
}

function supportsOffscreenCanvas(): boolean {
  return typeof OffscreenCanvas !== 'undefined'
    && typeof window !== 'undefined'
    && window.parent !== window
}

function createHandoffToken(): string {
  return `canvas-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Browser service canvas adapter.
 *
 * Both selector-query nodes and legacy `createCanvasContext` acquire the render
 * canvas by transferring its control surface to the service thread. There is no
 * PNG mirror fallback.
 */
type LegacyContext = OffscreenCanvasRenderingContext2D
type LegacyTask = (context: LegacyContext) => void

type LegacySession = {
  facade: Record<string, unknown>
  tasks: LegacyTask[]
  callbacks: Array<() => void>
  context: LegacyContext | null
  offscreen: OffscreenCanvas | null
  disposed: boolean
}

/**
 * Legacy `createCanvasContext` facade over an OffscreenCanvas.
 *
 * The legacy API is synchronous but the canvas handoff is asynchronous, so
 * drawing calls are buffered until the service owns the canvas surface.
 */
function createLegacyCanvasSession(
  canvasId: string,
  pageId: string | undefined,
): LegacySession {
  const session: LegacySession = {
    facade: {},
    tasks: [],
    callbacks: [],
    context: null,
    offscreen: null,
    disposed: false,
  }

  const run = (task: LegacyTask): void => {
    if (session.disposed) return
    if (session.context) {
      try {
        task(session.context)
      } catch {
        // A legacy context call should not break the surrounding page code.
      }
      return
    }
    session.tasks.push(task)
  }
  const setStyle = (property: string) => (value: unknown): Record<string, unknown> => {
    run((context) => {
      ;(context as unknown as Record<string, unknown>)[property] = value
    })
    return session.facade
  }
  const invoke = (method: string) => (...args: unknown[]): Record<string, unknown> => {
    run((context) => {
      const fn = (context as unknown as Record<string, unknown>)[method]
      if (typeof fn === 'function') {
        ;(fn as (...inner: unknown[]) => unknown).apply(context, args)
      }
    })
    return session.facade
  }

  for (const method of [
    'fillRect', 'strokeRect', 'clearRect', 'beginPath', 'closePath',
    'moveTo', 'lineTo', 'arc', 'rect', 'fill', 'stroke', 'clip',
    'fillText', 'strokeText', 'translate', 'rotate', 'scale',
    'save', 'restore', 'drawImage',
  ]) {
    session.facade[method] = invoke(method)
  }
  session.facade.setFillStyle = setStyle('fillStyle')
  session.facade.setStrokeStyle = setStyle('strokeStyle')
  session.facade.setLineWidth = setStyle('lineWidth')
  session.facade.setGlobalAlpha = setStyle('globalAlpha')
  session.facade.setTextAlign = setStyle('textAlign')
  session.facade.setTextBaseline = setStyle('textBaseline')
  session.facade.setLineCap = setStyle('lineCap')
  session.facade.setLineJoin = setStyle('lineJoin')
  session.facade.setFontSize = (value: unknown): Record<string, unknown> => {
    run((context) => {
      context.font = `${Number(value) || 12}px sans-serif`
    })
    return session.facade
  }
  session.facade.setShadow = (
    offsetX?: unknown,
    offsetY?: unknown,
    blur?: unknown,
    color?: unknown,
  ): Record<string, unknown> => {
    run((context) => {
      context.shadowOffsetX = Number(offsetX) || 0
      context.shadowOffsetY = Number(offsetY) || 0
      context.shadowBlur = Number(blur) || 0
      context.shadowColor = String(color ?? 'transparent')
    })
    return session.facade
  }
  session.facade.draw = (...args: unknown[]): Record<string, unknown> => {
    const callback = args.find((arg): arg is () => void => typeof arg === 'function')
    if (callback) {
      if (session.context) callback()
      else session.callbacks.push(callback)
    }
    return session.facade
  }

  const attach = async (): Promise<void> => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      if (session.disposed) return
      const token = createHandoffToken()
      const result = await requestCanvasHandoff({
        token,
        pageId,
        canvasId,
        width: 0,
        height: 0,
      })
      if (session.disposed) {
        if (result.status === 'transferred') {
          result.offscreen.width = 0
          result.offscreen.height = 0
        }
        return
      }
      if (result.status === 'transferred') {
        const context = result.offscreen.getContext('2d') as LegacyContext | null
        if (!context) {
          result.offscreen.width = 0
          result.offscreen.height = 0
          return
        }
        session.context = context
        session.offscreen = result.offscreen
        for (const task of session.tasks.splice(0)) {
          try {
            task(context)
          } catch {
            // Ignore individual legacy drawing failures.
          }
        }
        for (const callback of session.callbacks.splice(0)) callback()
        return
      }
      if (result.status === 'error' && result.reason === 'canvas-not-found' && attempt < 19) {
        await new Promise((resolve) => setTimeout(resolve, 50))
        continue
      }
      return
    }
  }
  void attach()

  return session
}

function disposeLegacySession(session: LegacySession): void {
  if (session.disposed) return
  session.disposed = true
  session.tasks.length = 0
  session.callbacks.length = 0
  if (session.offscreen) {
    session.offscreen.width = 0
    session.offscreen.height = 0
  }
  session.context = null
  session.offscreen = null
}

export function createBrowserCanvasAdapter(): ServiceCanvasAdapter {
  const nodes = new Map<string, {
    node: CanvasNodeHandle
    dispose: () => void
    surfaceId?: string
  }>()
  const pending = new Map<string, Promise<CanvasNodeHandle | null>>()
  const legacySessions = new Map<string, LegacySession>()
  const released = new Set<string>()

  const keyFor = (request: { pageId?: string; canvasId: string }): string => (
    `${request.pageId ?? ''}:${request.canvasId}`
  )
  const disposeKey = (key: string): void => {
    const entry = nodes.get(key)
    if (!entry) return
    entry.dispose()
    nodes.delete(key)
  }
  const disposeLegacyKey = (key: string): void => {
    const session = legacySessions.get(key)
    if (!session) return
    disposeLegacySession(session)
    legacySessions.delete(key)
  }
  const createLegacy = (
    canvasId: string,
    request: { pageId?: string } = {},
  ): Record<string, unknown> | null => {
    if (!supportsOffscreenCanvas()) return null
    const key = keyFor({ pageId: request.pageId, canvasId })
    const existing = legacySessions.get(key)
    if (existing && !existing.disposed) return existing.facade
    const session = createLegacyCanvasSession(canvasId, request.pageId)
    legacySessions.set(key, session)
    return session.facade
  }
  const acquire = async (request: CanvasNodeRequest): Promise<CanvasNodeHandle | null> => {
    const key = keyFor(request)
    if (released.has(key)) return null
    const inFlight = pending.get(key)
    if (inFlight) return inFlight
    if (!supportsOffscreenCanvas()) return null
    const token = createHandoffToken()
    const task = (async (): Promise<CanvasNodeHandle | null> => {
      const result = await requestCanvasHandoff({
        token,
        pageId: request.pageId,
        selector: request.selector,
        canvasId: request.canvasId,
        width: request.width,
        height: request.height,
      })
      if (result.status === 'transferred' && released.has(key)) {
        result.offscreen.width = 0
        result.offscreen.height = 0
        return null
      }
      if (released.has(key) || result.status === 'error') return null
      if (result.status === 'already') {
        const existing = nodes.get(key)
        if (existing && (existing.surfaceId ?? '') === (result.surfaceId ?? '')) {
          return existing.node
        }
        disposeKey(key)
        return null
      }
      disposeKey(key)
      const created = createOffscreenCanvasNode(
        result.offscreen,
        request.width,
        request.height,
        { resolveAssetUrl: request.resolveAssetUrl },
      )
      nodes.set(key, {
        node: created.node,
        dispose: created.dispose,
        surfaceId: result.surfaceId,
      })
      return created.node
    })()
    const tracked = task.finally(() => pending.delete(key))
    pending.set(key, tracked)
    return tracked
  }

  installOffscreenCanvasReceiver()

  return {
    createLegacyCanvasContext: createLegacy,
    acquireCanvasNode: acquire,
    releaseCanvasNode(request) {
      if (request.canvasId) {
        const key = keyFor({ pageId: request.pageId, canvasId: request.canvasId })
        released.add(key)
        disposeKey(key)
        disposeLegacyKey(key)
        return
      }
      const prefix = `${request.pageId ?? ''}:`
      for (const key of new Set([...nodes.keys(), ...pending.keys()])) {
        if (!key.startsWith(prefix)) continue
        released.add(key)
        disposeKey(key)
      }
      for (const key of Array.from(legacySessions.keys())) {
        if (key.startsWith(prefix)) disposeLegacyKey(key)
      }
    },
  }
}

const canvasSurfaceIds = new WeakMap<HTMLCanvasElement, string>()
const transferredCanvases = new WeakSet<HTMLCanvasElement>()
let offscreenResponderInstalled = false

function canvasSurfaceId(canvas: HTMLCanvasElement): string {
  const existing = canvasSurfaceIds.get(canvas)
  if (existing) return existing
  const surfaceId = createHandoffToken().replace('canvas-', 'surface-')
  canvasSurfaceIds.set(canvas, surfaceId)
  return surfaceId
}

function respondToHost(
  payload: Record<string, unknown>,
  transfer: Transferable[] = [],
): void {
  if (typeof window === 'undefined' || window.parent === window) return
  try {
    window.parent.postMessage(payload, postTargetOrigin(), transfer)
  } catch {
    // The host disappeared while the canvas was being handed off.
  }
}

/**
 * Render-thread side of the OffscreenCanvas handoff.
 *
 * The visible canvas transfers its control surface to the service thread, so
 * page code draws directly into the compositor-backed canvas.
 */
export function installOffscreenCanvasResponder(): void {
  if (offscreenResponderInstalled || typeof window === 'undefined') return
  if (window.parent === window) return
  offscreenResponderInstalled = true
  window.addEventListener('message', (event) => {
    if (event.source !== window.parent) return
    if (!isSameOrigin(event.origin)) return
    const data = event.data as CanvasHandoffRequest | undefined
    if (data?.type !== BROWSER_RUNTIME_NAMES.canvasRequest || !data.token) return
    const canvas = findBrowserCanvas(data.selector, data.canvasId)
    if (!canvas) {
      respondToHost({
        type: BROWSER_RUNTIME_NAMES.canvasError,
        token: data.token,
        reason: 'canvas-not-found',
      })
      return
    }
    const surfaceId = canvasSurfaceId(canvas)
    if (transferredCanvases.has(canvas)) {
      canvas.setAttribute(BROWSER_RUNTIME_NAMES.canvasOffscreenAttribute, 'true')
      respondToHost({
        type: BROWSER_RUNTIME_NAMES.canvasHandoff,
        token: data.token,
        status: 'already',
        surfaceId,
      })
      return
    }
    if (typeof canvas.transferControlToOffscreen !== 'function') {
      respondToHost({
        type: BROWSER_RUNTIME_NAMES.canvasError,
        token: data.token,
        reason: 'offscreen-unsupported',
      })
      return
    }
    try {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
      const width = data.width > 0 ? data.width : Math.round(rect.width) || canvas.width || 300
      const height = data.height > 0 ? data.height : Math.round(rect.height) || canvas.height || 150
      const offscreen = canvas.transferControlToOffscreen()
      offscreen.width = Math.max(1, Math.round(width))
      offscreen.height = Math.max(1, Math.round(height))
      transferredCanvases.add(canvas)
      canvas.setAttribute(BROWSER_RUNTIME_NAMES.canvasOffscreenAttribute, 'true')
      respondToHost(
        {
          type: BROWSER_RUNTIME_NAMES.canvasHandoff,
          token: data.token,
          status: 'transferred',
          surfaceId,
          offscreen,
        },
        [offscreen],
      )
    } catch {
      respondToHost({
        type: BROWSER_RUNTIME_NAMES.canvasError,
        token: data.token,
        reason: 'transfer-failed',
      })
    }
  })
}

/**
 * Mini-program canvas adapters (for example ECharts' `WxCanvas`) are plain
 * objects in WeChat, where `document` does not exist. In the browser service
 * thread `document` exists, so libraries that sniff `canvas.addEventListener`
 * treat the wrapper as a DOM node. Provide inert listener methods on plain
 * objects; DOM elements keep their own EventTarget implementation.
 */
export function installBrowserCanvasCompat(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  const prototype = Object.prototype as unknown as Record<string, unknown>
  for (const name of ['addEventListener', 'removeEventListener']) {
    if (name in prototype) continue
    Object.defineProperty(prototype, name, {
      value: () => undefined,
      configurable: true,
      writable: true,
    })
  }
}
