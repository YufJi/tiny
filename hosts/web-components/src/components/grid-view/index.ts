import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type GridRuntime = {
  _scrollTop?: number | null
  _scrollLeft?: number | null
  _masonryObserver?: MutationObserver | null
  _pageReRender?: () => void
  _columnHeights?: number[]
  _masonryFrame?: number
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
  normalizeSize?: (value: unknown) => number
  normalizeSizeStr?: (value: unknown) => string
}

type MasonryOptions = {
  rootElement: HTMLElement
  gap?: number
  gapX?: number
  gapY?: number
  maxCrossAxisExtent?: number
  crossAxisCount?: number
  previousColumnHeights?: number[]
  columnHeights?: number[]
}

type SingleItemOptions = {
  child: HTMLElement
  gapX?: number
  gapY?: number
  childWidth?: number
  columnHeights?: number[]
}

function rootOf(instance: unknown): HTMLElement | null {
  return (instance as GridRuntime).getShadowRoot?.()?.getElementById?.('root')
    ?.getBackendElement?.() ?? null
}

/**
 * Mirrors `wx-grid-view` in WeChat WebView 2.33.0.
 *
 * Behavior mapping:
 * - `wx-base`            -> `ctx.behaviors.base`
 * - `wx-hover`           -> `ctx.behaviors.hover`
 * - `wx-reload`          -> `ctx.behaviors.reload`
 * - `wx-size-normalizer` -> `ctx.behaviors.sizeNormalizer`
 *
 * `type` is an observer because glass has no property filter; the observer
 * normalizes the value and then runs the same aligned/masonry update path.
 */
