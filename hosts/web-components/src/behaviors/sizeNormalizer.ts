import type * as glassEasel from 'glass-easel'

import { convertRpx } from '@tiny/css-units'
import { BUILTIN_BEHAVIOR_IDS } from './ids'

export function createSizeNormalizerBehavior(space: glassEasel.ComponentSpace) {
  return space.defineBehavior({
    is: BUILTIN_BEHAVIOR_IDS.sizeNormalizer,
    methods: {
      normalizeSize(value: unknown): number {
        if (typeof value === 'number') return Number.isFinite(value) ? value : 0
        const text = String(value ?? '').trim()
        const match = /^(-?\d+(?:\.\d+)?)(?:px)?$/.exec(text)
        return match ? Number(match[1]) : 0
      },
      normalizeSizeStr(value: unknown): string {
        if (typeof value === 'number') return `${value}px`
        const text = String(value ?? '').trim()
        if (text !== '' && parseFloat(text).toString() === text) return `${text}px`
        // WeChat resolves rpx through the WebView width; Tiny uses the shared
        // 750-ratio `vw` conversion so inline sizes follow app WXSS.
        if (/\d(?:\.\d+)?rpx/.test(text)) return convertRpx(text)
        return text
      },
    },
  })
}
