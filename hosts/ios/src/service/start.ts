import { createApiHost, createGlobalEventHub } from '@tiny/api'
import type { ApiContext, ApiHost } from '@tiny/api'
import { bootServiceThread, resolveAssetPath } from '@tiny/runtime'
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
  styles: Record<string, string>
  assetsBase: string
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
function createIOSApiExtensions(iosHost: HostGlobal): ApiHost {
  return {
    getMenuButtonBoundingClientRect: () => iosHost.menuButton ?? {
      width: 87,
      height: 32,
      top: 48,
      right: 365,
      bottom: 80,
      left: 278,
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

  const initialPath = app.manifest.pages.find((page) => page.bodyType !== 'component')?.path
    ?? app.manifest.pages[0]?.path
    ?? ''

  let templates: TemplateRegistry | undefined
  let serviceEvaluated = false

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
    resolveAssetUrl: (assetPath, context) => {
      const resolved = resolveAssetPath(context.sourcePath, assetPath)
      if (!resolved) return undefined
      return app.assetsBase + resolved.split('/').map(encodeURIComponent).join('/')
    },
    events,
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
  const apiHost = createApiHost(apiContext, createIOSApiExtensions(iosHost))
  host.__tinyServiceStarted?.(initialPath)

  try {
    runtime = bootServiceThread({
      connection,
      apiHost,
      manifest: app.manifest,
      initialPath,
      maxPageStack: 10,
      loadTemplates,
      loadStyle: (stylePath) => app.styles[stylePath] ?? '',
      loadArtifacts: async () => {
        if (serviceEvaluated) return
        serviceEvaluated = true
        evaluate(app.serviceSource, 'service.js')
      },
      events,
      onPageRelease: (pageId) => canvas.releaseCanvasNode?.({ pageId }),
    })
  } catch (error) {
    reportError(`service bootstrap: ${errorText(error)}`)
    throw error
  }
}
