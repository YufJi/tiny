import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type CoverViewRuntime = {
  _content?: HTMLElement | null
  _scrollListener?: () => void
  _lastScrollTime?: number
  normalizeSize?: (value: unknown) => number
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors the DOM-observable part of `wx-cover-view` in WeChat WebView 2.33.0.
 *
 * Reference structure: a native placeholder `#container.wx-cover-view` plus a
 * slotted `#content.wx-cover-view`; the host block rules and scroll
 * properties/events are kept. The native cover layer itself
 * (`wx-native-cover` / `wx-native-hover` / `wx-native`) has no browser
 * equivalent, so this host renders in normal DOM order above sibling content.
 */
export function defineCoverView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('cover-view'),
    template: ctx.template('cover-view'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.native,
      ctx.behaviors.positioningTarget,
      ctx.behaviors.nativeCover,
      ctx.behaviors.nativeHover,
      ctx.behaviors.reload,
      ctx.behaviors.sizeNormalizer,
    ],
    properties: {
      scrollLeft: { type: String, value: '-1', observer: 'scrollLeftChanged' },
      scrollTop: { type: String, value: '-1', observer: 'scrollTopChanged' },
      viewName: { type: String, value: 'TextView' },
      markerId: { type: Number, value: -1 },
    },
    options: ctx.hostOptions('cover-view'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as CoverViewRuntime
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        runtime._content = content
        if (!content) return
        runtime._scrollListener = () => {
          ;(this as unknown as { handleScroll: () => void }).handleScroll()
        }
        content.addEventListener('scroll', runtime._scrollListener, { passive: true })
        ;(this as unknown as { scrollLeftChanged: (value: unknown) => void })
          .scrollLeftChanged(this.data.scrollLeft)
        ;(this as unknown as { scrollTopChanged: (value: unknown) => void })
          .scrollTopChanged(this.data.scrollTop)
      },
      detached() {
        const runtime = this as unknown as CoverViewRuntime
        if (runtime._content && runtime._scrollListener) {
          runtime._content.removeEventListener('scroll', runtime._scrollListener)
        }
        runtime._content = null
        runtime._scrollListener = undefined
      },
      saved(state: Record<string, unknown>) {
        const runtime = this as unknown as CoverViewRuntime
        const saved = {
          _savedScrollLeft: runtime._content?.scrollLeft ?? 0,
          _savedScrollTop: runtime._content?.scrollTop ?? 0,
        }
        ;(this as unknown as {
          saveCompVar: (target: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(saved, ['_savedScrollLeft', '_savedScrollTop'])
        ;(this as unknown as {
          saveState: (target: Record<string, unknown>, value: Record<string, unknown>) => void
        }).saveState(state, saved)
      },
      restored(state: Record<string, unknown>) {
        const restored = (this as unknown as {
          restoreState: (target: Record<string, unknown>) => Record<string, unknown> | undefined
        }).restoreState(state)
        if (!restored) return
        ;(this as unknown as {
          restoreCompVar: (target: Record<string, unknown>) => void
        }).restoreCompVar(restored)
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!content) return
        content.scrollLeft = Number(restored._savedScrollLeft) || 0
        content.scrollTop = Number(restored._savedScrollTop) || 0
      },
    },
    methods: {
      contentElement(): HTMLElement | null {
        const runtime = this as unknown as CoverViewRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('content')
          ?.getBackendElement?.() ?? null
      },
      normalizedScroll(value: unknown): number {
        const runtime = this as unknown as CoverViewRuntime
        const normalized = runtime.normalizeSize?.(value)
        return normalized === undefined ? Number(value) || -1 : normalized
      },
      scrollLeftChanged(value: unknown) {
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        const normalized = (this as unknown as {
          normalizedScroll: (value: unknown) => number
        }).normalizedScroll(value)
        if (normalized < 0) return
        if (content) content.scrollLeft = normalized
      },
      scrollTopChanged(value: unknown) {
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        const normalized = (this as unknown as {
          normalizedScroll: (value: unknown) => number
        }).normalizedScroll(value)
        if (normalized < 0) return
        if (content) content.scrollTop = normalized
      },
      handleScroll() {
        const runtime = this as unknown as CoverViewRuntime
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!content) return
        const now = Date.now()
        if (runtime._lastScrollTime && now - runtime._lastScrollTime < 20) return
        runtime._lastScrollTime = now
        this.triggerEvent('scroll', {
          scrollLeft: content.scrollLeft,
          scrollTop: content.scrollTop,
          scrollHeight: content.scrollHeight,
          scrollWidth: content.scrollWidth,
        }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
