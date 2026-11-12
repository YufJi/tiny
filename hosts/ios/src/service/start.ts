import { createApiHost, createGlobalEventHub } from '@tiny/api'
import type { ApiContext, ApiHost } from '@tiny/api'
import { bootServiceThread } from '@tiny/runtime'
import type {
  RuntimeManifest,
  ServiceThreadRuntime,
  TemplateRegistry,
} from '@tiny/runtime'
import { connectHostBridge, installHostBridge } from '@tiny/bridge'
import type { Transport, TransportFrame } from '@tiny/bridge'
import { installHostShims } from './shims'
import { answerSyncFrame } from './sync-frame'
import { createRemoteCanvasAdapter } from './canvas'

export type TinyIOSApp = {
  appId: string
  label: string
  manifest: RuntimeManifest
  templatesSource: string
  serviceSource: string
  /** Compiler-emitted service chunks keyed by subpackage root. */
  subPackageSources?: Record<string, string>
  styles: Record<string, string>
  assetsBase: string
  launchOptions?: unknown
}

type HostGlobal = Record<string, any>

type InjectedSyncHost = {
  call(domain: string, method: string, payload: Record<string, unknown>): unknown
}

const globalEval: (source: string) => unknown = eval

function errorText(error: unknown): string {
  if (error instanceof Error) return error.stack || error.message
  return String(error)
}

function reportError(message: string): void {
  const host = globalThis as unknown as HostGlobal
  try {
    host.__tinyError?.(message)
  } catch {
    // Host reporting is best effort.
  }
}

function evaluate(source: string, name: string): void {
  try {
    globalEval(source)
  } catch (error) {
    const message = `${name}: ${errorText(error)}`
    reportError(message)
    throw error
  }
}

function createNativeTransport(): Transport {
  const host = globalThis as unknown as HostGlobal
  let listener: ((frame: TransportFrame) => void) | undefined
  const pending: string[] = []

  host.__tinyReceiveFrame = (raw: string) => {
    if (!listener) {
      pending.push(raw)
      return
    }
    try {
      listener(JSON.parse(raw) as TransportFrame)
    } catch (error) {
      reportError(`service frame: ${errorText(error)}`)
    }
  }

  return {
    send(frame) {
      if (typeof host.__tinySend !== 'function') {
        throw new Error('The native service bridge is not installed')
      }
      host.__tinySend(JSON.stringify(frame))
    },
    close() {
      listener = undefined
    },
    onFrame(next) {
      listener = next
      while (pending.length > 0) {
        const raw = pending.shift()!
        try {
          next(JSON.parse(raw) as TransportFrame)
        } catch (error) {
          reportError(`service frame: ${errorText(error)}`)
        }
      }
      return () => {
        if (listener === next) listener = undefined
      }
    },
    sendSync() {
      throw new Error('The native service transport has no synchronous path')
    },
  }
}

function performanceExtension(): Record<string, unknown> {
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())
  return {
    createObserver: () => ({
      observe() {},
      disconnect() {},
      connect() {},
    }),
    now,
    mark() {},
    measure() {},
    clearMarks() {},
    clearMeasures() {},
    getEntries: () => [],
    getEntriesByName: () => [],
    getEntriesByType: () => [],
  }
}

/**
 * Device facts the JSCore engine cannot observe from inside the service
 * context: the menu-button geometry comes from the native chrome, performance
 * from the engine's own clock.
 */
function createIOSApiExtensions(
  iosHost: HostGlobal,
  readSystemInfo: () => HostGlobal,
): ApiHost {
  const currentWindowInfo = () => {
    const info = readSystemInfo()
    return info && typeof info === 'object' ? info : {}
  }

  return {
    getDeviceInfo: () => {
      const info = currentWindowInfo()
      return {
        brand: info.brand,
        model: info.model,
        system: info.system,
        platform: info.platform,
        pixelRatio: info.pixelRatio,
      }
    },
    getWindowInfo: () => {
      const info = currentWindowInfo()
      return {
        pixelRatio: info.pixelRatio,
        screenWidth: info.screenWidth,
        screenHeight: info.screenHeight,
        windowWidth: info.windowWidth,
        windowHeight: info.windowHeight,
        statusBarHeight: info.statusBarHeight,
        safeArea: info.safeArea,
        screenTop: 0,
      }
    },
    getAppBaseInfo: () => {
      const info = currentWindowInfo()
      return {
        SDKVersion: info.SDKVersion,
        language: info.language,
        version: info.version,
        theme: info.theme,
        host: info.host,
        enableDebug: info.enableDebug,
      }
    },
    getMenuButtonBoundingClientRect: () => {
      if (iosHost.menuButton) return iosHost.menuButton
      const info = currentWindowInfo()
      const width = Number(info.windowWidth ?? info.screenWidth ?? 375)
      const statusBarHeight = Number(info.statusBarHeight ?? 20)
      const top = statusBarHeight + 4
      const right = width - 8
      return {
        width: 87,
        height: 32,
        top,
        right,
        bottom: top + 32,
        left: right - 87,
      }
    },
    getPerformance: performanceExtension,
  }
}

/**
 * Boot one mini-program service thread inside a JavaScriptCore context.
 *
 * The native host evaluates the generic engine after installing `__tinySend`,
 * `__tinySchedule` and the logging callbacks, and after injecting
 * `globalThis.__TINY_IOS_APP__` with the compiled app data. The engine is
 * app-agnostic; per-app manifests, templates, scripts and WXSS arrive as data.
 */
