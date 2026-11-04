import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createGroupBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.group,
    methods: {
      addItem(_item: unknown): void {},
      removeItem(_item: unknown): void {},
      renameItem(_item: unknown, _newValue: string, _oldValue: string): void {},
      changed(_item: unknown): void {},
      changedByTap(): void {
        const value = (this as unknown as { _value?: unknown })._value
        this.triggerEvent(
          'change',
          { value: Array.isArray(value) ? [...value] : value },
          { bubbles: true, composed: true },
        )
      },
      resetFormData(): void {},
    },
  })
}
