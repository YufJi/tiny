import { bootTreeThread, type TreeRenderer } from '@tiny/runtime'
import { installOffscreenCanvasResponder } from './canvas-bridge'
import { installPageLifecycleBridge } from './page-lifecycle'
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

/** Cleanup for the window listeners installed by the previous boot. */
let disposePageLifecycle: (() => void) | undefined

/**
 * Boot the render thread of a browser host: install the OffscreenCanvas
 * responder, run host setup, wait for the host's message port, then create the
 * host render tree and start the tree thread. Entries keep only their renderer
 * factory, so the browser port handshake lives next to the service one.
 *
 * The render document is the page's WebView, so it also owns the scroll
 * container that drives `onPageScroll`, `onReachBottom` and the pull-down
 * gesture. Those events travel as `page.*` events and the host relays them to
 * the service thread.
 */
export function bootBrowserRenderEntry(options: BrowserRenderEntryOptions): void {
  installOffscreenCanvasResponder()
  options.prepare?.()
  listenForRuntimePort('render', (transport) => {
    const runtime = bootTreeThread({
      transport,
      renderer: options.createRenderer(),
      ...(options.pageId ? { initialPageId: options.pageId } : {}),
    })
    // A host may hand this document a second port when it re-boots the thread.
    // Drop the previous listeners first, otherwise every scroll or pull-down
    // gesture would be reported once per boot.
    disposePageLifecycle?.()
    disposePageLifecycle = installPageLifecycleBridge(runtime.connection)
  })
}
