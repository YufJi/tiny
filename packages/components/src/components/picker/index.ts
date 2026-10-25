import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type PickerOption = { label: string; value: string }

export function definePicker(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:picker',
    template: ctx.template('picker'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent],
    properties: {
      ariaLabel: { type: String, value: '' },
      mode: { type: String, value: 'selector' },
      range: { type: Array, value: [] },
      rangeKey: { type: String, value: '' },
      value: { type: Number, optionalTypes: [String], value: 0 },
      start: { type: String, value: '' },
      end: { type: String, value: '' },
      fields: { type: String, value: 'day' },
      disabled: { type: Boolean, value: false },
      headerText: { type: String, value: '' },
      customItem: { type: String, value: '' },
      style: { type: String, value: '' },
    },
    data: {
      options: [] as PickerOption[],
    },
    observers: {
      'range, rangeKey'() {
        this.syncOptions()
      },
    },
    lifetimes: {
      attached() {
        this.syncOptions()
      },
    },
    methods: {
      syncOptions() {
        const range = Array.isArray(this.data.range) ? this.data.range : []
        const rangeKey = String(this.data.rangeKey ?? '')
        const options = range.map((item, index) => {
          const label = rangeKey && item && typeof item === 'object'
            ? String((item as Record<string, unknown>)[rangeKey] ?? '')
            : String(item ?? '')
          return { label, value: String(index) }
        })
        this.setData({ options })
      },
      handleSelectorChange(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const detail = (event.detail ?? {}) as { value?: unknown }
        const value = Number(detail.value ?? 0)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleDateChange(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        const value = String((event.detail as { value?: unknown } | undefined)?.value ?? '')
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
      handleCancel() {
        this.triggerEvent('cancel', {}, { bubbles: true, composed: true })
      },
    },
  }).general()
}
