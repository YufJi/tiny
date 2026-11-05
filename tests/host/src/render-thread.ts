import { resolveAssetPath } from '@tiny/runtime'
import { bootBrowserRenderEntry } from '@tiny/host-browser'
import { createGlassRenderEntry } from '@tiny/host-web-components'

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined

bootBrowserRenderEntry(createGlassRenderEntry({
  pageId: initialPageId,
  loadTemplates: async () => (await import('../generated/templates.js')).default,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    return resolved ? `/generated/${resolved}` : undefined
  },
}))
