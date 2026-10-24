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
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
    lifetimes: {
      attached() {
        this.applyScrollAnimation()
        this.applyScrollPosition('scrollTop')
        this.applyScrollPosition('scrollLeft')
        this.applyScrollPosition('scrollIntoView')
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
    },
    methods: {
      backend(): ScrollBackend | null {
        return (this as unknown as { getBackendElement?: () => ScrollBackend | null }).getBackendElement?.() ?? null
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
          try {
            element.querySelector?.(`#${id}`)?.scrollIntoView?.({ behavior: this.data.scrollWithAnimation ? 'smooth' : 'auto' })
          } catch {
            // Ignore invalid selectors; scrollIntoView is best effort.
          }
          return
        }
        const value = Number(this.data[field] ?? 0)
        if (Number.isFinite(value)) element[field] = value
      },
      handleScroll(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as Record<string, unknown>
        const element = this.backend()
        const scrollTop = Number(detail.scrollTop ?? element?.scrollTop ?? 0)
        const scrollLeft = Number(detail.scrollLeft ?? element?.scrollLeft ?? 0)
        const scrollHeight = Number(detail.scrollHeight ?? element?.scrollHeight ?? 0)
        const scrollWidth = Number(detail.scrollWidth ?? element?.scrollWidth ?? 0)
        this.triggerEvent('scroll', { scrollTop, scrollLeft, scrollHeight, scrollWidth, deltaX: Number(detail.deltaX ?? 0), deltaY: Number(detail.deltaY ?? 0) }, { bubbles: true, composed: true })
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
