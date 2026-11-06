/**
 * Mini-program asset path conventions.
 *
 * Asset paths are relative to the page/component source file or app-root
 * absolute. Both the runtime (style url rewriting) and the API table (canvas
 * image URLs) resolve them, so the pure helpers live in the shared contract
 * package instead of either side importing the other.
 */

/** Host hook mapping app-root asset paths to loadable URLs. */
export type AssetUrlResolver = (
  assetPath: string,
  context: { sourcePath: string },
) => string | undefined | null

const EXTERNAL_ASSET_URL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i

export function isExternalAssetUrl(value: string): boolean {
  return EXTERNAL_ASSET_URL.test(value)
}

export function splitAssetSuffix(value: string): { path: string; suffix: string } {
  const index = value.search(/[?#]/)
  if (index === -1) return { path: value, suffix: '' }
  return { path: value.slice(0, index), suffix: value.slice(index) }
}

/**
 * Resolve a mini-program asset path to an app-root-relative path.
 *
 * Returns `null` for external URLs, fragments, or paths that escape the app
 * root. The caller should leave those values unchanged.
 */
export function resolveAssetPath(sourcePath: string, value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('#') || isExternalAssetUrl(trimmed)) return null

  const { path: pathname } = splitAssetSuffix(trimmed)
  if (!pathname) return null

  const normalizedSource = sourcePath.replace(/\\/g, '/').replace(/^\/+/, '')
  const sourceDir = normalizedSource.includes('/')
    ? normalizedSource.slice(0, normalizedSource.lastIndexOf('/'))
    : ''
  const normalizedPath = pathname.replace(/\\/g, '/')
  const parts = normalizedPath.startsWith('/') ? [] : sourceDir.split('/').filter(Boolean)

  for (const part of normalizedPath.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (parts.length === 0) return null
      parts.pop()
      continue
    }
    parts.push(part)
  }

  return parts.length > 0 ? parts.join('/') : null
}
