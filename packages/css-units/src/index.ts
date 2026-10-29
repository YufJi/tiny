/** The rpx-to-vw ratio is part of the public artifact contract. */
export const RPX_RATIO = 750

const RPX_RE = /(-?\d*\.?\d+)rpx/g

/**
 * Convert all `rpx` dimension values in a string to `vw`.
 *
 * This is the single implementation shared by the stylesheet compiler and the
 * render-side WXS `setStyle` descriptor. Keeping both on the same unit (vw)
 * avoids re-measuring the viewport in render and preserves compiler rounding.
 */
export function convertRpx(input: string, ratio: number = RPX_RATIO): string {
  return input.replace(RPX_RE, (_match, raw: string) => {
    const value = parseFloat(raw)
    const vw = (value * 100) / ratio
    const rounded = parseFloat(vw.toPrecision(6))
    return `${rounded}vw`
  })
}
