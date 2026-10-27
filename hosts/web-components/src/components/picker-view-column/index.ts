import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type ColumnElement = {
  getBoundingClientRect?: () => { top: number; height: number }
  addEventListener?: (type: string, listener: (event: Record<string, unknown>) => void) => void
  removeEventListener?: (type: string, listener: (event: Record<string, unknown>) => void) => void
  setPointerCapture?: (pointerId: number) => void
  releasePointerCapture?: (pointerId: number) => void
}

function eventY(event: glassEasel.ShadowedEvent<unknown>): number | undefined {
  const detail = (event.detail ?? {}) as {
    y?: unknown
    touches?: Array<{ clientY?: unknown; y?: unknown }>
    changedTouches?: Array<{ clientY?: unknown; y?: unknown }>
  }
  const touch = detail.touches?.[0] ?? detail.changedTouches?.[0]
    ?? (event as unknown as { touches?: Array<{ clientY?: unknown; y?: unknown }> }).touches?.[0]
  const value = touch?.clientY ?? touch?.y ?? detail.y
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

const DEFAULT_ITEM_HEIGHT = 34

export function definePickerViewColumn(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('picker-view-column'),
    template: ctx.template('picker-view-column'),
    behaviors: [ctx.behaviors.base],
    properties: {
      ariaLabel: { type: String, value: '' },
    },
    data: {
      column: 0,
      current: 0,
      translate: 0,
      itemHeight: DEFAULT_ITEM_HEIGHT,
      halfItemHeight: DEFAULT_ITEM_HEIGHT / 2,
      indicatorStyle: '',
      indicatorClass: '',
      maskStyle: '',
      maskClass: '',
      dragging: false,
    },
    lifetimes: {
      attached() {
        this.syncColumnIndex()
        this.bindPointerDrag()
        this.triggerEvent('wxPickerColumnChanged', {}, { bubbles: true, composed: true })
      },
      detached() {
        ;(this as unknown as { _pointerCleanup?: () => void })._pointerCleanup?.()
        this.triggerEvent('wxPickerColumnChanged', {}, { bubbles: true, composed: true })
      },
      ready() {
        this.syncColumnIndex()
        this.refresh()
      },
    },
    options: ctx.hostOptions('picker-view-column'),
    methods: {
      columnCount(): number {
        const content = (this.getShadowRoot?.() as { getElementById?: (id: string) => unknown } | null)
          ?.getElementById?.('content') as { getBackendElement?: () => { children?: ArrayLike<unknown> } | null } | null
        const domCount = content?.getBackendElement?.()?.children?.length ?? 0
        if (domCount > 0) return domCount
        const children = (this as unknown as { childNodes?: unknown[] }).childNodes
        return Array.isArray(children) ? children.length : 0
      },
      syncColumnIndex() {
        // The column index is its position among picker-view columns.
        const nodes = (this.parentNode as unknown as { childNodes?: unknown[] } | null)?.childNodes ?? []
        let index = 0
        for (const node of nodes) {
          const component = (node as { asGeneralComponent?: () => unknown }).asGeneralComponent?.() as
            | { is?: string; data?: { column?: number } }
            | null
          if (component?.is !== builtinDefinitionName('picker-view-column')) continue
          if (component === (this as unknown)) break
          index += 1
        }
        if (index !== this.data.column) this.setData({ column: index })
      },
      setColumnIndex(index: number) {
        const column = Math.max(0, Math.floor(Number(index) || 0))
        if (column !== this.data.column) this.setData({ column })
      },
      applyOptions(options: {
        indicatorStyle?: string
        indicatorClass?: string
        maskStyle?: string
        maskClass?: string
      }) {
        const indicatorStyle = String(options.indicatorStyle ?? '')
        const match = /height\s*:\s*([\d.]+)px/i.exec(indicatorStyle)
        const itemHeight = match ? Number(match[1]) : DEFAULT_ITEM_HEIGHT
        this.setData({
          indicatorStyle,
          indicatorClass: String(options.indicatorClass ?? ''),
          maskStyle: String(options.maskStyle ?? ''),
          maskClass: String(options.maskClass ?? ''),
          itemHeight,
          halfItemHeight: itemHeight / 2,
          translate: -Number(this.data.current || 0) * itemHeight,
        })
      },
      getCurrent(): number {
        return Number(this.data.current || 0)
      },
      requestedIndex(): number {
        return Number((this as unknown as { _requested?: number })._requested ?? this.data.current ?? 0)
      },
      applyCurrent(): number {
        const count = this.columnCount()
        const max = Math.max(0, count - 1)
        const current = Math.max(0, Math.min(max, Math.floor(this.requestedIndex())))
        this.setData({
          current,
          translate: -current * Number(this.data.itemHeight || DEFAULT_ITEM_HEIGHT),
        })
        return current
      },
      setCurrent(index: number): number {
        ;(this as unknown as { _requested?: number })._requested = Math.floor(Number(index) || 0)
        return this.applyCurrent()
      },
      refresh(attempt = 0): void {
        if (this.columnCount() > 1 || attempt >= 10) {
          this.applyCurrent()
          return
        }
        setTimeout(() => this.refresh(attempt + 1), 16)
      },
      emitChange(column: number, value: number) {
        this.triggerEvent('columnchange', { column, value }, { bubbles: true, composed: true })
        this.triggerEvent('wxPickerColumnValueChanged', { idx: value }, { bubbles: true, composed: true })
      },
      beginDrag(y: number) {
        const instance = this as unknown as {
          _startY?: number
          _startTranslate?: number
          _moved?: boolean
          _lastY?: number
          _lastTime?: number
          _velocity?: number
        }
        instance._startY = y
        instance._startTranslate = Number(this.data.translate || 0)
        instance._moved = false
        instance._lastY = y
        instance._lastTime = Date.now()
        instance._velocity = 0
        this.setData({ dragging: true })
        this.triggerEvent('columnstart', {}, { bubbles: true, composed: true })
        this.triggerEvent('wxPickerColumnValueChangeStart', {}, { bubbles: true, composed: true })
      },
      moveDrag(y: number) {
        const instance = this as unknown as {
          _startY?: number
          _startTranslate?: number
          _moved?: boolean
          _lastY?: number
          _lastTime?: number
          _velocity?: number
        }
        if (instance._startY === undefined) return
        const itemHeight = Number(this.data.itemHeight || DEFAULT_ITEM_HEIGHT)
        const count = this.columnCount()
        const min = -(Math.max(0, count - 1)) * itemHeight
        const delta = y - instance._startY
        if (Math.abs(delta) > 4) instance._moved = true
        const raw = (instance._startTranslate ?? 0) + delta
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
        this.setData({ translate })
      },
      endDrag() {
        const instance = this as unknown as { _moved?: boolean; _velocity?: number }
        if (Number(this.data.translate || 0) === 0 && !instance._moved) {
          this.setData({ dragging: false })
          return
        }
        const itemHeight = Number(this.data.itemHeight || DEFAULT_ITEM_HEIGHT)
        const projected = Number(this.data.translate || 0) + Number(instance._velocity ?? 0) * 120
        const index = this.setCurrent(Math.round(-projected / itemHeight))
        this.setData({ dragging: false })
        if (instance._moved) this.emitChange(Number(this.data.column), index)
        this.triggerEvent('columnend', { value: index }, { bubbles: true, composed: true })
        this.triggerEvent('wxPickerColumnValueChangeEnd', { idx: index }, { bubbles: true, composed: true })
      },
      bindPointerDrag() {
        const element = (this as unknown as { getBackendElement?: () => ColumnElement | null })
          .getBackendElement?.()
        if (!element?.addEventListener) return
        const onDown = (event: Record<string, unknown>) => {
          if (event.pointerType !== 'mouse' || Number(event.button ?? 0) !== 0) return
          const y = Number(event.clientY)
          if (!Number.isFinite(y)) return
          element.setPointerCapture?.(Number(event.pointerId))
          ;(event.preventDefault as (() => void) | undefined)?.()
          this.beginDrag(y)
        }
        const onMove = (event: Record<string, unknown>) => {
          if (!this.data.dragging) return
          const y = Number(event.clientY)
          if (Number.isFinite(y)) this.moveDrag(y)
        }
        const onUp = (event: Record<string, unknown>) => {
          if (!this.data.dragging) return
          element.releasePointerCapture?.(Number(event.pointerId))
          this.endDrag()
        }
        element.addEventListener('pointerdown', onDown)
        element.addEventListener('pointermove', onMove)
        element.addEventListener('pointerup', onUp)
        element.addEventListener('pointercancel', onUp)
        ;(this as unknown as { _pointerCleanup?: () => void })._pointerCleanup = () => {
          element.removeEventListener?.('pointerdown', onDown)
          element.removeEventListener?.('pointermove', onMove)
          element.removeEventListener?.('pointerup', onUp)
          element.removeEventListener?.('pointercancel', onUp)
        }
      },
      handleTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
        const y = eventY(event)
        if (y !== undefined) this.beginDrag(y)
      },
      handleTouchMove(event: glassEasel.ShadowedEvent<unknown>) {
        const y = eventY(event)
        if (y !== undefined) this.moveDrag(y)
      },
      handleTouchEnd(event: glassEasel.ShadowedEvent<unknown>) {
        void event
        this.endDrag()
      },
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        const instance = this as unknown as { _moved?: boolean }
        if (instance._moved) return
        const element = (this as unknown as { getBackendElement?: () => ColumnElement | null }).getBackendElement?.()
        const rect = element?.getBoundingClientRect?.()
        const y = eventY(event)
        if (!rect || y === undefined) return
        const itemHeight = Number(this.data.itemHeight || DEFAULT_ITEM_HEIGHT)
        const offset = y - (rect.top + rect.height / 2)
        const steps = Math.round(offset / itemHeight)
        if (steps === 0) return
        const index = this.setCurrent(Number(this.data.current || 0) + steps)
        this.emitChange(Number(this.data.column), index)
      },
    },
  }).general()
}
