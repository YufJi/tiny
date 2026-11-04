import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

export type MediaQueryMetrics = {
  width: number
  height: number
}

export type MediaQueryConditions = {
  width?: unknown
  minWidth?: unknown
  maxWidth?: unknown
  height?: unknown
  minHeight?: unknown
  maxHeight?: unknown
  orientation?: unknown
}

type MatchMediaRuntime = {
  _mediaQuery?: MediaQueryList
  _mediaQueryListener?: (event: MediaQueryListEvent) => void
  _onResize?: () => void
  _hidden?: boolean
  _originalDisplay?: string
  getBackendElement?: () => HTMLElement | null
}

function pixels(value: unknown): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

/**
 * Matches the viewport conditions of `<match-media>`.
 *
 * WeChat treats 0/empty as "not set"; `width`/`height` are exact values while
 * the min/max variants are inclusive. CSS viewport orientation is portrait when
 * height >= width.
 */
export function matchesMediaQuery(
  metrics: MediaQueryMetrics,
  conditions: MediaQueryConditions,
): boolean {
  const width = pixels(conditions.width)
  const minWidth = pixels(conditions.minWidth)
  const maxWidth = pixels(conditions.maxWidth)
  const height = pixels(conditions.height)
  const minHeight = pixels(conditions.minHeight)
  const maxHeight = pixels(conditions.maxHeight)

  if (width > 0 && metrics.width !== width) return false
  if (minWidth > 0 && metrics.width < minWidth) return false
  if (maxWidth > 0 && metrics.width > maxWidth) return false
  if (height > 0 && metrics.height !== height) return false
  if (minHeight > 0 && metrics.height < minHeight) return false
  if (maxHeight > 0 && metrics.height > maxHeight) return false

  const orientation = String(conditions.orientation ?? '')
  if (orientation === 'portrait' && metrics.width > metrics.height) return false
  if (orientation === 'landscape' && metrics.height >= metrics.width) return false
  return true
}

/** Build the CSS media query the reference virtual DOM would observe. */
export function buildMediaQuery(conditions: MediaQueryConditions): string {
  const parts: string[] = []
  const exact = (name: string, value: unknown): void => {
    const size = pixels(value)
    if (size > 0) parts.push(`(${name}: ${size}px)`)
  }
  exact('width', conditions.width)
  exact('min-width', conditions.minWidth)
  exact('max-width', conditions.maxWidth)
  exact('height', conditions.height)
  exact('min-height', conditions.minHeight)
  exact('max-height', conditions.maxHeight)
  const orientation = String(conditions.orientation ?? '')
  if (orientation === 'portrait' || orientation === 'landscape') {
    parts.push(`(orientation: ${orientation})`)
  }
  return parts.join(' and ')
}

function viewportMetrics(): MediaQueryMetrics {
  return {
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }
}

function clearObserver(runtime: MatchMediaRuntime): void {
  if (runtime._mediaQuery && runtime._mediaQueryListener) {
    if (typeof runtime._mediaQuery.removeEventListener === 'function') {
      runtime._mediaQuery.removeEventListener('change', runtime._mediaQueryListener)
    } else {
      runtime._mediaQuery.removeListener(runtime._mediaQueryListener)
    }
  }
  runtime._mediaQuery = undefined
  runtime._mediaQueryListener = undefined
  if (runtime._onResize && typeof window !== 'undefined') {
    window.removeEventListener('resize', runtime._onResize)
    window.removeEventListener('orientationchange', runtime._onResize)
  }
  runtime._onResize = undefined
}

/**
 * Mirrors `wx-match-media` in WeChat WebView 2.30.1:
 * the host stays in the tree and only the internal display style is toggled;
 * the slotted content is never unmounted. The reference observes viewport
 * media queries, so the browser host uses `matchMedia` instead of resize-polling.
 */
export function defineMatchMedia(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('match-media'),
    template: ctx.template('match-media'),
    behaviors: [ctx.behaviors.base],
    properties: {
      width: { type: Number, value: 0, observer: 'update' },
      minWidth: { type: Number, value: 0, observer: 'update' },
      maxWidth: { type: Number, value: 0, observer: 'update' },
      height: { type: Number, value: 0, observer: 'update' },
      minHeight: { type: Number, value: 0, observer: 'update' },
      maxHeight: { type: Number, value: 0, observer: 'update' },
      orientation: { type: String, value: '', observer: 'update' },
    },
    options: ctx.hostOptions('match-media'),
    lifetimes: {
      attached() {
        ;(this as unknown as { update: () => void }).update()
      },
      detached() {
        clearObserver(this as unknown as MatchMediaRuntime)
      },
    },
    methods: {
      applyMatch(matched: boolean) {
        const runtime = this as unknown as MatchMediaRuntime
        const host = runtime.getBackendElement?.()
        if (!host?.style) return
        if (matched) {
          if (runtime._hidden) {
            if (runtime._originalDisplay) host.style.display = runtime._originalDisplay
            else host.style.removeProperty('display')
            runtime._hidden = false
          }
          return
        }
        if (!runtime._hidden) {
          runtime._originalDisplay = host.style.display
          host.style.display = 'none'
          runtime._hidden = true
        }
      },
      update() {
        const runtime = this as unknown as MatchMediaRuntime
        const host = runtime.getBackendElement?.()
        if (!host?.isConnected) return
        clearObserver(runtime)
        const query = buildMediaQuery(this.data as MediaQueryConditions)
        if (!query) {
          ;(this as unknown as { applyMatch: (matched: boolean) => void })
            .applyMatch(true)
          return
        }
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
          const mediaQuery = window.matchMedia(query)
          const listener = (event: MediaQueryListEvent) => {
            ;(this as unknown as { applyMatch: (matched: boolean) => void })
              .applyMatch(event.matches)
          }
          runtime._mediaQuery = mediaQuery
          runtime._mediaQueryListener = listener
          if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', listener)
          } else {
            mediaQuery.addListener(listener)
          }
          ;(this as unknown as { applyMatch: (matched: boolean) => void })
            .applyMatch(mediaQuery.matches)
          return
        }
        const apply = () => {
          const metrics = viewportMetrics()
          ;(this as unknown as { applyMatch: (matched: boolean) => void })
            .applyMatch(matchesMediaQuery(metrics, this.data as MediaQueryConditions))
        }
        runtime._onResize = apply
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', apply)
          window.addEventListener('orientationchange', apply)
        }
        apply()
      },
    },
  }).general()
}
