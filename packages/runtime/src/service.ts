import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/cli'
import { applyDataPatch, cloneJsonSafe, type DataPatch } from './data'
import { buildComponentSchemas } from './component-schema'
import type { ServiceThreadOptions } from './types'
import type {
  MiniProgramComponentSchema,
  StorageSnapshot,
  SystemInfoSnapshot,
} from './types'
import { createRuntimeStateDiagnostic } from './diagnostics'
import { createBridgedCanvas, createLegacyCanvasContext } from './canvas-bridge'

export type MiniProgramPageOptions = {
  data?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  onLoad?: (...args: unknown[]) => void
  onShow?: (...args: unknown[]) => void
  onReady?: (...args: unknown[]) => void
  onHide?: (...args: unknown[]) => void
  onUnload?: (...args: unknown[]) => void
  [key: string]: unknown
}

export type MiniProgramComponentOptions = {
  data?: Record<string, unknown>
  properties?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  lifetimes?: Record<string, (...args: unknown[]) => void>
  pageLifetimes?: Record<string, (...args: unknown[]) => void>
  [key: string]: unknown
}

export type MiniProgramAppOptions = {
  globalData?: Record<string, unknown>
  onLaunch?: (...args: unknown[]) => void
  onShow?: (...args: unknown[]) => void
  onHide?: (...args: unknown[]) => void
  [key: string]: unknown
}

export class MiniProgramPageRegistry {
  readonly pages = new Map<string, MiniProgramPageOptions>()
  readonly components = new Map<string, MiniProgramPageOptions>()
  private app: MiniProgramAppOptions | null = null
  private readonly pagePaths: string[]
  private readonly componentPaths: string[]
  private pageCursor = 0
  private componentCursor = 0

  constructor(pagePaths: string[], componentPaths: string[] = []) {
    this.pagePaths = pagePaths
    this.componentPaths = componentPaths
  }

  registerApp(options: MiniProgramAppOptions): MiniProgramAppOptions {
    if (this.app) throw new Error('App has already been registered')
    this.app = options
    options.onLaunch?.()
    options.onShow?.()
    return options
  }

  hideApp(): void {
    this.app?.onHide?.()
  }

  showApp(): void {
    this.app?.onShow?.()
  }

  getApp(): MiniProgramAppOptions | null {
    return this.app
  }

  registerPage(options: MiniProgramPageOptions): MiniProgramPageOptions {
    const path = this.pagePaths[this.pageCursor++]
    if (!path) throw new Error('More Page definitions were registered than declared pages')
    this.pages.set(path, options)
    return options
  }

  registerComponent(options: MiniProgramPageOptions): MiniProgramPageOptions {
    const path = this.componentPaths[this.componentCursor++] ?? `component:${this.components.size}`
    this.components.set(path, options)
    return options
  }
}

const COMPONENT_LIFETIMES = new Set(['created', 'attached', 'ready', 'moved', 'detached'])

export class MiniProgramComponentInstance {
  readonly componentId: string
  readonly path: string
  readonly data: Record<string, unknown>
  readonly properties: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  private readonly options: MiniProgramComponentOptions
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()

  constructor(
    componentId: string,
    path: string,
    options: MiniProgramComponentOptions,
    private readonly bridge?: {
      onDataPatch: (componentId: string, patch: DataPatch) => void
      onTriggerEvent: (
        componentId: string,
        name: string,
        detail: unknown,
        options: Record<string, unknown> | undefined,
      ) => void
    },
  ) {
    this.componentId = componentId
    this.path = path
    this.options = options
    this.data = cloneJsonSafe(options.data ?? {})
    this.properties = this.data

    for (const [name, value] of Object.entries(options)) {
      if (typeof value === 'function' && !COMPONENT_LIFETIMES.has(name)) {
        this.methods.set(name, (value as (...args: unknown[]) => unknown).bind(this))
      }
    }
    for (const [name, method] of Object.entries(options.methods ?? {})) {
      if (typeof method === 'function') this.methods.set(name, method.bind(this))
    }
    for (const [name, method] of this.methods) {
      ;(this as unknown as Record<string, unknown>)[name] = method
    }

    Object.assign(this, {
      setData: this.setData.bind(this),
      triggerEvent: this.triggerEvent.bind(this),
    })
  }

  setData(patch: DataPatch): void {
    const clonedPatch = cloneJsonSafe(patch)
    applyDataPatch(this.data, clonedPatch)
    this.bridge?.onDataPatch(this.componentId, clonedPatch)
  }

