import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type Rect = { width: number; height: number; left: number; top: number }

type SwiperItemBackend = {
  style?: Record<string, string>
  offsetWidth?: number
  offsetHeight?: number
  offsetTop?: number
  offsetLeft?: number
  getBoundingClientRect?: () => Rect
  getAttribute?: (name: string) => string | null
  hasAttribute?: (name: string) => boolean
  data?: { itemId?: string }
  _position?: number
  _positionX?: string
  _positionY?: string
  _originalDisplay?: string
}

type SwiperBackend = {
  style?: Record<string, string>
  offsetWidth?: number
  offsetHeight?: number
  offsetTop?: number
  offsetLeft?: number
  getBoundingClientRect?: () => Rect
  querySelectorAll?: (selector: string) => ArrayLike<SwiperItemBackend>
  appendChild?: (node: unknown) => void
  addEventListener?: (type: string, listener: (event: Event) => void) => void
  removeEventListener?: (type: string, listener: (event: Event) => void) => void
  ownerDocument?: Document
}

type SwiperRuntime = {
  _attached?: boolean
  _invalid?: boolean
  _circularEnabled?: boolean
  _currentChangeSource?: string
  _viewportPosition?: number
  _marginSpecified?: boolean
  _viewportMoveRatio?: number
  _scheduleTimeoutObj?: ReturnType<typeof setTimeout> | null
  _shouldScheduleAutoplay?: boolean
  _schedulingAutoplay?: boolean
  _animating?: {
    fromPos: number
    toPos: number
    startTime: number
    endTime: number
    source: string
  } | null
  _requestedAnimation?: boolean
  _itemIdItemMap?: Record<string, SwiperItemBackend>
  _items?: SwiperItemBackend[]
  _itemListDirty?: boolean
  _userTracking?: boolean
  _userDirectionChecked?: boolean
  _contentTrackViewport?: number
  _contentTrackSpeed?: number
  _contentTrackT?: number
  _skipHiddenItemLayoutModified?: boolean
  _highlightedDots?: number[]
  _previous?: number
  _swiping?: boolean
  _transitioning?: boolean
  _lastCurrent?: number
  _lastPosX?: number | null
  _lastPosY?: number | null
  _transposed?: boolean
  _scrollPosition?: {
    scrollLeft: number
    scrollTop: number
    scrollWidth: number
    scrollHeight: number
  }
  _frameSize?: { width: number; height: number } | null
  _viewportSize?: { width: number; height: number; top: number; left: number } | null
  _wrapperSize?: { width: number; height: number } | null
  _frameBoundingClientRect?: Rect | null
  _firstItemBoundingClientRect?: Rect | null
  _touchCleanup?: () => void
  _animationTimer?: ReturnType<typeof setTimeout> | null
  _mutationObserver?: MutationObserver
  _resizeHandler?: () => void
  _host?: SwiperBackend | null
  _window?: Window
  _animateFrameFunc?: (time: number) => void
  getBackendElement?: () => SwiperBackend | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => { getBackendElement?: () => SwiperBackend | null } | null
  } | null
  setAriaRoleDefault?: (role: string) => void
  touchtrack?: (
    element: unknown,
    handler: (event: TouchEventLike) => boolean | void,
    useCapture?: boolean,
  ) => () => void
}

type TouchEventLike = {
  detail?: {
    state?: string
    dx?: number
    dy?: number
    ddx?: number
    ddy?: number
  }
}

type SwiperDot = { index: number; active: boolean }

const EASING = {
  linear: (t: number, b: number, c: number, d: number) => (c * t) / d + b,
  easeInCubic: (t: number, b: number, c: number, d: number) => c * (t /= d) * t * t + b,
  easeOutCubic: (t: number, b: number, c: number, d: number) => {
    const x = t / d - 1
    return c * (x * x * x + 1) + b
  },
  easeInOutCubic: (t: number, b: number, c: number, d: number) => {
    let x = t
    const half = d / 2
    if (x < half) return (c / 2) * (x /= half) * x * x + b
    x -= 2
    return (c / 2) * (x * x * x + 2) + b
  },
}

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

function itemIdOf(item: SwiperItemBackend): string {
  if (item.data && item.data.itemId !== undefined) return String(item.data.itemId)
  return String(item.getAttribute?.('item-id') ?? '')
}

/**
 * Mirrors `wx-swiper`: the slide frame moves over absolutely positioned
 * swiper-items, dots are driven by the visible position, touch moves the
 * viewport with edge resistance, and autoplay/current updates animate through
 * the same viewport helper as the reference.
 */