export function defineGridView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('grid-view'),
    template: ctx.template('grid-view'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.hover,
      ctx.behaviors.reload,
      ctx.behaviors.sizeNormalizer,
    ],
    properties: {
      type: { type: String, value: 'aligned', observer: 'typeChanged' },
      crossAxisCount: { type: Number, value: 2, observer: 'gridTemplateColumnsChanged' },
      maxCrossAxisExtent: { type: Number, value: 0, observer: 'gridTemplateColumnsChanged' },
      mainAxisGap: { type: String, value: '0', observer: 'mainAxisGapChanged' },
      crossAxisGap: { type: String, value: '0', observer: 'crossAxisGapChanged' },
    },
    options: ctx.hostOptions('grid-view'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        if (root) {
          if (runtime._scrollTop) root.scrollTop = runtime._scrollTop
          if (runtime._scrollLeft) root.scrollLeft = runtime._scrollLeft
          runtime._scrollTop = null
          runtime._scrollLeft = null
        }
        ;(this as unknown as { updateView: (type?: unknown) => void })
          .updateView(this.data.type)
        runtime._pageReRender = () => {
          ;(this as unknown as { updateView: (type?: unknown) => void })
            .updateView(this.data.type)
        }
        if (typeof document !== 'undefined') {
          document.addEventListener('pageReRender', runtime._pageReRender)
        }
      },
      detached() {
        const runtime = this as unknown as GridRuntime
        runtime._masonryObserver?.disconnect()
        runtime._masonryObserver = null
        if (runtime._masonryFrame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._masonryFrame)
        }
        runtime._masonryFrame = undefined
        if (runtime._pageReRender && typeof document !== 'undefined') {
          document.removeEventListener('pageReRender', runtime._pageReRender)
        }
        runtime._pageReRender = undefined
      },
      saved(state: Record<string, unknown>) {
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        runtime._scrollTop = root?.scrollTop ?? 0
        runtime._scrollLeft = root?.scrollLeft ?? 0
        const saved = {
          _scrollTop: runtime._scrollTop,
          _scrollLeft: runtime._scrollLeft,
        }
        ;(this as unknown as {
          saveCompVar: (target: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(saved, ['_scrollTop', '_scrollLeft'])
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
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        if (root) {
          if (runtime._scrollTop) root.scrollTop = runtime._scrollTop
          if (runtime._scrollLeft) root.scrollLeft = runtime._scrollLeft
        }
      },
    },
    methods: {
      typeChanged(next: unknown, previous: unknown) {
        const value = next === 'masonry' ? 'masonry' : 'aligned'
        if (value !== next) this.setData({ type: value })
        ;(this as unknown as { updateView: (type?: unknown) => void })
          .updateView(value)
        return value
      },
      updateView(type?: unknown) {
        const root = rootOf(this)
        if (!root) return
        if ((type ?? this.data.type) === 'masonry') {
          root.style.display = 'block'
          ;(this as unknown as { updateMasonry: (keep?: boolean) => void }).updateMasonry()
          return
        }
        const runtime = this as unknown as GridRuntime
        runtime._masonryObserver?.disconnect()
        runtime._masonryObserver = null
        for (const child of Array.from(root.children) as HTMLElement[]) {
          child.style.removeProperty('position')
          child.style.removeProperty('width')
          child.style.removeProperty('transform')
        }
        root.style.removeProperty('height')
        root.style.display = 'grid'
        ;(this as unknown as {
          gridTemplateColumnsChanged: () => void
        }).gridTemplateColumnsChanged()
        ;(this as unknown as {
          mainAxisGapChanged: (value: unknown) => void
        }).mainAxisGapChanged(this.data.mainAxisGap)
        ;(this as unknown as {
          crossAxisGapChanged: (value: unknown) => void
        }).crossAxisGapChanged(this.data.crossAxisGap)
      },
      calcColNumByExtent(width: number, maxExtent: number, gap: number): number {
        return Math.ceil((width + gap) / (maxExtent + gap))
      },
      positionMasonry(options: MasonryOptions): number[] | undefined {
        const {
          rootElement,
          gap = 0,
          gapX = gap,
          gapY = gap,
          maxCrossAxisExtent = 0,
          crossAxisCount = 2,
          previousColumnHeights = [],
          columnHeights: suppliedColumnHeights,
        } = options
        if (rootElement.children.length === 0) return undefined
        const width = rootElement.offsetWidth
        const children = (Array.from(rootElement.children) as HTMLElement[])
          .filter((child) => child.clientWidth && child.clientHeight)
        const count = maxCrossAxisExtent
          ? (this as unknown as {
              calcColNumByExtent: (width: number, max: number, gap: number) => number
            }).calcColNumByExtent(width, maxCrossAxisExtent, gapX)
          : crossAxisCount
        const columns = Math.max(1, Math.trunc(count) || 1)
        const childWidth = (width - (columns - 1) * gapX) / columns
        const previous = suppliedColumnHeights ?? previousColumnHeights
        const heights = previous.length === columns
          ? previous
          : new Array(columns).fill(0)
        for (const child of children) {
          ;(this as unknown as {
            updateSingleItem: (options: SingleItemOptions) => void
          }).updateSingleItem({
            child,
            gapX,
            gapY,
            childWidth,
            columnHeights: heights,
          })
        }
        const height = Math.max(...heights)
        rootElement.style.height = `${height}px`
        rootElement.style.position = 'relative'
        return heights
      },
      updateSingleItem(options: SingleItemOptions) {
        const { child, gapX = 0, gapY = 0, childWidth = 0, columnHeights = [] } = options
        if (columnHeights.length === 0) return
        let shortest = 0
        for (let index = 1; index < columnHeights.length; index += 1) {
          if (columnHeights[index]! < columnHeights[shortest]!) shortest = index
        }
        const top = columnHeights[shortest]!
        child.style.position = 'absolute'
        child.style.width = `${childWidth}px`
        child.style.transform = `translate(${shortest * childWidth + gapX * shortest}px, ${top}px)`
        columnHeights[shortest] = top + child.offsetHeight + gapY
      },
      updateMasonry(keepColumns = true) {
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        if (!root) return
        const gapX = runtime.normalizeSize?.(this.data.crossAxisGap) ?? 0
        const gapY = runtime.normalizeSize?.(this.data.mainAxisGap) ?? 0
        runtime._columnHeights = (this as unknown as {
          positionMasonry: (options: MasonryOptions) => number[] | undefined
        }).positionMasonry({
          rootElement: root,
          gapX,
          gapY,
          crossAxisCount: runtime.normalizeSize?.(this.data.crossAxisCount) ?? 2,
          maxCrossAxisExtent: runtime.normalizeSize?.(this.data.maxCrossAxisExtent) ?? 0,
          columnHeights: keepColumns ? runtime._columnHeights : undefined,
        })
        if (!runtime._masonryObserver && typeof MutationObserver !== 'undefined') {
          runtime._masonryObserver = new MutationObserver(() => {
            if (runtime._masonryFrame && typeof cancelAnimationFrame !== 'undefined') {
              cancelAnimationFrame(runtime._masonryFrame)
            }
            runtime._masonryFrame = requestAnimationFrame(() => {
              runtime._masonryFrame = undefined
              ;(this as unknown as { updateMasonry: (keep?: boolean) => void }).updateMasonry(false)
            })
          })
          runtime._masonryObserver.observe(root, { childList: true })
        }
      },
      mainAxisGapChanged(value: unknown) {
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        if (!root) return
        if (this.data.type === 'aligned') {
          root.style.rowGap = runtime.normalizeSizeStr?.(value) ?? String(value ?? '0')
        } else {
          ;(this as unknown as { updateMasonry: (keep?: boolean) => void }).updateMasonry(false)
        }
      },
      crossAxisGapChanged(value: unknown) {
        const runtime = this as unknown as GridRuntime
        const root = rootOf(this)
        if (!root) return
        root.style.columnGap = runtime.normalizeSizeStr?.(value) ?? String(value ?? '0')
        if (this.data.type === 'masonry') {
          ;(this as unknown as { updateMasonry: (keep?: boolean) => void }).updateMasonry(false)
        }
      },
      gridTemplateColumnsChanged() {
        const root = rootOf(this)
        if (!root || this.data.type !== 'aligned') return
        const runtime = this as unknown as GridRuntime
        const maxExtent = runtime.normalizeSize?.(this.data.maxCrossAxisExtent) ?? 0
        if (maxExtent > 0) {
          const width = root.offsetWidth
          const gap = runtime.normalizeSize?.(this.data.crossAxisGap) ?? 0
          const count = this.calcColNumByExtent(width, maxExtent, gap)
          root.style.gridTemplateColumns = `repeat(${count}, minmax(0, ${maxExtent}px))`
        } else {
          const count = Math.max(1, Math.trunc(
            runtime.normalizeSize?.(this.data.crossAxisCount) ?? 2,
          ))
          root.style.gridTemplateColumns = `repeat(${count}, minmax(0, 1fr))`
        }
      },
    },
  }).general()
}