  triggerEvent(name: string, detail?: unknown, options?: Record<string, unknown>): void {
    this.bridge?.onTriggerEvent(this.componentId, name, cloneJsonSafe(detail ?? null), options)
  }

  syncData(data: Record<string, unknown> | undefined): void {
    if (!data) return
    Object.assign(this.data, cloneJsonSafe(data))
  }

  invokeMethod(name: string, args: unknown[] = []): unknown {
    const method = this.methods.get(name)
    if (!method) throw new Error(`Component method not found: ${name}`)
    return method(...args)
  }

  triggerLifecycle(name: 'created' | 'attached' | 'ready' | 'moved' | 'detached'): void {
    this.lifecycleEvents.push(name);
    const lifetime = this.options.lifetimes?.[name]
    const topLevel = this.options[name]
    if (typeof lifetime === 'function') lifetime.call(this)
    else if (typeof topLevel === 'function') (topLevel as (...args: unknown[]) => void).call(this)
  }

  triggerPageLifetime(name: 'show' | 'hide'): void {
    this.options.pageLifetimes?.[name]?.call(this)
  }

  getComponentOptions(): MiniProgramPageOptions {
    return this.options
  }

}

export type MiniProgramApiHost = Record<string, (...args: unknown[]) => unknown>

const LIFECYCLE_METHODS = new Set(['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload'])

export class MiniProgramPageInstance {
  readonly pageId: string
  readonly path: string
  readonly query: Record<string, string>
  readonly data: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  private readonly options: MiniProgramPageOptions
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()
  private unloaded = false

  constructor(
    pageId: string,
    path: string,
    options: MiniProgramPageOptions,
    query: Record<string, string> = {},
    private readonly onDataPatch?: (pageId: string, patch: DataPatch) => void,
  ) {
    this.pageId = pageId
    this.path = path
    this.options = options
    this.data = cloneJsonSafe(options.data ?? {})
    this.query = cloneJsonSafe(query)

    for (const [name, value] of Object.entries(options)) {
      if (typeof value !== 'function' || LIFECYCLE_METHODS.has(name)) continue
      this.methods.set(name, value.bind(this))
    }
    for (const [name, method] of Object.entries(options.methods ?? {})) {
      if (typeof method === 'function') this.methods.set(name, method.bind(this))
    }
    for (const [name, method] of this.methods) {
      ;(this as unknown as Record<string, unknown>)[name] = method
    }
    // WeChat exposes lifecycle methods on the page object itself; Taro reads
    // e.g. `this.onReady.called`, so bind lifecycle functions onto the instance.
    for (const [name, value] of Object.entries(options)) {
      if (typeof value === 'function') {
        ;(this as unknown as Record<string, unknown>)[name] = value.bind(this)
      }
    }

    const setData = this.setData.bind(this)
    Object.assign(this, { setData })
  }

  setData(patch: DataPatch, callback?: () => void): void {
    if (this.unloaded) throw new Error(`Cannot setData on unloaded page: ${this.path}`)
    const clonedPatch = cloneJsonSafe(patch)
    applyDataPatch(this.data, clonedPatch)
    this.onDataPatch?.(this.pageId, clonedPatch)
    callback?.()
  }

  invokeMethod(name: string, args: unknown[] = []): unknown {
    const method = this.methods.get(name)
    if (!method) throw new Error(`Page method not found: ${name}`)
    return method(...args)
  }

  triggerLifecycle(name: 'onLoad' | 'onShow' | 'onReady' | 'onHide' | 'onUnload', args: unknown[] = []): void {
    if (this.unloaded) return
    this.lifecycleEvents.push(name);
    (this.options as MiniProgramComponentOptions).lifetimes?.[name]?.apply(this, args)
    this.options[name]?.apply(this, args)
    if (name === 'onUnload') this.unloaded = true
  }

  getComponentOptions(): MiniProgramPageOptions {
    return this.options
  }

  triggerPageLifetime(name: 'show' | 'hide'): void {
    (this.options as MiniProgramComponentOptions).pageLifetimes?.[name]?.call(this)
  }

  triggerComponentLifecycle(name: 'attached' | 'ready' | 'detached'): void {
    const componentOptions = this.options as MiniProgramComponentOptions
    componentOptions.lifetimes?.[name]?.call(this);
    (componentOptions[name] as ((...args: unknown[]) => void) | undefined)?.call(this)
  }
}

