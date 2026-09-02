import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/compiler-next'
import { applyDataPatch, cloneJsonSafe, type DataPatch } from './data'
import { buildComponentSchemas } from './component-schema'
import type { ServiceThreadOptions } from './types'
import type {
  MiniProgramComponentSchema,
  StorageSnapshot,
  SystemInfoSnapshot,
} from './types'

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

  constructor(pagePaths: string[]) {
    this.pagePaths = pagePaths
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
    const path = this.pagePaths[this.pages.size]
    if (!path) throw new Error('More Page definitions were registered than declared pages')
    this.pages.set(path, options)
    return options
  }

  registerComponent(options: MiniProgramPageOptions): MiniProgramPageOptions {
    const path = `component:${this.components.size}`
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
    this.lifecycleEvents.push(name)
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
  readonly data: Record<string, unknown>
  readonly lifecycleEvents: string[] = []
  private readonly options: MiniProgramPageOptions
  private readonly methods = new Map<string, (...args: unknown[]) => unknown>()
  private unloaded = false

  constructor(
    pageId: string,
    path: string,
    options: MiniProgramPageOptions,
    private readonly onDataPatch?: (pageId: string, patch: DataPatch) => void,
  ) {
    this.pageId = pageId
    this.path = path
    this.options = options
    this.data = cloneJsonSafe(options.data ?? {})

    for (const [name, value] of Object.entries(options)) {
      if (typeof value !== 'function' || LIFECYCLE_METHODS.has(name)) continue
      this.methods.set(name, value.bind(this))
    }
    for (const [name, method] of Object.entries(options.methods ?? {})) {
      if (typeof method === 'function') this.methods.set(name, method.bind(this))
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
    this.lifecycleEvents.push(name)
    this.options[name]?.apply(this, args)
    if (name === 'onUnload') this.unloaded = true
  }

  getComponentOptions(): MiniProgramPageOptions {
    return this.options
  }
}

export function installMiniProgramGlobals(
  registry: MiniProgramPageRegistry,
  apiHost: MiniProgramApiHost = {},
): void {
  const globalObject = globalThis as unknown as Record<string, unknown>
  globalObject.App = (options: MiniProgramAppOptions) => registry.registerApp(options)
  globalObject.Page = (options: MiniProgramPageOptions) => registry.registerPage(options)
  globalObject.Component = (options: MiniProgramPageOptions) => registry.registerComponent(options)
  globalObject.Behavior = (options: MiniProgramPageOptions) => options
  globalObject.getApp = () => registry.getApp()
  globalObject.wx = apiHost
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
  pageInstances: Map<string, MiniProgramPageInstance>
  componentInstances: Map<string, MiniProgramComponentInstance>
}

export function createServiceApiHost(context: ServiceApiContext): MiniProgramApiHost {
  return {
    getSystemInfoSync: () => cloneJsonSafe(context.getSystemInfoSnapshot()),
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
    navigateTo: (params: unknown) => context.connection.call(
      'api',
      'navigate.to',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    navigateBack: (params: unknown) => context.connection.call(
      'api',
      'navigate.back',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
    showToast: (params: unknown) => context.connection.call(
      'api',
      'toast.show',
      params as Record<string, unknown>,
      { pageId: context.pageId },
    ),
  }
}

export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
  const registry = new MiniProgramPageRegistry(options.manifest.pages.map((page) => page.path))
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  const componentInstances = new Map<string, MiniProgramComponentInstance>()
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
  installMiniProgramGlobals(registry, createServiceApiHost(apiContext))
  const connection = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'service' },
  })
  apiContext.connection = connection
  const artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()

  connection.onControl('runtime', 'bootstrap', async (message) => {
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
    const componentSchemas = buildComponentSchemas(
      options.manifest.components,
      registry.components as Map<string, MiniProgramComponentOptions>,
    )
    const initializeComponent = (path: string, reference: string): MiniProgramComponentInstance | null => {
      const componentPath = resolveComponentReference(path, reference)
      const existing = componentInstances.get(componentPath)
      if (existing) return existing
      const index = options.manifest.components.findIndex((component) => component.path === componentPath)
      const schema = componentSchemas[index]
      const definition = schema ? registry.components.get(`component:${index}`) : undefined
      if (!schema || !definition) return null
      const component = new MiniProgramComponentInstance(
        schema.componentId,
        componentPath,
        definition as MiniProgramComponentOptions,
        {
          onDataPatch: (componentId, patch) => {
            connection.sendEvent('data', 'setData', { componentId, patch }, { pageId: activePage?.pageId })
          },
          onTriggerEvent: (componentId, name, detail, triggerOptions) => {
            connection.sendEvent('event', 'trigger', { componentId, name, detail, options: triggerOptions })
          },
        },
      )
      componentInstances.set(componentPath, component)
      for (const nestedReference of Object.values(schema.using)) {
        initializeComponent(componentPath, nestedReference)
      }
      return component
    }
    if (!activePage || activePage.path !== currentPath) {
      const definition = registry.pages.get(currentPath)
      if (!definition) throw new Error(`page is not registered: ${currentPath}`)
      pageIdCounter += 1
      activePage = new MiniProgramPageInstance(
        `page-${pageIdCounter}`,
        currentPath,
        definition,
        (pageId, patch) => {
          connection.sendEvent('data', 'setData', { pageId, patch }, { pageId })
        },
      )
      pageInstances.set(activePage.pageId, activePage)
      const pageArtifact = findPageArtifact(options.manifest, currentPath)
      const usingComponents = pageArtifact?.configuration?.effective.usingComponents ?? {}
      const usingSources = pageArtifact?.configuration?.usingComponentsSource ?? {}
      for (const [tag, reference] of Object.entries(usingComponents)) {
        const sourcePath = usingSources[tag] === 'global' ? '' : currentPath
        initializeComponent(sourcePath, String(reference))
      }
      activePage.triggerLifecycle('onLoad', [{}])
      activePage.triggerLifecycle('onShow')
    }
    return {
      status: 'ready',
      registeredPages: [...registry.pages.keys()],
      currentPath,
      pageId: activePage.pageId,
      initialData: cloneJsonSafe(activePage.data),
      componentSchemas,
    }
  })

  connection.onControl('page', 'ready', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onReady')
    return { status: 'ready', pageId: page.pageId }
  })

  connection.onControl('page', 'hide', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onHide')
    registry.hideApp()
    for (const component of componentInstances.values()) component.triggerPageLifetime('hide')
    return { status: 'hidden', pageId: page.pageId }
  })

  connection.onControl('page', 'show', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    registry.showApp()
    page.triggerLifecycle('onShow')
    for (const component of componentInstances.values()) component.triggerPageLifetime('show')
    return { status: 'shown', pageId: page.pageId }
  })

  connection.onControl('page', 'unload', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onUnload')
    pageInstances.delete(page.pageId)
    if (activePage === page) activePage = null
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
      phase: 'created' | 'attached' | 'ready' | 'moved' | 'detached'
      data?: Record<string, unknown>
    }
    const component = findComponentByInstanceId(componentInstances, payload.componentId)
    component?.syncData(payload.data)
    component?.triggerLifecycle(payload.phase)
  })

  connection.onEvent('runtime', 'componentPageLifetime', (message) => {
    const payload = message.payload as { componentId: string; phase: 'show' | 'hide' }
    findComponentByInstanceId(componentInstances, payload.componentId)
      ?.triggerPageLifetime(payload.phase)
  })

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
        const component = findComponentByInstanceId(componentInstances, event.componentId)
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

function findComponentByInstanceId(
  componentInstances: Map<string, MiniProgramComponentInstance>,
  componentId: string,
): MiniProgramComponentInstance | undefined {
  for (const component of componentInstances.values()) {
    if (component.componentId === componentId) return component
  }
  return undefined
}
