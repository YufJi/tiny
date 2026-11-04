import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type PageContainerRuntime = {
  _timer?: ReturnType<typeof setTimeout>
  _frame?: number
  _display?: boolean
  _startY?: number
  _pageYOffset?: number
  _overlayListener?: (event: Event) => void
  _touchStartListener?: (event: TouchEvent) => void
  _touchMoveListener?: (event: TouchEvent) => void
  getBackendElement?: () => HTMLElement | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => HTMLElement | null
    } | null
  } | null
}

type PageContainerElements = {
  container: HTMLElement | null
  overlay: HTMLElement | null
  content: HTMLElement | null
}

const POSITIONS = new Set(['top', 'bottom', 'center', 'right'])

export function normalizePageContainerPosition(value: unknown): string {
  const position = String(value ?? 'bottom')
  return POSITIONS.has(position) ? position : 'bottom'
}

export function pageContainerStartTransform(position: string): string {
  if (position === 'top') return 'translate3d(0, -100%, 0)'
  if (position === 'bottom') return 'translate3d(0, 100%, 0)'
  if (position === 'right') return 'translate3d(100%, 0, 0)'
  return 'scale(0.7)'
}

/**
 * Mirrors `wx-page-container`: a fixed overlay plus a positioned popup panel
 * with enter/leave transitions. WeChat renders this in a native full-screen
 * layer; the browser host uses fixed-position DOM.
 */
