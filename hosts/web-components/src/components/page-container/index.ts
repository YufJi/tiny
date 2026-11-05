import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type PageContainerRuntime = {
  _pageYOffset?: number
  _startY?: number
  _timer?: ReturnType<typeof setTimeout>
  _frame?: number
}

type TransitionClasses = {
  enter: string
  enterTo: string
  leave: string
  leaveTo: string
}

/** Module-level singleton, matching WeChat's "Only one instance can exist". */
let activePageContainer: object | null = null

function transitionClasses(name: string): TransitionClasses {
  return {
    enter: `weui-${name}-enter weui-${name}-enter-active`,
    enterTo: `weui-${name}-enter-to weui-${name}-enter-active`,
    leave: `weui-${name}-leave weui-${name}-leave-active`,
    leaveTo: `weui-${name}-leave-to weui-${name}-leave-active`,
  }
}

export function computePageContainerClass(
  base: string,
  items: Array<string | Record<string, unknown>> = [],
): string {
  let result = ''
  for (const item of items) {
    if (typeof item === 'string') {
      result += `weui-${base}--${item} `
      continue
    }
    for (const [key, value] of Object.entries(item)) {
      if (value) result += `weui-${base}--${key} `
    }
  }
  return result
}

function popupClassModifiers(position: unknown, round: unknown): string {
  return computePageContainerClass('popup', [String(position ?? 'bottom'), { round }]).trim()
}

/**
 * Mirrors `wx-page-container` in WeChat WebView 2.33.0:
 * data-driven `inited`/`display`/`overlayClass`/`popupClass`, `computeClass`
 * position modifiers, `transitionend` + duration fallback, singleton instance,
 * body scroll lock and slide-down-to-close.
 */
