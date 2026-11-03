import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

const ACTIVE_DEFAULT = '#1AAD19'
const BACKGROUND_DEFAULT = '#E9E9E9'
const MIN_BLOCK_SIZE = 12
const MAX_BLOCK_SIZE = 28

type SliderEvent = {
  detail?: { state?: string; x?: number }
}

type SliderRuntime = {
  _startValue?: number
  _trackCleanup?: () => void
  getBackendElement?: () => {
    setAttribute?: (name: string, value: string) => void
  } | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => {
      getBackendElement?: () => {
        offsetWidth?: number
        getBoundingClientRect?: () => { left: number }
      } | null
    } | null
  } | null
  setAriaRoleDefault?: (role: string) => void
  touchtrack?: (
    element: unknown,
    handler: (event: SliderEvent) => boolean | void,
    useCapture?: boolean,
  ) => () => void
}

function decimalPlaces(value: number): number {
  if (!Number.isFinite(value) || value % 1 === 0) return 0
  const text = value.toString()
  return /\./.test(text) ? text.split('.')[1]!.length : Number(text.split('e-')[1] ?? 0)
}

/**
 * Mirrors `wx-slider`: a DOM track/thumb instead of a native range input.
 * Drags come through `tiny-touchtrack`, taps through the wrapper tap listener,
 * and both funnel through `_filterValue` before emitting changing/change.
 */
