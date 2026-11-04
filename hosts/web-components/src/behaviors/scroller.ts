import type * as glassEasel from 'glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createScrollerBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.scroller,
    methods: {
      initScroller(element: unknown) {
        ;(this as unknown as { __scrollerElement?: unknown }).__scrollerElement = element ?? null
      },
      isScrolling() {
        return Date.now() < Number((this as unknown as { __scrollingUntil?: number }).__scrollingUntil ?? 0)
      },
      scrollTo(scrollTop: number, scrollLeft: number, behavior: 'auto' | 'smooth' = 'auto') {
        const element = (this as unknown as {
          __scrollerElement?: {
            scrollTop?: number
            scrollLeft?: number
            scrollTo?: (options: { top: number; left: number; behavior: string }) => void
          } | null
        }).__scrollerElement
        if (!element) return
        if (typeof element.scrollTo === 'function') {
          element.scrollTo({ top: scrollTop, left: scrollLeft, behavior })
        } else {
          element.scrollTop = scrollTop
          element.scrollLeft = scrollLeft
        }
      },
    },
  })
}
