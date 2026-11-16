import {
  PREVIEW_DEVICE,
  type PreviewDeviceProfile,
} from './device'

const SAFE_AREA_EXPRESSION = /(?:env|constant)\(\s*safe-area-inset-(top|right|bottom|left)\s*(?:,\s*[^)]*)?\)/g

/**
 * The browser iframe is not a standalone iOS WebView, so its native safe-area
 * environment is always zero. Resolve the mini program's WXSS against the
 * simulated device instead of leaking the host browser's geometry into the
 * preview.
 */
export function resolvePreviewSafeArea(
  css: string,
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): string {
  return css.replace(SAFE_AREA_EXPRESSION, (_expression, side: keyof PreviewDeviceProfile['safeAreaInset']) => (
    `${deviceProfile.safeAreaInset[side]}px`
  ))
}

/** Override the built-in component stylesheet's fallback env() variables. */
export function installPreviewSafeAreaVariables(
  deviceProfile: PreviewDeviceProfile = PREVIEW_DEVICE,
): void {
  if (typeof document === 'undefined') return
  for (const [side, value] of Object.entries(deviceProfile.safeAreaInset)) {
    document.documentElement.style.setProperty(`--safe-area-inset-${side}`, `${value}px`)
  }
}