export function definePageContainer(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('page-container'),
    template: ctx.template('page-container'),
    behaviors: [ctx.behaviors.base],
    properties: {
      show: { type: Boolean, value: false, observer: 'observerShow' },
      duration: { type: Number, value: 300 },
      zIndex: { type: Number, value: 100 },
      overlay: { type: Boolean, value: true },
      position: { type: String, value: 'bottom', observer: 'positionChanged' },
      round: { type: Boolean, value: false, observer: 'positionChanged' },
      overlayStyle: { type: String, value: '' },
      customStyle: { type: String, value: '' },
      closeOnSlideDown: { type: Boolean, value: false },
    },
    data: {
      inited: false,
      display: false,
      overlayClass: '',
      popupClass: '',
      popupClassModifiers: 'weui-popup--bottom',
      status: '',
      exceeded: false,
      transitionEnded: true,
      threshold: 0,
      screenWidth: 0,
    },
    options: ctx.hostOptions('page-container'),
    lifetimes: {
      created() {
        if (activePageContainer) {
          this.setData({ exceeded: true })
          ctx.options.onDiagnostic?.({
            severity: 'error',
            code: 'PAGE_CONTAINER_DUPLICATE',
            message: '<page-container> only one instance can exist.',
          })
        } else {
          activePageContainer = this as unknown as object
        }
      },
      attached() {
        const width = (typeof window !== 'undefined' && window.screen?.width)
          || (typeof window !== 'undefined' ? window.innerWidth : 0)
        this.setData({
          threshold: 0.5 * width,
          screenWidth: width,
          popupClassModifiers: popupClassModifiers(this.data.position, this.data.round),
        })
        if (this.data.show) {
          ;(this as unknown as { enter: () => void }).enter()
          ;(this as unknown as { togglePageScroll: (enable: boolean) => void })
            .togglePageScroll(true)
        }
      },
      detached() {
        if (activePageContainer === (this as unknown as object)) {
          activePageContainer = null
        }
      },
    },
    methods: {
      positionChanged() {
        this.setData({
          popupClassModifiers: popupClassModifiers(this.data.position, this.data.round),
        })
      },
      observerShow(next: boolean, previous: boolean) {
        if (this.data.exceeded) return
        if (next === previous || previous === undefined) return
        if (next) (this as unknown as { enter: () => void }).enter()
        else (this as unknown as { leave: () => void }).leave()
        ;(this as unknown as { togglePageScroll: (enable: boolean) => void })
          .togglePageScroll(next)
        setTimeout(() => {
          if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') return
          document.dispatchEvent(new CustomEvent('animateShareElement'))
        })
      },
      togglePageScroll(enable: boolean) {
        if (typeof document === 'undefined' || !document.body) return
        const runtime = this as unknown as PageContainerRuntime
        if (enable) {
          runtime._pageYOffset = typeof window !== 'undefined' ? window.pageYOffset : 0
          document.body.style.position = 'fixed'
          document.body.style.top = `-${runtime._pageYOffset}px`
        } else {
          document.body.style.position = ''
          document.body.style.top = ''
          if (typeof window !== 'undefined') window.scrollTo(0, runtime._pageYOffset ?? 0)
        }
      },
      enter() {
        if (this.data.exceeded) return
        const runtime = this as unknown as PageContainerRuntime
        if (runtime._timer) clearTimeout(runtime._timer)
        this.triggerEvent('beforeenter')
        const overlay = transitionClasses('fade')
        const popup = transitionClasses(String(this.data.position ?? 'bottom'))
        this.setData({
          inited: true,
          display: true,
          overlayClass: overlay.enter,
          popupClass: popup.enter,
          status: 'enter',
          transitionEnded: false,
        })
        this.triggerEvent('enter')
        runtime._timer = setTimeout(() => {
          runtime._timer = undefined
          ;(this as unknown as { onTransitionEnd: () => void }).onTransitionEnd()
        }, Math.max(0, Number(this.data.duration) || 0))
        const frame = () => {
          this.setData({
            overlayClass: overlay.enterTo,
            popupClass: popup.enterTo,
          })
        }
        runtime._frame = typeof requestAnimationFrame !== 'undefined'
          ? requestAnimationFrame(frame)
          : (frame(), undefined)
      },
      leave() {
        if (!this.data.display) return
        const runtime = this as unknown as PageContainerRuntime
        if (runtime._timer) clearTimeout(runtime._timer)
        const overlay = transitionClasses('fade')
        const popup = transitionClasses(String(this.data.position ?? 'bottom'))
        this.triggerEvent('beforeleave')
        this.setData({
          overlayClass: overlay.leave,
          popupClass: popup.leave,
          status: 'leave',
          transitionEnded: false,
        })
        this.triggerEvent('leave')
        runtime._timer = setTimeout(() => {
          runtime._timer = undefined
          ;(this as unknown as { onTransitionEnd: () => void }).onTransitionEnd()
        }, Math.max(0, Number(this.data.duration) || 0))
        this.setData({
          overlayClass: overlay.leaveTo,
          popupClass: popup.leaveTo,
        })
      },
      onClickOverlay() {
        this.triggerEvent('clickoverlay')
        this.setData({ show: false })
      },
      onTransitionEnd() {
        if (this.data.transitionEnded) return
        const status = String(this.data.status ?? '')
        this.setData({ transitionEnded: true })
        this.triggerEvent(status ? `after${status}` : 'afterenter')
        if (!this.data.show && this.data.display) {
          this.setData({ display: false })
        }
      },
      onTouchStart(event: TouchEvent) {
        const runtime = this as unknown as PageContainerRuntime
        runtime._startY = event.touches[0]?.clientY ?? 0
      },
      onTouchMove(event: TouchEvent) {
        if (!this.data.closeOnSlideDown) return
        const runtime = this as unknown as PageContainerRuntime
        const start = runtime._startY ?? 0
        const current = event.touches[0]?.clientY ?? 0
        if (current - start > Number(this.data.threshold ?? 0)) {
          this.setData({ show: false })
        }
      },
    },
  }).general()
}
