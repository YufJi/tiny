import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type RootPortalRuntime = {
  _contentAttached?: boolean
  _lastEnable?: boolean
  _pageReRenderListener?: () => void
  getBackendElement?: () => HTMLElement | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors `wx-root-portal` in WeChat WebView 2.33.0.
 *
 * Reference template engine creates a `wx-root-portal-content` slot host,
 * assigns `style.top = 0`, and the behavior relocates that content node:
 * - `enable=true`  -> `document.documentElement.appendChild(content)`
 * - `enable=false` -> `host.appendChild(content)`
 * - `attached` / `pageReRender` retry; `detached` removes it.
 *
 * Tiny uses `tiny-root-portal-content` instead of the `wx-` tag to keep the
 * host namespace separate; the structure and relocation logic stay the same.
 */
export function defineRootPortal(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('root-portal'),
    template: ctx.template('root-portal'),
    behaviors: [ctx.behaviors.base],
    properties: {
      enable: { type: Boolean, value: true, observer: 'enableChanged' },
    },
    options: ctx.hostOptions('root-portal'),
    lifetimes: {
      created() {
        const runtime = this as unknown as RootPortalRuntime
        runtime._lastEnable = true
        runtime._contentAttached = false
      },
      attached() {
        const runtime = this as unknown as RootPortalRuntime
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (content) content.style.top = '0'
        runtime._pageReRenderListener = () => {
          ;(this as unknown as { tryAttachContent: () => void }).tryAttachContent()
        }
        if (typeof document !== 'undefined') {
          document.addEventListener('pageReRender', runtime._pageReRenderListener)
        }
        ;(this as unknown as { tryAttachContent: () => void }).tryAttachContent()
      },
      detached() {
        const runtime = this as unknown as RootPortalRuntime
        if (runtime._pageReRenderListener && typeof document !== 'undefined') {
          document.removeEventListener('pageReRender', runtime._pageReRenderListener)
        }
        runtime._pageReRenderListener = undefined
        ;(this as unknown as { detachContent: (enable: boolean) => void })
          .detachContent(Boolean(this.data.enable))
      },
    },
    methods: {
      hostElement(): HTMLElement | null {
        return (this as unknown as RootPortalRuntime).getBackendElement?.() ?? null
      },
      contentElement(): HTMLElement | null {
        const runtime = this as unknown as RootPortalRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('content')
          ?.getBackendElement?.() ?? null
      },
      tryAttachContent() {
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        if (host?.isConnected) {
          ;(this as unknown as { attachContent: (enable: boolean) => void })
            .attachContent(Boolean(this.data.enable))
        } else {
          ;(this as unknown as { detachContent: (enable: boolean) => void })
            .detachContent(Boolean(this.data.enable))
        }
      },
      attachContent(enable: boolean) {
        const runtime = this as unknown as RootPortalRuntime
        if (runtime._contentAttached) return
        runtime._contentAttached = true
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!content) return
        if (enable && typeof document !== 'undefined') {
          document.documentElement.appendChild(content)
        } else if (host) {
          host.appendChild(content)
        }
      },
      detachContent(enable: boolean) {
        const runtime = this as unknown as RootPortalRuntime
        if (!runtime._contentAttached) return
        runtime._contentAttached = false
        const host = (this as unknown as { hostElement: () => HTMLElement | null }).hostElement()
        const content = (this as unknown as {
          contentElement: () => HTMLElement | null
        }).contentElement()
        if (!content) return
        if (enable && typeof document !== 'undefined') {
          if (content.parentNode === document.documentElement) {
            document.documentElement.removeChild(content)
          }
        } else if (host && content.parentNode === host) {
          host.removeChild(content)
        }
      },
      enableChanged(next: boolean, previous: boolean) {
        if (next === previous) return
        const runtime = this as unknown as RootPortalRuntime
        if (next !== runtime._lastEnable && runtime._contentAttached) {
          ;(this as unknown as { detachContent: (enable: boolean) => void })
            .detachContent(Boolean(runtime._lastEnable))
          ;(this as unknown as { attachContent: (enable: boolean) => void })
            .attachContent(next)
          runtime._lastEnable = next
        } else {
          runtime._lastEnable = next
        }
      },
    },
  }).general()
}
