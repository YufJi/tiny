import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineCheckboxGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:checkbox-group',
    template: ctx.template('checkbox-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    data: {
      selected: [] as string[],
    },
    options: ctx.hostOptions({ multipleSlots: true }),
    lifetimes: {
      ready() {
        this.syncSelected()
      },
    },
    methods: {
      collectChecked(nodes: unknown[] | undefined, out: string[]): void {
        for (const node of nodes ?? []) {
          const item = node as {
            hasBehavior?: (behavior: string) => boolean
            data?: Record<string, unknown>
            childNodes?: unknown[]
          }
          if (item.hasBehavior?.('wx-item') && item.data?.checked) {
            const value = String(item.data.value ?? '')
            if (value) out.push(value)
          }
          this.collectChecked(item.childNodes, out)
        }
      },
      syncSelected(): string[] {
        const selected: string[] = []
        this.collectChecked((this as unknown as { childNodes?: unknown[] }).childNodes, selected)
        this.setData({ selected })
        return selected
      },
      handleItemChange() {
        const selected = this.syncSelected()
        this.triggerEvent('change', { value: selected }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
