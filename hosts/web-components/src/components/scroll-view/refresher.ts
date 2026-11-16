import type { BuiltinContext, BuiltinDefinition } from '../../types'

type ScrollBackend = {
  scrollTop?: number
  clientHeight?: number
  getBoundingClientRect?: () => { height?: number }
  style?: {
    height?: string
    top?: string
    transform?: string
    webkitTransform?: string
    '-webkit-transform'?: string
    [key: string]: string | undefined
  }
  addEventListener?: (type: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
  removeEventListener?: (type: string, listener: (event: TouchEvent) => void) => void
}

type DotBackend = {
  style?: {
    transform?: string
    webkitTransform?: string
    '-webkit-transform'?: string
    [key: string]: string | undefined
  }
}

type RefresherState = 'pulling' | 'reached' | 'refreshing' | 'aborting' | 'restoring'

type TouchPoint = {
  identifier: number
  startX: number
  startY: number
  lastY: number
}

type FrameHandle = {
  raf: boolean
  id: number | ReturnType<typeof setTimeout>
}

type RefresherRuntime = {
  _parent?: ScrollBackend | null
  _main?: ScrollBackend | null
  _content?: ScrollBackend | null
  _container?: ScrollBackend | null
  _state?: RefresherState | null
  _offset?: number
  _viewportHeight?: number
  _locked?: boolean
  _frame?: FrameHandle | null
  _touch?: TouchPoint | null
  _touchCleanup?: Array<() => void>
  _selectionCleanup?: (() => void) | null
  _dotState?: 'idle' | 'pulling' | 'refreshing' | 'restored' | 'abort'
}

const scheduleFrame = (callback: FrameRequestCallback): FrameHandle => {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return { raf: true, id: globalThis.requestAnimationFrame(callback) }
  }
  return {
    raf: false,
    id: setTimeout(() => callback(Date.now()), 16),
  }
}

const cancelFrame = (frame: FrameHandle): void => {
  if (frame.raf && typeof globalThis.cancelAnimationFrame === 'function') {
    globalThis.cancelAnimationFrame(frame.id as number)
    return
  }
  clearTimeout(frame.id as ReturnType<typeof setTimeout>)
}

const screenHeight = (): number => {
  if (typeof window === 'undefined') return 0
  return Number(window.screen?.height) || Number(window.innerHeight) || 0
}

const touchValue = (touch: Touch, horizontal: boolean): number => {
  const screen = horizontal ? touch.screenX : touch.screenY
  const client = horizontal ? touch.clientX : touch.clientY
  return Number(screen ?? client ?? 0)
}

const changedTouch = (event: TouchEvent, identifier: number): Touch | undefined => (
  Array.from(event.changedTouches ?? []).find((touch) => touch.identifier === identifier)
  ?? Array.from(event.touches ?? []).find((touch) => touch.identifier === identifier)
)

/**
 * Browser port of WeChat 3.17.5's private `wx://pull-down-refresher`.
 *
 * The state machine, damping, animation duration and DOM ownership follow the
 * WeChat WebView implementation: the refresher container sits one screen above
 * the scroller, and both its container and the scroll content translate by the
 * same offset. The scroll-view owns only event forwarding; `triggered` remains
 * page-controlled.
 */
