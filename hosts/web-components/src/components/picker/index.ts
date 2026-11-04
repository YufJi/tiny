import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'
import { bindHostListeners, unbindHostListeners } from '../../behaviors'

type PickerResult =
  | { status: 'ok'; value: unknown }
  | { status: 'cancel' }
  | { status: 'error'; errMsg: string }

type PickerRuntime = {
  __pickerShow?: boolean
  __multi_picker_watching?: boolean
  __formCallback?: (value: unknown) => void
  _defaultDateValue?: string
  _groupID?: number | null
  getBackendElement?: () => { getBoundingClientRect?: () => { width: number; height: number; left: number; top: number } } | null
}

/**
 * Mirrors `wx-picker`: the component renders only its slot; opening the picker
 * is a host call (WeChat uses WeixinJSBridge showPickerView/showDatePickerView),
 * and the host resolves the selected value.
 */
export function definePicker(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('picker'),
    template: ctx.template('picker'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.reload],
    properties: {
      range: { type: Array, value: [], observer: 'rangeChanged' },
      value: { value: '', observer: 'valueChanged' },
      mode: { type: String, value: 'selector' },
      fields: { type: String, value: 'day' },
      start: { type: String, value: '' },
      end: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      rangeKey: { type: String, value: '' },
      customItem: { type: String, value: '' },
      headerText: { type: String, value: '' },
      level: { type: String, value: '' },
    },
    options: ctx.hostOptions('picker'),
    lifetimes: {
      created() {
        bindHostListeners(this, {
          tap: () => {
            ;(this as unknown as { showPickerView: () => void }).showPickerView()
          },
        })
      },
      attached() {
        const element = (this as unknown as {
          getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
        }).getBackendElement?.()
        element?.setAttribute?.('aria-haspopup', 'true')
        if (this.data.mode === 'date') {
          const now = new Date()
          ;(this as unknown as PickerRuntime)._defaultDateValue =
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
        }
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    methods: {
      wrapperStyle(): { width: number; height: number; left: number; top: number } | undefined {
        const element = (this as unknown as PickerRuntime).getBackendElement?.()
        const rect = element?.getBoundingClientRect?.()
        if (!rect) return undefined
        return {
          width: rect.width,
          height: rect.height,
          left: rect.left + (window.scrollX || 0),
          top: rect.top + (window.scrollY || 0),
        }
      },
      showPickerView() {
        if (this.data.disabled) return
        const runtime = this as unknown as PickerRuntime
        if (runtime.__pickerShow) return
        const hostRequest = ctx.options.hostRequest
        if (!hostRequest) {
          this.triggerEvent('error', { errMsg: 'showPickerView:fail host picker is unavailable' })
          return
        }
        runtime.__pickerShow = true
        const mode = String(this.data.mode || 'selector')
        if (mode === 'multiSelector') runtime.__multi_picker_watching = true
        const current = mode === 'date' && !this.data.value
          ? runtime._defaultDateValue ?? this.data.value
          : this.data.value
        const result = hostRequest('showPicker', {
          mode,
          range: Array.isArray(this.data.range) ? this.data.range : [],
          rangeKey: String(this.data.rangeKey ?? ''),
          value: current,
          start: String(this.data.start ?? ''),
          end: String(this.data.end ?? ''),
          fields: String(this.data.fields ?? 'day'),
          headerText: String(this.data.headerText ?? ''),
          customItem: String(this.data.customItem ?? ''),
          level: String(this.data.level ?? ''),
          style: this.wrapperStyle(),
        }).then((raw) => {
          const value = raw as PickerResult
          runtime.__pickerShow = false
          if (value.status === 'ok') {
            this.setData({ value: value.value })
            this.triggerEvent('change', { value: value.value })
          } else if (value.status === 'error') {
            this.triggerEvent('error', { errMsg: value.errMsg })
          } else {
            this.triggerEvent('cancel', {})
          }
          this.formGetDataCallback()
        }, (error: unknown) => {
          runtime.__pickerShow = false
          this.triggerEvent('error', {
            errMsg: error instanceof Error ? error.message : String(error ?? 'showPickerView:fail'),
          })
          this.formGetDataCallback()
        })
      },
      getFormData(callback?: (value: unknown) => void): unknown {
        const runtime = this as unknown as PickerRuntime
        if (typeof callback !== 'function') {
          return runtime.__pickerShow ? undefined : this.data.value
        }
        if (runtime.__pickerShow) {
          runtime.__formCallback = callback
          return undefined
        }
        callback(this.data.value)
        return undefined
      },
      formGetDataCallback() {
        const runtime = this as unknown as PickerRuntime
        if (typeof runtime.__formCallback === 'function') {
          runtime.__formCallback(this.data.value)
        }
        runtime.__formCallback = undefined
      },
      resetFormData() {
        const runtime = this as unknown as PickerRuntime
        this.setData({ value: this.data.mode === 'selector' ? -1 : '' })
        if (typeof runtime._groupID === 'number') runtime._groupID = null
      },
      valueChanged(value: unknown, oldValue: unknown) {
        const runtime = this as unknown as PickerRuntime
        if (!runtime.__pickerShow || !runtime.__multi_picker_watching) return
        if (!Array.isArray(value) || !Array.isArray(oldValue)) return
        const range: unknown[] = Array.isArray(this.data.range) ? this.data.range as unknown[] : []
        let changed = false
        const next: unknown[] = [...value]
        for (let index = 0; index < range.length; index += 1) {
          const column: unknown = range[index]
          if (!Array.isArray(column)) continue
          if (value[index] !== oldValue[index]) {
            next[index] = Number(value[index]) >= column.length ? 0 : Number(value[index])
            changed = true
          }
        }
        if (!changed) return
        ctx.options.hostRequest?.('updatePicker', {
          mode: this.data.mode,
          range,
          rangeKey: this.data.rangeKey,
          value: next,
        }).catch(() => {})
      },
      rangeChanged(range: unknown, oldRange: unknown) {
        const runtime = this as unknown as PickerRuntime
        if (!runtime.__pickerShow || !runtime.__multi_picker_watching) return
        if (!Array.isArray(range) || !Array.isArray(oldRange)) return
        const current = Array.isArray(this.data.value) ? this.data.value : []
        let changed = false
        const next: unknown[] = [...current]
        for (let index = 0; index < range.length; index += 1) {
          const column = range[index]
          const previous = oldRange[index]
          if (!Array.isArray(column) || !Array.isArray(previous)) continue
          const same = column.length === previous.length
            && column.every((value, itemIndex) => value === previous[itemIndex])
          if (!same) {
            next[index] = Number(current[index]) >= column.length ? 0 : Number(current[index])
            changed = true
          }
        }
        if (!changed) return
        ctx.options.hostRequest?.('updatePicker', {
          mode: this.data.mode,
          range,
          rangeKey: this.data.rangeKey,
          value: next,
        }).catch(() => {})
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
