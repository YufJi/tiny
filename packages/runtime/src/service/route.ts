import type { PageArtifact } from '@tiny/manifest'
import type { ServiceThreadOptions } from './types'
import type { MiniProgramPageInstance } from './page-instance'

export function requireActivePage(
  pageInstances: Map<string, MiniProgramPageInstance>,
  requestedPageId: string | undefined,
  activePage: MiniProgramPageInstance | null,
): MiniProgramPageInstance {
  const pageId = requestedPageId ?? activePage?.pageId
  const page = pageId ? pageInstances.get(pageId) : null
  if (!page) throw new Error('No active mini-program page')
  return page
}

export function findPageArtifact(manifest: ServiceThreadOptions['manifest'], path: string): PageArtifact | undefined {
  return manifest.pages.find((page) => page.path === path)
}

export function resolveComponentReference(sourcePath: string, reference: string): string {
  return resolveRoutePath(sourcePath, reference)
}

/** WeChat protocol URLs (`wx://`, `plugin://`, `plugin-private://`) are absolute. */
const ROUTE_PROTOCOL = /^[a-z][a-z0-9+.-]*:\/\//i

/**
 * Resolve a route reference against the directory of `sourcePath`.
 *
 * Matches WeChat's `getRealRoute`: a leading `/` is an absolute app route and
 * is returned without the slash; `./` and `../` are resolved against the
 * directory that contains `sourcePath` (a page file, not its directory).
 */
export function resolveRoutePath(sourcePath: string, reference: string): string {
  if (reference.startsWith('/')) return normalizeRoutePath(reference.slice(1))
  const posix = (value: string) => value.split('\\').join('/')
  const directory = posix(sourcePath).split('/').slice(0, -1)
  const output: string[] = []
  for (const segment of [...directory, ...posix(reference).split('/')]) {
    if (!segment || segment === '.') continue
    if (segment === '..') output.pop()
    else output.push(segment)
  }
  return output.join('/')
}

/**
 * Resolve one navigation URL against the page/component that owns the caller.
 *
 * `wx.*` navigation resolves relative URLs against the *current* page (the last
 * route). The `Router` objects (`this.router` / `this.pageRouter`) keep a stable
 * base instead: the owning component or page path. They use this helper to turn
 * a relative URL into an absolute one before calling the same `wx.*` API, so
 * the base cannot drift when the page stack changes mid-call.
 */
export function resolveRouteUrl(basePath: string, url: string): string {
  if (!url || ROUTE_PROTOCOL.test(url)) return url
  const queryIndex = url.indexOf('?')
  const rawPath = queryIndex >= 0 ? url.slice(0, queryIndex) : url
  const query = queryIndex >= 0 ? url.slice(queryIndex) : ''
  if (!rawPath) return url
  // Keep the leading slash: `wx.*` treats a non-slash URL as relative to the
  // active page, and the resolved route must not be resolved a second time.
  return `/${resolveRoutePath(basePath, rawPath)}${query}`
}

export function normalizeRoutePath(path: string): string {
  return path.split('\\').join('/').replace(/^\.?\//, '').replace(/\/+$/, '')
}

