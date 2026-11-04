import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type PageMetaRuntime = {
  _resizeListener?: () => void
  _scrollListener?: () => void
  _lastScrollTop?: string
  getBackendElement?: () => HTMLElement | null
}

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
 * Mirrors `wx-page-meta`: a page-level configuration node for background,
 * font size, orientation and programmatic page scroll. The node itself renders
 * nothing (`display: contents`).
 */
export function definePageMeta(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('page-meta'),
    template: ctx.template('page-meta'),
    behaviors: [ctx.behaviors.base],
    properties: {
      backgroundTextStyle: { type: String, value: '', observer: 'apply' },
      backgroundColor: { type: String, value: '', observer: 'apply' },
      backgroundColorTop: { type: String, value: '', observer: 'apply' },
      backgroundColorBottom: { type: String, value: '', observer: 'apply' },
      rootBackgroundColor: { type: String, value: '', observer: 'apply' },
      scrollTop: { type: String, value: '', observer: 'scrollTopChanged' },
      scrollDuration: { type: Number, value: 300 },
      pageStyle: { type: String, value: '', observer: 'apply' },
      rootFontSize: { type: String, value: '', observer: 'apply' },
      pageOrientation: { type: String, value: '', observer: 'apply' },
      pageFontSize: { type: String, value: '', observer: 'apply' },
    },
    options: ctx.hostOptions('page-meta'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as PageMetaRuntime
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
        ;(this as unknown as { apply: () => void }).apply()
      },
      detached() {
        const runtime = this as unknown as PageMetaRuntime
        if (typeof window !== 'undefined') {
          if (runtime._resizeListener) window.removeEventListener('resize', runtime._resizeListener)
          if (runtime._scrollListener) window.removeEventListener('scroll', runtime._scrollListener)
        }
      },
    },
    methods: {
      pageRoot(): HTMLElement | null {
        const host = (this as unknown as PageMetaRuntime).getBackendElement?.()
        const root = host?.closest?.('tiny-page')
        return (root as HTMLElement | null) ?? null
      },
      apply() {
        if (typeof document === 'undefined') return
        const root = (this as unknown as { pageRoot: () => HTMLElement | null }).pageRoot()
        const style = String(this.data.pageStyle ?? '')
        if (root) {
          if (style) root.setAttribute('style', convertSize(style))
          const pageFontSize = String(this.data.pageFontSize ?? '')
          if (pageFontSize) root.style.fontSize = convertFontSize(pageFontSize)
          const backgroundColor = String(this.data.backgroundColor ?? '')
          const top = String(this.data.backgroundColorTop ?? '')
          const bottom = String(this.data.backgroundColorBottom ?? '')
          if (backgroundColor) root.style.backgroundColor = backgroundColor
          if (top || bottom) {
            root.style.backgroundImage = `linear-gradient(${top || backgroundColor} 0%, ${bottom || backgroundColor} 100%)`
          }
          if (this.data.backgroundTextStyle) {
            root.dataset.tinyBackgroundTextStyle = String(this.data.backgroundTextStyle)
          }
        }
        const rootFontSize = String(this.data.rootFontSize ?? '')
        if (rootFontSize) document.documentElement.style.fontSize = convertFontSize(rootFontSize)
        const rootBackground = String(this.data.rootBackgroundColor ?? '')
        if (rootBackground) {
          document.documentElement.style.backgroundColor = rootBackground
          if (document.body) document.body.style.backgroundColor = rootBackground
        }
        if (this.data.pageOrientation) {
          document.documentElement.dataset.tinyPageOrientation = String(this.data.pageOrientation)
        }
      },
      scrollTopChanged(value: string) {
        const runtime = this as unknown as PageMetaRuntime
        if (!value || value === runtime._lastScrollTop) return
        runtime._lastScrollTop = value
        if (typeof window === 'undefined') return
        const duration = Math.max(0, Number(this.data.scrollDuration) || 0)
        window.scrollTo({
          top: Math.max(0, Number(value) || 0),
          behavior: duration > 0 ? 'smooth' : 'auto',
        })
      },
    },
  }).general()
}
