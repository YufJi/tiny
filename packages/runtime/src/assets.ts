/**
 * Asset URL resolution shared by the render thread.
 *
 * Mini-program asset paths are relative to the page/component source file or
 * app-root absolute. Browser hosts need a real URL, so the runtime resolves
 * the source-relative path and asks the host to map the app-root path.
 */

export {
  isExternalAssetUrl,
  resolveAssetPath,
  splitAssetSuffix,
} from '@tiny/manifest'
export type { AssetUrlResolver } from '@tiny/manifest'
import {
  resolveAssetPath,
  splitAssetSuffix,
} from '@tiny/manifest'
import type { AssetUrlResolver } from '@tiny/manifest'

/**
 * Rewrite relative `url(...)` values in WXSS output before it reaches the
 * backend style registry. Data URIs, remote URLs, fragments and CSS variables
 * are left untouched.
 */
export function rewriteCssAssetUrls(
  css: string,
  sourcePath: string,
  resolve: AssetUrlResolver,
): string {
  return css.replace(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi,
    (match, doubleQuoted: string | undefined, singleQuoted: string | undefined, unquoted: string | undefined) => {
      const value = (doubleQuoted ?? singleQuoted ?? unquoted ?? '').trim()
      if (!value || value.startsWith('var(')) return match

      const assetPath = resolveAssetPath(sourcePath, value)
      if (!assetPath) return match

      let url: string | undefined | null
      try {
        url = resolve(assetPath, { sourcePath })
      } catch {
        return match
      }
      if (!url) return match

      const { suffix } = splitAssetSuffix(value)
      return `url("${url}${suffix}")`
    },
  )
}
