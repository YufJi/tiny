/**
 * URL helpers shared by the router, the renderer and the prerender script.
 *
 * The site is published under a sub-path on GitHub Pages, so every internal
 * link is built from `BASE_URL` instead of being hard-coded. Content keeps
 * writing `#/hosts`-style links for readability; `resolveContentHref` turns
 * them into real routes at render time.
 */

export const siteBase = import.meta.env.BASE_URL

export function routeHref(route) {
  return route ? `${siteBase}${route}/` : siteBase
}

/** `pathname` → route key (`''` for the landing page). */
export function routeFromPath(pathname) {
  let path = pathname
  if (siteBase !== '/' && path.startsWith(siteBase)) {
    path = path.slice(siteBase.length)
  } else if (path.startsWith(siteBase)) {
    path = path.slice(siteBase.length)
  } else {
    path = path.replace(/^\//, '')
  }
  return path.replace(/\/+$/, '')
}

const CONTENT_LINK = /^#\/(.*)$/

/** In-content `#/route` links become real URLs. */
export function resolveContentHref(href) {
  const match = CONTENT_LINK.exec(href)
  return match ? routeHref(match[1]) : href
}

/** Assets referenced relative to a page (the embedded devtool) get the base. */
export function resolveAssetSrc(src) {
  return src.startsWith('./') ? `${siteBase}${src.slice(2)}` : src
}
