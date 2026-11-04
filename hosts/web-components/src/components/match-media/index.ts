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
  _onResize?: () => void
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

/**
 * Mirrors `wx-match-media`: the host stays in the tree and only toggles
 * `display`; the slotted content is never unmounted.
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
        const runtime = this as unknown as MatchMediaRuntime
        const update = () => {
          ;(this as unknown as { update: () => void }).update()
        }
        runtime._onResize = update
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', update)
          window.addEventListener('orientationchange', update)
        }
        update()
      },
      detached() {
        const runtime = this as unknown as MatchMediaRuntime
        if (runtime._onResize && typeof window !== 'undefined') {
          window.removeEventListener('resize', runtime._onResize)
          window.removeEventListener('orientationchange', runtime._onResize)
        }
        runtime._onResize = undefined
      },
    },
    methods: {
      update() {
        const runtime = this as unknown as MatchMediaRuntime
        const host = runtime.getBackendElement?.()
        if (!host?.style) return
        const width = typeof window !== 'undefined' ? window.innerWidth : 0
        const height = typeof window !== 'undefined' ? window.innerHeight : 0
        const matched = matchesMediaQuery({ width, height }, this.data as MediaQueryConditions)
        host.style.display = matched ? '' : 'none'
      },
    },
  }).general()
}
