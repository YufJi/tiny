import type { PageArtifact } from '@tiny/manifest'
import type { ServiceThreadOptions } from '../types'
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
  if (reference.startsWith('/')) return reference.slice(1)
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

export function normalizeRoutePath(path: string): string {
  return path.split('\\').join('/').replace(/^\.?\//, '').replace(/\/+$/, '')
}

