import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type PageMetaRuntime = {
  _valid: boolean
  _dirtyFields: Record<string, boolean>
  _dirtyFrame?: number
  _resizeListener?: () => void
  _scrollListener?: () => void
  _scrollDoneTimer?: ReturnType<typeof setTimeout>
  normalizeSize?: (value: unknown) => number
  getBackendElement?: () => HTMLElement | null
}

const DIRTY_FIELDS = [
  'backgroundTextStyle',
  'backgroundColor',
  'rootBackgroundColor',
  'scrollTop',
  'pageStyle',
  'rootFontSize',
  'pageOrientation',
] as const

function convertSize(value: string): string {
  return value.replace(/(-?\d*\.?\d+)rpx/g, (_, raw: string) => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 375
    return `${(Number(raw) * width) / 750}px`
  })
}

function convertFontSize(value: string): string {
  if (value === 'system') {
    if (typeof document === 'undefined') return '16px'
    return getComputedStyle(document.documentElement).fontSize || '16px'
  }
  return convertSize(value)
}

/**
 * Mirrors `wx-page-meta` in WeChat WebView 2.33.0.
 *
 * Behaviors: `wx-base` + `wx-size-normalizer`. The reference batches most
 * updates into a requestAnimationFrame and applies pageStyle/rootFontSize on
 * the leading edge; this port keeps the same dirty-field model. Native page
 * background/orientation APIs are replaced by page-root styles and data
 * attributes in the browser host.
 */
