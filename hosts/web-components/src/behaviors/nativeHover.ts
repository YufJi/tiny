import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

/**
 * Web port of `wx-native-hover`. The reference only asks the parent
 * `wx-native-cover` view to repaint; the browser host has normal DOM hover
 * through the inherited `tiny-hover` behavior, so the native refresh is a
 * no-op.
 */
export function createNativeHoverBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.nativeHover,
    behaviors: [BUILTIN_BEHAVIOR_IDS.hover],
    methods: {
      _updateNativeCoverHover() {
        return false
      },
    },
  })
}
