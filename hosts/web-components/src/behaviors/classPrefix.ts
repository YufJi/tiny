import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createClassPrefixBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.classPrefix,
    methods: {
      getClassPrefix(): string {
        return ''
      },
      getAddGlobalClass(): boolean {
        return false
      },
      convertClassWithPrefix(value: string): string {
        const prefix = this.getClassPrefix?.() ?? ''
        if (!prefix) return value
        return this.getAddGlobalClass?.() ? `${value} ${prefix}${value}` : `${prefix}${value}`
      },
      convertClassListWithPrefix(values: string[]): string[] {
        return values.flatMap((value) => {
          if (!value) return []
          const converted = this.convertClassWithPrefix(value)
          return converted ? converted.split(' ') : []
        })
      },
    },
  })
}