export function installMiniProgramGlobals(
  registry: MiniProgramPageRegistry,
  apiHost: MiniProgramApiHost = {},
  onUnsupportedApi?: (name: string) => void,
  getCurrentPages?: () => unknown[],
): void {
  const globalObject = globalThis as unknown as Record<string, unknown>
  globalObject.App = (options: MiniProgramAppOptions) => registry.registerApp(options)
  globalObject.Page = (options: MiniProgramPageOptions) => registry.registerPage(options)
  globalObject.Component = (options: MiniProgramPageOptions) => registry.registerComponent(options)
  globalObject.Behavior = (options: MiniProgramPageOptions) => options
  globalObject.getApp = () => registry.getApp()
  globalObject.getCurrentPages = () => getCurrentPages?.() ?? []
  const rawWxProperties = new Set([
    'webpackJsonp',
    'cloud',
    'env',
    '__wxConfig',
    '__wxAppCode__',
    '__wxAppData',
  ])
  globalObject.wx = new Proxy(apiHost, {
    get(target, property) {
      if (typeof property !== 'string') return Reflect.get(target, property)
      if (property in target) return Reflect.get(target, property)
      if (rawWxProperties.has(property)) return undefined
      return (...args: unknown[]) => {
        onUnsupportedApi?.(property)
        return undefined
      }
    },
    set(target, property, value) {
      return Reflect.set(target, property, value)
    },
  })
}

export type ServiceApiContext = {
  connection: BridgeConnection
  getSystemInfoSnapshot: () => SystemInfoSnapshot
  getStorageSnapshot: () => StorageSnapshot
  setStorageSnapshot: (key: string, value: unknown) => void
  pageId?: string
}

export type ServiceThreadRuntime = {
  connection: BridgeConnection
  registry: MiniProgramPageRegistry
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  activePage: MiniProgramPageInstance | null
  pageStack: MiniProgramPageInstance[]
  pageInstances: Map<string, MiniProgramPageInstance>
  componentInstances: Map<string, MiniProgramComponentInstance>
}

