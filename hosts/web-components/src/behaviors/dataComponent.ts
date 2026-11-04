import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createDataComponentBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.dataComponent,
    properties: {
      name: { type: String, value: '' },
    },
    methods: {
      getFormData(): unknown {
        return (this.data as { value?: unknown }).value ?? ''
      },
      resetFormData(): void {
        if ('value' in this.data) this.setData({ value: '' })
      },
    },
  })
}