export function definePageMeta(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('page-meta'),
    template: ctx.template('page-meta'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.sizeNormalizer],
    properties: {
      backgroundTextStyle: { type: String, value: '' },
      backgroundColor: { type: String, value: '' },
      backgroundColorTop: { type: String, value: '' },
      backgroundColorBottom: { type: String, value: '' },
      rootBackgroundColor: { type: String, value: '' },
      scrollTop: { type: String, value: '' },
      scrollDuration: { type: Number, value: 300 },
      pageStyle: { type: String, value: '' },
      rootFontSize: { type: String, value: '' },
      pageOrientation: { type: String, value: '' },
      pageFontSize: { type: String, value: '' },
    },
    observers: {
      backgroundTextStyle() { this.update('backgroundTextStyle') },
      backgroundColor() { this.update('backgroundColor') },
      backgroundColorTop() { this.update('backgroundColor') },
      backgroundColorBottom() { this.update('backgroundColor') },
      rootBackgroundColor() { this.update('rootBackgroundColor') },
      pageStyle() { this.update('pageStyle') },
      rootFontSize() { this.update('rootFontSize') },
      pageOrientation() { this.update('pageOrientation') },
      pageFontSize() { this.update('pageStyle') },
      scrollTop() {
        if (this.data.scrollTop) this.update('scrollTop')
      },
    },
    options: ctx.hostOptions('page-meta'),
    lifetimes: {
      created() {
        const runtime = this as unknown as PageMetaRuntime
        runtime._valid = false
        runtime._dirtyFields = Object.fromEntries(DIRTY_FIELDS.map((key) => [key, false]))
      },
      attached() {
        const runtime = this as unknown as PageMetaRuntime
        const host = runtime.getBackendElement?.()
        const pageRoot = host?.closest?.('tiny-page') as HTMLElement | null
        runtime._valid = Boolean(pageRoot && pageRoot.firstElementChild === host)
        if (!runtime._valid) {
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'PAGE_META_NOT_FIRST',
            message: '<page-meta> must be the first node of the page and cannot be inside wx:if/wx:for.',
          })
          return
        }
        runtime._resizeListener = () => {
          if (typeof window === 'undefined') return
          this.triggerEvent('resize', {
            size: { windowWidth: window.innerWidth, windowHeight: window.innerHeight },
          })
        }
        runtime._scrollListener = () => {
          if (typeof window === 'undefined') return
          this.triggerEvent('scroll', { scrollTop: window.scrollY })
        }
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', runtime._resizeListener)
          window.addEventListener('scroll', runtime._scrollListener, { passive: true })
        }
        ;(this as unknown as { update: (field: string) => void }).update('')
      },
      detached() {
        const runtime = this as unknown as PageMetaRuntime
        if (typeof window !== 'undefined') {
          if (runtime._resizeListener) window.removeEventListener('resize', runtime._resizeListener)
          if (runtime._scrollListener) window.removeEventListener('scroll', runtime._scrollListener)
        }
        if (runtime._dirtyFrame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._dirtyFrame)
        }
        runtime._dirtyFrame = undefined
        if (runtime._scrollDoneTimer) clearTimeout(runtime._scrollDoneTimer)
        runtime._scrollDoneTimer = undefined
        runtime._resizeListener = undefined
        runtime._scrollListener = undefined
      },
    },
    methods: {
      pageRoot(): HTMLElement | null {
        const host = (this as unknown as PageMetaRuntime).getBackendElement?.()
        return (host?.closest?.('tiny-page') as HTMLElement | null) ?? null
      },
      update(field: string) {
        const runtime = this as unknown as PageMetaRuntime
        if (field && field in runtime._dirtyFields) {
          runtime._dirtyFields[field] = true
        }
        if (!runtime._valid || typeof document === 'undefined') return
        if (runtime._dirtyFields.pageStyle) {
          runtime._dirtyFields.pageStyle = false
          const root = (this as unknown as { pageRoot: () => HTMLElement | null }).pageRoot()
          if (root) {
            root.setAttribute('style', convertSize(String(this.data.pageStyle ?? '')))
            if (this.data.pageFontSize) {
              root.style.fontSize = convertFontSize(String(this.data.pageFontSize))
            }
          }
        }
        if (runtime._dirtyFields.rootFontSize) {
          runtime._dirtyFields.rootFontSize = false
          document.documentElement.style.fontSize = convertFontSize(
            String(this.data.rootFontSize ?? ''),
          )
        }
        if (!runtime._dirtyFrame && typeof requestAnimationFrame !== 'undefined') {
          runtime._dirtyFrame = requestAnimationFrame(() => {
            runtime._dirtyFrame = undefined
            ;(this as unknown as { applyUpdates: () => void }).applyUpdates()
          })
        }
      },
      applyUpdates() {
        const runtime = this as unknown as PageMetaRuntime
        const root = (this as unknown as { pageRoot: () => HTMLElement | null }).pageRoot()
        if (runtime._dirtyFields.backgroundTextStyle) {
          runtime._dirtyFields.backgroundTextStyle = false
          if (root) {
            const style = String(this.data.backgroundTextStyle ?? '')
            if (style) root.dataset.tinyBackgroundTextStyle = style
            else delete root.dataset.tinyBackgroundTextStyle
          }
        }
        if (runtime._dirtyFields.backgroundColor) {
          runtime._dirtyFields.backgroundColor = false
          if (root) {
            const background = String(this.data.backgroundColor ?? '')
            const top = String(this.data.backgroundColorTop ?? '')
            const bottom = String(this.data.backgroundColorBottom ?? '')
            if (background) root.style.backgroundColor = background
            else root.style.removeProperty('background-color')
            if (top || bottom) {
              root.style.backgroundImage = `linear-gradient(${top || background} 0%, ${bottom || background} 100%)`
            } else {
              root.style.removeProperty('background-image')
            }
          }
        }
        if (runtime._dirtyFields.scrollTop) {
          runtime._dirtyFields.scrollTop = false
          if (typeof window !== 'undefined') {
            const top = Math.max(0, runtime.normalizeSize?.(this.data.scrollTop) ?? 0)
            const duration = Math.max(0, Number(this.data.scrollDuration) || 0)
            window.scrollTo({ top, behavior: duration > 0 ? 'smooth' : 'auto' })
            if (runtime._scrollDoneTimer) clearTimeout(runtime._scrollDoneTimer)
            runtime._scrollDoneTimer = setTimeout(() => {
              runtime._scrollDoneTimer = undefined
              this.triggerEvent('scrolldone', {})
            }, duration)
          }
        }
        if (runtime._dirtyFields.pageOrientation) {
          runtime._dirtyFields.pageOrientation = false
          if (root && typeof document !== 'undefined') {
            const orientation = String(this.data.pageOrientation ?? '')
            if (orientation) document.documentElement.dataset.tinyPageOrientation = orientation
            else delete document.documentElement.dataset.tinyPageOrientation
          }
        }
        if (runtime._dirtyFields.rootBackgroundColor) {
          runtime._dirtyFields.rootBackgroundColor = false
          const color = String(this.data.rootBackgroundColor ?? '')
          if (color) {
            document.documentElement.style.backgroundColor = color
            if (document.body) document.body.style.backgroundColor = color
          } else {
            document.documentElement.style.removeProperty('background-color')
            if (document.body) document.body.style.removeProperty('background-color')
          }
        }
      },
    },
  }).general()
}
