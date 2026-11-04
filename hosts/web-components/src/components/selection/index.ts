import type { BuiltinContext, BuiltinDefinition } from '../../types'
import { builtinDefinitionName } from '../../tags'

type SelectionRuntime = {
  _selectionListener?: () => void
  getBackendElement?: () => HTMLElement | null
}

type SelectionDetail = {
  isCollapsed: boolean
  selectedString: string
  firstNodeId: string
  firstOffset: number | null
  lastNodeId: string
  lastOffset: number | null
  firstRangeRect: {
    left: number
    top: number
    right: number
    bottom: number
    width: number
    height: number
  } | null
}

function nodeIdWithin(node: Node | null, host: HTMLElement): string {
  let current: Node | null = node
  if (current?.nodeType === 3) current = current.parentNode
  while (current && current !== host) {
    if (current.nodeType === 1) {
      const id = (current as Element).id
      if (id) return id
    }
    current = current.parentNode
  }
  return ''
}

function offsetWithin(node: Node, offset: number): number | null {
  return node.nodeType === 3 ? offset : null
}

/**
 * Mirrors `wx-selection` (base library 3.6.4): a local text selection region
 * that reports `selectionchange` details. The browser host reads the native
 * Selection API instead of WeChat's native text-selection bridge.
 */
export function defineSelection(ctx: BuiltinContext): BuiltinDefinition {
  return ctx.space.defineComponent({
    is: builtinDefinitionName('selection'),
    template: ctx.template('selection'),
    behaviors: [ctx.behaviors.base],
    properties: {
      disableContextMenu: { type: Boolean, value: false },
    },
    options: ctx.hostOptions('selection'),
    lifetimes: {
      attached() {
        const runtime = this as unknown as SelectionRuntime
        runtime._selectionListener = () => {
          ;(this as unknown as { handleSelectionChange: () => void })
            .handleSelectionChange()
        }
        if (typeof document !== 'undefined') {
          document.addEventListener('selectionchange', runtime._selectionListener)
        }
      },
      detached() {
        const runtime = this as unknown as SelectionRuntime
        if (runtime._selectionListener && typeof document !== 'undefined') {
          document.removeEventListener('selectionchange', runtime._selectionListener)
        }
        runtime._selectionListener = undefined
      },
    },
    methods: {
      handleSelectionChange() {
        if (typeof document === 'undefined') return
        const host = (this as unknown as SelectionRuntime).getBackendElement?.()
        const selection = document.getSelection()
        if (!host || !selection || selection.rangeCount === 0) return
        const range = selection.getRangeAt(0)
        if (!host.contains(range.commonAncestorContainer)) return
        if (selection.isCollapsed && !host.contains(selection.anchorNode)) return
        const rect = range.getBoundingClientRect()
        const detail: SelectionDetail = {
          isCollapsed: selection.isCollapsed,
          selectedString: selection.toString(),
          firstNodeId: nodeIdWithin(range.startContainer, host),
          firstOffset: offsetWithin(range.startContainer, range.startOffset),
          lastNodeId: nodeIdWithin(range.endContainer, host),
          lastOffset: offsetWithin(range.endContainer, range.endOffset),
          firstRangeRect: {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          },
        }
        this.triggerEvent('selectionchange', detail)
      },
    },
  }).general()
}
