import { bootServiceThread, type ServiceThreadOptions } from '@tiny/runtime'
import { createBrowserCanvasAdapter, installBrowserCanvasCompat } from './canvas-bridge'
import { listenForRuntimePort } from './runtime-port'

export type BrowserServiceEntryOptions = {
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  loadTemplates: ServiceThreadOptions['loadTemplates']
  loadArtifacts: NonNullable<ServiceThreadOptions['loadArtifacts']>
  loadStyle?: ServiceThreadOptions['loadStyle']
  resolveAssetUrl: NonNullable<ServiceThreadOptions['resolveAssetUrl']>
  apiExtensions?: ServiceThreadOptions['apiExtensions']
}

/**
 * Boot the service thread of a browser host: install the DOM canvas compat
 * layer, wait for the host's message port, and start the runtime with the
 * browser canvas adapter. Entries keep only their artifact/style loading.
 */
export function bootBrowserServiceEntry(options: BrowserServiceEntryOptions): void {
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
      ...(options.apiExtensions ? { apiExtensions: options.apiExtensions } : {}),
    })
  })
}
