import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type SwiperItemElement = {
  style?: {
    transform?: string
    webkitTransform?: string
    display?: string
    setProperty?: (name: string, value: string) => void
  }
  /** Layout width, used only for the `previous-margin` move ratio. */
  offsetWidth?: number
  hasAttribute?: (name: string) => boolean
  getAttribute?: (name: string) => string | null
  hidden?: boolean
}

type SwiperDot = { index: number; active: boolean }

/** WeChat accepts bare numbers, `px` and `rpx` for the two slide margins. */
function normalizeMargin(value: string): string {
  const text = String(value ?? '').trim()
  if (!text) return ''
  const match = /^([+-]?\d+(?:\.\d+)?)(px|rpx)?$/i.exec(text)
  if (!match) return ''
  const amount = Number(match[1])
  if ((match[2] ?? '').toLowerCase() === 'rpx') {
    const width = typeof window === 'undefined' ? 375 : window.innerWidth || 375
    return `${(amount * width) / 750}px`
  }
  return `${amount}px`
}

export function defineSwiper(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('swiper'),
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
      dots: [] as SwiperDot[],
      slidesStyle: '',
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
        this.layoutItems()
        this.updateTrackStyle()
      },
      detached() {
        ;(this as unknown as { _swiperTouchCleanup?: () => void })._swiperTouchCleanup?.()
        this.stopAutoplay()
      },
    },
    observers: {
      current(value: number) {
        this.setData({ activeIndex: Math.max(0, Number(value) || 0) })
        this.syncDots()
        this.updateTrackStyle()
      },
      duration() {
        this.updateTrackStyle()
      },
      vertical() {
        this.layoutItems()
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
      'previousMargin, nextMargin'() {
        this.applyMargins()
        this.updateTrackStyle()
      },
      skipHiddenItemLayout() {
        this.syncDots()
        this.layoutItems()
        this.updateTrackStyle()
      },
      currentItemId(value: string) {
        if (!value) return
        this.applyCurrentItemId(String(value), 0)
      },
    },
    options: ctx.hostOptions('swiper'),
    methods: {
      bootstrapSwiper(attempt: number) {
        this.applyMargins()
        this.layoutItems()
        this.syncDots()
        this.updateTrackStyle()
        this.restartAutoplay()
        if ((this.data.dots as SwiperDot[]).length === 0 && attempt < 10) {
          setTimeout(() => this.bootstrapSwiper(attempt + 1), 16)
        }
      },
      handleItemIdChanged(item: unknown, itemId: string) {
        const items = this.itemElements()
        const index = items.indexOf(item)
        if (index < 0) return
        if (String(this.data.currentItemId ?? '') !== itemId) return
        this.setData({ activeIndex: index })
        this.syncDots()
        this.updateTrackStyle()
      },
      applyCurrentItemId(itemId: string, attempt: number) {
        const host = (this as unknown as { getBackendElement?: () => { querySelectorAll?: (selector: string) => ArrayLike<unknown> } | null }).getBackendElement?.()
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
          this.syncDots()
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
          const element = item as SwiperItemElement & { data?: { hidden?: boolean } }
          if (typeof element.hasAttribute === 'function') return !element.hasAttribute('hidden')
          if (typeof element.hidden === 'boolean') return !element.hidden
          return !element.data?.hidden
        })
      },
      /** `previous-margin`/`next-margin` shrink `#slides`, like WeChat. */
      applyMargins() {
        const previous = normalizeMargin(String(this.data.previousMargin ?? ''))
        const next = normalizeMargin(String(this.data.nextMargin ?? ''))
        const edges = this.data.vertical
          ? { top: previous, bottom: next }
          : { left: previous, right: next }
        const style = Object.entries(edges)
          .filter(([, value]) => value !== '')
          .map(([name, value]) => `${name}: ${value};`)
          .join(' ')
        if (style !== String(this.data.slidesStyle ?? '')) this.setData({ slidesStyle: style })
      },
      /** Every item is absolutely positioned and translated by its own width. */
      layoutItems() {
        const items = this.itemElements() as SwiperItemElement[]
        const vertical = Boolean(this.data.vertical)
        items.forEach((item, index) => {
          if (!item.style) return
          const offset = 100 * index
          const transform = vertical
            ? `translate(0, ${offset}%) translateZ(0)`
            : `translate(${offset}%, 0) translateZ(0)`
          item.style.transform = transform
          item.style.webkitTransform = transform
        })
        this.updateHiddenItemDisplay(Number(this.data.activeIndex) || 0)
      },
      /** `skip-hidden-item-layout` keeps off-window items out of the layout. */
      updateHiddenItemDisplay(position: number) {
        if (!this.data.skipHiddenItemLayout) return
        const items = this.itemElements() as SwiperItemElement[]
        const displayMultiple = Math.max(1, Number(this.data.displayMultipleItems) || 1)
        items.forEach((item, index) => {
          if (!item.style) return
          const offscreen = index <= position - 2 || index >= position + displayMultiple + 1
          item.style.display = offscreen ? 'none' : ''
        })
      },
      syncDots() {
        const items = this.itemElements()
        const total = items.length
        const position = Number(this.data.activeIndex) || 0
        const displayMultiple = Math.max(1, Number(this.data.displayMultipleItems) || 1)
        const dots: SwiperDot[] = Array.from({ length: total }, (_value, index) => {
          const active = (position <= index && index < position + displayMultiple)
            || index < position + displayMultiple - total
          return { index, active }
        })
        this.setData({ dots })
      },
      /** WeChat shrinks the frame to `100 / displayMultipleItems` percent. */
      frameSize(): number {
        const displayMultiple = Math.max(1, Math.floor(Number(this.data.displayMultipleItems) || 1))
        return Math.abs(100 / displayMultiple)
      },
      /**
       * `previous-margin` makes one item narrower than the frame, so WeChat
       * advances by the item width instead of a full frame width.
       *
       * The measurement is best-effort: backends without layout (or with a
       * callback-style `getBoundingClientRect`) fall back to one frame width.
       */
      viewportMoveRatio(): number {
        const displayMultiple = Math.max(1, Math.floor(Number(this.data.displayMultipleItems) || 1))
        if (displayMultiple !== 1) return 1
        const widthOf = (element: SwiperItemElement | null | undefined): number => {
          // `offsetWidth` is synchronous in DOM backends; glass-easel's
          // `getBoundingClientRect` is callback-based and cannot be probed.
          const width = Number(element?.offsetWidth ?? 0)
          return Number.isFinite(width) && width > 0 ? width : 0
        }
        const items = this.itemElements() as SwiperItemElement[]
        const frame = (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => SwiperItemElement | null } | null
        } | null)?.getElementById?.('slideFrame')?.getBackendElement?.()
        const itemWidth = widthOf(items[0])
        const frameWidth = widthOf(frame)
        const ratio = frameWidth > 0 ? itemWidth / frameWidth : 1
        return ratio > 0 && ratio < 1 ? ratio : 1
      },
      updateTrackStyle() {
        const index = Number(this.data.activeIndex) || 0
        const axis = this.data.vertical ? 'Y' : 'X'
        const duration = Number(this.data.duration) || 500
        const easing = this.data.easingFunction === 'ease-in'
          ? 'ease-in'
          : this.data.easingFunction === 'ease-out'
            ? 'ease-out'
            : this.data.easingFunction === 'ease-in-out'
              ? 'ease-in-out'
              : this.data.easingFunction === 'linear'
                ? 'linear'
                : 'ease'
        const distance = 100 * index * this.viewportMoveRatio()
        const size = this.frameSize()
        const frameSize = this.data.vertical ? `height: ${size}%;` : `width: ${size}%;`
        this.setData({
          trackStyle: `${frameSize} transform: translate${axis}(-${distance}%); transition-duration: ${duration}ms; transition-timing-function: ${easing};`,
        })
        this.updateHiddenItemDisplay(index)
      },
      setActive(index: number, source: string) {
        const count = (this.data.dots as SwiperDot[]).length
        let next = index
        if (count > 0) {
          if (this.data.circular) next = (index + count) % count
          else next = Math.max(0, Math.min(count - 1, index))
        }
        this.setData({ activeIndex: next })
        this.syncDots()
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
          const count = (this.data.dots as SwiperDot[]).length
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
        const dataset = (event.currentTarget as unknown as { dataset?: { index?: string | number } }).dataset
        const index = Number(dataset?.index ?? 0)
        this.setActive(Number.isFinite(index) ? index : 0, 'tap')
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
