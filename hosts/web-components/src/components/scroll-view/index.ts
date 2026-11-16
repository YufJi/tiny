import type * as glassEasel from '@tiny/runtime/glass-easel'
import { touchListFromEvent } from '../../events'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { definePullDownRefresher } from './refresher'

type ScrollBackend = {
  scrollTop?: number
  scrollLeft?: number
  scrollHeight?: number
  scrollWidth?: number
  clientHeight?: number
  clientWidth?: number
  offsetHeight?: number
  offsetWidth?: number
  getBoundingClientRect?: () => {
    top: number
    left: number
    width?: number
    height?: number
  }
  style?: {
    scrollBehavior?: string
    overflowX?: string
    overflowY?: string
    transition?: string
    transform?: string
    [key: string]: string | undefined
  }
  querySelector?: (selector: string) => {
    getBoundingClientRect?: () => {
      top: number
      left: number
      width?: number
      height?: number
    }
  } | null
}

type ScrollRuntime = {
  __scrollEndTimer?: ReturnType<typeof setTimeout>
  __refreshing?: boolean
  __scrollActive?: boolean
  __lastScrollEventTime?: number
  __lastScrollTop?: number
  __lastScrollLeft?: number
  __lastScrollToUpperTime?: number
  __lastScrollToLowerTime?: number
  __lastScrollIntoView?: string
  __scrollIntoViewRetryTimer?: ReturnType<typeof setTimeout>
  __scrollingUntil?: number
  __dragStart?: { x: number; y: number; scrollTop: number }
  __dragging?: boolean
}

function touchPoint(event: glassEasel.ShadowedEvent<unknown>): { x: number; y: number } {
  const touch = touchListFromEvent(event, 'touches')[0]
    ?? touchListFromEvent(event, 'changedTouches')[0]
  return { x: Number(touch?.clientX ?? touch?.x ?? 0), y: Number(touch?.clientY ?? touch?.y ?? 0) }
}

