import type { Transport, TransportFrame } from '@tiny/bridge'
import { postServiceFrame } from './native'

/**
 * Service transport backed by the native relay.
 *
 * The render side lives in iframes inside the same WKWebView, so only the
 * service frame crosses the native boundary. Frames are forwarded as JSON
 * strings to preserve the Bridge frame boundary exactly.
 */
export function createNativeServiceTransport(): Transport {
  let listener: ((frame: TransportFrame) => void) | undefined
  let disposed = false
  const pending: string[] = []

  const tinyWindow = window as Window & {
    __tinyHostReceive?: (frame: string) => void
  }

  tinyWindow.__tinyHostReceive = (raw: string) => {
    if (disposed) return
    if (!listener) {
      pending.push(raw)
      return
    }
    try {
      listener(JSON.parse(raw))
    } catch (error) {
      console.error('[tiny ios] invalid service frame', error)
    }
  }

  return {
    send(frame: unknown) {
      if (disposed) return
      postServiceFrame(frame)
    },
    close() {
      disposed = true
      listener = undefined
      pending.length = 0
    },
    onFrame(next) {
      listener = next
      while (pending.length > 0) {
        const raw = pending.shift()!
        try {
          next(JSON.parse(raw) as TransportFrame)
        } catch (error) {
          console.error('[tiny ios] invalid queued service frame', error)
        }
      }
      return () => {
        if (listener === next) listener = undefined
      }
    },
  }
}
