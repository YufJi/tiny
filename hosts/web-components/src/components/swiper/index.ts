import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineSwiper(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:swiper',
    template: ctx.template('swiper'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.touchTrack],
    properties: {
      ariaLabel: { type: String, value: '' },
      current: { type: Number, value: 0 },
      currentItemId: { type: String, value: '' },
      indicatorDots: { type: Boolean, value: false },
      indicatorColor: { type: String, value: '' },
      indicatorActiveColor: { type: String, value: '' },
      previousMargin: { type: String, value: '' },
      nextMargin: { type: String, value: '' },
      displayMultipleItems: { type: Number, value: 1 },
      skipHiddenItemLayout: { type: Boolean, value: false },
      easingFunction: { type: String, value: 'default' },
      autoplay: { type: Boolean, value: false },
      interval: { type: Number, value: 5000 },
      duration: { type: Number, value: 500 },
      circular: { type: Boolean, value: false },
      vertical: { type: Boolean, value: false },
    },
    data: {
      activeIndex: 0,
      dots: [] as number[],
      trackStyle: 'transform: translateX(0%); transition-duration: 500ms;',
    },
    lifetimes: {
      created() {
        this.bootstrapSwiper(0)
      },
      attached() {
        const element = (this as unknown as { getBackendElement?: () => unknown }).getBackendElement?.()
        const instance = this as unknown as { _swiperTouchCleanup?: () => void }
        instance._swiperTouchCleanup?.()
        const track = (this as unknown as {
          touchtrack?: (element: unknown, handler: (event: unknown) => void) => () => void
        }).touchtrack
        if (!track || !element) return
        instance._swiperTouchCleanup = track.call(this, element, (event) => {
          const detail = (event as { detail?: { state?: string } }).detail
          const touches = (event as { touches?: unknown[] }).touches
          const changedTouches = (event as { changedTouches?: unknown[] }).changedTouches
          if (detail?.state === 'start') this.handleTouchStart({ touches } as never)
          else if (detail?.state === 'end' || detail?.state === 'cancel') {
            this.handleTouchEnd({ changedTouches } as never)
          }
        })
      },
      detached() {
        ;(this as unknown as { _swiperTouchCleanup?: () => void })._swiperTouchCleanup?.()
        this.stopAutoplay()
      },
    },
    observers: {
      current(value: number) {
        const index = Math.max(0, Number(value) || 0)
        this.setData({ activeIndex: index })
        this.updateTrackStyle()
      },
      duration() {
        this.updateTrackStyle()
      },
      vertical() {
        this.updateTrackStyle()
      },
      autoplay() {
        this.restartAutoplay()
      },
      interval() {
        this.restartAutoplay()
      },
      displayMultipleItems() {
        this.layoutItems()
        this.updateTrackStyle()
      },
      skipHiddenItemLayout() {
        this.syncDots()
      },
      currentItemId(value: string) {
        if (!value) return
        this.applyCurrentItemId(String(value), 0)
      },
    },
    options: ctx.hostOptions(),
    methods: {
      bootstrapSwiper(attempt: number) {
        this.syncDots()
        this.updateTrackStyle()
        this.restartAutoplay()
        if ((this.data.dots as number[]).length === 0 && attempt < 10) {
          setTimeout(() => this.bootstrapSwiper(attempt + 1), 16)
        }
      },
      handleItemIdChanged(item: unknown, itemId: string) {
        const items = this.itemElements()
        const index = items.indexOf(item)
        if (index < 0) return
        if (String(this.data.currentItemId ?? '') !== itemId) return
        this.setData({ activeIndex: index })
        this.updateTrackStyle()
      },
      applyCurrentItemId(itemId: string, attempt: number) {
        const host = (this as unknown as { getBackendElement?: () => { querySelectorAll?: (selector: string) => ArrayLike<Element> } | null }).getBackendElement?.()
        const items = host?.querySelectorAll?.('tiny-swiper-item, .tiny-swiper-item')
        let index = -1
        if (items) {
          for (let i = 0; i < items.length; i += 1) {
            const element = items[i] as unknown as { getAttribute?: (name: string) => string | null }
            if (String(element.getAttribute?.('item-id') ?? '') === itemId) {
              index = i
              break
            }
          }
        }
        if (index < 0) {
          const children = (this as unknown as { childNodes?: unknown[] }).childNodes ?? []
          index = children.findIndex((child) => {
            const data = (child as { data?: { itemId?: string } }).data
            return String(data?.itemId ?? '') === itemId
          })
        }
        if (index >= 0) {
          this.setData({ activeIndex: index })
          this.updateTrackStyle()
          return
        }
        if (attempt < 10) setTimeout(() => this.applyCurrentItemId(itemId, attempt + 1), 16)
      },
      itemElements(): unknown[] {
        const host = (this as unknown as { getBackendElement?: () => { querySelectorAll?: (selector: string) => ArrayLike<unknown> } | null }).getBackendElement?.()
        const items = host?.querySelectorAll
          ? Array.from(host.querySelectorAll('tiny-swiper-item, .tiny-swiper-item'))
          : []
        const all = items.length > 0
          ? items
          : Array.isArray((this as unknown as { childNodes?: unknown[] }).childNodes)
            ? (this as unknown as { childNodes: unknown[] }).childNodes
            : []
        if (!this.data.skipHiddenItemLayout) return all
        return all.filter((item) => {
          const element = item as { hidden?: boolean; hasAttribute?: (name: string) => boolean; data?: { hidden?: boolean } }
          if (typeof element.hasAttribute === 'function') return !element.hasAttribute('hidden')
          if (typeof element.hidden === 'boolean') return !element.hidden
          return !element.data?.hidden
        })
      },
      layoutItems() {
        const items = this.itemElements() as Array<{
          style?: { setProperty?: (name: string, value: string) => void }
        }>
        const step = 100 / Math.max(1, Number(this.data.displayMultipleItems) || 1)
        items.forEach((item, index) => {
          item.style?.setProperty?.('--tiny-swiper-offset', `${index * step}%`)
        })
      },
      syncDots() {
        const count = this.itemElements().length
        const dots = Array.from({ length: count }, (_value, index) => index)
        this.layoutItems()
        this.setData({ dots })
        if (count === 0) {
          setTimeout(() => {
            const retryCount = this.itemElements().length
            if (retryCount > 0) {
              this.layoutItems()
              this.setData({ dots: Array.from({ length: retryCount }, (_value, index) => index) })
            }
          }, 0)
        }
      },
      updateTrackStyle() {
        const index = Number(this.data.activeIndex) || 0
        const axis = this.data.vertical ? 'Y' : 'X'
        const step = 100 / Math.max(1, Number(this.data.displayMultipleItems) || 1)
        const duration = Number(this.data.duration) || 500
        const easing = this.data.easingFunction === 'ease-in' ? 'ease-in' : this.data.easingFunction === 'ease-out' ? 'ease-out' : this.data.easingFunction === 'ease-in-out' ? 'ease-in-out' : this.data.easingFunction === 'linear' ? 'linear' : 'ease'
        this.setData({
          trackStyle: `transform: translate${axis}(-${index * step}%); transition-duration: ${duration}ms; transition-timing-function: ${easing};`,
        })
      },
      setActive(index: number, source: string) {
        const count = (this.data.dots as number[]).length
        let next = index
        if (count > 0) {
          if (this.data.circular) next = (index + count) % count
          else next = Math.max(0, Math.min(count - 1, index))
        }
        this.setData({ activeIndex: next })
        this.updateTrackStyle()
        this.triggerEvent('change', { current: next, source }, { bubbles: true, composed: true })
        this.triggerEvent('transition', { current: next, source }, { bubbles: true, composed: true })
        const timer = (this as unknown as { __swiperFinishTimer?: ReturnType<typeof setTimeout> }).__swiperFinishTimer
        if (timer) clearTimeout(timer)
        ;(this as unknown as { __swiperFinishTimer?: ReturnType<typeof setTimeout> }).__swiperFinishTimer = setTimeout(() => {
          this.triggerEvent('animationfinish', { current: next, source }, { bubbles: true, composed: true })
        }, Number(this.data.duration) || 500)
      },
      stopAutoplay() {
        const timer = (this as unknown as { __swiperTimer?: ReturnType<typeof setInterval> }).__swiperTimer
        if (timer) clearInterval(timer)
        ;(this as unknown as { __swiperTimer?: ReturnType<typeof setInterval> }).__swiperTimer = undefined
      },
      restartAutoplay() {
        this.stopAutoplay()
        if (!this.data.autoplay) return
        const interval = Math.max(100, Number(this.data.interval) || 5000)
        ;(this as unknown as { __swiperTimer?: ReturnType<typeof setInterval> }).__swiperTimer = setInterval(() => {
          const count = (this.data.dots as number[]).length
          if (count < 2) return
          const next = Number(this.data.activeIndex) + 1
          if (next >= count && !this.data.circular) {
            this.setActive(0, 'autoplay')
            return
          }
          this.setActive(next, 'autoplay')
        }, interval)
      },
      handleDotTap(event: glassEasel.ShadowedEvent<unknown>) {
        const id = String((event.currentTarget as unknown as { id?: string }).id ?? '')
        const index = Number(id.split('-').pop() ?? 0)
        this.setActive(index, 'tap')
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const touch = (event as unknown as { touches?: { clientX?: number; clientY?: number; x?: number; y?: number }[] }).touches?.[0]
        ;(this as unknown as { __swiperStart?: number }).__swiperStart = this.data.vertical
          ? Number(touch?.clientY ?? touch?.y ?? 0)
          : Number(touch?.clientX ?? touch?.x ?? 0)
      },
      handleTouchEnd(event: glassEasel.ShadowedEvent<unknown>) {
        const start = (this as unknown as { __swiperStart?: number }).__swiperStart
        if (start === undefined) return
        const touch = (event as unknown as { changedTouches?: { clientX?: number; clientY?: number; x?: number; y?: number }[] }).changedTouches?.[0]
        const end = this.data.vertical
          ? Number(touch?.clientY ?? touch?.y ?? start)
          : Number(touch?.clientX ?? touch?.x ?? start)
        const delta = end - start
        if (Math.abs(delta) < 40) return
        const direction = delta < 0 ? 1 : -1
        this.setActive(Number(this.data.activeIndex) + direction, 'touch')
      },
    },
  }).general()
}
