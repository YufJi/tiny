import { createApiHost } from '@tiny/api'
import {
  bootServiceThread,
  type MiniProgramApiHost,
  type ServiceApiFactory,
  type ServiceThreadOptions,
  type SyncHostChannel,
} from '@tiny/runtime'
import { createBrowserCanvasAdapter, installBrowserCanvasCompat } from './canvas-bridge'
import { listenForRuntimePort } from './runtime-port'

export type ServiceEntryOptions = {
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  loadTemplates: ServiceThreadOptions['loadTemplates']
  loadArtifacts: NonNullable<ServiceThreadOptions['loadArtifacts']>
  loadStyle?: ServiceThreadOptions['loadStyle']
  resolveAssetUrl: NonNullable<ServiceThreadOptions['resolveAssetUrl']>
  /**
   * Full mini-program API table factory. Defaults to the WeChat-compatible set
   * composed with `apiExtensions`; pass this to replace it entirely.
   */
  apiHost?: ServiceApiFactory
  /** Host-specific APIs merged over the default WeChat-compatible set. */
  apiExtensions?: MiniProgramApiHost
  /**
   * Synchronous host call path for `*Sync` APIs. Defaults to the channel the
   * browser host injects into this frame as `__tinySyncHost`.
   */
  syncHost?: SyncHostChannel
}

/**
 * The browser host injects a synchronous channel into the service frame before
 * bootstrapping it, because the bridge itself is asynchronous. Resolve it
 * lazily so injection order does not matter.
 */
const injectedSyncHost: SyncHostChannel = {
  call(domain, method, payload) {
    const bridge = (globalThis as unknown as Record<string, unknown>).__tinySyncHost as
      | SyncHostChannel
      | undefined
    if (!bridge) throw new Error('the browser host did not install a synchronous channel')
    return bridge.call(domain, method, payload)
  },
}

/**
 * Boot the service thread of a Web host: install the DOM canvas compat
 * layer, wait for the host's message port, and start the runtime with the
 * browser canvas adapter. Entries keep only their artifact/style loading.
 */
export function bootServiceEntry(options: ServiceEntryOptions): void {
  installBrowserCanvasCompat()
  listenForRuntimePort('service', (transport) => {
    bootServiceThread({
      transport,
      manifest: options.manifest,
      initialPath: options.initialPath,
      loadTemplates: options.loadTemplates,
      loadArtifacts: options.loadArtifacts,
      ...(options.loadStyle ? { loadStyle: options.loadStyle } : {}),
      resolveAssetUrl: options.resolveAssetUrl,
      canvas: createBrowserCanvasAdapter(),
      syncHost: options.syncHost ?? injectedSyncHost,
      // The kernel owns no API table of its own: this host ships the standard
      // WeChat-compatible surface and lets entries overlay device facts.
      apiHost: options.apiHost ?? ((context) => ({
        ...createApiHost(context),
        ...(options.apiExtensions ?? {}),
      })),
    })
  })
}
