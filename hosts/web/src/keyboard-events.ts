/**
 * `wx.onKeyDown` / `wx.onKeyUp`.
 *
 * Keys are typed into the render iframe, so the host attaches capture
 * listeners to every same-origin frame it can reach. New frames are discovered
 * by a periodic scan; cross-origin frames are skipped.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type DocumentLike = {
  addEventListener(type: string, listener: (event: unknown) => void, capture?: boolean): void
}

export type FrameLike = { contentDocument?: DocumentLike | null }

export type KeyboardHandlerOptions = {
  emit: (name: string, payload?: unknown) => void
  /** Test seam; defaults to the host document's iframes. */
  frames?: () => FrameLike[]
  /** Discovery interval; set to 0 to disable the timer. */
  intervalMs?: number
}

export function createKeyboardHandlers(
  options: KeyboardHandlerOptions,
): Record<string, (params: HandlerParams) => HandlerResult> {
  const frames = options.frames ?? defaultFrames
  const attached = new WeakSet<DocumentLike>()

  const attach = (): void => {
    for (const frame of frames()) {
      try {
        const document = frame.contentDocument
        if (!document || attached.has(document)) continue
        attached.add(document)
        document.addEventListener('keydown', (event) => emitKey('keyDown', event), true)
        document.addEventListener('keyup', (event) => emitKey('keyUp', event), true)
      } catch {
        // Cross-origin: not inspectable.
      }
    }
  }

  const emitKey = (name: string, raw: unknown): void => {
    const event = raw as { key?: unknown; code?: unknown; keyCode?: unknown }
    options.emit(name, {
      key: String(event?.key ?? ''),
      code: String(event?.code ?? ''),
      keyCode: Number(event?.keyCode ?? 0),
    })
  }

  const interval = options.intervalMs ?? 500
  if (interval > 0 && typeof setInterval === 'function') {
    const timer = setInterval(attach, interval)
    ;(timer as unknown as { unref?: () => void }).unref?.()
  }

  return {
    // Discovery happens here (and on the interval); tests call it directly.
    'keyboard.refresh': () => {
      attach()
      return { errMsg: 'keyboardRefresh:ok' }
    },
  }
}

function defaultFrames(): FrameLike[] {
  if (typeof document === 'undefined') return []
  return [...document.querySelectorAll('iframe')] as unknown as FrameLike[]
}
