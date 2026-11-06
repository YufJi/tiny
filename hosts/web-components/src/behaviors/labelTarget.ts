import type * as glassEasel from '@tiny/runtime/glass-easel'
import { BUILTIN_BEHAVIOR_IDS } from './ids'
import type { LabelTargetRuntime } from './types'

export function createLabelTargetBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.labelTarget,
    lifetimes: {
      created() {
        const instance = this as unknown as LabelTargetRuntime
        instance._labelTapListener = (event) => instance.handleLabelTap?.(event)
        instance.addListener?.('labelTap', instance._labelTapListener)
      },
      detached() {
        const instance = this as unknown as LabelTargetRuntime
        if (instance._labelTapListener) {
          instance.removeListener?.('labelTap', instance._labelTapListener)
        }
        instance._labelTapListener = undefined
      },
    },
    methods: {
      handleLabelTap() {
        // Label activation is dispatched by the label component.
      },
    },
  })
}
