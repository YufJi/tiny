import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type ScrollBackend = {
  scrollTop?: number
  scrollLeft?: number
  scrollHeight?: number
  scrollWidth?: number
  clientHeight?: number
  clientWidth?: number
  style?: { scrollBehavior?: string }
  querySelector?: (selector: string) => { scrollIntoView?: (options?: unknown) => void } | null
}

type ScrollRuntime = {
  __scrollStartTimer?: ReturnType<typeof setTimeout>
  __scrollEndTimer?: ReturnType<typeof setTimeout>
  __scrollThrottleTimer?: ReturnType<typeof setTimeout>
  __scrollPendingDetail?: Record<string, unknown>
  __lastScrollEmit?: number
  __refresherTimer?: ReturnType<typeof setTimeout>
  __dragStart?: { x: number; y: number; scrollTop: number }
  __dragging?: boolean
  __pullDistance?: number
}

function touchPoint(event: glassEasel.ShadowedEvent<unknown>): { x: number; y: number } {
  const detail = (event.detail ?? {}) as { touches?: Array<{ clientX?: number; clientY?: number; x?: number; y?: number }>; changedTouches?: Array<{ clientX?: number; clientY?: number; x?: number; y?: number }> }
  const touch = detail.touches?.[0] ?? detail.changedTouches?.[0] ?? (event as unknown as { touches?: Array<{ clientX?: number; clientY?: number; x?: number; y?: number }> }).touches?.[0]
  return { x: Number(touch?.clientX ?? touch?.x ?? 0), y: Number(touch?.clientY ?? touch?.y ?? 0) }
}

export function defineScrollView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:scroll-view',
    template: ctx.template('scroll-view'),
    behaviors: [ctx.behaviors.base],
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
    options: ctx.hostOptions({ multipleSlots: true }),
    lifetimes: {
      attached() {
        this.applyScrollAnimation()
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
      refresherTriggered(value: boolean) {
        this.triggerEvent('refresherstatuschange', { status: value ? 'refreshing' : 'complete' }, { bubbles: true, composed: true })
      },
    },
    methods: {
      backend(): ScrollBackend | null {
        const element = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => ScrollBackend | null } | null
        } | null)?.getElementById?.('native-scroll-view')?.getBackendElement?.()
        return element ?? (this as unknown as { getBackendElement?: () => ScrollBackend | null }).getBackendElement?.() ?? null
      },
      applyScrollAnimation() {
        const element = this.backend()
        if (element?.style) element.style.scrollBehavior = this.data.scrollWithAnimation ? 'smooth' : 'auto'
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
        if (Number.isFinite(value)) element[field] = value
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
      cancelRefresher() {
        const instance = this as unknown as ScrollRuntime
        if (instance.__refresherTimer) clearTimeout(instance.__refresherTimer)
        instance.__refresherTimer = undefined
        if (this.data.refresherTriggered) this.setData({ refresherTriggered: false })
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const point = touchPoint(event)
        instance.__dragStart = { ...point, scrollTop: Number(this.backend()?.scrollTop ?? 0) }
        instance.__dragging = false
        instance.__pullDistance = 0
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as ScrollRuntime
        const start = instance.__dragStart
        if (!start) return
        const point = touchPoint(event)
        const deltaX = point.x - start.x
        const deltaY = point.y - start.y
        if (this.data.refresherEnabled && start.scrollTop <= 0 && deltaY > 0) {
          instance.__pullDistance = deltaY
          this.triggerEvent('refresherpulling', { deltaY }, { bubbles: true, composed: true })
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
        instance.__dragStart = undefined
        instance.__dragging = false
        instance.__pullDistance = 0
        if (this.data.refresherEnabled && pullDistance > Number(this.data.refresherThreshold ?? 45)) {
          this.triggerEvent('refresherwillrefresh', {}, { bubbles: true, composed: true })
          this.triggerEvent('refresherwillRefresh', {}, { bubbles: true, composed: true })
          this.setData({ refresherTriggered: true })
          this.triggerEvent('refresherrefresh', { dy: pullDistance }, { bubbles: true, composed: true })
          if (instance.__refresherTimer) clearTimeout(instance.__refresherTimer)
          instance.__refresherTimer = setTimeout(() => {
            instance.__refresherTimer = undefined
            this.setData({ refresherTriggered: false })
            this.triggerEvent('refresherrestore', {}, { bubbles: true, composed: true })
          }, 300)
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
        if (this.data.refresherEnabled) this.triggerEvent('refresherabort', {}, { bubbles: true, composed: true })
      },
      handleTap() {
        if (!this.data.enableBackToTop) return
        const instance = this as unknown as { __lastTap?: number }
        const now = Date.now()
        if (instance.__lastTap && now - instance.__lastTap < 300) {
          instance.__lastTap = 0
          const element = this.backend()
          if (element) {
            element.scrollTop = 0
            element.scrollLeft = 0
          }
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
        const scrollDetail = {
          scrollTop,
          scrollLeft,
          scrollHeight,
          scrollWidth,
          deltaX: Number(detail.deltaX ?? 0),
          deltaY: Number(detail.deltaY ?? 0),
        }
        this.emitThrottledScroll(scrollDetail)
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
