import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineCheckboxGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:checkbox-group',
    template: ctx.template('checkbox-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    properties: {
      style: { type: String, value: '' },
    },
    data: {
      selected: [] as string[],
    },
    externalClasses: ['class'],
    methods: {
      applyState(detail: { value?: unknown; checked?: unknown }) {
        const value = String(detail.value ?? '')
        const selected = new Set<string>(this.data.selected as string[])
        if (detail.checked) selected.add(value)
        else selected.delete(value)
        this.setData({ selected: [...selected] })
        return [...selected]
      },
      handleState(event: glassEasel.ShadowedEvent<unknown>) {
        this.applyState(event.detail as { value?: unknown; checked?: unknown })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const selected = this.applyState(event.detail as { value?: unknown; checked?: unknown })
        this.triggerEvent('change', { value: selected }, { bubbles: true, composed: true })
      },
    },
    options: { multipleSlots: true, virtualHost: true },
  }).general()
}