export function defineSwiper(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('swiper'),
    template: ctx.template('swiper'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.touchTrack, ctx.behaviors.reload],
    properties: {
      indicatorDots: { type: Boolean, value: false },
      vertical: { type: Boolean, value: false, observer: '_updateLayout' },
      autoplay: { type: Boolean, value: false, observer: '_autoplayChanged' },
      circular: { type: Boolean, value: false, observer: '_updateLayout' },
      interval: { type: Number, value: 5000, observer: '_autoplayChanged' },
      duration: { type: Number, value: 500 },
      current: { type: Number, value: 0, observer: '_currentChanged' },
      indicatorColor: { type: String, value: '', observer: '_updateDotsColor' },
      indicatorActiveColor: { type: String, value: '', observer: '_updateDotsColor' },
      previousMargin: { type: String, value: '', observer: '_updateMargin' },
      nextMargin: { type: String, value: '', observer: '_updateMargin' },
      snapToEdge: { type: Boolean, value: false, observer: '_updateMargin' },
      currentItemId: { type: String, value: '', observer: '_currentItemIdChanged' },
      skipHiddenItemLayout: { type: Boolean, value: false, observer: '_skipHiddenItemLayoutChanged' },
      displayMultipleItems: { type: Number, value: 1, observer: '_updateDisplayMultipleItems' },
      easingFunction: { type: String, value: 'default' },
    },
    data: {
      scrollLabel: '可横向滚动',
      dots: [] as SwiperDot[],
      activeIndex: 0,
      trackStyle: '',
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as SwiperRuntime
        runtime._attached = false
        runtime._invalid = true
        runtime._circularEnabled = false
        runtime._currentChangeSource = ''
        runtime._viewportPosition = 0
        runtime._marginSpecified = false
        runtime._viewportMoveRatio = 1
        runtime._scheduleTimeoutObj = null
        runtime._animating = null
        runtime._requestedAnimation = false
        runtime._itemIdItemMap = {}
        runtime._items = []
        runtime._itemListDirty = true
        runtime._userTracking = false
        runtime._userDirectionChecked = false
        runtime._contentTrackViewport = 0
        runtime._contentTrackSpeed = 0
        runtime._contentTrackT = 0
        runtime._skipHiddenItemLayoutModified = false
        runtime._highlightedDots = []
        runtime._previous = 0
        runtime._swiping = false
        runtime._transitioning = false
        runtime._lastCurrent = 0
        runtime._lastPosX = null
        runtime._lastPosY = null
        runtime._transposed = false
        runtime._animateFrameFunc = () => {
          ;(this as unknown as { _animateFrame: () => void })._animateFrame()
        }
      },
      attached() {
        const runtime = this as unknown as SwiperRuntime
        runtime._attached = true
        runtime._host = runtime.getBackendElement?.() ?? null
        runtime._touchCleanup = runtime.touchtrack?.(
          this,
          (event) => (this as unknown as {
            _handleContentTrack: (event: TouchEventLike) => boolean | void
          })._handleContentTrack(event),
          true,
        )
        ;(this as unknown as { setAriaRoleDefault: (role: string) => void }).setAriaRoleDefault('listbox')
        ;(this as unknown as { _attachedCb: () => void })._attachedCb()
      },
      detached() {
        const runtime = this as unknown as SwiperRuntime
        runtime._attached = false
        runtime._touchCleanup?.()
        runtime._touchCleanup = undefined
        if (runtime._animationTimer) clearTimeout(runtime._animationTimer)
        runtime._animationTimer = null
        runtime._mutationObserver?.disconnect()
        runtime._mutationObserver = undefined
        if (runtime._resizeHandler) {
          runtime._window?.removeEventListener?.('resize', runtime._resizeHandler)
          runtime._resizeHandler = undefined
        }
        ;(this as unknown as { _cancelSchedule: () => void })._cancelSchedule()
      },
    },
    observers: {
      vertical() {
        this.setData({ scrollLabel: this._getScrollStr(Boolean(this.data.vertical)) })
      },
    },
    options: ctx.hostOptions('swiper'),
    methods: {
      refreshLayout() {
        const runtime = this as unknown as SwiperRuntime
        runtime._attached = true
        runtime._itemListDirty = true
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
      },
      _getScrollStr(vertical: boolean): string {
        return `可${vertical ? '竖向' : '横向'}滚动`
      },
      _attachedCb() {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._attached !== true) return
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
        if (this.data.autoplay) (this as unknown as { _scheduleAutoplay: () => void })._scheduleAutoplay()
        const host = runtime._host
        if (typeof MutationObserver !== 'undefined' && host) {
          runtime._mutationObserver = new MutationObserver(() => {
            ;(this as unknown as { _itemListChanged: () => void })._itemListChanged()
            ;(this as unknown as { _resetLayout: () => void })._resetLayout()
          })
          runtime._mutationObserver.observe(host as unknown as Node, { childList: true, subtree: false })
        }
        const windowRef = host?.ownerDocument?.defaultView ?? (typeof window !== 'undefined' ? window : undefined)
        if (windowRef?.addEventListener) {
          runtime._window = windowRef
          runtime._resizeHandler = () => {
            ;(this as unknown as { _resetLayout: () => void })._resetLayout()
          }
          windowRef.addEventListener('resize', runtime._resizeHandler)
        }
      },
      _div(id: string): SwiperBackend | null {
        const runtime = this as unknown as SwiperRuntime
        return runtime.getShadowRoot?.()?.getElementById?.(id)?.getBackendElement?.() ?? null
      },
      _getItems(): SwiperItemBackend[] {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._itemListDirty) return runtime._items ?? []
        runtime._itemListDirty = false
        const host = runtime._host ?? runtime.getBackendElement?.() ?? null
        const queried = host?.querySelectorAll?.('tiny-swiper-item')
        const list: SwiperItemBackend[] = queried && queried.length > 0
          ? Array.from(queried)
          : ((this as unknown as { childNodes?: SwiperItemBackend[] }).childNodes ?? [])
        runtime._items = list
        const map: Record<string, SwiperItemBackend> = {}
        for (const item of list) {
          const id = itemIdOf(item)
          if (id && !map[id]) map[id] = item
        }
        runtime._itemIdItemMap = map
        return list
      },
      _updateItemList() {
        const runtime = this as unknown as SwiperRuntime
        runtime._itemListDirty = true
        ;(this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
      },
      _itemListChanged() {
        const runtime = this as unknown as SwiperRuntime
        runtime._itemListDirty = true
      },
      _itemIdUpdated(item: unknown, next: string, previous: string) {
        if (next === previous) return
        const runtime = this as unknown as SwiperRuntime
        runtime._itemListDirty = true
        if (String(this.data.currentItemId ?? '')) {
          ;(this as unknown as { _currentItemIdChanged: (value: string) => void })
            ._currentItemIdChanged(String(this.data.currentItemId))
        }
      },
      _currentItemIdChanged(value: string) {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._currentChangeSource === '__none__') {
          runtime._currentChangeSource = ''
          return
        }
        if (!value) return
        const position = (this as unknown as { _getPositionFromCurrent: () => number })
          ._getPositionFromCurrent()
        if (position >= 0) this.setData({ current: position })
      },
      _currentChanged(value: number) {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._currentChangeSource === '__none__') {
          runtime._currentChangeSource = ''
          runtime._lastCurrent = value
          return
        }
        const source = runtime._currentChangeSource ?? ''
        runtime._currentChangeSource = ''
        const previous = Number(runtime._lastCurrent ?? value)
        runtime._lastCurrent = value
        if (!runtime._attached) return
        const legal = (this as unknown as { _isCurrentValueLegal: (value: number) => boolean })
        if (!legal._isCurrentValueLegal(value) || !legal._isCurrentValueLegal(previous)) {
          ;(this as unknown as { _resetLayout: () => void })._resetLayout()
          return
        }
        ;(this as unknown as { _animateViewport: (to: number, source: string, direction: number) => void })
          ._animateViewport(value, source, 0)
        this.setData({ activeIndex: value })
        if (value !== previous) {
          const item = (this as unknown as { _getItems: () => SwiperItemBackend[] })
            ._getItems()[value]
          const itemId = item ? itemIdOf(item) : ''
          runtime._currentChangeSource = '__none__'
          this.setData({ currentItemId: itemId })
          if (runtime._currentChangeSource === '__none__') runtime._currentChangeSource = ''
          this.triggerEvent('change', { current: value, currentItemId: itemId, source })
        }
        ;(this as unknown as { _updateDots: (position: number) => void })._updateDots(value)
      },
      _updateLayout() {
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
      },
      _updateMargin() {
        const runtime = this as unknown as SwiperRuntime
        runtime._marginSpecified = true
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
      },
      _skipHiddenItemLayoutChanged() {
        const runtime = this as unknown as SwiperRuntime
        runtime._skipHiddenItemLayoutModified = true
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
        runtime._skipHiddenItemLayoutModified = false
      },
      _updateDisplayMultipleItems() {
        ;(this as unknown as { _resetLayout: () => void })._resetLayout()
      },
      _autoplayChanged(next: boolean) {
        if (next) (this as unknown as { _scheduleAutoplay: () => void })._scheduleAutoplay()
        else (this as unknown as { _cancelSchedule: () => void })._cancelSchedule()
      },
      _scheduleAutoplay() {
        ;(this as unknown as { _cancelSchedule: () => void })._cancelSchedule()
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._attached || runtime._invalid) return
        if ((this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length <= Number(this.data.displayMultipleItems)) return
        runtime._shouldScheduleAutoplay = true
        if (runtime._schedulingAutoplay) return
        runtime._schedulingAutoplay = true
        Promise.resolve().then(() => {
          runtime._schedulingAutoplay = false
          if (!runtime._shouldScheduleAutoplay) return
          const step = () => {
            runtime._scheduleTimeoutObj = null
            runtime._currentChangeSource = 'autoplay'
            const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
            const next = runtime._circularEnabled
              ? (this as unknown as { _normalizeCurrentValue: (value: number) => number })
                ._normalizeCurrentValue(Number(this.data.current) + 1)
              : Number(this.data.current) + Number(this.data.displayMultipleItems) < count
                ? Number(this.data.current) + 1
                : 0
            this.setData({ current: next })
            ;(this as unknown as { _animateViewport: (to: number, source: string, direction: number) => void })
              ._animateViewport(next, 'autoplay', runtime._circularEnabled ? 1 : 0)
            runtime._scheduleTimeoutObj = setTimeout(step, Number(this.data.interval) || 5000)
          }
          runtime._scheduleTimeoutObj = setTimeout(step, Number(this.data.interval) || 5000)
        })
      },
      _cancelSchedule() {
        const runtime = this as unknown as SwiperRuntime
        runtime._shouldScheduleAutoplay = false
        if (runtime._scheduleTimeoutObj) {
          clearTimeout(runtime._scheduleTimeoutObj)
          runtime._scheduleTimeoutObj = null
        }
      },
      _updateDots(position: number) {
        const runtime = this as unknown as SwiperRuntime
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        const display = Math.max(1, Math.floor(Number(this.data.displayMultipleItems) || 1))
        const active: number[] = []
        if (!runtime._invalid && items.length > 0) {
          for (let offset = 0; offset < display; offset += 1) {
            active.push((position + offset + items.length) % items.length)
          }
        }
        runtime._highlightedDots = active
        const dots: SwiperDot[] = items.map((_item, index) => ({
          index,
          active: active.includes(index),
        }))
        this.setData({ dots })
      },
      _updateDotsColor() {
        ;(this as unknown as { _updateDots: (position: number) => void })
          ._updateDots(Number(this.data.activeIndex) || 0)
      },
      _normalizeCurrentValue(value: number): number {
        const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
        if (!count) return -1
        const runtime = this as unknown as SwiperRuntime
        const display = Math.max(1, Number(this.data.displayMultipleItems) || 1)
        const index = ((Math.round(value) % count) + count) % count
        if (runtime._circularEnabled) {
          if (count <= display) return 0
        } else if (index > count - display) {
          return Math.max(0, count - display)
        }
        return index
      },
      _isCurrentValueLegal(value: number): boolean {
        return (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length > 0
          && value === (this as unknown as { _normalizeCurrentValue: (value: number) => number })
            ._normalizeCurrentValue(value)
      },
      _getPositionFromCurrent(): number {
        const runtime = this as unknown as SwiperRuntime
        const currentItemId = String(this.data.currentItemId ?? '')
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        if (currentItemId) {
          const item = runtime._itemIdItemMap?.[currentItemId]
          return item ? items.indexOf(item) : -1
        }
        return (this as unknown as { _isCurrentValueLegal: (value: number) => boolean })
          ._isCurrentValueLegal(Number(this.data.current))
          ? Number(this.data.current)
          : -2
      },
      _resetLayout() {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._attached) return
        const vertical = Boolean(this.data.vertical)
        let top = ''
        let left = ''
        let right = ''
        let bottom = ''
        const display = Math.max(1, Number(this.data.displayMultipleItems) || 1)
        const frameSpan = `${Math.abs(100 / display)}%`
        if (vertical) {
          if (runtime._marginSpecified) {
            top = normalizeMargin(String(this.data.previousMargin ?? ''))
            bottom = normalizeMargin(String(this.data.nextMargin ?? ''))
          }
        } else if (runtime._marginSpecified) {
          left = normalizeMargin(String(this.data.previousMargin ?? ''))
          right = normalizeMargin(String(this.data.nextMargin ?? ''))
        }
        const slides = this._div('slides')
        const frame = this._div('slideFrame')
        if (slides?.style) {
          slides.style.top = top
          slides.style.left = left
          slides.style.right = right
          slides.style.bottom = bottom
        }
        if (frame?.style) {
          frame.style.height = vertical ? frameSpan : '100%'
          frame.style.width = vertical ? '100%' : frameSpan
        }
        runtime._viewportSize = null
        runtime._frameSize = null
        runtime._frameBoundingClientRect = null
        runtime._firstItemBoundingClientRect = null
        ;(this as unknown as { _cancelSchedule: () => void })._cancelSchedule()
        ;(this as unknown as { _endViewportAnimation: () => void })._endViewportAnimation()
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        const frameSize = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const viewportSize = (this as unknown as { _getViewportSize: () => { width: number; height: number; top: number; left: number } })
          ._getViewportSize()
        ;(this as unknown as { _getWrapperSize: () => { width: number; height: number } })._getWrapperSize()
        const currentItemId = String(this.data.currentItemId ?? '')
        if (currentItemId) {
          runtime._currentChangeSource = '__none__'
          this.setData({ current: (this as unknown as { _getPositionFromCurrent: () => number })._getPositionFromCurrent() })
          if (runtime._currentChangeSource === '__none__') runtime._currentChangeSource = ''
        }
        runtime._viewportMoveRatio = 1
        if (display === 1 && items.length > 0) {
          const first = (this as unknown as { _getFirstItemBoundingClientRect: () => Rect })
            ._getFirstItemBoundingClientRect()
          const frameRect = (this as unknown as { _getFrameBoundingClientRect: () => Rect })
            ._getFrameBoundingClientRect()
          const ratio = frameRect.width > 0 ? first.width / frameRect.width : 1
          runtime._viewportMoveRatio = ratio > 0 && ratio < 1 ? ratio : 1
        }
        runtime._circularEnabled = Boolean(this.data.circular) && items.length > display
        const previousViewport = Number(runtime._viewportPosition) || 0
        runtime._viewportPosition = -2
        let position = (this as unknown as { _getPositionFromCurrent: () => number })._getPositionFromCurrent()
        if (position >= 0) {
          runtime._invalid = false
          position = (this as unknown as { _calcNewPosition: (value: number) => number })._calcNewPosition(position)
          if (runtime._userTracking) {
            ;(this as unknown as { _updateViewport: (value: number) => void })
              ._updateViewport(previousViewport + position - Number(runtime._contentTrackViewport || 0))
            runtime._contentTrackViewport = position
          } else {
            ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(position)
          }
          if (this.data.autoplay) (this as unknown as { _scheduleAutoplay: () => void })._scheduleAutoplay()
        } else {
          runtime._invalid = true
          ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(-display - 1)
        }
        ;(this as unknown as { _updateDots: (position: number) => void })._updateDots(position)
        void frameSize
        void viewportSize
      },
      _warnInvalidCurrent() {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._invalid) {
          const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
          if (runtime._attached && Number(this.data.current) > count - 1) {
            this.setData({ current: 0 })
          }
        }
      },
      _updateItems(position: number) {
        const runtime = this as unknown as SwiperRuntime
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        for (let index = 0; index < items.length; index += 1) {
          ;(this as unknown as { _updateItemPos: (index: number, position: number) => void })
            ._updateItemPos(index, (this as unknown as {
              _getItemExpectPos: (index: number, position: number) => number
            })._getItemExpectPos(index, position))
        }
        if (runtime._skipHiddenItemLayoutModified || this.data.skipHiddenItemLayout) {
          ;(this as unknown as { _updateHiddenItemDisplay: (position: number) => void })
            ._updateHiddenItemDisplay(position)
        }
      },
      _getItemExpectPos(index: number, position: number): number {
        const runtime = this as unknown as SwiperRuntime
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        if (!runtime._circularEnabled) return index
        const count = items.length
        const forward = index < position ? index + count : index
        const backward = forward - count
        const viewport = (this as unknown as { _getViewportSize: () => { width: number; height: number; top: number; left: number } })
          ._getViewportSize()
        const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const offset = this.data.vertical
          ? viewport.top / (frame.height || 1)
          : viewport.left / (frame.width || 1)
        return position - 1 - offset < backward
          && backward < position + Number(this.data.displayMultipleItems) + 1
          ? backward
          : forward
      },
      _updateItemPos(index: number, position: number) {
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        const item = items[index]
        if (!item?.style) return
        const x = this.data.vertical ? '0' : `${100 * position}%`
        const y = this.data.vertical ? `${100 * position}%` : '0'
        if (item._positionX === x && item._positionY === y) return
        const transform = `translate(${x}, ${y}) translateZ(0)`
        item.style['-webkit-transform'] = transform
        item.style.transform = transform
        item._position = position
        item._positionX = x
        item._positionY = y
      },
      _getMinPos(): number {
        const runtime = this as unknown as SwiperRuntime
        let min = 0
        if (this.data.snapToEdge && !runtime._circularEnabled && this.data.previousMargin) {
          const viewport = (this as unknown as { _getViewportSize: () => { width: number; height: number; top: number; left: number } })
            ._getViewportSize()
          const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
            ._getFrameSize()
          min += this.data.vertical ? viewport.top / (frame.height || 1) : viewport.left / (frame.width || 1)
        }
        return min
      },
      _getMaxPos(): number {
        const runtime = this as unknown as SwiperRuntime
        const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
        const display = Math.max(1, Number(this.data.displayMultipleItems) || 1)
        let max = runtime._circularEnabled ? count - 1 : count - display
        if (this.data.snapToEdge && !runtime._circularEnabled && this.data.nextMargin) {
          const wrapper = (this as unknown as { _getWrapperSize: () => { width: number; height: number } })
            ._getWrapperSize()
          const viewport = (this as unknown as { _getViewportSize: () => { width: number; height: number; top: number; left: number } })
            ._getViewportSize()
          const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
            ._getFrameSize()
          max -= this.data.vertical
            ? (wrapper.height - viewport.top - viewport.height) / (frame.height || 1)
            : (wrapper.width - viewport.left - viewport.width) / (frame.width || 1)
        }
        return Math.max(0, max)
      },
      _calcNewPosition(value: number): number {
        const min = (this as unknown as { _getMinPos: () => number })._getMinPos()
        const max = (this as unknown as { _getMaxPos: () => number })._getMaxPos()
        return Math.max(min, Math.min(value, max))
      },
      _updateViewport(position: number) {
        const runtime = this as unknown as SwiperRuntime
        const frame = this._div('slideFrame')
        ;(this as unknown as { _updateItems: (position: number) => void })._updateItems(position)
        const ratio = Number(runtime._viewportMoveRatio) || 1
        const x = this.data.vertical ? '0' : `${100 * -position * ratio}%`
        const y = this.data.vertical ? `${100 * -position * ratio}%` : '0'
        runtime._viewportPosition = position
        const transform = `translate(${x}, ${y}) translateZ(0)`
        if (frame?.style) {
          frame.style['-webkit-transform'] = transform
          frame.style.transform = transform
        }
        const span = `${Math.abs(100 / Math.max(1, Number(this.data.displayMultipleItems) || 1))}%`
        const frameStyle = this.data.vertical ? `height: ${span}; ` : `width: ${span}; `
        const size = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
        const scroll = {
          scrollLeft: this.data.vertical ? 0 : position * ratio * size.width,
          scrollTop: this.data.vertical ? position * ratio * size.height : 0,
          scrollWidth: (this.data.vertical ? 1 : count) * size.width,
          scrollHeight: (this.data.vertical ? count : 1) * size.height,
        }
        const previous = runtime._scrollPosition
        const animating = runtime._animating
        const source = animating?.source ?? ''
        if ((source === 'touch' && !runtime._swiping) || !runtime._transitioning) {
          runtime._scrollPosition = scroll
          this.setData({
            trackStyle: `${frameStyle}transform: ${transform};`,
          })
          return
        }
        let dx = 0
        let dy = 0
        if (this.data.vertical) {
          dy = (this as unknown as { _getTransitionDeltaY: (value: number) => number })._getTransitionDeltaY(scroll.scrollTop)
        } else {
          dx = (this as unknown as { _getTransitionDeltaX: (value: number) => number })._getTransitionDeltaX(scroll.scrollLeft)
        }
        this.setData({ trackStyle: `${frameStyle}transform: ${transform};` })
        this.triggerEvent('transition', { dx, dy })
        void previous
        runtime._scrollPosition = scroll
      },
      _getTransitionDeltaX(value: number): number {
        const runtime = this as unknown as SwiperRuntime
        const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const width = frame.width || 1
        const last = runtime._lastPosX
        const distance = last === null || last === undefined ? 0 : Math.abs(value - last)
        if ((last !== null && last !== undefined && distance > width) || runtime._transposed) {
          runtime._transposed = true
          const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
          const total = (count - 1) * width
          if (runtime._circularEnabled) {
            if ((last ?? 0) < 0) value = -(width - (value - total))
            else if ((last ?? 0) > 0) value = total + (width + value)
          }
        } else {
          runtime._lastPosX = value
        }
        return value - (Number(runtime._previous) || 0) * width
      },
      _getTransitionDeltaY(value: number): number {
        const runtime = this as unknown as SwiperRuntime
        const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const height = frame.height || 1
        const last = runtime._lastPosY
        const distance = last === null || last === undefined ? 0 : Math.abs(value - last)
        if ((last !== null && last !== undefined && distance > height) || runtime._transposed) {
          runtime._transposed = true
          const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
          const total = (count - 1) * height
          if (runtime._circularEnabled) {
            if ((last ?? 0) < 0) value = -(height - (value - total))
            else if ((last ?? 0) > 0) value = total + (height + value)
          }
        } else {
          runtime._lastPosY = value
        }
        return value - (Number(runtime._previous) || 0) * height
      },
      _animateFrame() {
        const runtime = this as unknown as SwiperRuntime
        const animation = runtime._animating
        if (!animation) {
          runtime._requestedAnimation = false
          return
        }
        runtime._transitioning = true
        const target = (this as unknown as { _calcNewPosition: (value: number) => number })
          ._calcNewPosition(animation.toPos)
        const duration = Number(this.data.duration) || 0
        const remaining = animation.endTime - Date.now()
        if (remaining <= 0 || duration <= 0) {
          ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(target)
          runtime._animating = null
          runtime._requestedAnimation = false
          const item = (this as unknown as { _getItems: () => SwiperItemBackend[] })
            ._getItems()[Number(this.data.current)]
          if (item && (animation.source !== 'touch' || runtime._swiping)) {
            this.triggerEvent('animationfinish', {
              current: Number(this.data.current),
              currentItemId: itemIdOf(item),
              source: animation.source,
            })
          }
          runtime._swiping = false
          runtime._transitioning = false
          runtime._transposed = false
          runtime._lastPosX = null
          runtime._lastPosY = null
          runtime._previous = Number(this.data.current)
          return
        }
        const elapsed = Date.now() - animation.startTime
        let position: number
        switch (this.data.easingFunction) {
          case 'easeInCubic':
            position = EASING.easeInCubic(elapsed, animation.fromPos, target - animation.fromPos, duration)
            break
          case 'easeOutCubic':
            position = EASING.easeOutCubic(elapsed, animation.fromPos, target - animation.fromPos, duration)
            break
          case 'easeInOutCubic':
            position = EASING.easeInOutCubic(elapsed, animation.fromPos, target - animation.fromPos, duration)
            break
          case 'linear':
            position = EASING.linear(elapsed, animation.fromPos, target - animation.fromPos, duration)
            break
          default: {
            const acceleration = (2 * (animation.fromPos - target)) / (duration * duration)
            position = target + (acceleration * remaining * remaining) / 2
          }
        }
        ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(position)
        const callback = runtime._animateFrameFunc
        if (typeof callback !== 'function') return
        if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(callback)
        else runtime._animationTimer = setTimeout(callback, 16) as unknown as ReturnType<typeof setTimeout>
      },
      _animateViewport(to: number, source: string, direction: number) {
        const runtime = this as unknown as SwiperRuntime
        ;(this as unknown as { _cancelViewportAnimation: () => void })._cancelViewportAnimation()
        const frame = this._div('slideFrame')
        if (!frame?.style) {
          ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(to)
          runtime._transitioning = false
          runtime._previous = to
          return
        }
        const duration = Number(this.data.duration) || 0
        let from = Number(runtime._viewportPosition) || 0
        const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
        if (runtime._circularEnabled) {
          if (direction < 0) {
            while (from < to) from += count
            while (from - count > to) from -= count
          } else if (direction > 0) {
            while (from > to) from -= count
            while (from + count < to) from += count
          } else {
            while (from + count < to) from += count
            while (from - count > to) from -= count
            if (from + count - to < to - from) from += count
            if (to - (from - count) < from - to) from -= count
          }
        }
        runtime._animating = {
          fromPos: from,
          toPos: to,
          startTime: Date.now(),
          endTime: Date.now() + duration,
          source,
        }
        runtime._transitioning = true
        if (!runtime._requestedAnimation) {
          const callback = runtime._animateFrameFunc
          if (typeof callback !== 'function') return
          runtime._requestedAnimation = true
          if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(callback)
          else runtime._animationTimer = setTimeout(callback, 0) as unknown as ReturnType<typeof setTimeout>
        }
      },
      _cancelViewportAnimation() {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._animationTimer) clearTimeout(runtime._animationTimer)
        runtime._animationTimer = null
        runtime._animating = null
      },
      _endViewportAnimation() {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._animating) return
        ;(this as unknown as { _updateViewport: (value: number) => void })
          ._updateViewport(runtime._animating.toPos)
        runtime._animating = null
      },
      _handleTrackStart() {
        const runtime = this as unknown as SwiperRuntime
        ;(this as unknown as { _cancelSchedule: () => void })._cancelSchedule()
        runtime._contentTrackViewport = Number(runtime._viewportPosition) || 0
        runtime._contentTrackSpeed = 0
        runtime._contentTrackT = Date.now()
      },
      _handleTrackMove(detail: NonNullable<TouchEventLike['detail']>) {
        const runtime = this as unknown as SwiperRuntime
        runtime._swiping = true
        runtime._transitioning = true
        const time = runtime._contentTrackT || Date.now()
        runtime._contentTrackT = Date.now()
        const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const max = (this as unknown as { _getMaxPos: () => number })._getMaxPos()
        const min = (this as unknown as { _getMinPos: () => number })._getMinPos()
        const resistance = (value: number) => 0.5 - 0.25 / (value + 0.5)
        const update = (amount: number, speed: number) => {
          let position = Number(runtime._contentTrackViewport) + amount
          runtime._contentTrackSpeed = 0.6 * Number(runtime._contentTrackSpeed) + 0.4 * speed
          if (!runtime._circularEnabled && (position < min || position > max)) {
            position = position < min ? -resistance(-position) : max + resistance(position - max)
            runtime._contentTrackSpeed = 0
          }
          ;(this as unknown as { _updateViewport: (value: number) => void })._updateViewport(position)
        }
        const elapsed = Date.now() - time || 1
        if (this.data.vertical) update(-Number(detail.dy ?? 0) / (frame.height || 1), -Number(detail.ddy ?? 0) / elapsed)
        else update(-Number(detail.dx ?? 0) / (frame.width || 1), -Number(detail.ddx ?? 0) / elapsed)
      },
      _handleTrackEnd(cancelled: boolean) {
        const runtime = this as unknown as SwiperRuntime
        if (this.data.autoplay) (this as unknown as { _scheduleAutoplay: () => void })._scheduleAutoplay()
        runtime._userTracking = false
        const speed = Number(runtime._contentTrackSpeed)
        const direction = speed === 0 ? 0 : speed / Math.abs(speed)
        let extra = 0
        if (!cancelled && Math.abs(speed) > 0.2) extra = 0.5 * direction
        const next = (this as unknown as { _normalizeCurrentValue: (value: number) => number })
          ._normalizeCurrentValue(Number(runtime._viewportPosition) + extra)
        if (cancelled) {
          ;(this as unknown as { _updateViewport: (value: number) => void })
            ._updateViewport(Number(runtime._contentTrackViewport))
        } else if (Number(this.data.current) !== next) {
          runtime._currentChangeSource = 'touch'
          this.setData({ current: next })
          ;(this as unknown as { _animateViewport: (to: number, source: string, direction: number) => void })
            ._animateViewport(next, 'touch', extra)
        } else {
          ;(this as unknown as { _animateViewport: (to: number, source: string, direction: number) => void })
            ._animateViewport(next, 'touch', extra)
        }
      },
      _handleContentTrack(event: TouchEventLike): boolean | void {
        const runtime = this as unknown as SwiperRuntime
        if (runtime._invalid) return
        const detail = event.detail ?? {}
        if (detail.state === 'start') {
          runtime._userTracking = true
          runtime._userDirectionChecked = false
          ;(this as unknown as { _handleTrackStart: () => void })._handleTrackStart()
          return
        }
        if (!runtime._userTracking) return
        if (detail.state === 'end') {
          ;(this as unknown as { _handleTrackEnd: (cancelled: boolean) => void })._handleTrackEnd(false)
          return
        }
        if (detail.state === 'cancel') {
          ;(this as unknown as { _handleTrackEnd: (cancelled: boolean) => void })._handleTrackEnd(true)
          return
        }
        if (!runtime._userDirectionChecked) {
          runtime._userDirectionChecked = true
          const dx = Math.abs(Number(detail.dx ?? 0))
          const dy = Math.abs(Number(detail.dy ?? 0))
          if ((this.data.vertical && dx >= dy) || (!this.data.vertical && dy >= dx)) {
            runtime._userTracking = false
            if (this.data.autoplay) (this as unknown as { _scheduleAutoplay: () => void })._scheduleAutoplay()
            return
          }
          if ((this.data.vertical && dx < dy) || (!this.data.vertical && dx > dy)) {
            ;(this as unknown as { _cancelViewportAnimation: () => void })._cancelViewportAnimation()
          }
        }
        ;(this as unknown as { _handleTrackMove: (detail: NonNullable<TouchEventLike['detail']>) => void })
          ._handleTrackMove(detail)
        return false
      },
      _getFrameSize(): { width: number; height: number } {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._frameSize) {
          const frame = this._div('slideFrame')
          runtime._frameSize = {
            width: Number(frame?.offsetWidth ?? frame?.getBoundingClientRect?.().width ?? 0),
            height: Number(frame?.offsetHeight ?? frame?.getBoundingClientRect?.().height ?? 0),
          }
        }
        return runtime._frameSize
      },
      _getViewportSize(): { width: number; height: number; top: number; left: number } {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._viewportSize) {
          const slides = this._div('slides')
          runtime._viewportSize = {
            width: Number(slides?.offsetWidth ?? 0),
            height: Number(slides?.offsetHeight ?? 0),
            top: Number(slides?.offsetTop ?? 0),
            left: Number(slides?.offsetLeft ?? 0),
          }
        }
        return runtime._viewportSize
      },
      _getWrapperSize(): { width: number; height: number } {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._wrapperSize) {
          const wrapper = this._div('slidesWrapper')
          runtime._wrapperSize = {
            width: Number(wrapper?.offsetWidth ?? 0),
            height: Number(wrapper?.offsetHeight ?? 0),
          }
        }
        return runtime._wrapperSize
      },
      _getFirstItemBoundingClientRect(): Rect {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._firstItemBoundingClientRect) {
          const item = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()[0]
          runtime._firstItemBoundingClientRect = item?.getBoundingClientRect?.() ?? { width: 0, height: 0, left: 0, top: 0 }
        }
        return runtime._firstItemBoundingClientRect
      },
      _getFrameBoundingClientRect(): Rect {
        const runtime = this as unknown as SwiperRuntime
        if (!runtime._frameBoundingClientRect) {
          const frame = this._div('slideFrame')
          runtime._frameBoundingClientRect = frame?.getBoundingClientRect?.() ?? { width: 0, height: 0, left: 0, top: 0 }
        }
        return runtime._frameBoundingClientRect as Rect
      },
      _updateHiddenItemDisplay(position: number) {
        if (!this.data.skipHiddenItemLayout) return
        const items = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems()
        const display = Number(this.data.displayMultipleItems) || 1
        for (const item of items) {
          if (!item.style) continue
          const itemPosition = Number(item._position ?? 0)
          const hidden = itemPosition <= position - 2 || itemPosition >= position + display + 1
          item.style.display = hidden ? 'none' : (item._originalDisplay ?? '')
        }
      },
      handleDotTap(event: { currentTarget?: { dataset?: { index?: string } } }) {
        const index = Number(event.currentTarget?.dataset?.index ?? 0)
        if (!Number.isFinite(index)) return
        this.setData({ current: index })
      },
      getScrollPosition() {
        const runtime = this as unknown as SwiperRuntime
        return runtime._scrollPosition ?? {
          scrollLeft: 0,
          scrollTop: 0,
          scrollWidth: 0,
          scrollHeight: 0,
        }
      },
      getScrollSize() {
        const frame = (this as unknown as { _getFrameSize: () => { width: number; height: number } })
          ._getFrameSize()
        const count = (this as unknown as { _getItems: () => SwiperItemBackend[] })._getItems().length
        return this.data.vertical
          ? { width: frame.width, height: frame.height * count }
          : { width: frame.width * count, height: frame.height }
      },
      saved(state: Record<string, unknown>) {
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['current'])
        ;(this as unknown as {
          saveState: (target: Record<string, unknown>, state: Record<string, unknown>) => void
        }).saveState(state, fields)
      },
      restored(state: Record<string, unknown>) {
        const restored = (this as unknown as {
          restoreState: (target: Record<string, unknown>) => Record<string, unknown> | undefined
        }).restoreState(state)
        if (!restored) return
        ;(this as unknown as {
          restoreCompVar: (state: Record<string, unknown>) => void
        }).restoreCompVar(restored)
      },
    },
  }).general()
}