export function createServiceApiHost(context: ServiceApiContext): MiniProgramApiHost {
  const unsupported = (name: string) => {
    context.connection.sendDiagnostic('warn', {
      code: 'UNSUPPORTED_API',
      message: `wx.${name} is not supported in the P0 runtime.`,
    }, context.pageId)
  }
  return {
    getSystemInfoSync: () => cloneJsonSafe(context.getSystemInfoSnapshot()),
    getSystemInfo: (params?: unknown) => {
      const info = cloneJsonSafe(context.getSystemInfoSnapshot())
      const callbacks = (params ?? {}) as {
        success?: (value: unknown) => void
        complete?: (value: unknown) => void
      }
      callbacks.success?.(info)
      callbacks.complete?.(info)
      return info
    },
    getStorageSync: (key: unknown) => cloneJsonSafe(context.getStorageSnapshot()[String(key)]),
    setStorageSync: (key: unknown, value: unknown) => {
      const normalizedKey = String(key)
      const normalizedValue = cloneJsonSafe(value)
      context.setStorageSnapshot(normalizedKey, normalizedValue)
      void context.connection
        .call('api', 'storage.set', { key: normalizedKey, value: normalizedValue }, { pageId: context.pageId })
        .catch((error) => {
          context.connection.sendDiagnostic('error', {
            code: 'API_STORAGE_WRITE_FAILED',
            message: error instanceof Error ? error.message : String(error),
            key: normalizedKey,
          }, context.pageId)
        })
      return undefined
    },
    navigateTo: (params: unknown = {}) => context.connection.call(
      'api',
      'navigate.to',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    navigateBack: (params: unknown = {}) => context.connection.call(
      'api',
      'navigate.back',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    showToast: (params: unknown = {}) => context.connection.call(
      'api',
      'toast.show',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    // Animation and canvas are outside P0, but page code still calls these
    // APIs during lifecycle hooks. Return chainable stubs so the page can boot.
    createAnimation: (options: unknown = {}) => createAnimationStub(options),
    createCanvasContext: (canvasId: unknown = 'canvas') => {
      const bridged = createLegacyCanvasContext(
        String(canvasId || 'canvas'),
        (frame) => {
          context.connection.sendEvent('canvas', 'frame', frame, { pageId: context.pageId })
        },
      )
      return bridged ?? createCanvasContextStub()
    },
    createSelectorQuery: () => {
      context.connection.sendDiagnostic('log', {
        code: 'CANVAS_OFFSCREEN',
        message: 'Canvas is rendered in the service thread and mirrored to the render thread.',
      }, context.pageId)
      return createSelectorQueryStub(context)
    },
  }
}

function createAnimationStub(options: unknown = {}): Record<string, unknown> {
  const settings = (options ?? {}) as {
    duration?: number
    delay?: number
    timingFunction?: string
    transformOrigin?: string
  }
  const duration = Number(settings.duration ?? 400)
  const delay = Number(settings.delay ?? 0)
  const timing = String(settings.timingFunction ?? 'linear')
  const transforms: string[] = []
  const styles: Record<string, string> = {}
  const animation: Record<string, unknown> = {}
  const chain = () => animation
  const number = (value: unknown, fallback = 1) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  animation.scale = (x: unknown, y: unknown = x) => {
    transforms.push(`scale(${number(x)}, ${number(y, number(x))})`)
    return animation
  }
  animation.scaleX = (x: unknown) => {
    transforms.push(`scaleX(${number(x)})`)
    return animation
  }
  animation.scaleY = (y: unknown) => {
    transforms.push(`scaleY(${number(y)})`)
    return animation
  }
  animation.scaleZ = (z: unknown) => {
    transforms.push(`scaleZ(${number(z)})`)
    return animation
  }
  for (const [method, cssName] of [['rotate', 'rotate'], ['rotateX', 'rotateX'], ['rotateY', 'rotateY'], ['rotateZ', 'rotateZ'], ['skewX', 'skewX'], ['skewY', 'skewY']] as const) {
    animation[method] = (value: unknown) => {
      transforms.push(`${cssName}(${number(value)}deg)`)
      return animation
    }
  }
  animation.rotate = (value: unknown) => {
    transforms.push(`rotate(${number(value)}deg)`)
    return animation
  }
  animation.translate = (x: unknown, y: unknown = 0) => {
    transforms.push(`translate(${number(x, 0)}px, ${number(y, 0)}px)`)
    return animation
  }
  animation.translateX = (x: unknown) => {
    transforms.push(`translateX(${number(x, 0)}px)`)
    return animation
  }
  animation.translateY = (y: unknown) => {
    transforms.push(`translateY(${number(y, 0)}px)`)
    return animation
  }
  animation.translateZ = (z: unknown) => {
    transforms.push(`translateZ(${number(z, 0)}px)`)
    return animation
  }
  animation.skew = (x: unknown, y: unknown = 0) => {
    transforms.push(`skew(${number(x)}deg, ${number(y)}deg)`)
    return animation
  }
  animation.matrix = (...values: unknown[]) => {
    transforms.push(`matrix(${values.map((value) => number(value, 0)).join(',')})`)
    return animation
  }
  for (const property of ['opacity', 'width', 'height', 'top', 'left', 'bottom', 'right', 'backgroundColor']) {
    animation[property] = (value: unknown) => {
      styles[property] = property === 'opacity' ? String(number(value)) : String(value)
      return animation
    }
  }
  animation.step = chain
  animation.export = () => {
    const parts: string[] = []
    if (transforms.length > 0) parts.push(`transform: ${transforms.join(' ')}`)
    for (const [property, value] of Object.entries(styles)) parts.push(`${property}: ${value}`)
    parts.push(`transition: all ${duration}ms ${timing} ${delay}ms`)
    if (settings.transformOrigin) parts.push(`transform-origin: ${settings.transformOrigin}`)
    return `${parts.join('; ')};`
  }
  return animation
}

function createCanvasContextStub(): Record<string, unknown> {
  return new Proxy({}, {
    get: () => () => undefined,
    set: () => true,
  })
}

export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
  installBrowserCanvasCompat()
  const expectedPagePaths = options.manifest.pages
    .filter((page) => page.bodyType !== 'component')
    .map((page) => page.path)
  const expectedComponentPaths = [
    ...options.manifest.pages
      .filter((page) => page.bodyType === 'component')
      .map((page) => page.path),
    ...options.manifest.components.map((component) => component.path),
  ]
  const registry = new MiniProgramPageRegistry(expectedPagePaths, expectedComponentPaths)
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  const componentInstances = new Map<string, MiniProgramComponentInstance>()
  let componentSchemas: MiniProgramComponentSchema[] = []
  const pageStack: MiniProgramPageInstance[] = []
  let activePage: MiniProgramPageInstance | null = null
  let pageIdCounter = 0
  let systemInfoSnapshot: SystemInfoSnapshot = {
    pixelRatio: 1,
    windowWidth: 0,
    windowHeight: 0,
  }
  const storageSnapshot: StorageSnapshot = {}
  const apiContext: ServiceApiContext = {
    connection: null as unknown as BridgeConnection,
    getSystemInfoSnapshot: () => systemInfoSnapshot,
    getStorageSnapshot: () => storageSnapshot,
    setStorageSnapshot: (key, value) => {
      storageSnapshot[key] = value
    },
    get pageId() {
      return activePage?.pageId
    },
  }
  const connection = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'service' },
  })
  apiContext.connection = connection
  installMiniProgramGlobals(
    registry,
    createServiceApiHost(apiContext),
    (name) => connection.sendDiagnostic('warn', {
      code: 'UNSUPPORTED_API',
      message: `wx.${name} is not supported in the P0 runtime.`,
    }, activePage?.pageId),
    () => pageStack,
  )
  const createComponentInstance = (
    componentId: string,
    componentPath: string,
    definition: MiniProgramComponentOptions,
  ) => new MiniProgramComponentInstance(
    componentId,
    componentPath,
    definition,
    {
      onDataPatch: (instanceId, patch) => {
        connection.sendEvent('data', 'setData', { componentId: instanceId, patch }, { pageId: activePage?.pageId })
      },
      onTriggerEvent: (instanceId, name, detail, triggerOptions) => {
        connection.sendEvent('event', 'trigger', {
          componentId: instanceId,
          name,
          detail,
          options: triggerOptions,
        })
      },
    },
  )
  const ensureComponentInstance = (
    componentId: string,
    componentPath?: string,
  ): MiniProgramComponentInstance | undefined => {
    const existing = findComponentByInstanceId(componentInstances, componentId)
    if (existing) return existing
    if (!componentPath) return undefined
    const schema = componentSchemas.find((component) => component.path === componentPath)
    const definition = schema ? registry.components.get(componentPath) : undefined
    if (!schema || !definition) return undefined
    const component = createComponentInstance(componentId, componentPath, definition as MiniProgramComponentOptions)
    componentInstances.set(componentId, component)
    return component
  }
  const artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()
  const sendRuntimeState = () => {
    connection.sendDiagnostic('state', createRuntimeStateDiagnostic(
      'service',
      {
        pageStack: pageStack.map((page) => page.pageId),
        currentPage: activePage?.path,
        transport: 'connected',
      },
      activePage?.pageId,
    ))
  }
  const createPageInstance = (path: string, query: Record<string, string> = {}) => {
    const definition = registry.pages.get(path) ?? registry.components.get(path)
    if (!definition) throw new Error(`page is not registered: ${path}`)
    pageIdCounter += 1
    const page = new MiniProgramPageInstance(
      `page-${pageIdCounter}`,
      path,
      definition,
      query,
      (pageId, patch) => {
        connection.sendEvent('data', 'setData', { pageId, patch }, { pageId })
      },
    )
    pageInstances.set(page.pageId, page)
    pageStack.push(page)
    activePage = page
    return page
  }
  const resolveRoute = (fromPath: string, url: string) => {
    const [rawPath, queryString] = url.split('?', 2)
    const path = rawPath!.startsWith('/')
      ? normalizeRoutePath(rawPath!.slice(1))
      : resolveComponentReference(fromPath, rawPath!)
    const query = Object.fromEntries(new URLSearchParams(queryString ?? ''))
    return { path, query }
  }

  connection.onControl('runtime', 'bootstrap', async (message) => {
    try {
      const payload = message.payload as {
        manifest?: ServiceThreadOptions['manifest']
        initialPath?: string
        systemInfo?: SystemInfoSnapshot
        storage?: StorageSnapshot
      }
      currentPath = payload.initialPath ?? currentPath
      await artifactsReady
      if (payload.systemInfo) systemInfoSnapshot = cloneJsonSafe(payload.systemInfo)
      if (payload.storage) Object.assign(storageSnapshot, cloneJsonSafe(payload.storage))
      componentSchemas = buildComponentSchemas(
        options.manifest.components,
        registry.components as Map<string, MiniProgramComponentOptions>,
      )
      const initializeComponent = (path: string, reference: string): MiniProgramComponentInstance | null => {
        const componentPath = resolveComponentReference(path, reference)
        const existing = componentInstances.get(componentPath)
        if (existing) return existing
        const schema = componentSchemas.find((component) => component.path === componentPath)
        const definition = schema ? registry.components.get(componentPath) : undefined
        if (!schema || !definition) return null
        const component = createComponentInstance(
          schema.componentId,
          componentPath,
          definition as MiniProgramComponentOptions,
        )
        componentInstances.set(componentPath, component)
        for (const nestedReference of Object.values(schema.using)) {
          initializeComponent(componentPath, nestedReference)
        }
        return component
      }
      if (pageStack.length === 0) {
        const pageArtifact = findPageArtifact(options.manifest, currentPath)
        const currentPage = createPageInstance(currentPath, {})
        const usingComponents = pageArtifact?.configuration?.effective.usingComponents ?? {}
        const usingSources = pageArtifact?.configuration?.usingComponentsSource ?? {}
        for (const [tag, reference] of Object.entries(usingComponents)) {
          const sourcePath = usingSources[tag] === 'global' ? '' : currentPath
          initializeComponent(sourcePath, String(reference))
        }
        currentPage.triggerLifecycle('onLoad', [currentPage.query])
        currentPage.triggerLifecycle('onShow')
        if (pageArtifact?.bodyType === 'component') {
          currentPage.triggerComponentLifecycle('attached')
          currentPage.triggerComponentLifecycle('ready')
        }
        sendRuntimeState()
      }
      const currentPage = pageStack.at(-1)!
      return {
        status: 'ready',
        registeredPages: [...registry.pages.keys()],
        currentPath,
        pageId: currentPage.pageId,
        initialData: cloneJsonSafe(currentPage.data),
        componentSchemas,
      }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'BOOTSTRAP_ERROR',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl('page', 'ready', async (message) => {
    try {
      const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
      page.triggerLifecycle('onReady')
      sendRuntimeState()
      return { status: 'ready', pageId: page.pageId }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'PAGE_READY_ERROR',
        message: error instanceof Error ? error.message : String(error),
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      })
      throw error
    }
  })

  connection.onControl('page', 'navigateTo', async (message) => {
    const payload = message.payload as { url?: string }
    if (!payload.url) throw new Error('navigateTo requires a url')
    activePage?.triggerLifecycle('onHide')
    activePage?.triggerPageLifetime('hide')
    const route = resolveRoute(currentPath, payload.url)
    const page = createPageInstance(route.path, route.query)
    page.triggerLifecycle('onLoad', [page.query])
    page.triggerLifecycle('onShow')
    page.triggerPageLifetime('show')
    if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
      page.triggerComponentLifecycle('attached')
      page.triggerComponentLifecycle('ready')
    }
    currentPath = page.path
    sendRuntimeState()
    return {
      status: 'navigated',
      path: page.path,
      pageId: page.pageId,
      query: page.query,
      initialData: cloneJsonSafe(page.data),
    }
  })

  connection.onControl('page', 'navigateBack', async (message) => {
    const payload = message.payload as { delta?: number }
    const delta = Math.max(1, Number(payload.delta ?? 1))
    if (delta >= pageStack.length) throw new Error('Cannot navigate back beyond the first page')
    const removed = pageStack.splice(-delta)
    const unloadedPageIds: string[] = []
    for (const page of removed.reverse()) {
      page.triggerLifecycle('onHide')
      page.triggerPageLifetime('hide')
      page.triggerLifecycle('onUnload')
      if (findPageArtifact(options.manifest, page.path)?.bodyType === 'component') {
        page.triggerComponentLifecycle('detached')
      }
      pageInstances.delete(page.pageId)
      unloadedPageIds.push(page.pageId)
    }
    const page = pageStack.at(-1)!
    activePage = page
    currentPath = page.path
    page.triggerLifecycle('onShow')
    page.triggerPageLifetime('show')
    sendRuntimeState()
    return {
      status: 'navigated-back',
      path: page.path,
      pageId: page.pageId,
      initialData: cloneJsonSafe(page.data),
      unloadedPageIds,
    }
  })

  connection.onControl('page', 'hide', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onHide')
    registry.hideApp()
    for (const page of pageStack) page.triggerPageLifetime('hide')
    for (const component of uniqueComponentsByPath(componentInstances)) component.triggerPageLifetime('hide')
    sendRuntimeState()
    return { status: 'hidden', pageId: page.pageId }
  })

  connection.onControl('page', 'show', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    registry.showApp()
    page.triggerLifecycle('onShow')
    for (const page of pageStack) page.triggerPageLifetime('show')
    for (const component of uniqueComponentsByPath(componentInstances)) component.triggerPageLifetime('show')
    sendRuntimeState()
    return { status: 'shown', pageId: page.pageId }
  })

  connection.onControl('page', 'unload', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onUnload')
    pageInstances.delete(page.pageId)
    if (activePage === page) activePage = null
    sendRuntimeState()
    return { status: 'unloaded', pageId: page.pageId }
  })

  connection.onCall('page', 'getInitialData', async (message) => {
    const path = (message.payload as { path?: string }).path ?? currentPath
    const page = findPageArtifact(options.manifest, path)
    if (!page) throw new Error(`page is not declared: ${path}`)
    const definition = registry.pages.get(path)
    return {
      path,
      data: definition?.data ?? {},
    }
  })

  connection.onEvent('runtime', 'componentLifecycle', (message) => {
    const payload = message.payload as {
      componentId: string
      path?: string
      phase: 'created' | 'attached' | 'ready' | 'moved' | 'detached'
      data?: Record<string, unknown>
    }
    const component = ensureComponentInstance(payload.componentId, payload.path)
    component?.syncData(payload.data)
    component?.triggerLifecycle(payload.phase)
  })

  // Component page lifetimes are driven by the page show/hide controls below,
  // which iterate every service-side instance exactly once.
  connection.onEvent('runtime', 'componentPageLifetime', () => {})

  connection.onEvent('event', 'dispatch', (message) => {
    const pageId = message.pageId
    const page = pageId ? pageInstances.get(pageId) : activePage
    if (!page) {
      connection.sendDiagnostic('warn', {
        code: 'EVENT_PAGE_NOT_FOUND',
        message: `No page found for event: ${pageId ?? 'unknown'}`,
      }, pageId)
      return
    }
    const event = message.payload as {
      componentId?: string
      componentPath?: string
      handler?: string
      type?: string
      [key: string]: unknown
    }
    const handler = event.handler
    if (!handler) {
      connection.sendDiagnostic('warn', {
        code: 'EVENT_HANDLER_MISSING',
        message: 'Event payload does not contain a handler name.',
      }, page?.pageId)
      return
    }
    try {
      if (event.componentId) {
        const component = ensureComponentInstance(event.componentId, event.componentPath)
        if (!component) throw new Error(`Component not found for event: ${event.componentId}`)
        component.syncData(event.componentData as Record<string, unknown> | undefined)
        component.invokeMethod(handler, [event])
      } else {
        page.invokeMethod(handler, [event])
      }
    } catch (error) {
      connection.sendDiagnostic('error', {
        code: 'EVENT_HANDLER_ERROR',
        message: error instanceof Error ? error.message : String(error),
        handler,
        eventType: event.type,
      }, page.pageId)
    }
  })

  return {
    connection,
    registry,
    manifest: options.manifest,
    initialPath: options.initialPath,
    get activePage() {
      return activePage
    },
    get pageStack() {
      return pageStack
    },
    pageInstances,
    componentInstances,
  }
}

