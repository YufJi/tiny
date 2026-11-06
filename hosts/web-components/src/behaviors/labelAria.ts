import type * as glassEasel from '@tiny/runtime/glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { LabelAriaRuntime } from './types'

export function createLabelAriaBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.labelAria,
    methods: {
      _setAria(role: string): void {
        const runtime = this as unknown as LabelAriaRuntime
        runtime.setAriaRoleDefault?.(role)
        const element = runtime.getBackendElement?.()
        element?.setAttribute?.('aria-disabled', String(Boolean(runtime.data.disabled)))
        if (!isButtonComponent(runtime.is)) {
          element?.setAttribute?.('aria-checked', String(Boolean(runtime.data.checked)))
        }
      },
      _setRelatedLabelAria(role?: string): void {
        const runtime = this as unknown as LabelAriaRuntime
        const label = runtime._relatedLabel
        if (!label) return
        const resolved = role ?? relatedRole(runtime.is)
        if (resolved) label.setAriaRoleDefault?.(resolved)
        const element = label.getBackendElement?.()
        element?.setAttribute?.('aria-disabled', String(Boolean(runtime.data.disabled)))
        if (!isButtonComponent(runtime.is)) {
          element?.setAttribute?.('aria-checked', String(Boolean(runtime.data.checked)))
        }
      },
    },
  })
}

function isButtonComponent(is: string | undefined): boolean {
  return /:button$/.test(String(is ?? ''))
}

function relatedRole(is: string | undefined): string | undefined {
  const value = String(is ?? '')
  if (/:radio$/.test(value)) return 'radio'
  if (/:switch$/.test(value)) return 'checkbox'
  if (/:checkbox$/.test(value)) return 'checkbox'
  if (/:button$/.test(value)) return 'button'
  return undefined
}
