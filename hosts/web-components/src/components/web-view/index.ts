import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type WebViewRuntime = {
  _invalid?: boolean
  _frame?: HTMLIFrameElement | null
  getBackendElement?: () => HTMLElement | null
  _messageListener?: (event: MessageEvent) => void
  _loadListener?: () => void
  _errorListener?: () => void
}

function normalizeSrc(value: string): string {
  let hashCount = 0
  return value.trim().replace(/#/g, () => {
    hashCount += 1
    return hashCount > 1 ? '%23' : '#'
  })
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
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.native,
      ctx.behaviors.positioningTarget,
      ctx.behaviors.reload,
    ],
    properties: {
      src: { type: String, value: '', observer: 'srcChanged' },
      ariaLabel: { type: String, value: '' },
    },
    options: ctx.hostOptions('web-view'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as WebViewRuntime
        const host = (this as unknown as { getBackendElement?: () => HTMLElement | null })
          .getBackendElement?.()
        const pageRoot = host?.closest?.('tiny-page')
        if (pageRoot && pageRoot.querySelectorAll('tiny-web-view').length > 1) {
          runtime._invalid = true
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'WEB_VIEW_DUPLICATE',
            message: '<web-view> can only be inserted once per page.',
          })
          return
        }
        runtime._invalid = false
        const root = host?.firstElementChild as HTMLElement | null
        if (!root) return
        root.style.height = '100%'
        root.style.width = '100%'
        const frame = runtime._frame ?? document.createElement('iframe')
        runtime._frame = frame
        frame.setAttribute('allow', 'camera; microphone; autoplay; fullscreen')
        frame.style.border = '0'
        frame.style.display = 'block'
        frame.style.height = '100%'
        frame.style.width = '100%'
        if (frame.parentNode !== root) root.appendChild(frame)
        runtime._loadListener = () => this.triggerEvent('load', {
          src: frame.src,
        })
        runtime._errorListener = () => this.triggerEvent('error', {
          src: frame.src,
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
          frame.remove()
        }
        runtime._frame = null
        if (runtime._messageListener && typeof window !== 'undefined') {
          window.removeEventListener('message', runtime._messageListener)
        }
      },
    },
    methods: {
      frameElement(): HTMLIFrameElement | null {
        const runtime = this as unknown as WebViewRuntime
        if (runtime._frame) return runtime._frame
        const host = runtime.getBackendElement?.()
        return (host?.querySelector?.('iframe') as HTMLIFrameElement | null) ?? null
      },
      srcChanged(value: string) {
        const runtime = this as unknown as WebViewRuntime
        if (runtime._invalid) return
        const frame = (this as unknown as { frameElement: () => HTMLIFrameElement | null })
          .frameElement()
        if (!frame) return
        const src = normalizeSrc(String(value ?? ''))
        if (!src) {
          frame.removeAttribute('src')
          return
        }
        if (frame.src === src) return
        try {
          frame.src = src
        } catch {
          this.triggerEvent('error', { errMsg: 'web-view: invalid src' })
        }
      },
    },
  }).general()
}
