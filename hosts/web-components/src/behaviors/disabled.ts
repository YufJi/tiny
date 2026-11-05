import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { LabelAriaRuntime } from './types'

export function createDisabledBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.disabled,
    properties: {
      disabled: { type: Boolean, value: false, observer: 'disabledChanged' },
    },
    methods: {
      disabledChanged(next: boolean): void {
        const runtime = this as unknown as LabelAriaRuntime
        runtime.getBackendElement?.()?.setAttribute?.('aria-disabled', String(Boolean(next)))
        ;(this as unknown as { _setRelatedLabelAria?: () => void })._setRelatedLabelAria?.()
      },
    },
  })
}
