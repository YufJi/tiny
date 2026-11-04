import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createClassPrefixBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.classPrefix,
    methods: {
      getClassPrefix(): string {
        return ''
      },
    },
  })
}
