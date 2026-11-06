import type * as glassEasel from '@tiny/runtime/glass-easel'

import { BUILTIN_BEHAVIOR_IDS } from './ids'

type QuillGlobal = {
  Quill?: unknown
  __tinyQuillCore?: { available: boolean; version: string }
}

/**
 * Web compatibility port of `wx-quill-core` (WeChat 2.33.0).
 *
 * The reference ensures the bundled Quill runtime is installed on
 * `window.Quill`. Tiny's editor first pass uses a contenteditable host and does
 * not ship Quill, so this behavior only records whether a Quill runtime is
 * already present; it never fabricates a Quill instance.
 */
export function createQuillCoreBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.quillCore,
    methods: {
      isQuillAvailable(): boolean {
        return typeof window !== 'undefined' && Boolean((window as QuillGlobal).Quill)
      },
    },
    lifetimes: {
      created() {
        if (typeof window === 'undefined') return
        const target = window as QuillGlobal
        target.__tinyQuillCore = {
          available: Boolean(target.Quill),
          version: 'web-compat',
        }
      },
    },
  })
}
