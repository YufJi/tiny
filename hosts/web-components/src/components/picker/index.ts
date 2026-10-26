import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type PickerOption = { label: string; value: string }
type PickerColumn = PickerOption[]

const DATE_START = '1970-01-01'
const DATE_END = '2999-12-31'

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function parseDate(value: unknown): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/.exec(String(value ?? ''))
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3] ?? 1) }
}

function parseTime(value: unknown): { hour: number; minute: number } | null {
  const match = /^(\d{1,2}):(\d{1,2})/.exec(String(value ?? ''))
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function definePicker(ctx: BuiltinContext): BuiltinDefinition {
  const pickerView = ctx.getBuiltin('picker-view')
  const pickerColumn = ctx.getBuiltin('picker-view-column')
  if (!pickerView || !pickerColumn) {
    throw new Error('picker requires picker-view and picker-view-column')
  }
  return ctx.space.defineComponent({
    is: 'tiny-builtin:picker',
    template: ctx.template('picker'),
    using: {
      'picker-view': pickerView,
      'picker-view-column': pickerColumn,
    },
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent],
    properties: {
      ariaLabel: { type: String, value: '' },
      mode: { type: String, value: 'selector' },
      range: { type: Array, value: [] },
      rangeKey: { type: String, value: '' },
      value: { type: Number, optionalTypes: [String, Array], value: 0 },
      start: { type: String, value: '' },
      end: { type: String, value: '' },
      fields: { type: String, value: 'day' },
      disabled: { type: Boolean, value: false },
      headerText: { type: String, value: '' },
      customItem: { type: String, value: '' },
    },
    data: {
      overlayVisible: false,
      overlayColumns: [] as PickerColumn[],
      draftValue: [] as number[],
      overlayTitle: '',
    },
    options: ctx.hostOptions('picker'),
    methods: {
      rangeLabels(range: unknown): string[] {
        const list = Array.isArray(range) ? range : []
        const rangeKey = String(this.data.rangeKey ?? '')
        return list.map((item) => {
          if (rangeKey && item && typeof item === 'object') {
            return String((item as Record<string, unknown>)[rangeKey] ?? '')
          }
          return String(item ?? '')
        })
      },
      selectorColumn(): PickerColumn {
        const labels = this.rangeLabels(this.data.range)
        const custom = String(this.data.customItem ?? '')
        if (custom) labels.push(custom)
        return labels.map((label, index) => ({
          label,
          value: String(index),
        }))
      },
      multiColumns(): PickerColumn[] {
        const range = Array.isArray(this.data.range) ? this.data.range : []
        const columns = range.map((column) => this.rangeLabels(column).map((label, index) => ({
          label,
          value: String(index),
        })))
        const custom = String(this.data.customItem ?? '')
        if (custom && columns.length > 0) {
          columns[columns.length - 1]!.push({ label: custom, value: String(columns[columns.length - 1]!.length) })
        }
        return columns
      },
      dateParts(): {
        startYear: number
        endYear: number
        fields: string
      } {
        const start = parseDate(this.data.start || DATE_START) ?? parseDate(DATE_START)!
        const end = parseDate(this.data.end || DATE_END) ?? parseDate(DATE_END)!
        return {
          startYear: start.year,
          endYear: Math.max(start.year, end.year),
          fields: String(this.data.fields || 'day'),
        }
      },
      dateColumns(
        selected: { year: number; month: number; day: number },
      ): PickerColumn[] {
        const { startYear, endYear, fields } = this.dateParts()
        const yearColumn = Array.from(
          { length: endYear - startYear + 1 },
          (_value, index) => ({
            label: `${startYear + index}年`,
            value: String(index),
          }),
        )
        if (fields === 'year') return [yearColumn]
        const monthColumn = Array.from({ length: 12 }, (_value, index) => ({
          label: `${index + 1}月`,
          value: String(index),
        }))
        if (fields === 'month') return [yearColumn, monthColumn]
        const dayColumn = Array.from(
          { length: daysInMonth(selected.year, selected.month) },
          (_value, index) => ({
            label: `${index + 1}日`,
            value: String(index),
          }),
        )
        return [yearColumn, monthColumn, dayColumn]
      },
      dateDraft(columns: PickerColumn[]): { draft: number[]; date: { year: number; month: number; day: number } } {
        const { startYear } = this.dateParts()
        const current = parseDate(this.data.value) ?? parseDate(this.data.start || DATE_START)!
        const year = clamp(current.year, startYear, startYear + columns[0]!.length - 1)
        const month = clamp(current.month, 1, columns[1]?.length ?? 1)
        const day = clamp(current.day, 1, columns[2]?.length ?? 1)
        return {
          draft: columns.length === 1
            ? [year - startYear]
            : columns.length === 2
              ? [year - startYear, month - 1]
              : [year - startYear, month - 1, day - 1],
          date: { year, month, day },
        }
      },
      timeColumns(draft: { hour: number; minute: number }): PickerColumn[] {
        const start = parseTime(this.data.start) ?? { hour: 0, minute: 0 }
        const end = parseTime(this.data.end) ?? { hour: 23, minute: 59 }
        const firstHour = clamp(start.hour, 0, 23)
        const lastHour = clamp(end.hour, firstHour, 23)
        const hours = Array.from(
          { length: lastHour - firstHour + 1 },
          (_value, index) => ({
            label: `${pad2(firstHour + index)}时`,
            value: String(index),
          }),
        )
        const minutes = Array.from({ length: 60 }, (_value, index) => ({
          label: `${pad2(index)}分`,
          value: String(index),
        }))
        void draft
        return [hours, minutes]
      },
      timeDraft(columns: PickerColumn[]): { draft: number[]; time: { hour: number; minute: number } } {
        const start = parseTime(this.data.start) ?? { hour: 0, minute: 0 }
        const current = parseTime(this.data.value) ?? start
        const firstHour = clamp(start.hour, 0, 23)
        const hour = clamp(current.hour, firstHour, firstHour + columns[0]!.length - 1)
        const minute = clamp(current.minute, 0, 59)
        return {
          draft: [hour - firstHour, minute],
          time: { hour, minute },
        }
      },
      buildOverlay(): { columns: PickerColumn[]; draft: number[] } | null {
        const mode = String(this.data.mode || 'selector')
        if (mode === 'multiSelector') {
          const columns = this.multiColumns()
          const value = Array.isArray(this.data.value) ? this.data.value : []
          return {
            columns,
            draft: columns.map((column, index) => clamp(Number(value[index] ?? 0), 0, Math.max(0, column.length - 1))),
          }
        }
        if (mode === 'date') {
          const initial = parseDate(this.data.value) ?? parseDate(this.data.start || DATE_START)!
          const { startYear } = this.dateParts()
          const year = Math.max(startYear, initial.year)
          const columns = this.dateColumns({ ...initial, year })
          const { draft } = this.dateDraft(columns)
          return { columns, draft }
        }
        if (mode === 'time') {
          const columns = this.timeColumns(parseTime(this.data.value) ?? { hour: 0, minute: 0 })
          const { draft } = this.timeDraft(columns)
          return { columns, draft }
        }
        if (mode === 'region') return null
        const column = this.selectorColumn()
        return {
          columns: [column],
          draft: [clamp(Number(this.data.value ?? 0), 0, Math.max(0, column.length - 1))],
        }
      },
      handleOpen() {
        if (this.data.disabled) return
        const overlay = this.buildOverlay()
        if (!overlay) return
        this.setData({
          overlayVisible: true,
          overlayColumns: overlay.columns,
          draftValue: overlay.draft,
          overlayTitle: String(this.data.headerText ?? ''),
        })
      },
      handleOverlayChange(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { value?: unknown }
        const next = Array.isArray(detail.value) ? detail.value.map((item) => Number(item) || 0) : []
        const previous = this.data.draftValue as number[]
        const column = next.findIndex((item, index) => item !== previous[index])
        const mode = String(this.data.mode || 'selector')
        if (mode === 'date' && next.length >= 2) {
          const { startYear, fields } = this.dateParts()
          const year = startYear + (next[0] ?? 0)
          const month = (next[1] ?? 0) + 1
          const columns = this.dateColumns({ year, month, day: 1 })
          const day = clamp((next[2] ?? 0) + 1, 1, columns[2]?.length ?? 1)
          const normalized = columns.length === 1
            ? [next[0] ?? 0]
            : columns.length === 2
              ? [next[0] ?? 0, next[1] ?? 0]
              : [next[0] ?? 0, next[1] ?? 0, day - 1]
          this.setData({ overlayColumns: columns, draftValue: normalized })
          if (column >= 0) {
            this.triggerEvent('columnchange', { column, value: normalized }, { bubbles: true, composed: true })
          }
          return
        }
        this.setData({ draftValue: next })
        if (column >= 0) {
          this.triggerEvent('columnchange', { column, value: next }, { bubbles: true, composed: true })
        }
      },
      handleConfirm() {
        const mode = String(this.data.mode || 'selector')
        const draft = this.data.draftValue as number[]
        let value: number | string | number[] = 0
        if (mode === 'multiSelector') {
          value = draft.slice()
        } else if (mode === 'date') {
          const { startYear, fields } = this.dateParts()
          const year = startYear + (draft[0] ?? 0)
          const month = (draft[1] ?? 0) + 1
          const day = (draft[2] ?? 0) + 1
          value = fields === 'year'
            ? String(year)
            : fields === 'month'
              ? `${year}-${pad2(month)}`
              : `${year}-${pad2(month)}-${pad2(day)}`
        } else if (mode === 'time') {
          const start = parseTime(this.data.start) ?? { hour: 0, minute: 0 }
          value = `${pad2((start.hour ?? 0) + (draft[0] ?? 0))}:${pad2(draft[1] ?? 0)}`
        } else {
          value = Number(draft[0] ?? 0)
        }
        this.setData({ value, overlayVisible: false })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleCancel() {
        this.setData({ overlayVisible: false })
        this.triggerEvent('cancel', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
