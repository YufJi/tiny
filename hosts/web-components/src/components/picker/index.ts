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
      range: { type: Array, value: [] },
      value: { value: '' },
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
        return { width: rect.width, height: rect.height, left: rect.left, top: rect.top }
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
        const result = hostRequest('showPicker', {
          mode,
          range: Array.isArray(this.data.range) ? this.data.range : [],
          rangeKey: String(this.data.rangeKey ?? ''),
          value: this.data.value,
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
        }, (error: unknown) => {
          runtime.__pickerShow = false
          this.triggerEvent('error', {
            errMsg: error instanceof Error ? error.message : String(error ?? 'showPickerView:fail'),
          })
        })
      },
      getFormData(callback?: (value: unknown) => void): unknown {
        if (typeof callback === 'function') {
          callback(this.data.value)
          return undefined
        }
        return this.data.value
      },
      resetFormData() {
        this.setData({ value: this.data.mode === 'selector' ? -1 : '' })
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
