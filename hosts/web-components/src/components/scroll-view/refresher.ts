import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ScrollBackend = {
  scrollTop?: number
  style?: {
    transition?: string
    transform?: string
    [key: string]: string | undefined
  }
  addEventListener?: (type: string, listener: (event: TouchEvent) => void, options?: AddEventListenerOptions) => void
  removeEventListener?: (type: string, listener: (event: TouchEvent) => void) => void
}

type RefresherRuntime = {
  _main?: ScrollBackend | null
  _active?: boolean
  _refreshing?: boolean
  _cancelling?: boolean
  _offset?: number
  _startY?: number
  _startOffset?: number
  _startScrollTop?: number
  _touchCleanup?: Array<() => void>
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
        runtime._main = shadow?.getElementById?.('main')?.getBackendElement?.() ?? null
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
        if (value) {
          runtime._refreshing = true
          this.applyOffset(threshold, true)
          this.setDots('refreshing')
          return
        }
        const wasRefreshing = Boolean(runtime._refreshing)
        runtime._refreshing = false
        this.applyOffset(0, true)
        this.setDots('restored')
        if (wasRefreshing && !runtime._cancelling) {
          this.triggerEvent('restore', { dy: 0 })
        }
        runtime._cancelling = false
      },
      setDots(state: 'pulling' | 'reached' | 'refreshing' | 'restored'): void {
        if (this.data.normalizedStyle === '') return
        const blink = 'tiny-refresher-dot-1-blink-anim'
        const blink2 = 'tiny-refresher-dot-2-blink-anim'
        const blink3 = 'tiny-refresher-dot-3-blink-anim'
        const fold1 = 'tiny-refresher-dot-1-fold'
        const fold3 = 'tiny-refresher-dot-3-fold'
        if (state === 'refreshing') {
          this.setData({ dot1Class: blink, dot2Class: blink2, dot3Class: blink3 })
        } else if (state === 'reached') {
          this.setData({ dot1Class: fold1, dot2Class: '', dot3Class: fold3 })
        } else if (state === 'restored') {
          this.setData({ dot1Class: fold1, dot2Class: '', dot3Class: fold3 })
        } else {
          this.setData({ dot1Class: '', dot2Class: '', dot3Class: '' })
        }
      },
      applyOffset(offset: number, animate: boolean): void {
        const runtime = this as unknown as RefresherRuntime
        runtime._offset = offset
        const main = runtime._main
        if (!main?.style) return
        main.style.transition = animate ? 'transform 0.3s ease' : 'none'
        main.style['-webkit-transition'] = animate ? 'transform 0.3s ease' : 'none'
        main.style.transform = offset ? `translateY(${offset}px)` : ''
        main.style['-webkit-transform'] = offset ? `translateY(${offset}px)` : ''
      },
      handleStart(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        if (event.touches.length !== 1) return
        runtime._active = true
        runtime._startY = event.touches[0]!.clientY
        runtime._startOffset = Number(runtime._offset ?? 0)
        runtime._startScrollTop = Number(runtime._main?.scrollTop ?? 0)
      },
      handleMove(event: TouchEvent): void {
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._active || event.touches.length !== 1) return
        const main = runtime._main
        if (!main) return
        const threshold = Number(this.data.threshold ?? 55)
        const startY = Number(runtime._startY ?? 0)
        const deltaY = event.touches[0]!.clientY - startY
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
          const offset = clamp(deltaY * 0.5, 0, threshold * 1.2)
          this.applyOffset(offset, false)
          this.setDots(offset >= threshold ? 'reached' : 'pulling')
          this.triggerEvent('pulling', { dy: offset })
        }
      },
      handleEnd(event: TouchEvent): void {
        void event
        const runtime = this as unknown as RefresherRuntime
        if (!runtime._active) return
        runtime._active = false
        const threshold = Number(this.data.threshold ?? 55)
        const offset = Number(runtime._offset ?? 0)
        if (runtime._refreshing) {
          if (offset < threshold / 2) {
            runtime._refreshing = false
            runtime._cancelling = true
            this.applyOffset(0, true)
            this.setDots('restored')
            this.triggerEvent('abort', { dy: offset })
          } else {
            this.applyOffset(threshold, true)
            this.setDots('refreshing')
          }
          return
        }
        if (offset >= threshold) {
          runtime._refreshing = true
          this.applyOffset(threshold, true)
          this.setDots('refreshing')
          this.triggerEvent('refresh', { dy: offset })
        } else if (offset > 0) {
          this.applyOffset(0, true)
          this.setDots('restored')
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
        this.setDots('restored')
        this.triggerEvent('abort', { dy: Number(runtime._offset ?? 0) })
      },
    },
  }).general()
}
