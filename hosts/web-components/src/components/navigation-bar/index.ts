import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type NavigationBarRuntime = {
  getBackendElement?: () => HTMLElement | null
}

function pageRootOf(host: HTMLElement | null): HTMLElement | null {
  const root = host?.closest?.('tiny-page')
  return (root as HTMLElement | null) ?? null
}

/**
 * Mirrors `wx-navigation-bar`: a config-only node that updates the page's
 * native navigation bar. The browser host exposes the values as page-root
 * data attributes, CSS variables and a `tiny:navigation-bar` event so the
 * debugger/native chrome can consume them without a WeChat bridge.
 */
export function defineNavigationBar(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('navigation-bar'),
    template: ctx.template('navigation-bar'),
    behaviors: [ctx.behaviors.base],
    properties: {
      title: { type: String, value: '', observer: 'apply' },
      loading: { type: Boolean, value: false, observer: 'apply' },
      frontColor: { type: String, value: '#ffffff', observer: 'apply' },
      backgroundColor: { type: String, value: '#000000', observer: 'apply' },
      colorAnimationDuration: { type: Number, value: 0, observer: 'apply' },
      colorAnimationTimingFunc: { type: String, value: 'linear', observer: 'apply' },
    },
    options: ctx.hostOptions('navigation-bar'),
    lifetimes: {
      attached() {
        ;(this as unknown as { apply: () => void }).apply()
      },
    },
    methods: {
      apply() {
        const runtime = this as unknown as NavigationBarRuntime
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
      },
    },
  }).general()
}
