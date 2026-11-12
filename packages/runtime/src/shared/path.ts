function normalizePath(path: string): string {
  const output: string[] = []
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') continue
    if (segment === '..') output.pop()
    else output.push(segment)
  }
  return output.join('/')
}

/**
 * Resolve a component/page reference against the directory of its owner.
 *
 * A leading `/` is an app-root path; `./` and `../` are resolved against the
 * directory that contains `sourcePath`.
 */
export function resolveComponentReference(sourcePath: string, reference: string): string {
  const posix = (value: string) => value.split('\\').join('/')
  if (reference.startsWith('/')) return normalizePath(reference.slice(1))
  const directory = posix(sourcePath).split('/').slice(0, -1)
  return normalizePath([
    ...directory,
    ...posix(reference).split('/'),
  ].join('/'))
}
