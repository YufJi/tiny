/**
 * Component-scoped element addressing.
 *
 * Components keep a shared render id; every other node is addressed by a
 * locator: `<owner>#<index>.<index>...`, where `owner` is the nearest
 * component (or the page root) and the indexes are the child path from that
 * owner. Only elements inside the render tree carry a render-local id.
 */
export const RENDER_LOCATOR_SEPARATOR = '#'
export const RENDER_LOCAL_ID_PREFIX = 'r:'

/** Build the locator of a node at `path` below `owner`. */
export function formatLocator(owner: string, path: readonly number[]): string {
  return `${owner}${RENDER_LOCATOR_SEPARATOR}${path.join('.')}`
}

/** Extract the owner and child path of a locator, or `null` when malformed. */
export function parseLocator(target: string): { owner: string; path: number[] } | null {
  const separator = target.indexOf(RENDER_LOCATOR_SEPARATOR)
  if (separator <= 0) return null
  const owner = target.slice(0, separator)
  const path = target
    .slice(separator + 1)
    .split('.')
    .filter((segment) => segment.length > 0)
    .map((segment) => Number(segment))
  if (path.length === 0) return null
  if (path.some((index) => !Number.isInteger(index) || index < 0)) return null
  return { owner, path }
}

/** Whether a patch target is a locator (as opposed to a shared node id). */
export function isLocator(target: string): boolean {
  return target.includes(RENDER_LOCATOR_SEPARATOR)
}