export function definePullDownRefresher(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:pull-down-refresher',
    template: ctx.internalTemplate('pull-down-refresher'),
    options: { virtualHost: true, multipleSlots: true },
    properties: {
      defaultStyle: { type: String, value: 'black', observer: 'defaultStyleChanged' },
      threshold: { type: Number, value: 55 },
      background: { type: String, value: '' },
      triggered: { type: Boolean, value: false },
      enablePassive: { type: Boolean, value: false, observer: 'enablePassiveChanged' },
      maxHeight: { type: Number, value: 53 },
    },
    data: {
      normalizedStyle: 'black',
      dot1Class: '',
      dot2Class: '',
      dot3Class: '',
    },
    observers: {
      triggered(value: boolean) {
        this.triggeredChanged(value)
      },
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as RefresherRuntime
        runtime._offset = 0
        runtime._state = null
        runtime._locked = false
        runtime._touch = null
        runtime._touchCleanup = []
        runtime._selectionCleanup = null
      },
      attached() {
        const runtime = this as unknown as RefresherRuntime
        const shadow = (this as unknown as {
          ownerShadowRoot?: {
            getHostNode?: () => unknown
            _$host?: unknown
            getElementById?: (id: string) => {
              getBackendElement?: () => ScrollBackend | null
            } | null
          } | null
        }).ownerShadowRoot
        const scrollViewHost = shadow?.getHostNode?.() ?? shadow?._$host
        const scrollView = (scrollViewHost as {
          asGeneralComponent?: () => {
            getBackendElement?: () => ScrollBackend | null
          } | null
        } | null)?.asGeneralComponent?.() ?? scrollViewHost
        runtime._parent = (
          scrollView as { getBackendElement?: () => ScrollBackend | null } | null
        )?.getBackendElement?.() ?? null
        runtime._main = shadow?.getElementById?.('main')?.getBackendElement?.() ?? null
        runtime._content = shadow?.getElementById?.('content')?.getBackendElement?.() ?? null
        runtime._container = (
          this.getShadowRoot?.()?.getElementById?.('container')
            ?.getBackendElement?.() ?? null
        ) as ScrollBackend | null

        const container = runtime._container
        if (container?.style) {
          const height = screenHeight()
          container.style.position = 'absolute'
          container.style.height = `${height}px`
          container.style.top = `${-height}px`
        }

        ;(this as unknown as { defaultStyleChanged: (value: string) => void })
          .defaultStyleChanged(String(this.data.defaultStyle ?? 'black'))
        this.bindTouchEvents()
        ;(this as unknown as { triggeredChanged: (value: boolean) => void })
          .triggeredChanged(Boolean(this.data.triggered))
        this.triggerEvent('ready', { ready: true })
      },
      detached() {
        const runtime = this as unknown as RefresherRuntime
        if (runtime._frame) cancelFrame(runtime._frame)
        runtime._frame = null
        this.unbindTouchEvents()
        runtime._state = null
        runtime._touch = null
      },
    },
    methods: {
      defaultStyleChanged(value: string): void {
        const normalized = value === 'white' || value === 'black' ? value : ''
        if (normalized !== this.data.normalizedStyle) this.setData({ normalizedStyle: normalized })
      },
      enablePassiveChanged(): void {
        if ((this as unknown as RefresherRuntime)._main) this.bindTouchEvents()
      },
      viewportHeight(): number {
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._viewportHeight) {
          runtime._viewportHeight = Number(
            runtime._parent?.getBoundingClientRect?.().height
            ?? runtime._main?.clientHeight
            ?? screenHeight(),
          ) || 1
        }
        return runtime._viewportHeight
      },
      effectiveThreshold(): number {
        if (this.data.normalizedStyle !== '') return 55
        const threshold = Number(this.data.threshold)
        return Number.isFinite(threshold) && threshold > 0 ? threshold : 55
      },
      bindTouchEvents(): void {
        const runtime = this as unknown as RefresherRuntime
        this.unbindTouchEvents()
        const main = runtime._main
        if (!main?.addEventListener) return
        const start = (event: TouchEvent) => this.handleStart(event)
        const move = (event: TouchEvent) => this.handleMove(event)
        const end = (event: TouchEvent) => this.handleEnd(event)
        const cancel = (event: TouchEvent) => this.handleCancel(event)
        const passive = Boolean(this.data.enablePassive)
        main.addEventListener('touchstart', start, { passive })
        main.addEventListener('touchmove', move, { passive })
        main.addEventListener('touchend', end, { passive })
        main.addEventListener('touchcancel', cancel, { passive })
        runtime._touchCleanup = [
          () => main.removeEventListener?.('touchstart', start),
          () => main.removeEventListener?.('touchmove', move),
          () => main.removeEventListener?.('touchend', end),
          () => main.removeEventListener?.('touchcancel', cancel),
        ]
        if (typeof document !== 'undefined' && document.getSelection) {
          const selectionChange = () => {
            runtime._locked = !document.getSelection()?.isCollapsed
          }
          document.addEventListener('selectionchange', selectionChange)
          runtime._selectionCleanup = () => document.removeEventListener('selectionchange', selectionChange)
        }
      },
      unbindTouchEvents(): void {
        const runtime = this as unknown as RefresherRuntime
        for (const cleanup of runtime._touchCleanup ?? []) cleanup()
        runtime._touchCleanup = []
        runtime._selectionCleanup?.()
        runtime._selectionCleanup = null
      },
      updateLock(disabled: boolean): void {
        ;(this as unknown as RefresherRuntime)._locked = Boolean(disabled)
      },
      dotBackend(id: string): DotBackend | null {
        return (this.getShadowRoot?.() as {
          getElementById?: (id: string) => { getBackendElement?: () => DotBackend | null } | null
        } | null)?.getElementById?.(id)?.getBackendElement?.() ?? null
      },
      applyDotTransform(id: string, offset: number): void {
        const dot = this.dotBackend(id)
        if (!dot?.style) return
        const transform = `translateX(${offset}px)`
        dot.style.transform = transform
        dot.style.webkitTransform = transform
        dot.style['-webkit-transform'] = transform
      },
      applyDotPull(dy: number): void {
        if (!this.data.normalizedStyle) return
        const threshold = this.effectiveThreshold()
        const progress = dy <= 17 ? 0 : (dy - 17) / 36
        const raw = dy <= threshold ? 13 * progress - 12 : 1
        const offset = Number.parseInt(String(raw * 100), 10) / 100
        this.applyDotTransform('dot1', -offset)
        this.applyDotTransform('dot3', offset)
      },
      setDotClasses(dot1: string, dot2: string, dot3: string): void {
        if (this.data.dot1Class === dot1 && this.data.dot2Class === dot2 && this.data.dot3Class === dot3) return
        this.setData({ dot1Class: dot1, dot2Class: dot2, dot3Class: dot3 })
      },
      setDots(state: 'idle' | 'pulling' | 'refreshing' | 'restored' | 'abort'): void {
        if (!this.data.normalizedStyle) return
        const runtime = this as unknown as RefresherRuntime
        if (runtime._dotState === state) return
        runtime._dotState = state
        if (state === 'refreshing') {
          this.setDotClasses(
            'tiny-refresher-dot-1-blink-anim',
            'tiny-refresher-dot-2-blink-anim',
            'tiny-refresher-dot-3-blink-anim',
          )
        } else if (state === 'restored') {
          this.setDotClasses('tiny-refresher-dot-1-fold', '', 'tiny-refresher-dot-3-fold')
        } else {
          this.setDotClasses('', '', '')
        }
      },
      applyTransform(offset: number): void {
        const runtime = this as unknown as RefresherRuntime
        runtime._offset = offset
        const transform = offset ? `translateY(${offset}px)` : ''
        for (const target of [runtime._container, runtime._content]) {
          if (!target?.style) continue
          target.style.transform = transform
          target.style.webkitTransform = transform
          target.style['-webkit-transform'] = transform
        }
      },
      animateTo(
        targetOffset: number,
        duration: number,
        onFrame: (offset: number) => void,
        onDone?: (offset: number) => void,
      ): void {
        const runtime = this as unknown as RefresherRuntime
        if (runtime._frame) cancelFrame(runtime._frame)
        const startOffset = Number(runtime._offset ?? 0)
        const direction = targetOffset < startOffset ? -1 : 1
        const distance = Math.abs(targetOffset - startOffset)
        if (duration <= 0 || distance === 0) {
          runtime._offset = targetOffset
          onFrame(targetOffset)
          onDone?.(targetOffset)
          runtime._frame = null
          return
        }
        let startedAt: number | null = null
        const tick = (time: number) => {
          if (startedAt === null) startedAt = time
          const progress = Math.min((time - startedAt) / duration, 1)
          const eased = Math.sqrt(Math.max(0, 1 - (progress - 1) ** 2))
          const offset = Math.floor(startOffset + direction * eased * distance)
          runtime._offset = offset
          onFrame(offset)
          if (Math.abs(offset - startOffset) >= distance) {
            runtime._offset = targetOffset
            onFrame(targetOffset)
            onDone?.(targetOffset)
            runtime._frame = null
            return
          }
          runtime._frame = scheduleFrame(tick)
        }
        runtime._frame = scheduleFrame(tick)
      },
      pullingChanged(dy: number): void {
        this.triggerEvent('pulling', { dy })
        this.setDots('pulling')
        this.applyDotPull(dy)
      },
      refreshChanged(dy: number): void {
        this.triggerEvent('refresh', { dy })
        this.setDots('refreshing')
      },
      restoreChanged(dy: number): void {
        this.triggerEvent('restore', { dy })
        this.setDots('restored')
      },
      abortChanged(dy: number): void {
        this.triggerEvent('abort', { dy })
        this.setDots('abort')
      },
      settleToRefresh(): void {
        this.animateTo(this.effectiveThreshold(), 300, (offset) => this.applyTransform(offset))
      },
      openRefresh(): void {
        const runtime = this as unknown as RefresherRuntime
        runtime._state = 'refreshing'
        this.refreshChanged(Number(runtime._offset ?? 0))
        this.settleToRefresh()
      },
      closeRefresh(): void {
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._state || runtime._state === 'restoring') return
        runtime._state = 'restoring'
        runtime._locked = true
        this.restoreChanged(Number(runtime._offset ?? 0))
        this.animateTo(0, 200, (offset) => this.applyTransform(offset), () => {
          runtime._state = null
          runtime._locked = false
          runtime._touch = null
        })
      },
      triggeredChanged(value: boolean): void {
        if (value) {
          const runtime = this as unknown as RefresherRuntime
          if (runtime._state) return
          runtime._state = 'pulling'
          this.animateTo(this.effectiveThreshold(), 400, (offset) => {
            this.applyTransform(offset)
            this.pullingChanged(offset)
          }, () => this.openRefresh())
          return
        }
        this.closeRefresh()
      },
      handleStart(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        if (runtime._locked) return
        const touch = event.changedTouches?.[0] ?? event.touches?.[0]
        if (!touch) return
        runtime._touch = {
          identifier: touch.identifier,
          startX: touchValue(touch, true),
          startY: touchValue(touch, false),
          lastY: touchValue(touch, false),
        }
      },
      handleMove(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        const tracked = runtime._touch
        const main = runtime._main
        if (!tracked || runtime._locked || !main) return
        const touch = changedTouch(event, tracked.identifier)
        if (!touch) return
        const y = touchValue(touch, false)
        const x = touchValue(touch, true)
        const deltaY = y - tracked.lastY
        const distY = Math.abs(y - tracked.startY)
        const distX = Math.abs(x - tracked.startX)
        tracked.lastY = y
        if (
          Number(main.scrollTop ?? 0) > 0
          || runtime._state === 'aborting'
          || runtime._state === 'restoring'
          || distY < distX
          || distY < 5
        ) return
        if (deltaY < 0 && !runtime._state) return
        if (!runtime._state) runtime._state = 'pulling'
        if (
          event.cancelable
          && (
            runtime._state === 'pulling'
            || runtime._state === 'refreshing'
            || runtime._state === 'reached'
          )
        ) event.preventDefault()
        if (runtime._state === 'refreshing' && deltaY < -10) {
          runtime._state = 'restoring'
          this.restoreChanged(Number(runtime._offset ?? 0))
          this.animateTo(0, 200, (offset) => this.applyTransform(offset), () => {
            runtime._state = null
            runtime._locked = false
            runtime._touch = null
          })
          return
        }
        const viewport = this.viewportHeight()
        const offset = Number(runtime._offset ?? 0)
        const damping = 0.52 * (1 - Math.min(offset / viewport, 1)) ** 2
        const nextOffset = offset + Math.ceil(deltaY * damping)
        const threshold = this.effectiveThreshold()
        if (
          runtime._state !== 'refreshing'
          && (
            (nextOffset >= threshold && runtime._state !== 'reached')
            || (nextOffset < threshold && runtime._state !== 'pulling')
          )
        ) {
          runtime._state = runtime._state === 'reached' ? 'pulling' : 'reached'
        }
        if (runtime._frame) {
          cancelFrame(runtime._frame)
          runtime._frame = null
        }
        if (runtime._state !== 'refreshing') this.pullingChanged(nextOffset)
        this.applyTransform(nextOffset)
      },
      handleEnd(event: TouchEvent): void {
        void event
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._state || runtime._locked) return
        if (runtime._state === 'refreshing') {
          this.settleToRefresh()
          return
        }
        if (runtime._state === 'pulling') {
          runtime._state = 'aborting'
          runtime._locked = true
          this.abortChanged(Number(runtime._offset ?? 0))
          this.animateTo(0, 300, (offset) => this.applyTransform(offset), () => {
            runtime._state = null
            runtime._locked = false
            runtime._touch = null
          })
          return
        }
        if (runtime._state === 'reached') this.openRefresh()
      },
      handleCancel(event: TouchEvent): void {
        this.handleEnd(event)
      },
    },
  }).general()
}