export function defineSlider(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('slider'),
    template: ctx.template('slider'),
    behaviors: [
      ctx.behaviors.base,
      ctx.behaviors.dataComponent,
      ctx.behaviors.disabled,
      ctx.behaviors.touchTrack,
      ctx.behaviors.reload,
    ],
    properties: {
      min: { type: Number, value: 0, observer: '_revalicateRange' },
      max: { type: Number, value: 100, observer: '_revalicateRange' },
      step: { type: Number, value: 1, observer: '_revalicateRange' },
      value: { type: Number, value: 0, observer: '_revalicateRange' },
      showValue: { type: Boolean, value: false },
      activeColor: { type: String, value: ACTIVE_DEFAULT, observer: 'syncColors' },
      backgroundColor: { type: String, value: BACKGROUND_DEFAULT, observer: 'syncColors' },
      blockSize: { type: Number, value: 28, observer: 'syncBlock' },
      blockColor: { type: String, value: '#FFFFFF' },
      selectedColor: { type: String, value: ACTIVE_DEFAULT, observer: 'syncColors' },
      color: { type: String, value: '', observer: 'syncColors' },
    },
    data: {
      filteredValue: 0,
      valuePercent: '0%',
      thumbSize: MAX_BLOCK_SIZE,
      thumbOffset: -MAX_BLOCK_SIZE / 2,
      backgroundValue: BACKGROUND_DEFAULT,
      activeValue: ACTIVE_DEFAULT,
      valueTextWidth: '3ch',
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as SliderRuntime
        ;(this as unknown as { _revalicateRange: () => void })._revalicateRange()
        ;(this as unknown as { syncBlock: () => void }).syncBlock()
        ;(this as unknown as { syncColors: () => void }).syncColors()
        runtime._trackCleanup = runtime.touchtrack?.(
          this,
          (event) => (this as unknown as {
            _onTrack: (event: SliderEvent) => boolean | void
          })._onTrack(event),
        )
        bindHostListeners(this, {
          tap: (event) => (this as unknown as {
            _onTap: (event: SliderEvent) => void
          })._onTap(event as unknown as SliderEvent),
        })
      },
      attached() {
        ;(this as unknown as { _setAria: () => void })._setAria()
      },
      detached() {
        ;(this as unknown as Partial<SliderRuntime>)._trackCleanup?.()
        unbindHostListeners(this)
      },
    },
    options: ctx.hostOptions('slider'),
    methods: {
      _setAria() {
        const runtime = this as unknown as SliderRuntime
        runtime.setAriaRoleDefault?.('slider')
        const element = runtime.getBackendElement?.()
        element?.setAttribute?.('aria-valuemin', String(this.data.min))
        element?.setAttribute?.('aria-valuemax', String(this.data.max))
        element?.setAttribute?.('aria-valuenow', String(this.data.filteredValue ?? this.data.value))
      },
      _filterValue(value: number): number {
        const min = Number(this.data.min)
        const max = Number(this.data.max)
        const step = Number(this.data.step)
        let next = value < min ? min : value > max ? max : value
        if (Number.isFinite(step) && step > 0) {
          next = Math.round((next - min) / step) * step + min
        }
        return next
      },
      _revalicateRange() {
        const min = Number(this.data.min)
        const max = Number(this.data.max)
        const step = Number(this.data.step)
        let filtered = (this as unknown as {
          _filterValue: (value: number) => number
        })._filterValue(Number(this.data.value) || 0)
        const maxDecimals = Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step))
        if (maxDecimals > 0) filtered = Number(filtered.toFixed(maxDecimals))
        this.setData({
          filteredValue: filtered,
          valuePercent: (this as unknown as {
            _getValueWidth: (value: number, min: number, max: number) => string
          })._getValueWidth(filtered, min, max),
          valueTextWidth: (this as unknown as {
            _getValueTextWidth: (min: number, max: number, step: number) => string
          })._getValueTextWidth(min, max, step),
        })
        ;(this as unknown as { _setAria: () => void })._setAria()
      },
      _getValueWidth(value: number, min: number, max: number): string {
        if (!(max > min)) return '0%'
        return `${(100 * (value - min)) / (max - min)}%`
      },
      _getValueTextWidth(min: number, max: number, step: number): string {
        const digits = Math.round(max).toString().length
        const decimals = Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step))
        return `${decimals > 0 ? digits + decimals : digits}ch`
      },
      _getBlockSize(value: number): number {
        const size = Number(value)
        if (!Number.isFinite(size)) return MAX_BLOCK_SIZE
        return size < MIN_BLOCK_SIZE ? MIN_BLOCK_SIZE : size > MAX_BLOCK_SIZE ? MAX_BLOCK_SIZE : size
      },
      _getBackgroundColor(color: string, backgroundColor: string): string {
        if (backgroundColor !== BACKGROUND_DEFAULT) return backgroundColor
        if (color !== BACKGROUND_DEFAULT && color !== '') return color
        return BACKGROUND_DEFAULT
      },
      _getActiveColor(selectedColor: string, activeColor: string): string {
        if (activeColor !== ACTIVE_DEFAULT) return activeColor
        if (selectedColor !== ACTIVE_DEFAULT) return selectedColor
        return ACTIVE_DEFAULT
      },
      syncBlock() {
        const size = (this as unknown as {
          _getBlockSize: (value: number) => number
        })._getBlockSize(Number(this.data.blockSize))
        this.setData({ thumbSize: size, thumbOffset: -size / 2 })
      },
      syncColors() {
        this.setData({
          backgroundValue: (this as unknown as {
            _getBackgroundColor: (color: string, backgroundColor: string) => string
          })._getBackgroundColor(String(this.data.color ?? ''), String(this.data.backgroundColor ?? '')),
          activeValue: (this as unknown as {
            _getActiveColor: (selectedColor: string, activeColor: string) => string
          })._getActiveColor(String(this.data.selectedColor ?? ''), String(this.data.activeColor ?? '')),
        })
      },
      _onUserChangedValue(event: SliderEvent): boolean {
        const runtime = this as unknown as SliderRuntime
        const shadow = runtime.getShadowRoot?.()
        const backend = shadow?.getElementById?.('step')?.getBackendElement?.()
        if (!backend) return false
        const width = Number(backend.offsetWidth ?? 0)
        const left = Number(backend.getBoundingClientRect?.().left ?? 0)
        const x = Number(event.detail?.x)
        if (!(width > 0) || !Number.isFinite(x)) return false
        const min = Number(this.data.min)
        const max = Number(this.data.max)
        let next = ((x - left) * (max - min)) / width + min
        next = (this as unknown as { _filterValue: (value: number) => number })._filterValue(next)
        if (runtime._startValue === undefined) {
          if (next === Number(this.data.value)) return false
        } else if (next === runtime._startValue) {
          return false
        }
        this.setData({ value: next })
        return true
      },
      _onTrack(event: SliderEvent): boolean | void {
        if ((this.data as Record<string, unknown>).disabled) return
        const runtime = this as unknown as SliderRuntime
        const state = event.detail?.state
        if (runtime._startValue === undefined && state !== 'start') runtime._startValue = Number(this.data.value)
        if (state === 'move') {
          ;(this as unknown as {
            _onUserChangedValue: (event: SliderEvent) => boolean
          })._onUserChangedValue(event)
          this.triggerEvent('changing', { value: this.data.value })
          return false
        }
        if (state === 'end') {
          ;(this as unknown as {
            _triggerChangeEvent: (event: SliderEvent) => void
          })._triggerChangeEvent(event)
          runtime._startValue = undefined
          return
        }
        if (state === 'cancel' || state === 'start') {
          if (state === 'cancel') runtime._startValue = undefined
        }
      },
      _onTap(event: SliderEvent) {
        if ((this.data as Record<string, unknown>).disabled) return
        ;(this as unknown as {
          _triggerChangeEvent: (event: SliderEvent) => void
        })._triggerChangeEvent(event)
      },
      _triggerChangeEvent(event: SliderEvent) {
        if ((this as unknown as {
          _onUserChangedValue: (event: SliderEvent) => boolean
        })._onUserChangedValue(event)) {
          this.triggerEvent('change', { value: this.data.value })
        }
      },
      resetFormData() {
        this.setData({ value: Number(this.data.min) })
      },
      moveStep(direction: number) {
        const step = Number(this.data.step)
        const next = (this as unknown as {
          _filterValue: (value: number) => number
        })._filterValue(Number(this.data.value) + (direction < 0 ? -step : step))
        if (next === Number(this.data.value)) return
        this.setData({ value: next })
        this.triggerEvent('change', { value: this.data.value })
      },
      saved(state: Record<string, unknown>) {
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['value'])
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
