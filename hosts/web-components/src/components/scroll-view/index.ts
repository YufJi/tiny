import type * as glassEasel from 'glass-easel'
import { touchListFromEvent } from '../../events'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ScrollBackend = {
  scrollTop?: number
  scrollLeft?: number
  scrollHeight?: number
  scrollWidth?: number
  clientHeight?: number
  clientWidth?: number
  style?: {
    scrollBehavior?: string
    overflowX?: string
    overflowY?: string
    transition?: string
    transform?: string
    [key: string]: string | undefined
  }
  querySelector?: (selector: string) => { scrollIntoView?: (options?: unknown) => void } | null
}

type ScrollRuntime = {
  __scrollStartTimer?: ReturnType<typeof setTimeout>
  __scrollEndTimer?: ReturnType<typeof setTimeout>
  __scrollThrottleTimer?: ReturnType<typeof setTimeout>
  __scrollPendingDetail?: Record<string, unknown>
  __lastScrollEmit?: number
  __scrollingUntil?: number
  __refresherTimer?: ReturnType<typeof setTimeout>
  __dragStart?: { x: number; y: number; scrollTop: number }
  __dragging?: boolean
  __pullDistance?: number
  __refresherOffset?: number
  __refresherStartOffset?: number
  __refreshing?: boolean
  __preventRefreshScroll?: (event: TouchEvent) => void
}

function touchPoint(event: glassEasel.ShadowedEvent<unknown>): { x: number; y: number } {
  const touch = touchListFromEvent(event, 'touches')[0]
    ?? touchListFromEvent(event, 'changedTouches')[0]
  return { x: Number(touch?.clientX ?? touch?.x ?? 0), y: Number(touch?.clientY ?? touch?.y ?? 0) }
}

