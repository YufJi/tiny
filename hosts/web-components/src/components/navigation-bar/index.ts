import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type NavigationBarRuntime = {
  _valid?: boolean
  _dirtyFields?: Record<string, boolean>
  _dirtyFrame?: number
  getBackendElement?: () => HTMLElement | null
}

const DIRTY_FIELDS = ['title', 'loading', 'color'] as const

function pageRootOf(host: HTMLElement | null): HTMLElement | null {
  return (host?.closest?.('tiny-page') as HTMLElement | null) ?? null
}

/**
 * Mirrors `wx-navigation-bar` in WeChat WebView 2.33.0.
 *
 * It is a page-meta config node: the reference requires it to be the first
 * child of `<page-meta>`, batches title/loading/color updates into a
 * requestAnimationFrame and calls the native navigation APIs. The browser host
 * exposes the same state on the page root and a `tiny:navigation-bar` event.
 */
export function defineNavigationBar(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('navigation-bar'),
    template: ctx.template('navigation-bar'),
    behaviors: [ctx.behaviors.base],
    properties: {
      title: { type: String, value: '' },
      loading: { type: Boolean, value: false },
      frontColor: { type: String, value: '#ffffff' },
      backgroundColor: { type: String, value: '#000000' },
      colorAnimationDuration: { type: Number, value: 0 },
      colorAnimationTimingFunc: { type: String, value: 'linear' },
    },
    observers: {
      title() { this.update('title') },
      loading() { this.update('loading') },
      frontColor() { this.update('color') },
      backgroundColor() { this.update('color') },
      colorAnimationDuration() { this.update('color') },
      colorAnimationTimingFunc() { this.update('color') },
    },
    options: ctx.hostOptions('navigation-bar'),
    lifetimes: {
      created() {
        const runtime = this as unknown as NavigationBarRuntime
        runtime._valid = false
        runtime._dirtyFields = Object.fromEntries(
          DIRTY_FIELDS.map((field) => [field, false]),
        )
      },
      attached() {
        const runtime = this as unknown as NavigationBarRuntime
        const host = runtime.getBackendElement?.()
        const pageMeta = host?.closest?.('tiny-page-meta') as HTMLElement | null
        runtime._valid = Boolean(pageMeta && pageMeta.firstElementChild === host)
        if (!runtime._valid) {
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'NAVIGATION_BAR_NOT_IN_PAGE_META',
            message: '<navigation-bar> must be the first child of <page-meta> and cannot be inside wx:if/wx:for.',
          })
          return
        }
        ;(this as unknown as { update: (field: string) => void }).update('')
      },
      detached() {
        const runtime = this as unknown as NavigationBarRuntime
        if (runtime._dirtyFrame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._dirtyFrame)
        }
        runtime._dirtyFrame = undefined
      },
    },
    methods: {
      update(field: string) {
        const runtime = this as unknown as NavigationBarRuntime
        if (field && runtime._dirtyFields && field in runtime._dirtyFields) {
          runtime._dirtyFields[field] = true
        }
        if (!runtime._valid || typeof requestAnimationFrame === 'undefined') return
        if (runtime._dirtyFrame) return
        runtime._dirtyFrame = requestAnimationFrame(() => {
          runtime._dirtyFrame = undefined
          ;(this as unknown as { applyUpdates: () => void }).applyUpdates()
        })
      },
      applyUpdates() {
        const runtime = this as unknown as NavigationBarRuntime
        if (!runtime._valid || !runtime._dirtyFields) return
        const root = pageRootOf(runtime.getBackendElement?.() ?? null)
        const detail = {
          title: String(this.data.title ?? ''),
          loading: Boolean(this.data.loading),
          frontColor: String(this.data.frontColor ?? '#ffffff'),
          backgroundColor: String(this.data.backgroundColor ?? '#000000'),
          colorAnimationDuration: Number(this.data.colorAnimationDuration) || 0,
          colorAnimationTimingFunc: String(this.data.colorAnimationTimingFunc ?? 'linear'),
        }
        if (root) {
          root.dataset.tinyNavigationTitle = detail.title
          root.dataset.tinyNavigationLoading = detail.loading ? 'true' : 'false'
          root.style.setProperty('--tiny-navbar-front-color', detail.frontColor)
          root.style.setProperty('--tiny-navbar-background-color', detail.backgroundColor)
          root.style.setProperty(
            '--tiny-navbar-color-animation-duration',
            `${detail.colorAnimationDuration}ms`,
          )
          root.style.setProperty(
            '--tiny-navbar-color-animation-timing',
            detail.colorAnimationTimingFunc,
          )
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tiny:navigation-bar', { detail }))
        }
        for (const field of DIRTY_FIELDS) runtime._dirtyFields[field] = false
      },
    },
  }).general()
}
