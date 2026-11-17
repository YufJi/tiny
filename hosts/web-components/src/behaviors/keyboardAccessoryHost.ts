import type * as glassEasel from '@tiny/runtime/glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

type KeyboardAccessoryHostRuntime = {
  childNodes?: ArrayLike<{
    hasBehavior?: (name: string) => boolean
  }>
}

/**
 * Web port of `wx-keyboard-accessory-host`.
 *
 * WeChat lets an input/textarea host a `wx-keyboard-accessory` child above the
 * native keyboard. The behavior only exposes the child lookup; the iOS host
 * owns the actual input accessory view.
 */
export function createKeyboardAccessoryHostBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.keyboardAccessoryHost,
    methods: {
      getWidgetId(): number {
        return -1
      },
      hasKeyboardAccessoryWidget(): boolean {
        const children = (this as unknown as KeyboardAccessoryHostRuntime).childNodes
        if (!children) return false
        for (let index = 0; index < children.length; index += 1) {
          if (children[index]?.hasBehavior?.(BUILTIN_BEHAVIOR_IDS.keyboardAccessory)) {
            return true
          }
        }
        return false
      },
    },
  })
}
