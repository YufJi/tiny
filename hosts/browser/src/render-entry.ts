import { bootTreeThread, type TreeRenderer } from '@tiny/runtime'
import { installOffscreenCanvasResponder } from './canvas-bridge'
import { listenForRuntimePort } from './runtime-port'

export type BrowserRenderEntryOptions = {
  /**
   * Runs before the thread announces readiness, so host-owned setup (built-in
   * styles, fonts) is in place before the host transfers the message port.
   */
  prepare?: () => void
  /** Build the render tree for this render thread (one per page). */
  createRenderer: () => TreeRenderer
  /** Page id when the render document was created for a specific page. */
  pageId?: string
}

/**
 * Boot the render thread of a browser host: install the OffscreenCanvas
 * responder, run host setup, wait for the host's message port, then create the
 * host render tree and start the tree thread. Entries keep only their renderer
 * factory, so the browser port handshake lives next to the service one.
 */
export function bootBrowserRenderEntry(options: BrowserRenderEntryOptions): void {
  installOffscreenCanvasResponder()
  options.prepare?.()
  listenForRuntimePort('render', (transport) => {
    bootTreeThread({
      transport,
      renderer: options.createRenderer(),
      ...(options.pageId ? { initialPageId: options.pageId } : {}),
    })
  })
}
