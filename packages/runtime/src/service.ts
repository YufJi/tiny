import { BridgeConnection } from '@tiny/bridge'
import type { PageArtifact } from '@tiny/compiler-next'
import type { ServiceThreadOptions } from './types'

export type MiniProgramPageOptions = {
  data?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
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

  connection.onControl('runtime', 'bootstrap', async (message) => {
    const payload = message.payload as { manifest?: ServiceThreadOptions['manifest']; initialPath?: string }
    currentPath = payload.initialPath ?? currentPath
    return {
      status: 'ready',
      registeredPages: [...registry.pages.keys()],
      currentPath,
    }
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
  }
}

function findPageArtifact(manifest: ServiceThreadOptions['manifest'], path: string): PageArtifact | undefined {
  return manifest.pages.find((page) => page.path === path)
}
