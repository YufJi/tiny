// Path utilities — mirrors src/path.rs exactly

/** Normalize a path by resolving '.' and '..' segments. */
export function normalize(path: string): string {
  const slices: string[] = []
  for (const slice of path.split('/')) {
    if (slice === '.') {
      // skip
    } else if (slice === '..') {
      slices.pop()
    } else {
      slices.push(slice)
    }
  }
  return slices.join('/')
}

/** Resolve `rel` relative to `base`, returning the normalized absolute path. */
export function resolve(base: string, rel: string): string {
  const slices: string[] = []
  let main: string
  if (rel.startsWith('/')) {
    main = rel.slice(1)
  } else {
    for (const slice of base.split('/')) {
      if (slice === '.') {
        // skip
      } else if (slice === '..') {
        slices.pop()
      } else {
        slices.push(slice)
      }
    }
    main = rel
  }
  slices.pop()
  for (const slice of main.split('/')) {
    if (slice === '.') {
      // skip
    } else if (slice === '..') {
      slices.pop()
    } else {
      slices.push(slice)
    }
  }
  return slices.join('/')
}
