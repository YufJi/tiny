import type * as glassEasel from 'glass-easel'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const DEFAULT_ITEM_HEIGHT = 34

type ColumnBackend = {
  style?: Record<string, string>
  offsetHeight?: number
  offsetWidth?: number
  children?: ArrayLike<{ style?: Record<string, string> }>
  getBoundingClientRect?: () => { top: number; height: number }
}

type ColumnRuntime = {
  _startY?: number
  _startTranslate?: number
  _moved?: boolean
  _lastY?: number
  _lastTime?: number
  _velocity?: number
  _updatingValue?: boolean
  _touchCleanup?: () => void
  _dragTranslate?: number
  getShadowRoot?: () => {
    getElementById?: (id: string) => { getBackendElement?: () => ColumnBackend | null } | null
  } | null
  getBackendElement?: () => ColumnBackend | null
  touchtrack?: (
    element: unknown,
    handler: (event: { detail?: { state?: string; x?: number; y?: number } }) => boolean | void,
    useCapture?: boolean,
  ) => () => void
}

function eventY(event: glassEasel.ShadowedEvent<unknown>): number | undefined {
  const detail = (event.detail ?? {}) as {
    y?: unknown
    touches?: Array<{ clientY?: unknown; y?: unknown }>
    changedTouches?: Array<{ clientY?: unknown; y?: unknown }>
  }
  const direct = (event as unknown as { touches?: Array<{ clientY?: unknown; y?: unknown }> }).touches
  const touch = detail.touches?.[0] ?? detail.changedTouches?.[0] ?? direct?.[0]
  const value = touch?.clientY ?? touch?.y ?? detail.y
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

/**
 * Mirrors `wx-picker-view-column`: mask/indicator/content inside the column,
 * the content translated by current * itemHeight, and the same
 * wxPickerColumnValueChangeStart/Changed/End protocol. The reference uses the
 * native scroller; the web host keeps the same transform/snap semantics with
 * touchtrack instead.
 */
export function definePickerViewColumn(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('picker-view-column'),
    template: ctx.template('picker-view-column'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.touchTrack],
    properties: {
      immediateChange: { type: Boolean, value: false },
    },
    data: {
      current: 0,
      translate: 0,
      itemHeight: DEFAULT_ITEM_HEIGHT,
      height: 0,
      maskClass: '',
      maskStyle: '',
      indicatorClass: '',
      indicatorStyle: '',
      dragging: true,
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as ColumnRuntime
        runtime._touchCleanup = runtime.touchtrack?.(
          this,
          (event) => (this as unknown as {
            _handleTrack: (event: { detail?: { state?: string; x?: number; y?: number } }) => boolean | void
          })._handleTrack(event),
          true,
        )
        bindHostListeners(this, {
          tap: (event) => {
            ;(this as unknown as {
              _handleTap: (event: glassEasel.ShadowedEvent<unknown>) => void
            })._handleTap(event as unknown as glassEasel.ShadowedEvent<unknown>)
          },
        })
        ;(this as unknown as { getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null })
          .getBackendElement?.()?.setAttribute?.('aria-label', '上下滚动进行选择')
      },
      detached() {
        unbindHostListeners(this)
        ;(this as unknown as { _touchCleanup?: () => void })._touchCleanup?.()
      },
    },
    options: ctx.hostOptions('picker-view-column'),
    methods: {
      content(): ColumnBackend | null {
        const runtime = this as unknown as ColumnRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('content')?.getBackendElement?.() ?? null
      },
      main(): ColumnBackend | null {
        const runtime = this as unknown as ColumnRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('main')?.getBackendElement?.() ?? null
      },
      indicator(): ColumnBackend | null {
        const runtime = this as unknown as ColumnRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('indicator')?.getBackendElement?.() ?? null
      },
      mask(): ColumnBackend | null {
        const runtime = this as unknown as ColumnRuntime
        return runtime.getShadowRoot?.()?.getElementById?.('mask')?.getBackendElement?.() ?? null
      },
      columnCount(): number {
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        const domCount = Number(content?.children?.length ?? 0)
        if (domCount > 0) return domCount
        const children = (this as unknown as { childNodes?: unknown[] }).childNodes
        return Array.isArray(children) ? children.length : 0
      },
      _getCurrent(): number {
        return Number(this.data.current ?? 0)
      },
      _setCurrent(index: number, animate = false): void {
        const count = this.columnCount()
        const max = Math.max(0, count - 1)
        const current = Math.max(0, Math.min(max, Math.floor(Number(index) || 0)))
        this.setData({
          ...(animate ? {} : { dragging: true }),
          current,
          translate: -current * Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT),
        })
        if (!animate) {
          ;(this as unknown as { scheduleTransition: () => void }).scheduleTransition()
        }
      },
      _setMaskStyle(className: string, style: string): void {
        this.setData({ maskClass: String(className ?? ''), maskStyle: String(style ?? '') })
      },
      _setIndicatorStyle(className: string, style: string): void {
        const text = String(style ?? '')
        const match = /height\s*:\s*([\d.]+)px/i.exec(text)
        const itemHeight = match ? Number(match[1]) : Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
        this.setData({
          indicatorClass: String(className ?? ''),
          indicatorStyle: text,
          itemHeight,
          translate: -Number(this.data.current ?? 0) * itemHeight,
        })
      },
      _getIndicatorHeight(): number {
        return Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
      },
      _setHeight(height: number, itemHeight: number): void {
        const pickerHeight = Math.max(0, Number(height) || 0)
        const item = Math.max(1, Number(itemHeight) || DEFAULT_ITEM_HEIGHT)
        this.setData({
          height: pickerHeight,
          itemHeight: item,
          translate: -Number(this.data.current ?? 0) * item,
        })
        const main = (this as unknown as { main: () => ColumnBackend | null }).main()
        if (main?.style) main.style.height = `${pickerHeight}px`
        const offset = Math.max(0, (pickerHeight - item) / 2)
        const mask = (this as unknown as { mask: () => ColumnBackend | null }).mask()
        if (mask?.style) mask.style.backgroundSize = `100% ${offset}px`
        const indicator = (this as unknown as { indicator: () => ColumnBackend | null }).indicator()
        if (indicator?.style) indicator.style.top = `${offset}px`
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        if (content?.style) content.style.padding = `${offset}px 0`
        const children = content?.children
        if (children) {
          for (let index = 0; index < children.length; index += 1) {
            const child = children[index]
            if (child?.style) {
              child.style.height = `${item}px`
              child.style.overflow = 'hidden'
            }
          }
        }
      },
      scheduleTransition(): void {
        const enable = () => {
          if (this.data.dragging) this.setData({ dragging: false })
        }
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => requestAnimationFrame(enable))
        } else {
          setTimeout(enable, 32)
        }
      },
      _init(): void {
        ;(this as unknown as { _updatingValue?: boolean })._updatingValue = false
        this.setData({ dragging: true })
        this._update()
        ;(this as unknown as { scheduleTransition: () => void }).scheduleTransition()
      },
      _update(): void {
        const item = Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
        const translate = -Number(this.data.current ?? 0) * item
        if (Number(this.data.translate) !== translate) this.setData({ translate })
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        if (content?.style) {
          content.style.transform = `translateY(${translate}px)`
          content.style['-webkit-transform'] = `translateY(${translate}px)`
        }
        const children = content?.children
        if (children) {
          for (let index = 0; index < children.length; index += 1) {
            const child = children[index]
            if (child?.style) {
              child.style.height = `${item}px`
              child.style.overflow = 'hidden'
            }
          }
        }
      },
      _emitChanged(index: number): void {
        this.triggerEvent('wxPickerColumnValueChanged', { idx: index }, { bubbles: true })
      },
      _emitStart(): void {
        this.triggerEvent('wxPickerColumnValueChangeStart', {}, { bubbles: true })
      },
      _emitEnd(): void {
        this.triggerEvent('wxPickerColumnValueChangeEnd', {}, { bubbles: true })
      },
      beginDrag(y: number): void {
        const instance = this as unknown as ColumnRuntime
        instance._startY = y
        instance._startTranslate = Number(this.data.translate ?? 0)
        instance._dragTranslate = Number(this.data.translate ?? 0)
        instance._moved = false
        instance._lastY = y
        instance._lastTime = Date.now()
        instance._velocity = 0
        instance._updatingValue = true
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        if (content?.style) {
          content.style.transition = 'none'
          content.style['-webkit-transition'] = 'none'
        }
        this.setData({ dragging: true })
        this._emitStart()
      },
      moveDrag(y: number): void {
        const instance = this as unknown as ColumnRuntime
        if (instance._startY === undefined) return
        const item = Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
        const count = this.columnCount()
        const min = -(Math.max(0, count - 1)) * item
        const delta = y - instance._startY
        if (Math.abs(delta) > 4) instance._moved = true
        const raw = Number(instance._startTranslate ?? 0) + delta
        const translate = raw > 0
          ? raw * 0.3
          : raw < min
            ? min + (raw - min) * 0.3
            : raw
        const now = Date.now()
        const elapsed = Math.max(1, now - Number(instance._lastTime ?? now))
        const velocity = (y - Number(instance._lastY ?? y)) / elapsed
        instance._velocity = Number(instance._velocity ?? 0) * 0.7 + velocity * 0.3
        instance._lastY = y
        instance._lastTime = now
        instance._dragTranslate = translate
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        if (content?.style) {
          content.style.transform = `translateY(${translate}px)`
          content.style['-webkit-transform'] = `translateY(${translate}px)`
        }
      },
      endDrag(): void {
        const instance = this as unknown as ColumnRuntime
        const previous = Number(this.data.current ?? 0)
        if (!instance._moved) {
          this.setData({ dragging: false })
          instance._updatingValue = false
          this._emitEnd()
          return
        }
        const item = Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
        const projected = Number(instance._dragTranslate ?? this.data.translate ?? 0)
          + Number(instance._velocity ?? 0) * 180
        const count = this.columnCount()
        const next = Math.max(0, Math.min(Math.max(0, count - 1), Math.round(-projected / item)))
        const target = -next * item
        const content = (this as unknown as { content: () => ColumnBackend | null }).content()
        if (content?.style) {
          content.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          content.style['-webkit-transition'] = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          content.style.transform = `translateY(${target}px)`
          content.style['-webkit-transform'] = `translateY(${target}px)`
          setTimeout(() => {
            if (content.style && !this.data.dragging) {
              content.style.transition = ''
              content.style['-webkit-transition'] = ''
            }
          }, 350)
        }
        this.setData({ current: next, translate: target, dragging: false })
        if (next !== previous || instance._moved) this._emitChanged(next)
        instance._updatingValue = false
        this._emitEnd()
      },
      moveUint(direction: number): void {
        const count = this.columnCount()
        const next = Math.max(0, Math.min(Math.max(0, count - 1), Number(this.data.current ?? 0) + (direction < 0 ? -1 : 1)))
        if (next === Number(this.data.current ?? 0)) return
        this._emitStart()
        this._setCurrent(next, true)
        this._update()
        this._emitChanged(next)
        this._emitEnd()
      },
      moveUnit(direction: number): void {
        ;(this as unknown as { moveUint: (direction: number) => void }).moveUint(direction)
      },
      _handleTrack(event: { detail?: { state?: string; x?: number; y?: number } }): boolean | void {
        const state = event.detail?.state
        const y = Number(event.detail?.y)
        if (!Number.isFinite(y)) return
        if (state === 'start') {
          this.beginDrag(y)
          return false
        }
        if (state === 'move') {
          this.moveDrag(y)
          return false
        }
        if (state === 'end' || state === 'cancel') this.endDrag()
      },
      _handleTap(event: glassEasel.ShadowedEvent<unknown>): void {
        const instance = this as unknown as ColumnRuntime
        if (instance._moved) return
        const element = (this as unknown as { getBackendElement?: () => ColumnBackend | null }).getBackendElement?.()
        const rect = element?.getBoundingClientRect?.()
        const y = eventY(event)
        if (!rect || y === undefined) return
        const item = Number(this.data.itemHeight ?? DEFAULT_ITEM_HEIGHT)
        const offset = y - (rect.top + rect.height / 2)
        const steps = Math.round(offset / item)
        if (steps === 0) return
        const next = Number(this.data.current ?? 0) + steps
        const wasUpdating = Boolean(instance._updatingValue)
        if (!wasUpdating) this._emitStart()
        this._setCurrent(next, true)
        this._update()
        this._emitChanged(Number(this.data.current ?? 0))
        if (wasUpdating) {
          this._emitEnd()
          instance._updatingValue = false
        }
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>): void {
        const y = eventY(event)
        if (y !== undefined) this.beginDrag(y)
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>): void {
        const y = eventY(event)
        if (y !== undefined) this.moveDrag(y)
      },
      handleTouchEnd(event: glassEasel.ShadowedEvent<unknown>): void {
        void event
        this.endDrag()
      },
    },
  }).general()
}
