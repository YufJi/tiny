import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type KeyboardAccessoryRuntime = {
  _focusListener?: () => void
  _blurListener?: () => void
  _viewportListener?: () => void
  _nativeInput?: HTMLInputElement | HTMLTextAreaElement | null
  getBackendElement?: () => HTMLElement | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

/**
 * Mirrors `wx-keyboard-accessory`: a bar that appears above the native
 * keyboard while the parent `<input>` / `<textarea>` is focused. The browser
 * host positions it with `position: fixed` and the VisualViewport API when
 * available.
 */
export function defineKeyboardAccessory(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('keyboard-accessory'),
    template: ctx.template('keyboard-accessory'),
    behaviors: [ctx.behaviors.base],
    properties: {
      maxHeight: { type: Number, value: 200, observer: 'maxHeightChanged' },
    },
    options: ctx.hostOptions('keyboard-accessory'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as KeyboardAccessoryRuntime
        const host = runtime.getBackendElement?.()
        const owner = host?.closest?.('tiny-input, tiny-textarea') as HTMLElement | null
        const native = owner?.querySelector('input, textarea') as
          | HTMLInputElement
          | HTMLTextAreaElement
          | null
        runtime._nativeInput = native
        ;(this as unknown as { maxHeightChanged: (value: number) => void })
          .maxHeightChanged(Number(this.data.maxHeight) || 200)
        if (!native) return
        runtime._focusListener = () => {
          ;(this as unknown as { handleShowKeyboard: () => void }).handleShowKeyboard()
        }
        runtime._blurListener = () => {
          ;(this as unknown as { handleHideKeyboard: () => void }).handleHideKeyboard()
        }
        native.addEventListener('focus', runtime._focusListener)
        native.addEventListener('blur', runtime._blurListener)
        runtime._viewportListener = () => {
          ;(this as unknown as { position: () => void }).position()
        }
        if (typeof window !== 'undefined' && window.visualViewport) {
          window.visualViewport.addEventListener('resize', runtime._viewportListener)
          window.visualViewport.addEventListener('scroll', runtime._viewportListener)
        }
        if (document.activeElement === native) {
          ;(this as unknown as { handleShowKeyboard: () => void }).handleShowKeyboard()
        }
      },
      detached() {
        const runtime = this as unknown as KeyboardAccessoryRuntime
        const native = runtime._nativeInput
        if (native) {
          if (runtime._focusListener) native.removeEventListener('focus', runtime._focusListener)
          if (runtime._blurListener) native.removeEventListener('blur', runtime._blurListener)
        }
        if (runtime._viewportListener && typeof window !== 'undefined' && window.visualViewport) {
          window.visualViewport.removeEventListener('resize', runtime._viewportListener)
          window.visualViewport.removeEventListener('scroll', runtime._viewportListener)
        }
        runtime._nativeInput = null
      },
    },
    methods: {
      container(): HTMLElement | null {
        const runtime = this as unknown as KeyboardAccessoryRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('container')?.getBackendElement?.() ?? null
      },
      maxHeightChanged(value: number) {
        const container = (this as unknown as { container: () => HTMLElement | null }).container()
        if (container) container.style.maxHeight = `${Math.max(0, value)}px`
      },
      _inLandscapeOrientation() {
        return typeof window !== 'undefined' && window.innerWidth > window.innerHeight
      },
      position() {
        const container = (this as unknown as { container: () => HTMLElement | null }).container()
        if (!container || typeof window === 'undefined') return
        const viewport = window.visualViewport
        if (!viewport) {
          container.style.bottom = '0px'
          return
        }
        const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        container.style.bottom = `${offset}px`
      },
      handleShowKeyboard() {
        if (this._inLandscapeOrientation()) return
        const container = (this as unknown as { container: () => HTMLElement | null }).container()
        if (!container) return
        container.style.display = 'block'
        ;(this as unknown as { position: () => void }).position()
      },
      handleHideKeyboard() {
        const container = (this as unknown as { container: () => HTMLElement | null }).container()
        if (!container) return
        container.style.display = 'none'
      },
    },
  }).general()
}
