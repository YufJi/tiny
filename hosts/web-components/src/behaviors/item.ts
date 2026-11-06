import type * as glassEasel from '@tiny/runtime/glass-easel'

import { findAncestorWithBehavior } from './find-ancestor'
import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { GroupHandler, ItemRuntime } from './types'

export function createItemBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.item,
    properties: {
      value: { type: String, value: '', observer: 'valueChange' },
      checked: { type: Boolean, value: false, observer: 'checkedChange' },
    },
    lifetimes: {
      attached() {
        const runtime = this as unknown as ItemRuntime
        const group = findAncestorWithBehavior(this, BUILTIN_BEHAVIOR_IDS.group) as GroupHandler | null
        runtime._relatedGroup = group
        group?.addItem?.(this)
      },
      moved() {
        const runtime = this as unknown as ItemRuntime
        runtime._relatedGroup?.removeItem?.(this)
        const group = findAncestorWithBehavior(this, BUILTIN_BEHAVIOR_IDS.group) as GroupHandler | null
        runtime._relatedGroup = group
        group?.addItem?.(this)
      },
      detached() {
        const runtime = this as unknown as ItemRuntime
        runtime._relatedGroup?.removeItem?.(this)
        runtime._relatedGroup = null
      },
    },
    methods: {
      valueChange(next: unknown, previous: unknown): void {
        if (next === previous) return
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.renameItem?.(this, String(next ?? ''), String(previous ?? ''))
      },
      checkedChange(next: unknown, previous: unknown): void {
        const runtime = this as unknown as ItemRuntime & {
          getBackendElement?: () => {
            setAttribute?: (name: string, value: string) => void
          } | null
          _setRelatedLabelAria?: () => void
        }
        runtime.getBackendElement?.()?.setAttribute?.('aria-checked', String(Boolean(next)))
        runtime._setRelatedLabelAria?.()
        if (next === previous) return
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.changed?.(this)
      },
      changedByTap(): void {
        const group = (this as unknown as ItemRuntime)._relatedGroup
        group?.changedByTap?.()
      },
      resetFormData(): void {
        ;(this as unknown as ItemRuntime).setData({ checked: false })
      },
    },
  })
}