export function startTinyService(app: TinyIOSApp): void {
  installHostShims()
  const host = globalThis as unknown as HostGlobal
  const iosHost = (host.__TINY_IOS__ ?? {}) as HostGlobal

  // The first declared page is the launch page; whether it is a Page or a
  // Component-as-page is decided by its own registration at runtime.
  const initialPath = app.manifest.pages[0]?.path ?? ''
  const launchOptions = app.launchOptions ?? {
    path: initialPath,
    query: {},
    scene: 1001,
  }

  let templates: TemplateRegistry | undefined
  let serviceEvaluated = false
  const evaluatedSubPackages = new Set<string>()

  const loadTemplates = (): TemplateRegistry => {
    if (templates) return templates
    // templates.js is the compiler's ESM entry. JSCore has no module loader,
    // so turn its single `export default` into the return value of a factory.
    const transformed = app.templatesSource.replace(/\bexport\s+default\s+/, 'return ')
    if (transformed === app.templatesSource) {
      throw new Error('templates.js does not contain an export default')
    }
    let value: TemplateRegistry
    try {
      value = new Function(transformed)() as TemplateRegistry
    } catch (error) {
      const message = `templates.js: ${errorText(error)}`
      reportError(message)
      throw error
    }
    if (!value) throw new Error('templates.js did not return a template registry')
    templates = value
    return value
  }

  const transport = createNativeTransport()
  installHostBridge(transport)
  const connection = connectHostBridge({
    localRole: 'service',
    peerRole: 'host',
    capabilities: { role: 'service' },
  })
  const canvas = createRemoteCanvasAdapter((payload) => {
    const send = host.__tinyCanvasSend
    if (typeof send === 'function') send(JSON.stringify(payload))
  })
  // JSCore blocks are synchronous, so the native host serves `*Sync` APIs
  // inline. Without the block those APIs throw instead of using cached state.
  const nativeSyncCall = host.__tinySyncHostCall as
    | ((method: string, payload: string) => string)
    | undefined
  const syncHost: InjectedSyncHost | undefined = typeof nativeSyncCall === 'function'
    ? {
        call: (domain, method, payload) => {
          if (domain !== 'api') throw new Error(`unsupported sync host domain: ${domain}`)
          const result = nativeSyncCall(method, JSON.stringify(payload ?? {}))
          if (result === undefined || result === null || result === 'null') return undefined
          const parsed = JSON.parse(result) as Record<string, unknown>
          if (parsed && typeof parsed === 'object' && 'error' in parsed) {
            throw new Error(String(parsed.error))
          }
          return parsed
        },
      }
    : undefined
  if (syncHost) {
    transport.sendSync = (frame) => answerSyncFrame(frame, (message) => {
      if (message.domain !== 'api') throw new Error(`unsupported sync domain: ${message.domain}`)
      return syncHost.call(
        message.domain,
        message.method,
        (message.payload ?? {}) as Record<string, unknown>,
      )
    })
  }
  const readSystemInfo = (): HostGlobal => {
    if (typeof nativeSyncCall === 'function') {
      try {
        const raw = nativeSyncCall('system.info', '{}')
        const parsed = raw ? JSON.parse(raw) : null
        if (parsed && typeof parsed === 'object') return parsed as HostGlobal
      } catch (error) {
        reportError(`system.info: ${errorText(error)}`)
      }
    }
    return (iosHost.system ?? {}) as HostGlobal
  }

  const compatibility = app.manifest.runtimeCompatibility
  let runtime: ServiceThreadRuntime | undefined
  const events = createGlobalEventHub({
    onListenerError: (event, error) => connection.sendDiagnostic('warn', {
      code: 'GLOBAL_EVENT_LISTENER_ERROR',
      message: `${event}: ${error instanceof Error ? error.message : String(error)}`,
    }),
  })
  const apiContext: ApiContext = {
    connection,
    apiName: compatibility.api.global,
    apiNamespaces: [compatibility.api.global, ...compatibility.api.aliases],
    canvas,
    // The API layer passes an app-root path; only map it to a loadable URL.
    resolveAssetUrl: (assetPath) => (
      app.assetsBase + assetPath.split('/').map(encodeURIComponent).join('/')
    ),
    events,
    launchOptions,
    getActivePage: () => runtime?.activePage,
    getCurrentPagePath: () => runtime?.activePage?.path,
    get pageId() {
      return runtime?.activePage?.pageId
    },
    get tabBar() {
      return runtime?.tabBar
    },
    setNextPageEventChannel: (channel) => (
      runtime?.setNextPageEventChannel(channel) ?? (() => {})
    ),
  }
  const apiHost = createApiHost(apiContext, createIOSApiExtensions(iosHost, readSystemInfo))
  host.__tinyServiceStarted?.(initialPath)

  try {
    runtime = bootServiceThread({
      connection,
      apiHost,
      manifest: app.manifest,
      initialPath,
      launchOptions,
      maxPageStack: 10,
      loadTemplates,
      loadStyle: (stylePath) => app.styles[stylePath] ?? '',
      resolveAssetUrl: apiContext.resolveAssetUrl,
      resolveProtocolRelativeUrl: (url) => `https:${url}`,
      loadArtifacts: async () => {
        if (serviceEvaluated) return
        serviceEvaluated = true
        evaluate(app.serviceSource, 'service.js')
      },
      loadSubPackage: async (root) => {
        if (evaluatedSubPackages.has(root)) return
        const source = app.subPackageSources?.[root]
        if (!source) return
        evaluatedSubPackages.add(root)
        evaluate(source, `${root}.js`)
      },
      events,
      onPageRelease: (pageId) => canvas.releaseCanvasNode?.({ pageId }),
    })
  } catch (error) {
    reportError(`service bootstrap: ${errorText(error)}`)
    throw error
  }
}