function requireActivePage(
  pageInstances: Map<string, MiniProgramPageInstance>,
  requestedPageId: string | undefined,
  activePage: MiniProgramPageInstance | null,
): MiniProgramPageInstance {
  const pageId = requestedPageId ?? activePage?.pageId
  const page = pageId ? pageInstances.get(pageId) : null
  if (!page) throw new Error('No active mini-program page')
  return page
}

function findPageArtifact(manifest: ServiceThreadOptions['manifest'], path: string): PageArtifact | undefined {
  return manifest.pages.find((page) => page.path === path)
}

function resolveComponentReference(sourcePath: string, reference: string): string {
  if (reference.startsWith('/')) return reference.slice(1)
  const posix = (value: string) => value.split('\\').join('/')
  const directory = posix(sourcePath).split('/').slice(0, -1)
  const output: string[] = []
  for (const segment of [...directory, ...posix(reference).split('/')]) {
    if (!segment || segment === '.') continue
    if (segment === '..') output.pop()
    else output.push(segment)
  }
  return output.join('/')
}

function normalizeRoutePath(path: string): string {
  return path.split('\\').join('/').replace(/^\.?\//, '').replace(/\/+$/, '')
}

function findComponentByInstanceId(
  componentInstances: Map<string, MiniProgramComponentInstance>,
  componentId: string,
): MiniProgramComponentInstance | undefined {
  for (const component of componentInstances.values()) {
    if (component.componentId === componentId) return component
  }
  return undefined
}

type SelectorQuerySelection = {
  selector?: string
  rectCallback?: (rect: Record<string, unknown>) => void
  fieldsCallback?: (fields: Record<string, unknown>) => void
  nodeCallback?: (node: unknown) => void
}

function createSelectorQueryStub(context: ServiceApiContext): Record<string, unknown> {
  const selections: SelectorQuerySelection[] = []
  let component: { data?: Record<string, unknown> } | undefined
  let execCallback: ((results: unknown[]) => void) | undefined
  let scheduled = false

  const schedule = () => {
    if (scheduled) return
    scheduled = true
    void (async () => {
      const results: Record<string, unknown>[] = []
      for (const selection of selections) {
        results.push(await buildSelectorResult(context, selection, component))
      }
      for (const [index, selection] of selections.entries()) {
        const result = results[index]!
        selection.rectCallback?.(result)
        selection.fieldsCallback?.(result)
        selection.nodeCallback?.(result.node)
      }
      execCallback?.(results)
    })()
  }

  const createSelection = (selector?: string): Record<string, unknown> => {
    const selection: SelectorQuerySelection = { selector }
    selections.push(selection)
    const api: Record<string, unknown> = {
      boundingClientRect: (callback?: (rect: Record<string, unknown>) => void) => {
        selection.rectCallback = callback
        return api
      },
      fields: (
        _options: Record<string, unknown>,
        callback?: (fields: Record<string, unknown>) => void,
      ) => {
        selection.fieldsCallback = callback
        return api
      },
      node: (callback?: (node: unknown) => void) => {
        selection.nodeCallback = callback
        return api
      },
      exec: (callback?: (results: unknown[]) => void) => {
        if (callback) execCallback = callback
        schedule()
        return api
      },
    }
    return api
  }

  const query: Record<string, unknown> = {
    in: (target?: unknown) => {
      component = target as { data?: Record<string, unknown> } | undefined
      return query
    },
    select: (selector?: string) => createSelection(selector),
    selectAll: (selector?: string) => createSelection(selector),
    exec: (callback?: (results: unknown[]) => void) => {
      if (callback) execCallback = callback
      schedule()
      return query
    },
  }
  return query
}

async function buildSelectorResult(
  context: ServiceApiContext,
  selection: SelectorQuerySelection,
  component?: { data?: Record<string, unknown> },
): Promise<Record<string, unknown>> {
  let width = 300
  let height = 150
  let measured: { width?: number; height?: number; canvasId?: string } | undefined
  try {
    measured = await context.connection.call<{ width?: number; height?: number; canvasId?: string }>(
      'canvas',
      'measure',
      { selector: selection.selector },
      { pageId: context.pageId },
    )
    if (measured && Number(measured.width) > 0 && Number(measured.height) > 0) {
      width = Math.round(Number(measured.width))
      height = Math.round(Number(measured.height))
    }
  } catch {
    // Fall back to the default canvas size.
  }
  const canvasId = String(component?.data?.canvasId ?? measured?.canvasId ?? 'canvas')
  const bridged = createBridgedCanvas(width, height, canvasId, (frame) => {
    context.connection.sendEvent('canvas', 'frame', frame, { pageId: context.pageId })
  })
  return {
    node: bridged?.canvas ?? null,
    id: '',
    dataset: {},
    width,
    height,
    left: 0,
    top: 0,
    right: width,
    bottom: height,
  }
}

/**
 * Mini-program canvas adapters (for example ECharts' `WxCanvas`) are plain
 * objects in WeChat, where `document` does not exist. In the browser service
 * thread `document` exists, so libraries that sniff `canvas.addEventListener`
 * treat the wrapper as a DOM node. Provide inert listener methods on plain
 * objects; DOM elements keep their own EventTarget implementation.
 */
function installBrowserCanvasCompat(): void {
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

function uniqueComponentsByPath(
  componentInstances: Map<string, MiniProgramComponentInstance>,
): MiniProgramComponentInstance[] {
  const seen = new Set<string>()
  const result: MiniProgramComponentInstance[] = []
  for (const component of componentInstances.values()) {
    if (seen.has(component.path)) continue
    seen.add(component.path)
    result.push(component)
  }
  return result
}
