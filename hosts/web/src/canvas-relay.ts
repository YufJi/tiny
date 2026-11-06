import { BROWSER_RUNTIME_NAMES } from './naming'

export type CanvasHandoffRelayOptions = {
  serviceIframe: HTMLIFrameElement
  /** Resolve the render iframe for a page. */
  getRenderIframe: (pageId?: string) => HTMLIFrameElement | undefined
  isRenderSource: (source: MessageEventSource | null) => boolean
}

/**
 * Browser-host relay for the OffscreenCanvas handoff.
 *
 * The service thread asks its parent for a canvas handle; the parent forwards
 * the request to the render iframe that owns the page. The render iframe
 * transfers the OffscreenCanvas back through this relay.
 */
export function installCanvasHandoffRelay(
  options: CanvasHandoffRelayOptions,
): () => void {
  const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin
  const serviceWindow = options.serviceIframe.contentWindow
  const sendToService = (payload: Record<string, unknown>, transfer: Transferable[] = []): void => {
    try {
      serviceWindow?.postMessage(payload, targetOrigin, transfer)
    } catch {
      // The service iframe may already be gone.
    }
  }
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    const data = event.data as {
      type?: string
      token?: string
      status?: string
      pageId?: string
      offscreen?: OffscreenCanvas
    } | undefined
    if (!data?.type || !data.token) return
    if (event.source === serviceWindow && data.type === BROWSER_RUNTIME_NAMES.canvasRequest) {
      const deliver = (attempt: number): void => {
        const renderWindow = options.getRenderIframe(data.pageId)?.contentWindow
        if (!renderWindow) {
          if (attempt < 100) {
            setTimeout(() => deliver(attempt + 1), 50)
          } else {
            sendToService({
              type: BROWSER_RUNTIME_NAMES.canvasError,
              token: data.token,
              reason: 'render-not-found',
            })
          }
          return
        }
        try {
          renderWindow.postMessage(data, targetOrigin)
        } catch {
          sendToService({
            type: BROWSER_RUNTIME_NAMES.canvasError,
            token: data.token,
            reason: 'render-post-failed',
          })
        }
      }
      deliver(0)
      return
    }
    if (!options.isRenderSource(event.source)) return
    if (data.type === BROWSER_RUNTIME_NAMES.canvasHandoff) {
      if (data.status === 'transferred' && !data.offscreen) {
        sendToService({
          type: BROWSER_RUNTIME_NAMES.canvasError,
          token: data.token,
          reason: 'missing-offscreen',
        })
        return
      }
      const transfer = data.status === 'transferred' && data.offscreen
        ? [data.offscreen]
        : []
      sendToService(data as Record<string, unknown>, transfer)
      return
    }
    if (data.type === BROWSER_RUNTIME_NAMES.canvasError) {
      sendToService(data as Record<string, unknown>)
    }
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}
