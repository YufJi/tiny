import { createApiHost, createGlobalEventHub } from '@tiny/api'
import type { ServiceCanvasAdapter, ApiContext, ApiHost } from '@tiny/api'
import { connectHostBridge, installHostBridge } from '@tiny/bridge'
import { bootServiceThread as bootRealServiceThread } from '../../src/service/boot'
import type {
  ServiceThreadOptions,
  ServiceThreadRuntime,
} from '../../src/service/boot'
import type { TemplateRegistry } from '../../src/shared/template'
import type { Transport } from '@tiny/bridge'

type SyncHostCall = (
  domain: string,
  method: string,
  payload: Record<string, unknown>,
) => unknown
import type { AssetUrlResolver } from '../../src/shared/assets'
import { answerSyncFrame } from './sync-frame'

type HarnessConfig = {
  templates: TemplateRegistry
  loadStyle: (path: string) => string
}

type ServiceThreadBootOptions = Omit<
  ServiceThreadOptions,
  | 'connection'
  | 'apiHost'
  | 'events'
  | 'onPageRelease'
  | 'loadTemplates'
  | 'loadStyle'
  | 'onLogicTreeCreated'
> & {
  /** Test host side of the service transport. */
  transport: Transport
  /** Defaults to the standard WeChat-compatible API table. */
  apiHost?: (context: ApiContext) => ApiHost
  /** Host capabilities, composed into the API context. */
  canvas?: ServiceCanvasAdapter
  resolveAssetUrl?: AssetUrlResolver
  syncHost?: SyncHostCall
  launchOptions?: unknown
}

let active: HarnessConfig | undefined
let waiter: ((config: HarnessConfig) => void) | undefined
let lastTree: unknown

export function provideHarnessConfig(config: HarnessConfig): void {
  active = config
  const resolve = waiter
  waiter = undefined
  resolve?.(config)
}

async function currentConfig(): Promise<HarnessConfig> {
  if (active) return active
  return new Promise((resolve) => {
    waiter = resolve
  })
}

export function lastLogicTree(): Record<string, unknown> {
  return (lastTree ?? {}) as Record<string, unknown>
}

/**
 * Test-side host entry: creates the connection, composes the API context with
 * late-bound runtime accessors, and boots the kernel with the resulting table.
 */
export function bootServiceThread(options: ServiceThreadBootOptions): ServiceThreadRuntime {
  const {
    transport,
    apiHost,
    canvas,
    resolveAssetUrl,
    syncHost,
    launchOptions,
    ...runtimeOptions
  } = options
  if (syncHost) {
    transport.sendSync = (frame) => answerSyncFrame(frame, (message) => {
      if (message.domain !== 'api') throw new Error(`unsupported sync host domain: ${message.domain}`)
      return syncHost(message.domain, message.method, (message.payload ?? {}) as Record<string, unknown>)
    })
  }
  installHostBridge(transport)
  const connection = connectHostBridge({
    localRole: 'service',
    peerRole: 'host',
    capabilities: { role: 'service' },
  })
  const events = createGlobalEventHub()
  let runtime: ServiceThreadRuntime | undefined
  const apiContext: ApiContext = {
    connection,
    apiName: runtimeOptions.manifest.runtimeCompatibility.api.global,
    apiNamespaces: [
      runtimeOptions.manifest.runtimeCompatibility.api.global,
      ...runtimeOptions.manifest.runtimeCompatibility.api.aliases,
    ],
    ...(canvas ? { canvas } : {}),
    ...(resolveAssetUrl ? { resolveAssetUrl } : {}),
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
  const apiHostTable = (apiHost ?? ((context) => createApiHost(context)))(apiContext)
  runtime = bootRealServiceThread({
    ...runtimeOptions,
    connection,
    apiHost: apiHostTable,
    events,
    launchOptions,
    ...(canvas ? { onPageRelease: (pageId) => canvas.releaseCanvasNode?.({ pageId }) } : {}),
    ...(resolveAssetUrl ? { resolveAssetUrl } : {}),
    onLogicTreeCreated: (tree) => {
      lastTree = tree
    },
    loadTemplates: async () => (await currentConfig()).templates,
    loadStyle: (path) => active?.loadStyle(path) ?? '',
  })
  return runtime
}