export function definePageContainer(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('page-container'),
    template: ctx.template('page-container'),
    behaviors: [ctx.behaviors.base],
    properties: {
      show: { type: Boolean, value: false, observer: 'showChanged' },
      duration: { type: Number, value: 300 },
      zIndex: { type: Number, value: 100 },
      overlay: { type: Boolean, value: true },
      position: { type: String, value: 'bottom' },
      round: { type: Boolean, value: false },
      overlayStyle: { type: String, value: '' },
      customStyle: { type: String, value: '' },
      closeOnSlideDown: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('page-container'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as PageContainerRuntime
        const elements = (this as unknown as {
          elements: () => PageContainerElements
        }).elements()
        if (elements.overlay) {
          runtime._overlayListener = () => {
            ;(this as unknown as { onClickOverlay: () => void }).onClickOverlay()
          }
          elements.overlay.addEventListener('click', runtime._overlayListener)
        }
        if (elements.content) {
          runtime._touchStartListener = (event) => {
            runtime._startY = event.touches[0]?.clientY ?? 0
          }
          runtime._touchMoveListener = (event) => {
            if (!this.data.closeOnSlideDown) return
            const start = runtime._startY ?? 0
            const current = event.touches[0]?.clientY ?? 0
            const threshold = (typeof window !== 'undefined' ? window.innerWidth : 0) * 0.5
            if (current - start > threshold) this.setData({ show: false })
          }
          elements.content.addEventListener('touchstart', runtime._touchStartListener)
          elements.content.addEventListener('touchmove', runtime._touchMoveListener)
        }
        ;(this as unknown as { applyStyles: (display: boolean) => void })
          .applyStyles(false)
        if (this.data.show) {
          ;(this as unknown as { enter: () => void }).enter()
        }
      },
      detached() {
        const runtime = this as unknown as PageContainerRuntime
        if (runtime._timer) clearTimeout(runtime._timer)
        if (runtime._frame && typeof cancelAnimationFrame !== 'undefined') {
          cancelAnimationFrame(runtime._frame)
        }
        const elements = (this as unknown as {
          elements: () => PageContainerElements
        }).elements()
        if (elements.overlay && runtime._overlayListener) {
          elements.overlay.removeEventListener('click', runtime._overlayListener)
        }
        if (elements.content) {
          if (runtime._touchStartListener) {
            elements.content.removeEventListener('touchstart', runtime._touchStartListener)
          }
          if (runtime._touchMoveListener) {
            elements.content.removeEventListener('touchmove', runtime._touchMoveListener)
          }
        }
        ;(this as unknown as { togglePageScroll: (locked: boolean) => void })
          .togglePageScroll(false)
      },
    },
    methods: {
      elements(): PageContainerElements {
        const runtime = this as unknown as PageContainerRuntime
        const shadow = runtime.getShadowRoot?.()
        const backend = (id: string): HTMLElement | null => (
          shadow?.getElementById?.(id)?.getBackendElement?.() ?? null
        )
        return {
          container: backend('container'),
          overlay: backend('overlay'),
          content: backend('content'),
        }
      },
      showChanged(next: boolean, previous: boolean) {
        if (next === previous) return
        const runtime = this as unknown as { enter: () => void; leave: () => void }
        if (next) runtime.enter()
        else runtime.leave()
      },
      applyStyles(display: boolean) {
        const runtime = this as unknown as PageContainerRuntime
        const { container, overlay, content } = (this as unknown as {
          elements: () => PageContainerElements
        }).elements()
        runtime._display = display
        if (container?.style) container.style.display = display ? '' : 'none'
        if (!container) return
        const position = normalizePageContainerPosition(this.data.position)
        const duration = Math.max(0, Number(this.data.duration) || 0)
        if (overlay?.style) {
          overlay.style.cssText = [
            `display:${this.data.overlay ? '' : 'none'}`,
            `z-index:${Number(this.data.zIndex) || 100}`,
            `transition-duration:${duration}ms`,
            String(this.data.overlayStyle ?? ''),
          ].join(';')
        }
        if (content) {
          for (const name of ['top', 'bottom', 'center', 'right']) {
            content.classList.toggle(`weui-popup--${name}`, name === position)
          }
          content.classList.toggle('weui-popup--round', Boolean(this.data.round))
          content.style.cssText = [
            `z-index:${Number(this.data.zIndex) || 100}`,
            `transition-duration:${duration}ms`,
            String(this.data.customStyle ?? ''),
          ].join(';')
        }
      },
      enter() {
        const runtime = this as unknown as PageContainerRuntime
        if (runtime._timer) clearTimeout(runtime._timer)
        const { overlay, content } = (this as unknown as {
          elements: () => PageContainerElements
        }).elements()
        if (!overlay || !content) return
        const position = normalizePageContainerPosition(this.data.position)
        const duration = Math.max(0, Number(this.data.duration) || 0)
        this.triggerEvent('beforeenter')
        ;(this as unknown as { applyStyles: (display: boolean) => void })
          .applyStyles(true)
        overlay.style.opacity = '0'
        content.style.transform = pageContainerStartTransform(position)
        content.style.opacity = position === 'center' ? '0' : '1'
        this.triggerEvent('enter')
        const frame = () => {
          overlay.style.opacity = '1'
          content.style.transform = position === 'center' ? 'scale(1)' : 'translate3d(0, 0, 0)'
          content.style.opacity = '1'
        }
        runtime._frame = typeof requestAnimationFrame !== 'undefined'
          ? requestAnimationFrame(frame)
          : (frame(), undefined)
        runtime._timer = setTimeout(() => {
          runtime._timer = undefined
          this.triggerEvent('afterenter')
        }, duration)
        ;(this as unknown as { togglePageScroll: (locked: boolean) => void })
          .togglePageScroll(true)
      },
      leave() {
        const runtime = this as unknown as PageContainerRuntime
        if (!runtime._display) return
        if (runtime._timer) clearTimeout(runtime._timer)
        const { overlay, content } = (this as unknown as {
          elements: () => PageContainerElements
        }).elements()
        const position = normalizePageContainerPosition(this.data.position)
        const duration = Math.max(0, Number(this.data.duration) || 0)
        this.triggerEvent('beforeleave')
        if (overlay?.style) overlay.style.opacity = '0'
        if (content?.style) {
          content.style.transform = pageContainerStartTransform(position)
          content.style.opacity = position === 'center' ? '0' : '1'
        }
        this.triggerEvent('leave')
        runtime._timer = setTimeout(() => {
          runtime._timer = undefined
          ;(this as unknown as { applyStyles: (display: boolean) => void })
            .applyStyles(false)
          this.triggerEvent('afterleave')
          ;(this as unknown as { togglePageScroll: (locked: boolean) => void })
            .togglePageScroll(false)
        }, duration)
      },
      onClickOverlay() {
        this.triggerEvent('clickoverlay')
        this.setData({ show: false })
      },
      togglePageScroll(locked: boolean) {
        const runtime = this as unknown as PageContainerRuntime
        if (typeof document === 'undefined' || !document.body) return
        if (locked) {
          if (runtime._pageYOffset !== undefined) return
          runtime._pageYOffset = typeof window !== 'undefined' ? window.pageYOffset : 0
          document.body.style.position = 'fixed'
          document.body.style.top = `-${runtime._pageYOffset}px`
          return
        }
        if (runtime._pageYOffset === undefined) return
        document.body.style.position = ''
        document.body.style.top = ''
        if (typeof window !== 'undefined') window.scrollTo(0, runtime._pageYOffset)
        runtime._pageYOffset = undefined
      },
    },
  }).general()
}
