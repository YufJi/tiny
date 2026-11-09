import { createApiHost } from '@tiny/api'
import type { ApiContext, ApiHost } from '@tiny/api'
import { connectHostBridge, installHostBridge } from '@tiny/bridge'
import type { TransportFrame } from '@tiny/bridge'
import {
  bootServiceThread,
  type ServiceThreadOptions,
  type ServiceThreadRuntime,
} from '@tiny/runtime'
import { createBrowserCanvasAdapter, installBrowserCanvasCompat } from './canvas-bridge'
import { listenForRuntimePort } from './runtime-port'
import { answerSyncFrame } from './sync-frame'

export type ServiceEntryOptions = {
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  loadTemplates: ServiceThreadOptions['loadTemplates']
  loadArtifacts: NonNullable<ServiceThreadOptions['loadArtifacts']>
  loadStyle?: ServiceThreadOptions['loadStyle']
  resolveAssetUrl: NonNullable<ApiContext['resolveAssetUrl']>
  /**
   * Full API table factory. Defaults to the WeChat-compatible set composed with
   * `apiExtensions`; pass this to replace it entirely.
   */
  apiHost?: (context: ApiContext) => ApiHost
  /** Host-specific APIs composed into the standard table. */
  apiExtensions?: ApiHost
}

/**
 * The browser host injects a synchronous API-level channel into the service
 * frame before bootstrapping it. Resolve it lazily so injection order does not
 * matter; the transport adapter turns frames into these API-level calls.
 */
type InjectedSyncHost = {
  call(domain: string, method: string, payload: Record<string, unknown>): unknown
}

function readInjectedSyncHost(): InjectedSyncHost | undefined {
  return (globalThis as unknown as Record<string, unknown>).__tinySyncHost as
    | InjectedSyncHost
    | undefined
}

const sendSync = (frame: TransportFrame): TransportFrame => {
  const host = readInjectedSyncHost()
  if (!host) throw new Error('the browser host did not install a synchronous channel')
  return answerSyncFrame(frame, (message) => {
    if (message.domain !== 'api') throw new Error(`unsupported sync domain: ${message.domain}`)
    return host.call(
      message.domain,
      message.method,
      (message.payload ?? {}) as Record<string, unknown>,
    )
  })
}

/**
 * Boot the service thread of a Web host.
 *
 * This is the composition point the runtime deliberately does not own: the host
 * creates the connection, builds the API context (host facts plus late-bound
 * runtime accessors), composes the `wx` table and hands both to the kernel.
 */
export function bootServiceEntry(options: ServiceEntryOptions): void {
  installBrowserCanvasCompat()
  listenForRuntimePort('service', (transport) => {
    installHostBridge(transport)
    const connection = connectHostBridge({
      localRole: 'service',
      peerRole: 'host',
      capabilities: { role: 'service' },
    })
    const canvas = createBrowserCanvasAdapter()
    const themeListeners = new Set<(value: unknown) => void>()
    let runtime: ServiceThreadRuntime | undefined

    const compatibility = options.manifest.runtimeCompatibility
    const apiContext: ApiContext = {
      connection,
      apiName: compatibility.api.global,
      apiNamespaces: [compatibility.api.global, ...compatibility.api.aliases],
      canvas,
      resolveAssetUrl: options.resolveAssetUrl,
      themeListeners,
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
    const apiHost = (options.apiHost ?? ((context) => (
      createApiHost(context, options.apiExtensions)
    )))(apiContext)

    runtime = bootServiceThread({
      connection,
      apiHost,
      manifest: options.manifest,
      initialPath: options.initialPath,
      loadTemplates: options.loadTemplates,
      loadArtifacts: options.loadArtifacts,
      ...(options.loadStyle ? { loadStyle: options.loadStyle } : {}),
      themeListeners,
      onPageRelease: (pageId) => canvas.releaseCanvasNode?.({ pageId }),
    })
  }, { sendSync })
}
