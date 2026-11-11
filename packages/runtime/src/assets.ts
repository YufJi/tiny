/**
 * Asset URL resolution shared by the render thread.
 *
 * Mini-program asset paths are relative to the page/component source file or
 * app-root absolute. Browser hosts need a real URL, so the runtime resolves
 * the source-relative path and asks the host to map the app-root path.
 */

export { resolveAssetReference } from '@tiny/manifest'
export type { AssetUrlResolver } from '@tiny/manifest'
import { resolveAssetReference } from '@tiny/manifest'
import type { AssetUrlResolver } from '@tiny/manifest'

/**
 * Map compiler-normalized WXSS `url(/app-root/path)` values to host URLs
 * before the text reaches the backend style registry. The compiler owns
 * relative-path resolution (it sees each WXSS file and its `@import` graph);
 * the runtime only asks the host to turn the resulting app-root path into a
 * loadable URL. Relative values are left for the WebView, matching WeChat.
 */
export function mapCssAssetUrls(css: string, resolve: AssetUrlResolver): string {
  return css.replace(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi,
    (match, doubleQuoted: string | undefined, singleQuoted: string | undefined, unquoted: string | undefined) => {
      const value = (doubleQuoted ?? singleQuoted ?? unquoted ?? '').trim()
      if (!value || value.startsWith('var(')) return match

      if (!value.startsWith('/')) return match
      const reference = resolveAssetReference('', value)
      if (!reference) return match

      let url: string | undefined | null
      try {
        url = resolve(reference.path, { sourcePath: '' })
      } catch {
        return match
      }
      if (!url) return match

      return `url("${url}${reference.suffix}")`
    },
  )
}
