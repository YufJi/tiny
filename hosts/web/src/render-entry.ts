import { bootTreeThread } from '@tiny/runtime'
import { connectHostBridge, installHostBridge } from '@tiny/bridge'
import { installOffscreenCanvasResponder } from './canvas-bridge'
import { installPageLifecycleBridge } from './page-lifecycle'
import type { PageBehaviorConfig } from '@tiny/manifest'
import { listenForRuntimePort } from './runtime-port'
import { createGlassRenderEntry, type GlassRenderEntryOptions } from './render/entry'

export type RenderEntryOptions = GlassRenderEntryOptions & {
  /** Page-shell gesture config supplied by the host (WebView or iframe query). */
  pageBehavior?: Partial<PageBehaviorConfig>
  /**
   * Extra setup to run after the built-in styles are installed and before the
   * thread announces readiness (fonts or host-owned DOM setup).
   */
  prepare?: () => void
}

/** Cleanup for the window listeners installed by the previous boot. */
let disposePageLifecycle: (() => void) | undefined

/**
 * Boot the render thread of a Web host.
 *
 * The browser entry owns the MessageChannel handshake, so it also owns the DOM
 * render tree factory: callers pass the container/templates/asset resolver and
 * do not compose `createGlassRenderEntry` themselves. `createGlassRenderEntry`
 * remains public for WebView hosts that provide their own transport (iOS).
 *
 * The render document is the page's WebView, so it also owns the scroll
 * container that drives `onPageScroll`, `onReachBottom` and the pull-down
 * gesture. Those events travel as `page.*` events and the host relays them to
 * the service thread.
 */
export function bootRenderEntry(options: RenderEntryOptions = {}): void {
  installOffscreenCanvasResponder()
  const entry = createGlassRenderEntry(options)
  entry.prepare()
  options.prepare?.()
  const search = typeof location === 'undefined' ? undefined : new URLSearchParams(location.search)
  const pageBehavior: Partial<PageBehaviorConfig> = {
    enablePullDownRefresh: options.pageBehavior?.enablePullDownRefresh
      ?? search?.get('enablePullDownRefresh') === '1',
    onReachBottomDistance: options.pageBehavior?.onReachBottomDistance
      ?? Number(search?.get('onReachBottomDistance') ?? 50),
  }
  listenForRuntimePort('render', (transport) => {
    installHostBridge(transport)
    const connection = connectHostBridge({
      localRole: 'render',
      peerRole: 'host',
      capabilities: { role: 'render', mode: 'tree' },
    })
    const runtime = bootTreeThread({
      connection,
      renderer: entry.createRenderer(),
      ...(entry.pageId ? { initialPageId: entry.pageId } : {}),
      ...(entry.loadTemplates ? { loadTemplates: entry.loadTemplates } : {}),
      ...(entry.pageFrame ? { pageFrame: true } : {}),
    })
    // A host may hand this document a second port when it re-boots the thread.
    // Drop the previous listeners first, otherwise every scroll or pull-down
    // gesture would be reported once per boot.
    disposePageLifecycle?.()
    disposePageLifecycle = installPageLifecycleBridge(runtime.connection, () => pageBehavior)
  })
}
