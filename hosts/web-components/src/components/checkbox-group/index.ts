import type { BuiltinContext, BuiltinDefinition } from '../../types'

function asValues(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

export function defineCheckboxGroup(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:checkbox-group',
    template: ctx.template('checkbox-group'),
    behaviors: [ctx.behaviors.base, ctx.behaviors.dataComponent, ctx.behaviors.group],
    properties: {
      value: { type: Array, value: [] as string[] },
    },
    data: {
      selected: [] as string[],
    },
    observers: {
      value(next: unknown) {
        if (!(this as unknown as { _groupReady?: boolean })._groupReady) return
        this.applySelection(asValues(next))
      },
    },
    lifetimes: {
      created() {
        setTimeout(() => this.initializeGroup(), 0)
      },
      attached() {
        const element = (this as unknown as {
          getBackendElement?: () => { setAttribute?: (name: string, value: string) => void } | null
        }).getBackendElement?.()
        element?.setAttribute?.('role', 'group')
        element?.setAttribute?.('aria-label', '复选区')
        this.initializeGroup()
      },
      ready() {
        this.initializeGroup()
      },
    },
    options: ctx.hostOptions('checkbox-group', { multipleSlots: true }),
    methods: {
      initializeGroup() {
        if (!this.hasItems((this as unknown as { childNodes?: unknown[] }).childNodes)) return
        const provided = asValues(this.data.value)
        if (provided.length > 0) this.applySelection(provided)
        const selected = this.syncSelected()
        this.setData({ selected, value: selected })
        ;(this as unknown as { _groupReady?: boolean })._groupReady = true
      },
      hasItems(nodes: unknown[] | undefined): boolean {
        for (const node of nodes ?? []) {
          const item = node as {
            hasBehavior?: (behavior: string) => boolean
            childNodes?: unknown[]
          }
          if (item.hasBehavior?.('wx-item')) return true
          if (this.hasItems(item.childNodes)) return true
        }
        return false
      },
      collectChecked(nodes: unknown[] | undefined, out: string[]): void {
        for (const node of nodes ?? []) {
          const item = node as {
            hasBehavior?: (behavior: string) => boolean
            data?: Record<string, unknown>
            childNodes?: unknown[]
          }
          if (item.hasBehavior?.('wx-item') && item.data?.checked) {
            const value = String(item.data.value ?? '')
            if (value && !out.includes(value)) out.push(value)
          }
          this.collectChecked(item.childNodes, out)
        }
      },
      syncSelected(): string[] {
        const selected: string[] = []
        this.collectChecked((this as unknown as { childNodes?: unknown[] }).childNodes, selected)
        return selected
      },
      applySelection(selected: string[]): void {
        const set = new Set(selected)
        const walk = (nodes: unknown[] | undefined) => {
          for (const node of nodes ?? []) {
            const item = node as {
              hasBehavior?: (behavior: string) => boolean
              data?: Record<string, unknown>
              childNodes?: unknown[]
              setData?: (data: Record<string, unknown>) => void
            }
            if (item.hasBehavior?.('wx-item') && item.data && 'checked' in item.data) {
              const should = set.has(String(item.data.value ?? ''))
              if (Boolean(item.data.checked) !== should) item.setData?.({ checked: should })
            }
            walk(item.childNodes)
          }
        }
        walk((this as unknown as { childNodes?: unknown[] }).childNodes)
      },
      handleItemChange() {
        const selected = this.syncSelected()
        this.setData({ selected, value: selected })
        this.triggerEvent('change', { value: selected }, { bubbles: true, composed: true })
      },
    },
  }).general()
}
