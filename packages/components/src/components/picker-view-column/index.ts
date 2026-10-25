import type * as glassEasel from 'glass-easel'
import type { BuiltinContext, BuiltinDefinition } from '../../types'

type ColumnBackend = {
  scrollTop?: number
  scrollTo?: (options: { top?: number; behavior?: string }) => void
  children?: ArrayLike<{ getBoundingClientRect?: () => { top: number }; offsetTop?: number }>
}

const ITEM_HEIGHT = 34

export function definePickerViewColumn(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: 'tiny-builtin:picker-view-column',
    template: ctx.template('picker-view-column'),
    behaviors: [ctx.behaviors.base],
    properties: {
      ariaLabel: { type: String, value: '' },
    },
    data: {
      column: 0,
    },
    lifetimes: {
      attached() {
        const parent = (this.parentNode as unknown as {
          asGeneralComponent?: () => { childNodes?: unknown[] } | null
        } | null)?.asGeneralComponent?.()
        const siblings = (parent?.childNodes ?? []).filter((node) => (
          (node as { asGeneralComponent?: () => { data?: { column?: number } } | null }).asGeneralComponent?.()?.data?.column !== undefined
        ))
        const index = siblings.indexOf(this as unknown)
        this.setData({ column: index >= 0 ? index : Number(this.data.column) })
      },
    },
    options: ctx.hostOptions(),
    methods: {
      backend(): ColumnBackend | null {
        return (this as unknown as { getBackendElement?: () => ColumnBackend | null }).getBackendElement?.() ?? null
      },
      notifyParent(column: number, value: number) {
        let node = this.parentNode as unknown as { parentNode?: unknown; asGeneralComponent?: () => { handleColumnChange?: (event: unknown) => void } | null } | null
        while (node) {
          const component = node.asGeneralComponent?.()
          if (component && typeof component.handleColumnChange === 'function') {
            component.handleColumnChange({ detail: { column, value } })
            return
          }
          node = node.parentNode as typeof node
        }
      },
      handleScroll() {
        const element = this.backend()
        const index = Math.max(0, Math.round(Number(element?.scrollTop ?? 0) / ITEM_HEIGHT))
        this.triggerEvent('columnchange', { column: Number(this.data.column), value: index }, { bubbles: true, composed: true })
        this.notifyParent(Number(this.data.column), index)
      },
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        const target = event.target as unknown as { offsetTop?: number; parentNode?: unknown }
        let node = target
        let index = 0
        while (node) {
          const sibling = (node as { previousSibling?: unknown }).previousSibling
          if (!sibling) break
          index += 1
          node = sibling as typeof node
        }
        this.triggerEvent('columnchange', { column: Number(this.data.column), value: index }, { bubbles: true, composed: true })
        this.notifyParent(Number(this.data.column), index)
        this.backend()?.scrollTo?.({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
      },
    },
  }).general()
}
