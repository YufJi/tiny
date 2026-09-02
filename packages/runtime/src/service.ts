import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/compiler-next'
import { applyDataPatch, cloneJsonSafe, type DataPatch } from './data'
import type { ServiceThreadOptions } from './types'

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

export type ServiceThreadRuntime = {
  connection: BridgeConnection
  registry: MiniProgramPageRegistry
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  activePage: MiniProgramPageInstance | null
  pageInstances: Map<string, MiniProgramPageInstance>
}

export function createServiceApiHost(): MiniProgramApiHost {
  const storage = new Map<string, unknown>()
  return {
    getSystemInfoSync: () => ({
      pixelRatio: globalThis.devicePixelRatio ?? 1,
      windowWidth: globalThis.innerWidth ?? 0,
      windowHeight: globalThis.innerHeight ?? 0,
    }),
    getStorageSync: (key: unknown) => storage.get(String(key)),
    setStorageSync: (key: unknown, value: unknown) => {
      storage.set(String(key), value)
      return undefined
    },
    showToast: () => ({ errMsg: 'showToast:ok' }),
  }
}

export function bootServiceThread(options: ServiceThreadOptions): ServiceThreadRuntime {
  const registry = new MiniProgramPageRegistry(options.manifest.pages.map((page) => page.path))
  installMiniProgramGlobals(registry, createServiceApiHost())
  const connection = new BridgeConnection({
    localRole: 'service',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'service' },
  })
  let currentPath = options.initialPath
  const pageInstances = new Map<string, MiniProgramPageInstance>()
  let activePage: MiniProgramPageInstance | null = null
  let pageIdCounter = 0
  const artifactsReady = options.loadArtifacts?.() ?? Promise.resolve()

  connection.onControl('runtime', 'bootstrap', async (message) => {
    const payload = message.payload as { manifest?: ServiceThreadOptions['manifest']; initialPath?: string }
    currentPath = payload.initialPath ?? currentPath
    await artifactsReady
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
      activePage.triggerLifecycle('onLoad', [{}])
      activePage.triggerLifecycle('onShow')
    }
    return {
      status: 'ready',
      registeredPages: [...registry.pages.keys()],
      currentPath,
      pageId: activePage.pageId,
      initialData: cloneJsonSafe(activePage.data),
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
    return { status: 'hidden', pageId: page.pageId }
  })

  connection.onControl('page', 'show', async (message) => {
    const page = requireActivePage(pageInstances, (message.payload as { pageId?: string }).pageId, activePage)
    page.triggerLifecycle('onShow')
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

  return {
    connection,
    registry,
    manifest: options.manifest,
    initialPath: options.initialPath,
    get activePage() {
      return activePage
    },
    pageInstances,
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
