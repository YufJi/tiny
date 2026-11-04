import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type WebViewRuntime = {
  _messageListener?: (event: MessageEvent) => void
  _loadListener?: () => void
  _errorListener?: () => void
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors `wx-web-view` with an iframe. WeChat restricts the domain via the
 * platform config; the browser host can only expose the URL and bridge
 * `postMessage` back to the page as a `message` event.
 */
export function defineWebView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('web-view'),
    template: ctx.template('web-view'),
    behaviors: [ctx.behaviors.base],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      ariaLabel: { type: String, value: '' },
    },
    options: ctx.hostOptions('web-view'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as WebViewRuntime
        const frame = (this as unknown as { frameElement: () => HTMLIFrameElement | null })
          .frameElement()
        if (!frame) return
        frame.setAttribute('role', 'link')
        runtime._loadListener = () => this.triggerEvent('load', {})
        runtime._errorListener = () => this.triggerEvent('error', {
          errMsg: 'web-view: failed to load',
        })
        frame.addEventListener('load', runtime._loadListener)
        frame.addEventListener('error', runtime._errorListener)
        runtime._messageListener = (event) => {
          if (event.source !== frame.contentWindow) return
          this.triggerEvent('message', { data: [event.data] })
        }
        if (typeof window !== 'undefined') {
          window.addEventListener('message', runtime._messageListener)
        }
        ;(this as unknown as { srcChanged: (value: string) => void })
          .srcChanged(String(this.data.src ?? ''))
      },
      detached() {
        const runtime = this as unknown as WebViewRuntime
        const frame = (this as unknown as { frameElement: () => HTMLIFrameElement | null })
          .frameElement()
        if (frame) {
          if (runtime._loadListener) frame.removeEventListener('load', runtime._loadListener)
          if (runtime._errorListener) frame.removeEventListener('error', runtime._errorListener)
        }
        if (runtime._messageListener && typeof window !== 'undefined') {
          window.removeEventListener('message', runtime._messageListener)
        }
      },
    },
    methods: {
      frameElement(): HTMLIFrameElement | null {
        const runtime = this as unknown as WebViewRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('frame')
          ?.getBackendElement?.() as HTMLIFrameElement | null
      },
      srcChanged(value: string) {
        const frame = (this as unknown as { frameElement: () => HTMLIFrameElement | null })
          .frameElement()
        if (!frame) return
        const src = String(value ?? '').trim()
        if (!src) {
          frame.removeAttribute('src')
          return
        }
        try {
          frame.src = src
        } catch {
          this.triggerEvent('error', { errMsg: 'web-view: invalid src' })
        }
      },
    },
  }).general()
}
