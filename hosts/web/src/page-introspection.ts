/**
 * Page facts that live inside the render iframe: the focused input selection
 * and whether a video is in picture-in-picture.
 *
 * Same-origin frames are inspected directly; a cross-origin frame is skipped,
 * which is why both APIs count as partial (they can only report what the host
 * is allowed to read).
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type DocumentLike = {
  activeElement?: unknown
  pictureInPictureElement?: unknown
}

export type FrameLike = { contentDocument?: DocumentLike | null }

export type PageIntrospectionOptions = {
  /** Test seam; defaults to the host document's iframes. */
  frames?: () => FrameLike[]
}

export function createPageIntrospectionHandlers(
  options: PageIntrospectionOptions = {},
): Record<string, (params: HandlerParams) => HandlerResult> {
  const frames = options.frames ?? defaultFrames

  return {
    'page.selectedTextRange': () => {
      for (const frame of frames()) {
        try {
          const active = frame.contentDocument?.activeElement as {
            tagName?: string
            selectionStart?: number | null
            selectionEnd?: number | null
          } | null | undefined
          const tag = active?.tagName?.toUpperCase()
          if (tag === 'INPUT' || tag === 'TEXTAREA') {
            return {
              start: Number(active?.selectionStart ?? 0),
              end: Number(active?.selectionEnd ?? 0),
              errMsg: 'getSelectedTextRange:ok',
            }
          }
        } catch {
          // A cross-origin frame is not inspectable; keep looking.
        }
      }
      return { start: 0, end: 0, errMsg: 'getSelectedTextRange:ok' }
    },
    'page.pipActive': () => {
      for (const frame of frames()) {
        try {
          if (frame.contentDocument?.pictureInPictureElement) {
            return { isActive: true, errMsg: 'checkIsPictureInPictureActive:ok' }
          }
        } catch {
          // Same as above: skip frames the host cannot read.
        }
      }
      return { isActive: false, errMsg: 'checkIsPictureInPictureActive:ok' }
    },
  }
}

function defaultFrames(): FrameLike[] {
  if (typeof document === 'undefined') return []
  return [...document.querySelectorAll('iframe')] as unknown as FrameLike[]
}
