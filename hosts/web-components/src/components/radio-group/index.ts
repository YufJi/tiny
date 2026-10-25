import type { BuiltinContext, BuiltinDefinition } from '../../types'

export function defineRadioGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:radio-group',
    template: ctx.template('radio-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    data: {
      value: '',
    },
    options: ctx.hostOptions({ multipleSlots: true }),
    lifetimes: {
      ready() {
        const value = this.syncValue()
        this.applyValue((this as unknown as { childNodes?: unknown[] }).childNodes, value)
      },
    },
    methods: {
      collectChecked(nodes: unknown[] | undefined): string | undefined {
        for (const node of nodes ?? []) {
          const item = node as {
            hasBehavior?: (behavior: string) => boolean
            data?: Record<string, unknown>
            childNodes?: unknown[]
          }
          if (item.hasBehavior?.('wx-item') && item.data?.checked) {
            return String(item.data.value ?? '')
          }
          const nested = this.collectChecked(item.childNodes)
          if (nested !== undefined) return nested
        }
        return undefined
      },
      syncValue(): string {
        const value = this.collectChecked(
          (this as unknown as { childNodes?: unknown[] }).childNodes,
        ) ?? String(this.data.value ?? '')
        this.setData({ value })
        return value
      },
      applyValue(nodes: unknown[] | undefined, value: string): void {
        for (const node of nodes ?? []) {
          const item = node as {
            hasBehavior?: (behavior: string) => boolean
            data?: Record<string, unknown>
            childNodes?: unknown[]
            setData?: (data: Record<string, unknown>) => void
          }
          if (item.hasBehavior?.('wx-item') && item.data && 'checked' in item.data) {
            const should = String(item.data.value ?? '') === value
            if (Boolean(item.data.checked) !== should) item.setData?.({ checked: should })
          }
          this.applyValue(item.childNodes, value)
        }
      },
      handleItemChange(detail: { value?: unknown; checked?: unknown }) {
        if (detail.checked === false) return
        const value = String(detail.value ?? '')
        this.setData({ value })
        this.applyValue((this as unknown as { childNodes?: unknown[] }).childNodes, value)
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
