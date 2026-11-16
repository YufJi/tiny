import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ScrollBackend = {
  scrollTop?: number
  clientHeight?: number
  getBoundingClientRect?: () => { height?: number }
  style?: {
    transition?: string
    transform?: string
    [key: string]: string | undefined
  }
  addEventListener?: (type: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
  removeEventListener?: (type: string, listener: (event: TouchEvent) => void) => void
}

type DotBackend = {
  style?: {
    transform?: string
    webkitTransform?: string
    [key: string]: string | undefined
  }
}

type RefresherRuntime = {
  _main?: ScrollBackend | null
  _content?: ScrollBackend | null
  _container?: ScrollBackend | null
  _active?: boolean
  _refreshing?: boolean
  _cancelling?: boolean
  _offset?: number
  _lastTouchY?: number
  _startOffset?: number
  _startScrollTop?: number
  _touchCleanup?: Array<() => void>
  _dotState?: 'idle' | 'pulling' | 'refreshing' | 'restored' | 'abort'
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

/**
 * Private equivalent of WeChat's `wx://pull-down-refresher`.
 *
 * It owns the pull gesture and transforms the parent scroll-view's `#main`,
 * emits pulling/refresh/restore/abort, renders the default three-dot indicator
 * or the slotted custom content, and treats `triggered` as the parent-controlled
 * refreshing state.
 */
export function definePullDownRefresher(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:pull-down-refresher',
    template: ctx.internalTemplate('pull-down-refresher'),
    options: { virtualHost: true, multipleSlots: true },
    properties: {
      defaultStyle: { type: String, value: 'black', observer: 'defaultStyleChanged' },
      threshold: { type: Number, value: 55 },
      background: { type: String, value: '#fff' },
      triggered: { type: Boolean, value: false, observer: 'triggeredChanged' },
      enablePassive: { type: Boolean, value: false },
      maxHeight: { type: Number, value: 53 },
    },
    data: {
      normalizedStyle: 'black',
      dot1Class: '',
      dot2Class: '',
      dot3Class: '',
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as RefresherRuntime
        runtime._offset = 0
        runtime._refreshing = false
        runtime._cancelling = false
        runtime._touchCleanup = []
      },
      attached() {
        const runtime = this as unknown as RefresherRuntime
        ;(this as unknown as { defaultStyleChanged: (value: string) => void })
          .defaultStyleChanged(String(this.data.defaultStyle ?? 'black'))
        const ownerShadow = (this as unknown as {
          ownerShadowRoot?: {
            getElementById?: (id: string) => { getBackendElement?: () => ScrollBackend | null } | null
          } | null
        }).ownerShadowRoot
        const parent = this.findScrollView()
        const parentShadow = (parent as unknown as {
          getShadowRoot?: () => {
            getElementById?: (id: string) => { getBackendElement?: () => ScrollBackend | null } | null
          } | null
        } | null)?.getShadowRoot?.()
        const shadow = ownerShadow ?? parentShadow
        runtime._container = (
          this.getShadowRoot?.()?.getElementById?.('container')
            ?.getBackendElement?.() ?? null
        ) as ScrollBackend | null
        runtime._main = shadow?.getElementById?.('main')?.getBackendElement?.() ?? null
        runtime._content = shadow?.getElementById?.('content')?.getBackendElement?.() ?? null
        if (runtime._content?.style) runtime._content.style.willChange = 'transform'
        const main = runtime._main
        if (!main?.addEventListener) return
        const start = (event: TouchEvent) => this.handleStart(event)
        const move = (event: TouchEvent) => this.handleMove(event)
        const end = (event: TouchEvent) => this.handleEnd(event)
        const cancel = (event: TouchEvent) => this.handleCancel(event)
        main.addEventListener('touchstart', start, { capture: true })
        main.addEventListener('touchmove', move, { capture: true, passive: false })
        main.addEventListener('touchend', end, { capture: true })
        main.addEventListener('touchcancel', cancel, { capture: true })
        runtime._touchCleanup = [
          () => main.removeEventListener?.('touchstart', start),
          () => main.removeEventListener?.('touchmove', move),
          () => main.removeEventListener?.('touchend', end),
          () => main.removeEventListener?.('touchcancel', cancel),
        ]
        ;(this as unknown as { triggeredChanged: (value: boolean) => void })
          .triggeredChanged(Boolean(this.data.triggered))
      },
      detached() {
        const runtime = this as unknown as RefresherRuntime
        for (const cleanup of runtime._touchCleanup ?? []) cleanup()
        runtime._touchCleanup = []
        this.applyOffset(0, false)
      },
    },
    methods: {
      findScrollView(): unknown {
        let node = (this as unknown as { parentNode?: unknown }).parentNode as {
          asGeneralComponent?: () => { is?: string } | null
          parentNode?: unknown
        } | null
        for (let depth = 0; node && depth < 20; depth += 1) {
          const component = node.asGeneralComponent?.()
          if (component?.is === builtinDefinitionName('scroll-view')) return component
          node = node.parentNode as typeof node
        }
        return null
      },
      defaultStyleChanged(value: string): void {
        const normalized = value === 'white' || value === 'black' ? value : ''
        if (normalized !== this.data.normalizedStyle) this.setData({ normalizedStyle: normalized })
      },
      triggeredChanged(value: boolean): void {
        const runtime = this as unknown as RefresherRuntime
        const threshold = Number(this.data.threshold ?? 55)
        const refreshHeight = this.refreshHeight()
        if (value) {
          runtime._refreshing = true
          this.setContainerHeight(refreshHeight, true)
          this.applyOffset(refreshHeight, true)
          this.applyDotPull(threshold + 1)
          this.setDots('refreshing')
          return
        }
        const wasRefreshing = Boolean(runtime._refreshing)
        const wasCancelling = Boolean(runtime._cancelling)
        runtime._refreshing = false
        const restoreOffset = Number(runtime._offset ?? 0)
        this.setContainerHeight(threshold, true)
        this.applyOffset(0, true)
        if (wasRefreshing && !wasCancelling) {
          this.setDots('restored')
          this.triggerEvent('restore', { dy: restoreOffset })
        } else {
          this.setDots(wasCancelling ? 'abort' : 'idle')
        }
        runtime._cancelling = false
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
        const threshold = Number(this.data.threshold ?? 55)
        const progress = dy <= 17 ? 0 : (dy - 17) / 36
        const raw = dy <= threshold ? 13 * progress - 12 : 1
        const offset = Number.parseInt(String(raw * 100), 10) / 100
        this.applyDotTransform('dot1', -offset)
        this.applyDotTransform('dot3', offset)
      },
      setDots(state: 'idle' | 'pulling' | 'refreshing' | 'restored' | 'abort'): void {
        if (this.data.normalizedStyle === '') return
        const runtime = this as unknown as RefresherRuntime
        if (runtime._dotState === state) return
        runtime._dotState = state
        const blink = 'tiny-refresher-dot-1-blink-anim'
        const blink2 = 'tiny-refresher-dot-2-blink-anim'
        const blink3 = 'tiny-refresher-dot-3-blink-anim'
        const fold1 = 'tiny-refresher-dot-1-fold'
        const fold3 = 'tiny-refresher-dot-3-fold'
        if (state === 'refreshing') {
          this.setData({ dot1Class: blink, dot2Class: blink2, dot3Class: blink3 })
        } else if (state === 'restored') {
          this.setData({ dot1Class: fold1, dot2Class: '', dot3Class: fold3 })
        } else {
          this.setData({ dot1Class: '', dot2Class: '', dot3Class: '' })
        }
      },
      applyOffset(offset: number, animate: boolean): void {
        const runtime = this as unknown as RefresherRuntime
        runtime._offset = offset
        const target = runtime._content ?? runtime._main
        if (!target?.style) return
        const transform = offset ? `translateY(${offset}px)` : ''
        target.style.transition = animate ? 'transform 0.3s ease' : 'none'
        target.style['-webkit-transition'] = animate ? 'transform 0.3s ease' : 'none'
        target.style.transform = transform
        target.style.webkitTransform = transform
        target.style['-webkit-transform'] = transform
      },
      refreshHeight(): number {
        const threshold = Number(this.data.threshold ?? 55)
        if (this.data.normalizedStyle === '') return threshold
        return Math.min(threshold, Number(this.data.maxHeight ?? 53))
      },
      setContainerHeight(height: number, animate: boolean): void {
        const style = (this as unknown as RefresherRuntime)._container?.style
        if (!style) return
        style.transition = animate ? 'height 0.3s ease' : 'none'
        style['-webkit-transition'] = animate ? 'height 0.3s ease' : 'none'
        style.height = `${height}px`
      },
      handleStart(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        if (event.touches.length !== 1) return
        runtime._active = true
        runtime._lastTouchY = event.touches[0]!.clientY
        runtime._startOffset = Number(runtime._offset ?? 0)
        runtime._startScrollTop = Number(runtime._main?.scrollTop ?? 0)
      },
      handleMove(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._active || event.touches.length !== 1) return
        const main = runtime._main
        if (!main) return
        const threshold = Number(this.data.threshold ?? 55)
        const currentY = event.touches[0]!.clientY
        const deltaY = currentY - Number(runtime._lastTouchY ?? currentY)
        runtime._lastTouchY = currentY
        const atTop = Number(main.scrollTop ?? 0) <= 0 || Number(runtime._offset ?? 0) > 0
        if (!atTop) return
        if (runtime._refreshing) {
          if (deltaY >= 0) return
          if (event.cancelable) event.preventDefault()
          const offset = clamp(Number(runtime._startOffset ?? threshold) + deltaY, 0, threshold)
          this.applyOffset(offset, false)
          this.triggerEvent('pulling', { dy: offset })
          return
        }
        if (deltaY > 0 || Number(runtime._offset ?? 0) > 0) {
          if (event.cancelable) event.preventDefault()
          const viewportHeight = Number(
            main.clientHeight
            ?? main.getBoundingClientRect?.().height
            ?? 0,
          ) || 1
          const offset = Number(runtime._offset ?? 0)
          const damping = 0.52 * (1 - Math.min(offset / viewportHeight, 1)) ** 2
          const nextOffset = Math.max(0, offset + Math.ceil(deltaY * damping))
          this.applyOffset(nextOffset, false)
          this.setDots('pulling')
          this.applyDotPull(nextOffset)
          this.triggerEvent('pulling', { dy: nextOffset })
        }
      },
      handleEnd(event: TouchEvent): void {
        void event
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._active) return
        runtime._active = false
        const threshold = Number(this.data.threshold ?? 55)
        const refreshHeight = this.refreshHeight()
        const offset = Number(runtime._offset ?? 0)
        if (runtime._refreshing) {
          if (offset < threshold / 2) {
            runtime._refreshing = false
            runtime._cancelling = true
            this.setContainerHeight(threshold, true)
            this.applyOffset(0, true)
            this.setDots('abort')
            this.triggerEvent('abort', { dy: offset })
          } else {
            this.setContainerHeight(refreshHeight, true)
            this.applyOffset(refreshHeight, true)
            this.applyDotPull(threshold + 1)
            this.setDots('refreshing')
          }
          return
        }
        if (offset >= threshold) {
          runtime._refreshing = true
          this.setContainerHeight(refreshHeight, true)
          this.applyOffset(refreshHeight, true)
          this.applyDotPull(threshold + 1)
          this.setDots('refreshing')
          this.triggerEvent('willrefresh', { dy: offset })
          this.triggerEvent('refresh', { dy: offset })
        } else if (offset > 0) {
          this.applyOffset(0, true)
          this.setDots('abort')
          this.triggerEvent('abort', { dy: offset })
        }
      },
      handleCancel(event: TouchEvent): void {
        void event
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._active) return
        runtime._active = false
        runtime._refreshing = false
        this.applyOffset(0, true)
        this.setDots('abort')
        this.triggerEvent('abort', { dy: Number(runtime._offset ?? 0) })
      },
    },
  }).general()
}