function numericValue(value: unknown, fallback: number): number {
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

export function defineScrollView(ctx: BuiltinContext): BuiltinDefinition {
  const refresher = definePullDownRefresher(ctx)
  return ctx.space.defineComponent({
    is: builtinDefinitionName('scroll-view'),
    template: ctx.template('scroll-view'),
    using: { 'refresher-impl': refresher },
    behaviors: [ctx.behaviors.base, ctx.behaviors.scroller],
    properties: {
      scrollX: { type: Boolean, value: false },
      scrollY: { type: Boolean, value: false },
      upperThreshold: { type: null, value: 50 },
      lowerThreshold: { type: null, value: 50 },
      scrollTop: { type: null, value: 0 },
      scrollLeft: { type: null, value: 0 },
      scrollIntoView: { type: String, value: '' },
      scrollIntoViewWithinExtent: { type: Boolean, value: false },
      scrollIntoViewAlignment: { type: String, value: 'start' },
      scrollIntoViewOffset: { type: null, value: 0 },
      scrollWithAnimation: { type: Boolean, value: false },
      enableBackToTop: { type: Boolean, value: false },
      enablePassive: { type: Boolean, value: false },
      scrollEnabled: { type: Boolean, value: true },
      throttle: { type: Boolean, value: true },
      refresherEnabled: { type: Boolean, value: false },
      refresherTriggered: { type: Boolean, value: false },
      refresherThreshold: { type: Number, value: 45 },
      refresherDefaultStyle: { type: String, value: 'black' },
      refresherBackground: { type: String, value: '' },
      enhanced: { type: Boolean, value: false },
      showScrollbar: { type: Boolean, value: true },
      bounces: { type: Boolean, value: true },
      fastDeceleration: { type: Boolean, value: false },
      scrollAnchoring: { type: Boolean, value: false },
      enableFlex: { type: Boolean, value: false },
      pagingEnabled: { type: Boolean, value: false },
      usingSticky: { type: Boolean, value: false },
      type: { type: String, value: '' },
    },
    options: ctx.hostOptions('scroll-view', { multipleSlots: true }),
    lifetimes: {
      attached() {
        const instance = this as unknown as ScrollRuntime
        instance.__lastScrollIntoView = String(this.data.scrollIntoView ?? '')
        ;(this as unknown as { initScroller: (element: unknown) => void }).initScroller(this.backend())
        const element = this.backend()
        instance.__lastScrollEventTime = undefined
        instance.__scrollActive = false
        instance.__lastScrollTop = numericValue(this.data.scrollTop, numericValue(element?.scrollTop, 0))
        instance.__lastScrollLeft = numericValue(this.data.scrollLeft, numericValue(element?.scrollLeft, 0))
        instance.__lastScrollToUpperTime = 0
        instance.__lastScrollToLowerTime = 0
        this.applyOverflow()
        this.applyBounces()
        this.applyScrollAnimation()
        this.applyScrollAnchoring()
        this.applyScrollPosition('scrollTop')
        this.applyScrollPosition('scrollLeft')
        this.applyScrollPosition('scrollIntoView')
      },
      detached() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__scrollEndTimer) clearTimeout(instance.__scrollEndTimer)
        if (instance.__scrollIntoViewRetryTimer) {
          clearTimeout(instance.__scrollIntoViewRetryTimer)
          instance.__scrollIntoViewRetryTimer = undefined
        }
        instance.__scrollActive = false
      },
    },
    observers: {
      scrollTop() {
        this.applyScrollPosition('scrollTop')
      },
      scrollLeft() {
        this.applyScrollPosition('scrollLeft')
      },
      scrollIntoView(value: string) {
        const instance = this as unknown as ScrollRuntime
        const next = String(value ?? '')
        if (instance.__lastScrollIntoView === next) return
        instance.__lastScrollIntoView = next
        this.applyScrollPosition('scrollIntoView')
      },
      scrollWithAnimation() {
        this.applyScrollAnimation()
      },
      bounces() {
        this.applyBounces()
      },
      scrollAnchoring() {
        this.applyScrollAnchoring()
      },
      scrollX() {
        this.applyOverflow()
      },
      scrollY() {
        this.applyOverflow()
      },
      scrollEnabled() {
        this.applyOverflow()
      },
    },
    methods: {
      backend(): ScrollBackend | null {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => ScrollBackend | null } | null
        } | null)?.getElementById?.('main')?.getBackendElement?.()
        return element ?? (this as unknown as { getBackendElement?: () => ScrollBackend | null }).getBackendElement?.() ?? null
      },
      scrollAxes() {
        const enabled = Boolean(this.data.scrollEnabled)
        const vertical = enabled && Boolean(this.data.scrollY)
        return {
          vertical,
          horizontal: enabled && Boolean(this.data.scrollX) && !vertical,
        }
      },
      applyOverflow() {
        const element = this.backend()
        if (!element?.style) return
        const axes = this.scrollAxes()
        element.style.overflowX = axes.horizontal ? 'auto' : 'hidden'
        element.style.overflowY = axes.vertical ? 'auto' : 'hidden'
      },
      applyScrollAnimation() {
        const element = this.backend()
        if (element?.style) element.style.scrollBehavior = this.data.scrollWithAnimation ? 'smooth' : 'auto'
      },
      applyBounces() {
        const element = this.backend()
        if (!element?.style) return
        const bounces = this.data.bounces ? 'contain' : 'none'
        element.style.overscrollBehaviorX = bounces
        element.style.overscrollBehaviorY = bounces
      },
      applyScrollAnchoring() {
        const element = this.backend()
        if (element?.style) element.style.overflowAnchor = this.data.scrollAnchoring ? 'auto' : 'none'
      },
      updateScrollbar(left: number, width: number, client: number) {
        if (!this.data.enhanced || !this.data.showScrollbar || !this.data.scrollX) return
        const wrap = (this.getShadowRoot?.() as { getElementById?: (id: string) => { getBackendElement?: () => { style?: Record<string, string> } | null } | null } | null)
          ?.getElementById?.('barWrap')?.getBackendElement?.()
        const bar = (this.getShadowRoot?.() as { getElementById?: (id: string) => { getBackendElement?: () => { style?: Record<string, string> } | null } | null } | null)
          ?.getElementById?.('scrollbar')?.getBackendElement?.()
        if (!wrap?.style || !bar?.style) return
        if (!(width > client) || client <= 0) {
          wrap.style.display = 'none'
          return
        }
        wrap.style.display = 'block'
        bar.style.width = `${Math.max(10, (client / width) * 100)}%`
        const maxLeft = width - client
        bar.style.left = `${maxLeft > 0 ? (left / maxLeft) * (100 - Number.parseFloat(bar.style.width)) : 0}%`
      },
      applyScrollPosition(field: 'scrollTop' | 'scrollLeft' | 'scrollIntoView') {
        const element = this.backend()
        if (!element) return
        if (field === 'scrollIntoView') {
          const instance = this as unknown as ScrollRuntime
          if (instance.__scrollIntoViewRetryTimer) {
            clearTimeout(instance.__scrollIntoViewRetryTimer)
            instance.__scrollIntoViewRetryTimer = undefined
          }
          const id = String(this.data.scrollIntoView ?? '')
          if (!id) return
          this.scrollToElement(id, 0)
          return
        }
        const axes = this.scrollAxes()
        if (field === 'scrollTop' && !axes.vertical) return
        if (field === 'scrollLeft' && !axes.horizontal) return
        const value = numericValue(this.data[field], 0)
        if (Number.isFinite(value)) {
          ;(this as unknown as {
            scrollTo: (top: number, left: number, behavior: 'auto' | 'smooth') => void
          }).scrollTo(
            field === 'scrollTop' ? value : Number(element.scrollTop ?? 0),
            field === 'scrollLeft' ? value : Number(element.scrollLeft ?? 0),
            this.data.scrollWithAnimation ? 'smooth' : 'auto',
          )
        }
      },
      scrollToElement(id: string, attempt: number) {
        const instance = this as unknown as ScrollRuntime
        if (!id || String(this.data.scrollIntoView ?? '') !== id) {
          if (instance.__scrollIntoViewRetryTimer) {
            clearTimeout(instance.__scrollIntoViewRetryTimer)
            instance.__scrollIntoViewRetryTimer = undefined
          }
          return
        }
        const element = this.backend()
        if (!element) return
        const axes = this.scrollAxes()
        try {
          const selector = /^[_a-zA-Z][-_a-zA-Z0-9:]*$/.test(id) ? `#${id}` : id
          const target = element.querySelector?.(selector)
          const targetRect = target?.getBoundingClientRect?.()
          const elementRect = element.getBoundingClientRect?.()
          if (targetRect && elementRect) {
            const offset = numericValue(this.data.scrollIntoViewOffset, 0)
            const alignment = String(this.data.scrollIntoViewAlignment ?? 'start')
            const withinExtent = Boolean(this.data.scrollIntoViewWithinExtent)
            const viewportHeight = Number(element.clientHeight ?? 0)
            const viewportWidth = Number(element.clientWidth ?? 0)
            const targetHeight = Number(targetRect.height ?? 0)
            const targetWidth = Number(targetRect.width ?? 0)
            const targetTop = Number(targetRect.top ?? 0)
            const targetLeft = Number(targetRect.left ?? 0)
            const elementTop = Number(elementRect.top ?? 0)
            const elementLeft = Number(elementRect.left ?? 0)
            const targetVisibleVertically = targetTop >= elementTop
              && targetTop + targetHeight <= elementTop + viewportHeight
            const targetVisibleHorizontally = targetLeft >= elementLeft
              && targetLeft + targetWidth <= elementLeft + viewportWidth
            const alignedTop = alignment === 'center'
              ? targetTop - elementTop - (viewportHeight - targetHeight) / 2
              : alignment === 'end'
                ? targetTop - elementTop - viewportHeight + targetHeight
                : targetTop - elementTop
            const alignedLeft = alignment === 'center'
              ? targetLeft - elementLeft - (viewportWidth - targetWidth) / 2
              : alignment === 'end'
                ? targetLeft - elementLeft - viewportWidth + targetWidth
                : targetLeft - elementLeft
            const shouldScrollVertically = axes.vertical && !(withinExtent && targetVisibleVertically)
            const shouldScrollHorizontally = axes.horizontal && !(withinExtent && targetVisibleHorizontally)
            if (!shouldScrollVertically && !shouldScrollHorizontally) return
            const scrollTop = shouldScrollVertically
              ? Math.max(0, Number(element.scrollTop ?? 0) + alignedTop + offset)
              : Number(element.scrollTop ?? 0)
            const scrollLeft = shouldScrollHorizontally
              ? Math.max(0, Number(element.scrollLeft ?? 0) + alignedLeft + offset)
              : Number(element.scrollLeft ?? 0)
            ;(this as unknown as {
              scrollTo: (top: number, left: number, behavior: 'auto' | 'smooth') => void
            }).scrollTo(
              scrollTop,
              scrollLeft,
              this.data.scrollWithAnimation ? 'smooth' : 'auto',
            )
            if (instance.__scrollIntoViewRetryTimer) {
              clearTimeout(instance.__scrollIntoViewRetryTimer)
              instance.__scrollIntoViewRetryTimer = undefined
            }
            return
          }
        } catch {
          // Ignore invalid selectors and retry; ids may be attached later.
        }
        if (attempt < 5) {
          if (instance.__scrollIntoViewRetryTimer) {
            clearTimeout(instance.__scrollIntoViewRetryTimer)
          }
          instance.__scrollIntoViewRetryTimer = setTimeout(() => {
            instance.__scrollIntoViewRetryTimer = undefined
            this.scrollToElement(id, attempt + 1)
          }, 16)
        }
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const point = touchPoint(event)
        instance.__dragStart = { ...point, scrollTop: Number(this.backend()?.scrollTop ?? 0) }
        instance.__dragging = false
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const start = instance.__dragStart
        if (!start) return
        const point = touchPoint(event)
        const deltaX = point.x - start.x
        const deltaY = point.y - start.y
        const distance = Math.hypot(deltaX, deltaY)
        if (!instance.__dragging && distance > 5) {
          instance.__dragging = true
          this.triggerEvent('dragstart', { scrollTop: start.scrollTop, scrollLeft: Number(this.backend()?.scrollLeft ?? 0) }, { bubbles: true, composed: true })
        }
        if (instance.__dragging) {
          this.triggerEvent('dragging', { deltaX, deltaY, scrollTop: Number(this.backend()?.scrollTop ?? 0), scrollLeft: Number(this.backend()?.scrollLeft ?? 0) }, { bubbles: true, composed: true })
        }
      },
      handleTouchEnd() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__dragging) {
          this.triggerEvent('dragend', { scrollTop: Number(this.backend()?.scrollTop ?? 0), scrollLeft: Number(this.backend()?.scrollLeft ?? 0) }, { bubbles: true, composed: true })
        }
        instance.__dragStart = undefined
        instance.__dragging = false
      },
      handleTouchCancel() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__dragging) this.triggerEvent('dragend', {}, { bubbles: true, composed: true })
        instance.__dragStart = undefined
        instance.__dragging = false
      },
      handleRefresherPulling(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { dy?: number }
        this.triggerEvent('refresherpulling', { dy: Number(detail.dy ?? 0) }, { bubbles: true, composed: true })
      },
      handleRefresherRefresh(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { dy?: number }
        ;(this as unknown as ScrollRuntime).__refreshing = true
        this.triggerEvent('refresherrefresh', { dy: Number(detail.dy ?? 0) }, { bubbles: true, composed: true })
      },
      handleRefresherRestore(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { dy?: number }
        ;(this as unknown as ScrollRuntime).__refreshing = false
        this.triggerEvent('refresherrestore', { dy: Number(detail.dy ?? 0) }, { bubbles: true, composed: true })
      },
      handleRefresherAbort(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { dy?: number }
        ;(this as unknown as ScrollRuntime).__refreshing = false
        this.triggerEvent('refresherabort', { dy: Number(detail.dy ?? 0) }, { bubbles: true, composed: true })
      },
      handleTap() {
        if (!this.data.enableBackToTop) return
        const instance = this as unknown as { __lastTap?: number }
        const now = Date.now()
        if (instance.__lastTap && now - instance.__lastTap < 300) {
          instance.__lastTap = 0
          ;(this as unknown as {
            scrollTo: (top: number, left: number, behavior: 'auto' | 'smooth') => void
          }).scrollTo(0, 0, this.data.scrollWithAnimation ? 'smooth' : 'auto')
          return
        }
        instance.__lastTap = now
      },
      handleScroll(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const detail = (event.detail ?? {}) as Record<string, unknown>
        const element = this.backend()
        const now = Date.now()
        if (this.data.throttle && now - Number(instance.__lastScrollEventTime ?? 0) < 20) return
        instance.__lastScrollEventTime = now
        const scrollTop = Number(detail.scrollTop ?? element?.scrollTop ?? 0)
        const scrollLeft = Number(detail.scrollLeft ?? element?.scrollLeft ?? 0)
        const scrollHeight = Number(detail.scrollHeight ?? element?.scrollHeight ?? 0)
        const scrollWidth = Number(detail.scrollWidth ?? element?.scrollWidth ?? 0)
        const previousTop = Number(instance.__lastScrollTop ?? scrollTop)
        const previousLeft = Number(instance.__lastScrollLeft ?? scrollLeft)
        const deltaY = previousTop - scrollTop
        const deltaX = previousLeft - scrollLeft
        if (!instance.__scrollActive) {
          instance.__scrollActive = true
          this.triggerEvent('scrollstart', { scrollTop, scrollLeft }, { bubbles: true, composed: true })
        }
        if (instance.__scrollEndTimer) clearTimeout(instance.__scrollEndTimer)
        instance.__scrollEndTimer = setTimeout(() => {
          instance.__scrollEndTimer = undefined
          instance.__scrollActive = false
          this.triggerEvent('scrollend', { scrollTop, scrollLeft }, { bubbles: true, composed: true })
        }, 120)
        ;(this as unknown as ScrollRuntime).__scrollingUntil = Date.now() + 100
        const scrollDetail = {
          scrollTop,
          scrollLeft,
          scrollHeight,
          scrollWidth,
          deltaX,
          deltaY,
        }
        this.triggerEvent('scroll', scrollDetail, { bubbles: true, composed: true })
        ;(this as unknown as { updateScrollbar: (left: number, width: number, client: number) => void })
          .updateScrollbar(scrollLeft, scrollWidth, Number(detail.clientWidth ?? element?.clientWidth ?? 0))
        const axes = this.scrollAxes()
        const upperThreshold = numericValue(this.data.upperThreshold, 50)
        const lowerThreshold = numericValue(this.data.lowerThreshold, 50)
        if (axes.vertical) {
          const offsetHeight = Number(
            detail.offsetHeight
            ?? element?.offsetHeight
            ?? detail.clientHeight
            ?? element?.clientHeight
            ?? 0,
          )
          if (
            scrollTop <= upperThreshold
            && deltaY > 0
            && now - Number(instance.__lastScrollToUpperTime ?? 0) > 200
          ) {
            instance.__lastScrollToUpperTime = now
            this.triggerEvent('scrolltoupper', { direction: 'top' }, { bubbles: true, composed: true })
          }
          if (
            scrollHeight > 0
            && scrollTop + offsetHeight + lowerThreshold >= scrollHeight
            && deltaY < 0
            && now - Number(instance.__lastScrollToLowerTime ?? 0) > 200
          ) {
            instance.__lastScrollToLowerTime = now
            this.triggerEvent('scrolltolower', { direction: 'bottom' }, { bubbles: true, composed: true })
          }
        }
        if (axes.horizontal) {
          const offsetWidth = Number(
            detail.offsetWidth
            ?? element?.offsetWidth
            ?? detail.clientWidth
            ?? element?.clientWidth
            ?? 0,
          )
          if (
            scrollLeft <= upperThreshold
            && deltaX > 0
            && now - Number(instance.__lastScrollToUpperTime ?? 0) > 200
          ) {
            instance.__lastScrollToUpperTime = now
            this.triggerEvent('scrolltoupper', { direction: 'left' }, { bubbles: true, composed: true })
          }
          if (
            scrollWidth > 0
            && scrollLeft + offsetWidth + lowerThreshold >= scrollWidth
            && deltaX < 0
            && now - Number(instance.__lastScrollToLowerTime ?? 0) > 200
          ) {
            instance.__lastScrollToLowerTime = now
            this.triggerEvent('scrolltolower', { direction: 'right' }, { bubbles: true, composed: true })
          }
        }
        instance.__lastScrollTop = scrollTop
        instance.__lastScrollLeft = scrollLeft
      },
    },
  }).general()
}
