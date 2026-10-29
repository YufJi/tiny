import { createHostMessageChannelPair } from '@tiny/bridge'
import type { Transport } from '@tiny/bridge'
import { BROWSER_RUNTIME_NAMES } from '@tiny/host-browser'
import type { RenderThreadConnector } from '@tiny/runtime'

const READY_TIMEOUT_MS = 15_000

function waitForThreadReady(
  iframe: HTMLIFrameElement,
  channel: 'render',
  timeoutMs = READY_TIMEOUT_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup()
      reject(new Error(`render frame did not report ready within ${timeoutMs}ms`))
    }, timeoutMs)
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; channel?: string } | undefined
      if (data?.type !== BROWSER_RUNTIME_NAMES.runtimePortReady || data.channel !== channel) return
      if (event.source !== iframe.contentWindow) return
      cleanup()
      resolve()
    }
    const cleanup = () => {
      window.clearTimeout(timer)
      window.removeEventListener('message', onMessage)
    }
    window.addEventListener('message', onMessage)
  })
}

/**
 * One render iframe per page, all inside the single WKWebView.
 *
 * This is the same page-frame model as the devtool browser host: hidden pages
 * keep their DOM, scroll position, timers and page-scoped WXSS. The only
 * difference is that the service transport goes to JavaScriptCore through the
 * native relay.
 */
export class PageFrameConnector implements RenderThreadConnector {
  private readonly frames = new Map<string, HTMLIFrameElement>()
  private readonly pendingMessages = new Map<string, unknown[]>()
  private activePageId: string | undefined
  private appVisible = true

  constructor(
    private readonly appId: string,
    private readonly container: HTMLElement,
  ) {}

  async connect(pageId: string): Promise<Transport> {
    const iframe = document.createElement('iframe')
    iframe.className = 'tiny-ios-page'
    iframe.dataset.pageId = pageId
    iframe.title = `Tiny page ${pageId}`
    const url = new URL('./render.html', window.location.href)
    url.searchParams.set('app', this.appId)
    url.searchParams.set('pageId', pageId)
    iframe.src = url.href

    const ready = waitForThreadReady(iframe, 'render')
    this.frames.set(pageId, iframe)
    this.container.append(iframe)
    this.updateVisibility()
    try {
      await ready
    } catch (error) {
      this.frames.delete(pageId)
      iframe.remove()
      this.updateVisibility()
      throw error
    }

    const channel = createHostMessageChannelPair()
    const target = iframe.contentWindow
    if (!target) {
      this.frames.delete(pageId)
      iframe.remove()
      throw new Error('render frame has no content window')
    }
    target.postMessage(
      { type: BROWSER_RUNTIME_NAMES.runtimePort, channel: 'render' },
      '*',
      [channel.peerPort as unknown as Transferable],
    )
    this.flushMessages(pageId)
    return channel.hostTransport
  }

  activate(pageId: string): void {
    this.activePageId = pageId
    this.updateVisibility()
    this.flushMessages(pageId)
  }

  getPageFrame(pageId: string): HTMLIFrameElement | undefined {
    return this.frames.get(pageId)
  }

  /**
   * Route a host-side message (canvas commands, snapshots) to one page frame.
   * Commands can arrive while the frame is still booting, so keep a small queue.
   */
  postToPage(pageId: string | undefined, message: unknown): void {
    const targetPageId = pageId || this.activePageId
    if (!targetPageId) {
      for (const frame of this.frames.values()) frame.contentWindow?.postMessage(message, '*')
      return
    }
    const frame = this.frames.get(targetPageId)
    if (frame?.contentWindow) {
      frame.contentWindow.postMessage(message, '*')
      return
    }
    const queue = this.pendingMessages.get(targetPageId) ?? []
    queue.push(message)
    if (queue.length > 256) queue.splice(0, queue.length - 256)
    this.pendingMessages.set(targetPageId, queue)
  }

  disconnect(pageId: string): void {
    const iframe = this.frames.get(pageId)
    this.frames.delete(pageId)
    this.pendingMessages.delete(pageId)
    iframe?.remove()
    if (this.activePageId === pageId) this.activePageId = undefined
    this.updateVisibility()
  }

  setAppVisible(visible: boolean): void {
    this.appVisible = visible
    this.updateVisibility()
  }

  dispose(): void {
    for (const iframe of this.frames.values()) iframe.remove()
    this.frames.clear()
    this.pendingMessages.clear()
    this.activePageId = undefined
  }

  private flushMessages(pageId: string): void {
    const frame = this.frames.get(pageId)
    const queue = this.pendingMessages.get(pageId)
    if (!frame?.contentWindow || !queue?.length) return
    this.pendingMessages.delete(pageId)
    for (const message of queue) frame.contentWindow.postMessage(message, '*')
  }

  private updateVisibility(): void {
    for (const [pageId, iframe] of this.frames) {
      const active = this.appVisible && pageId === this.activePageId
      iframe.classList.toggle('is-active', active)
      iframe.setAttribute('aria-hidden', active ? 'false' : 'true')
    }
  }
}
