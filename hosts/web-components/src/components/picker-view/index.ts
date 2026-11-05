import { bindHostListeners, unbindHostListeners } from '../../behaviors'
import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type PickerColumn = {
  is?: string
  data?: Record<string, unknown>
  setData?: (data: Record<string, unknown>) => void
  _setCurrent?: (index: number) => void
  _getCurrent?: () => number
  _setMaskStyle?: (className: string, style: string) => void
  _setIndicatorStyle?: (className: string, style: string) => void
  _getIndicatorHeight?: () => number
  _setHeight?: (height: number, itemHeight: number) => void
  _init?: () => void
  _update?: () => void
}

type PickerViewRuntime = {
  _columns?: PickerColumn[] | null
  _columnsDirty?: boolean
  _savedValue?: number[] | null
  _pickerHeight?: number | null
  getBackendElement?: () => { offsetHeight?: number } | null
  getShadowRoot?: () => {
    getElementById?: (id: string) => unknown
  } | null
}

/**
 * Mirrors `wx-picker-view`: the host is only the flex wrapper; every column
 * owns its mask/indicator/content, and the parent forwards value updates,
 * style options and immediateChange, then rebuilds the value array from the
 * column currents on wxPickerColumn* events.
 */
export function definePickerView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('picker-view'),
    template: ctx.template('picker-view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.reload],
    properties: {
      value: { type: Array, value: [], observer: '_valueChanged' },
      indicatorStyle: { type: String, value: '' },
      indicatorClass: { type: String, value: '' },
      maskStyle: { type: String, value: '' },
      maskClass: { type: String, value: '' },
      immediateChange: { type: Boolean, value: false, observer: '_immediateChangeChanged' },
    },
    lifetimes: {
      created() {
        const runtime = this as unknown as PickerViewRuntime
        runtime._columns = null
        runtime._columnsDirty = false
        runtime._pickerHeight = null
        bindHostListeners(this, {
          wxPickerColumnValueChanged: () => {
            ;(this as unknown as { handleColumnValueChanged: () => void }).handleColumnValueChanged()
          },
          wxPickerColumnValueChangeStart: () => {
            this.triggerEvent('pickstart', {})
          },
          wxPickerColumnValueChangeEnd: () => {
            this.triggerEvent('pickend', {})
          },
        })
        // EmptyBackend tests do not run `attached`; columns are still being
        // created during `created`, so initialize on the next task.
        setTimeout(() => {
          ;(this as unknown as { _initColumns: () => void })._initColumns()
        }, 0)
      },
      attached() {
        ;(this as unknown as { _initColumns: () => void })._initColumns()
      },
      detached() {
        unbindHostListeners(this)
      },
    },
    options: ctx.hostOptions('picker-view', { multipleSlots: true }),
    methods: {
      collectColumns(nodes: unknown[] | undefined, out: PickerColumn[]): void {
        for (const node of nodes ?? []) {
          const component = (node as { asGeneralComponent?: () => PickerColumn | null })
            .asGeneralComponent?.()
          if (component?.is === builtinDefinitionName('picker-view-column')) {
            out.push(component)
          }
          const children = (node as { childNodes?: unknown[] }).childNodes
          if (children) this.collectColumns(children, out)
        }
      },
      _getColumns(): PickerColumn[] {
        const runtime = this as unknown as PickerViewRuntime
        if (runtime._columnsDirty || !runtime._columns) {
          const columns: PickerColumn[] = []
          this.collectColumns((this as unknown as { childNodes?: unknown[] }).childNodes, columns)
          runtime._columns = columns
          runtime._columnsDirty = false
        }
        return runtime._columns ?? []
      },
      _getPickerHeight(): number {
        const runtime = this as unknown as PickerViewRuntime
        if (runtime._pickerHeight === null || runtime._pickerHeight === undefined) {
          runtime._pickerHeight = Number(runtime.getBackendElement?.()?.offsetHeight ?? 0)
        }
        return runtime._pickerHeight
      },
      _getIndicatorHeight(): number {
        const column = this._getColumns()[0]
        if (!column) return 34
        column._setIndicatorStyle?.(
          String(this.data.indicatorClass ?? ''),
          String(this.data.indicatorStyle ?? ''),
        )
        return Number(column._getIndicatorHeight?.() ?? 34)
      },
      _setColumnStyles(column: PickerColumn, height: number, indicatorHeight: number) {
        column._setMaskStyle?.(
          String(this.data.maskClass ?? ''),
          String(this.data.maskStyle ?? ''),
        )
        column._setIndicatorStyle?.(
          String(this.data.indicatorClass ?? ''),
          String(this.data.indicatorStyle ?? ''),
        )
        column._setHeight?.(height, indicatorHeight)
      },
      _initColumns(attempt = 0) {
        const runtime = this as unknown as PickerViewRuntime
        runtime._columnsDirty = true
        const columns = this._getColumns()
        if (!columns.length) {
          if (attempt < 10) setTimeout(() => this._initColumns(attempt + 1), 0)
          return
        }
        const values = Array.isArray(this.data.value) ? this.data.value : []
        const height = this._getPickerHeight()
        const indicatorHeight = this._getIndicatorHeight()
        columns.forEach((column, index) => {
          this._setColumnStyles(column, height, indicatorHeight)
          column._setCurrent?.(Number(values[index] ?? 0))
          column.setData?.({ immediateChange: Boolean(this.data.immediateChange) })
          column._init?.()
        })
        this._valueChanged(this.data.value)
      },
      _valueChanged(value: unknown) {
        const values = Array.isArray(value) ? value : []
        const columns = this._getColumns()
        columns.forEach((column, index) => {
          column._setCurrent?.(Number(values[index] ?? 0))
          column._update?.()
        })
      },
      _immediateChangeChanged(next: boolean) {
        for (const column of this._getColumns()) {
          column.setData?.({ immediateChange: Boolean(next) })
        }
      },
      handleColumnValueChanged() {
        const columns = this._getColumns()
        if (!columns.length) return
        const value = columns.map((column) => Number(column._getCurrent?.() ?? 0))
        this.setData({ value })
        this.triggerEvent('change', { value })
      },
      /** Kept for the existing unit harness and simple hosts. */
      handleColumnChange(event: { detail?: { column?: unknown; value?: unknown } }) {
        const column = Number(event.detail?.column ?? -1)
        if (column < 0) return
        const value: unknown[] = Array.isArray(this.data.value) ? [...this.data.value] : []
        value[column] = Number(event.detail?.value ?? 0)
        this.setData({ value })
        this.triggerEvent('change', { value })
      },
      saved(state: Record<string, unknown>) {
        const runtime = this as unknown as PickerViewRuntime
        const savedValue = this._getColumns().map((column) => Number(column._getCurrent?.() ?? 0))
        runtime._savedValue = savedValue
        const fields: Record<string, unknown> = {}
        ;(this as unknown as {
          saveCompVar: (state: Record<string, unknown>, fields: string[]) => void
        }).saveCompVar(fields, ['_savedValue'])
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
        const runtime = this as unknown as PickerViewRuntime
        const saved = runtime._savedValue
        runtime._savedValue = null
        if (Array.isArray(saved)) this.setData({ value: saved })
      },
    },
  }).general()
}
