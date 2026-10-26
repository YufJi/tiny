import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type PickerColumn = {
  is?: string
  applyOptions?: (options: {
    indicatorStyle?: string
    indicatorClass?: string
    maskStyle?: string
    maskClass?: string
  }) => void
  setCurrent?: (index: number) => number
  setColumnIndex?: (index: number) => void
}

export function definePickerView(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:picker-view',
    template: ctx.template('picker-view'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent],
    properties: {
      ariaLabel: { type: String, value: '' },
      value: { type: Array, value: [] },
      indicatorStyle: { type: String, value: '' },
      indicatorClass: { type: String, value: '' },
      maskStyle: { type: String, value: '' },
      maskClass: { type: String, value: '' },
    },
    observers: {
      value() {
        this.syncColumnValues()
      },
      'indicatorStyle, indicatorClass, maskStyle, maskClass'() {
        this.syncColumnOptions()
      },
    },
    lifetimes: {
      created() {
        // Children are not instantiated yet when `created` runs.
        setTimeout(() => {
          this.syncColumnOptions()
          this.syncColumnValues()
        }, 0)
      },
      attached() {
        this.syncColumnOptions()
        this.syncColumnValues()
      },
      ready() {
        this.syncColumnOptions()
        this.syncColumnValues()
      },
    },
    options: ctx.hostOptions('picker-view', { multipleSlots: true }),
    methods: {
      collectColumns(nodes: unknown[] | undefined, out: PickerColumn[]): void {
        for (const node of nodes ?? []) {
          const component = (node as { asGeneralComponent?: () => PickerColumn | null })
            .asGeneralComponent?.()
          if (component?.is === 'tiny-builtin:picker-view-column') {
            out.push(component)
          }
          const children = (node as { childNodes?: unknown[] }).childNodes
          if (children) this.collectColumns(children, out)
        }
      },
      getColumns(): PickerColumn[] {
        const columns: PickerColumn[] = []
        this.collectColumns(
          (this as unknown as { childNodes?: unknown[] }).childNodes,
          columns,
        )
        return columns
      },
      syncColumnOptions(): void {
        this.getColumns().forEach((column, index) => {
          column.setColumnIndex?.(index)
          column.applyOptions?.({
            indicatorStyle: String(this.data.indicatorStyle ?? ''),
            indicatorClass: String(this.data.indicatorClass ?? ''),
            maskStyle: String(this.data.maskStyle ?? ''),
            maskClass: String(this.data.maskClass ?? ''),
          })
        })
      },
      syncColumnValues(): void {
        const values = Array.isArray(this.data.value) ? this.data.value : []
        this.getColumns().forEach((column, index) => {
          column.setColumnIndex?.(index)
          column.setCurrent?.(Number(values[index] ?? 0))
        })
      },
      handleColumnChange(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { column?: unknown; value?: unknown }
        const column = Number(detail.column ?? -1)
        if (column < 0) return
        const value: unknown[] = Array.isArray(this.data.value) ? [...this.data.value] : []
        value[column] = Number(detail.value ?? 0)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleColumnStart() {
        this.triggerEvent('pickstart', {}, { bubbles: true, composed: true })
      },
      handleColumnEnd() {
        this.triggerEvent('pickend', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
