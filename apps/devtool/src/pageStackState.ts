export type SavedPageStackEntry = {
  path: string;
  query: Record<string, string>;
  pageId?: string;
  data?: Record<string, unknown>;
  savedExitState?: unknown;
  exitState?: unknown;
};

/**
 * The value a recreated page should see as `this.exitState`: the most recent
 * save wins over the state loaded by the previous page instance.
 */
export function launchExitState(entry: SavedPageStackEntry | undefined): unknown {
  if (!entry) return undefined;
  if (entry.savedExitState !== undefined && entry.savedExitState !== null) {
    return entry.savedExitState;
  }
  return Object.prototype.hasOwnProperty.call(entry, 'exitState')
    ? entry.exitState
    : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sameQuery(left: Record<string, string>, right: Record<string, string>): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key, index) => key === rightKeys[index] && left[key] === right[key]);
}

function sameRoute(left: SavedPageStackEntry, right: SavedPageStackEntry): boolean {
  return left.path === right.path && sameQuery(left.query, right.query);
}

/**
 * Runtime state only carries page identity, not page data. Keep the payload
 * captured by Snapshot/Reload when the same live page reports its route again.
 * A new page id is a new page instance (redirect/reload), so stale data must not
 * leak into it. Legacy entries without ids may fall back to their stack slot.
 */
export function mergeSavedPageStack(
  current: SavedPageStackEntry[],
  saved: SavedPageStackEntry[],
): SavedPageStackEntry[] {
  const used = new Set<number>();
  return current.map((entry, index) => {
    let match = -1;
    if (entry.pageId) {
      match = saved.findIndex((candidate, candidateIndex) => (
        !used.has(candidateIndex)
        && candidate.pageId === entry.pageId
        && sameRoute(candidate, entry)
      ));
    }
    if (match < 0 && saved[index] && !saved[index]!.pageId) {
      if (!used.has(index) && sameRoute(saved[index]!, entry)) match = index;
    }
    if (match < 0) {
      match = saved.findIndex((candidate, candidateIndex) => (
        !used.has(candidateIndex)
        && !candidate.pageId
        && sameRoute(candidate, entry)
      ));
    }
    if (match < 0) return { ...entry, query: { ...entry.query } };

    used.add(match);
    const previous = saved[match]!;
    return {
      ...entry,
      query: { ...entry.query },
      ...(isPlainObject(previous.data) ? { data: previous.data } : {}),
      ...(Object.prototype.hasOwnProperty.call(previous, 'savedExitState')
        ? { savedExitState: previous.savedExitState }
        : {}),
      ...(Object.prototype.hasOwnProperty.call(previous, 'exitState')
        ? { exitState: previous.exitState }
        : {}),
    };
  });
}
