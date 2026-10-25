import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

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
    options: ctx.hostOptions({ multipleSlots: true }),
    methods: {
      handleColumnChange(event: glassEasel.ShadowedEvent<unknown>) {
        const detail = (event.detail ?? {}) as { column?: unknown; value?: unknown }
        const column = Number(detail.column ?? -1)
        if (column < 0) return
        const value: unknown[] = Array.isArray(this.data.value) ? [...this.data.value] : []
        value[column] = Number(detail.value ?? 0)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