export function defineScrollView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('scroll-view'),
    template: ctx.template('scroll-view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.scroller],
    properties: {
      scrollX: { type: Boolean, value: false },
      scrollY: { type: Boolean, value: false },
      upperThreshold: { type: Number, value: 50 },
      lowerThreshold: { type: Number, value: 50 },
      scrollTop: { type: Number, optionalTypes: [String], value: 0 },
      scrollLeft: { type: Number, optionalTypes: [String], value: 0 },
      scrollIntoView: { type: String, value: '' },
      scrollWithAnimation: { type: Boolean, value: false },
      enableBackToTop: { type: Boolean, value: false },
      enablePassive: { type: Boolean, value: false },
      scrollEnabled: { type: Boolean, value: true },
      throttle: { type: Boolean, value: true },
      refresherEnabled: { type: Boolean, value: false },
      refresherTriggered: { type: Boolean, value: false },
      refresherThreshold: { type: Number, value: 45 },
      refresherDefaultStyle: { type: String, value: 'black' },
      refresherBackground: { type: String, value: '#FFF' },
      enhanced: { type: Boolean, value: false },
      showScrollbar: { type: Boolean, value: true },
      bounces: { type: Boolean, value: true },
      fastDeceleration: { type: Boolean, value: false },
      scrollAnchoring: { type: Boolean, value: false },
      enableFlex: { type: Boolean, value: false },
      pagingEnabled: { type: Boolean, value: false },
      usingSticky: { type: Boolean, value: false },
    },
    data: {
      refresherText: '下拉刷新',
    },
    options: ctx.hostOptions('scroll-view', { multipleSlots: true }),
    lifetimes: {
      attached() {
        ;(this as unknown as { initScroller: (element: unknown) => void }).initScroller(this.backend())
        this.applyOverflow()
        this.applyScrollAnimation()
        ;(this as unknown as { setRefresherOffset: (offset: number, animate: boolean) => void })
          .setRefresherOffset(0, false)
        ;(this as unknown as { relocateCustomRefresher: (attempt: number) => void })
          .relocateCustomRefresher(0)
        const main = this.backend() as { addEventListener?: (type: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void } | null
        if (main?.addEventListener) {
          const runtime = this as unknown as ScrollRuntime
          runtime.__preventRefreshScroll = (event: TouchEvent) => {
            if (Number(runtime.__refresherOffset ?? 0) > 0 && event.cancelable) event.preventDefault()
          }
          main.addEventListener('touchmove', runtime.__preventRefreshScroll, { passive: false })
        }
        this.applyScrollPosition('scrollTop')
        this.applyScrollPosition('scrollLeft')
        this.applyScrollPosition('scrollIntoView')
      },
      detached() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__scrollStartTimer) clearTimeout(instance.__scrollStartTimer)
        if (instance.__scrollEndTimer) clearTimeout(instance.__scrollEndTimer)
        if (instance.__scrollThrottleTimer) clearTimeout(instance.__scrollThrottleTimer)
        if (instance.__refresherTimer) clearTimeout(instance.__refresherTimer)
        const main = this.backend() as { removeEventListener?: (type: string, listener: (event: TouchEvent) => void) => void } | null
        if (instance.__preventRefreshScroll) main?.removeEventListener?.('touchmove', instance.__preventRefreshScroll)
      },
    },
    observers: {
      scrollTop() {
        this.applyScrollPosition('scrollTop')
      },
      scrollLeft() {
        this.applyScrollPosition('scrollLeft')
      },
      scrollIntoView() {
        this.applyScrollPosition('scrollIntoView')
      },
      scrollWithAnimation() {
        this.applyScrollAnimation()
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
      refresherTriggered(value: boolean) {
        const instance = this as unknown as ScrollRuntime
        const threshold = Number(this.data.refresherThreshold ?? 45)
        if (value) {
          instance.__refreshing = true
          ;(this as unknown as { setRefresherOffset: (offset: number, animate: boolean) => void })
            .setRefresherOffset(threshold, true)
          this.setData({ refresherText: '正在刷新...' })
        } else {
          const wasRefreshing = Boolean(instance.__refreshing)
          instance.__refreshing = false
          ;(this as unknown as { setRefresherOffset: (offset: number, animate: boolean) => void })
            .setRefresherOffset(0, true)
          this.setData({ refresherText: '下拉刷新' })
          if (wasRefreshing) {
            this.triggerEvent('refresherrestore', {}, { bubbles: true, composed: true })
          }
        }
        this.triggerEvent('refresherstatuschange', { status: value ? 'refreshing' : 'complete' }, { bubbles: true, composed: true })
      },
      refresherEnabled(value: boolean) {
        if (!value) {
          ;(this as unknown as { setRefresherOffset: (offset: number, animate: boolean) => void })
            .setRefresherOffset(0, true)
          this.setData({ refresherText: '下拉刷新' })
        }
      },
    },
    methods: {
      backend(): ScrollBackend | null {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => ScrollBackend | null } | null
        } | null)?.getElementById?.('main')?.getBackendElement?.()
        return element ?? (this as unknown as { getBackendElement?: () => ScrollBackend | null }).getBackendElement?.() ?? null
      },
      relocateCustomRefresher(attempt: number) {
        // Named slots on native children are not materialized by the current
        // glass proc-gen path, so the page's slot="refresher" node lands in the
        // default content slot. With refresher-default-style="none" that first
        // content child is the custom refresher: move its backend node into the
        // refresher overlay so it no longer occupies scroll layout.
        if (!this.data.refresherEnabled || this.data.refresherDefaultStyle !== 'none') return
        const content = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => { children?: ArrayLike<{ parentNode?: unknown }>; removeChild?: (node: unknown) => void } | null } | null
        } | null)?.getElementById?.('content')?.getBackendElement?.()
        const host = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => { querySelector?: (selector: string) => { appendChild?: (node: unknown) => void } | null } | null } | null
        } | null)?.getElementById?.('refresher')?.getBackendElement?.()
        const slot = host?.querySelector?.('[class*="refresher-slot"]')
        const first = content?.children?.[0]
        if (content && slot?.appendChild && first) {
          content.removeChild?.(first)
          slot.appendChild(first)
          return
        }
        if (attempt < 5 && typeof setTimeout !== 'undefined') {
          setTimeout(() => {
            ;(this as unknown as { relocateCustomRefresher: (attempt: number) => void })
              .relocateCustomRefresher(attempt + 1)
          }, 16)
        }
      },
      applyOverflow() {
        const element = this.backend()
        if (!element?.style) return
        const enabled = Boolean(this.data.scrollEnabled)
        element.style.overflowX = enabled && this.data.scrollX ? 'auto' : 'hidden'
        element.style.overflowY = enabled && this.data.scrollY ? 'auto' : 'hidden'
      },
      applyScrollAnimation() {
        const element = this.backend()
        if (element?.style) element.style.scrollBehavior = this.data.scrollWithAnimation ? 'smooth' : 'auto'
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
          const id = String(this.data.scrollIntoView ?? '')
          if (!id) return
          this.scrollToElement(id, 0)
          return
        }
        const value = Number(this.data[field] ?? 0)
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
        const element = this.backend()
        if (!element) return
        try {
          const target = element.querySelector?.(`#${id}`)
          if (target?.scrollIntoView) {
            target.scrollIntoView({ behavior: this.data.scrollWithAnimation ? 'smooth' : 'auto' })
            return
          }
        } catch {
          // Ignore invalid selectors and retry; ids may be attached later.
        }
        if (attempt < 5) setTimeout(() => this.scrollToElement(id, attempt + 1), 16)
      },
      setRefresherOffset(offset: number, animate: boolean) {
        const instance = this as unknown as ScrollRuntime
        instance.__refresherOffset = offset
        const element = this.backend()
        if (element?.style) {
          element.style.transition = animate ? 'transform 0.3s ease' : 'none'
          element.style.transform = offset === 0 ? '' : `translateY(${offset}px)`
          element.style['-webkit-transition'] = animate ? 'transform 0.3s ease' : 'none'
          element.style['-webkit-transform'] = offset === 0 ? '' : `translateY(${offset}px)`
        }
      },
      cancelRefresher() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__refresherTimer) clearTimeout(instance.__refresherTimer)
        instance.__refresherTimer = undefined
        instance.__refreshing = false
        this.setRefresherOffset(0, true)
        this.setData({ refresherTriggered: false, refresherText: '下拉刷新' })
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const point = touchPoint(event)
        instance.__dragStart = { ...point, scrollTop: Number(this.backend()?.scrollTop ?? 0) }
        instance.__dragging = false
        instance.__pullDistance = 0
        instance.__refresherOffset = instance.__refresherOffset ?? 0
        instance.__refresherStartOffset = instance.__refresherOffset
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const start = instance.__dragStart
        if (!start) return
        const point = touchPoint(event)
        const deltaX = point.x - start.x
        const deltaY = point.y - start.y
        const refresherOffset = Number(instance.__refresherOffset ?? 0)
        const threshold = Number(this.data.refresherThreshold ?? 45)
        if (this.data.refresherEnabled && (refresherOffset > 0 || (start.scrollTop <= 0 && deltaY > 0))) {
          event.preventDefault?.()
          const startOffset = Number(instance.__refresherStartOffset ?? 0)
          const offset = instance.__refreshing
            ? Math.max(0, Math.min(threshold, startOffset + deltaY))
            : Math.max(0, Math.min(threshold * 1.2, deltaY * 0.5))
          instance.__pullDistance = offset
          this.setRefresherOffset(offset, false)
          this.setData({
            refresherText: instance.__refreshing
              ? '正在刷新...'
              : offset >= threshold ? '释放刷新' : '下拉刷新',
          })
          this.triggerEvent('refresherpulling', { dy: offset }, { bubbles: true, composed: true })
          return
        }
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
        const pullDistance = Number(instance.__pullDistance ?? 0)
        const threshold = Number(this.data.refresherThreshold ?? 45)
        instance.__dragStart = undefined
        instance.__dragging = false
        instance.__pullDistance = 0
        if (this.data.refresherEnabled && instance.__refreshing) {
          if (Number(instance.__refresherOffset ?? 0) < threshold / 2) {
            instance.__refreshing = false
            this.setRefresherOffset(0, true)
            this.setData({ refresherTriggered: false, refresherText: '下拉刷新' })
            this.triggerEvent('refresherabort', {}, { bubbles: true, composed: true })
          } else {
            this.setRefresherOffset(threshold, true)
          }
          return
        }
        if (this.data.refresherEnabled && pullDistance > 0) {
          if (pullDistance >= threshold) {
            this.setRefresherOffset(threshold, true)
            if (!this.data.refresherTriggered) this.setData({ refresherTriggered: true })
            this.setData({ refresherText: '正在刷新...' })
            instance.__refreshing = true
            this.triggerEvent('refresherrefresh', { dy: pullDistance }, { bubbles: true, composed: true })
          } else {
            this.setRefresherOffset(0, true)
            this.setData({ refresherText: '下拉刷新' })
            this.triggerEvent('refresherabort', {}, { bubbles: true, composed: true })
          }
        }
      },
      handleTouchCancel() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__dragging) {
          this.triggerEvent('dragend', {}, { bubbles: true, composed: true })
        }
        instance.__dragStart = undefined
        instance.__dragging = false
        instance.__pullDistance = 0
        if (this.data.refresherEnabled) {
          this.setRefresherOffset(0, true)
          this.setData({ refresherText: '下拉刷新' })
          this.triggerEvent('refresherabort', {}, { bubbles: true, composed: true })
        }
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
      emitThrottledScroll(detail: Record<string, unknown>) {
        const instance = this as unknown as ScrollRuntime
        const emit = () => {
          instance.__lastScrollEmit = Date.now()
          this.triggerEvent('scroll', detail, { bubbles: true, composed: true })
        }
        if (!this.data.throttle) {
          emit()
          return
        }
        const now = Date.now()
        const elapsed = now - Number(instance.__lastScrollEmit ?? 0)
        if (!instance.__lastScrollEmit || elapsed >= 50) {
          emit()
          return
        }
        instance.__scrollPendingDetail = detail
        if (instance.__scrollThrottleTimer) return
        instance.__scrollThrottleTimer = setTimeout(() => {
          instance.__scrollThrottleTimer = undefined
          const pending = instance.__scrollPendingDetail
          instance.__scrollPendingDetail = undefined
          if (pending) {
            instance.__lastScrollEmit = Date.now()
            this.triggerEvent('scroll', pending, { bubbles: true, composed: true })
          }
        }, 50 - elapsed)
      },
      handleScroll(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const detail = (event.detail ?? {}) as Record<string, unknown>
        const element = this.backend()
        const scrollTop = Number(detail.scrollTop ?? element?.scrollTop ?? 0)
        const scrollLeft = Number(detail.scrollLeft ?? element?.scrollLeft ?? 0)
        const scrollHeight = Number(detail.scrollHeight ?? element?.scrollHeight ?? 0)
        const scrollWidth = Number(detail.scrollWidth ?? element?.scrollWidth ?? 0)
        if (!instance.__scrollStartTimer) {
          instance.__scrollStartTimer = setTimeout(() => {
            instance.__scrollStartTimer = undefined
          }, 100)
          this.triggerEvent('scrollstart', { scrollTop, scrollLeft }, { bubbles: true, composed: true })
        }
        if (instance.__scrollEndTimer) clearTimeout(instance.__scrollEndTimer)
        instance.__scrollEndTimer = setTimeout(() => {
          instance.__scrollEndTimer = undefined
          instance.__scrollStartTimer = undefined
          this.triggerEvent('scrollend', { scrollTop, scrollLeft }, { bubbles: true, composed: true })
        }, 120)
        ;(this as unknown as ScrollRuntime).__scrollingUntil = Date.now() + 100
        const scrollDetail = {
          scrollTop,
          scrollLeft,
          scrollHeight,
          scrollWidth,
          deltaX: Number(detail.deltaX ?? 0),
          deltaY: Number(detail.deltaY ?? 0),
        }
        this.emitThrottledScroll(scrollDetail)
        ;(this as unknown as { updateScrollbar: (left: number, width: number, client: number) => void })
          .updateScrollbar(scrollLeft, scrollWidth, Number(detail.clientWidth ?? element?.clientWidth ?? 0))
        if (scrollTop <= Number(this.data.upperThreshold ?? 50)) {
          this.triggerEvent('scrolltoupper', { direction: 'top' }, { bubbles: true, composed: true })
        }
        const clientHeight = Number(detail.clientHeight ?? element?.clientHeight ?? 0)
        if (scrollHeight > 0 && scrollHeight - scrollTop - clientHeight <= Number(this.data.lowerThreshold ?? 50)) {
          this.triggerEvent('scrolltolower', { direction: 'bottom' }, { bubbles: true, composed: true })
        }
      },
    },
  }).general()
}
