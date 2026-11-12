import { PREVIEW_DEVICE } from './previewDevice'

const SAFE_AREA_EXPRESSION = /(?:env|constant)\(\s*safe-area-inset-(top|right|bottom|left)\s*(?:,\s*[^)]*)?\)/g

/**
 * The browser iframe is not a standalone iOS WebView, so its native safe-area
 * environment is always zero. Resolve the mini program's WXSS against the
 * simulated device instead of leaking the host browser's geometry into the
 * preview.
 */
export function resolvePreviewSafeArea(css: string): string {
  return css.replace(SAFE_AREA_EXPRESSION, (_expression, side: keyof typeof PREVIEW_DEVICE.safeAreaInset) => (
    `${PREVIEW_DEVICE.safeAreaInset[side]}px`
  ))
}

/** Override the built-in component stylesheet's fallback env() variables. */
export function installPreviewSafeAreaVariables(): void {
  if (typeof document === 'undefined') return
  for (const [side, value] of Object.entries(PREVIEW_DEVICE.safeAreaInset)) {
    document.documentElement.style.setProperty(`--safe-area-inset-${side}`, `${value}px`)
  }
}
