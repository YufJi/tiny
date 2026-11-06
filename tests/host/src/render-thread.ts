import { resolveAssetPath } from '@tiny/runtime'
import { bootRenderEntry } from '@tiny/host-web'

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined

bootRenderEntry({
  pageId: initialPageId,
  loadTemplates: async () => (await import('../generated/templates.js')).default,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    return resolved ? `/generated/${resolved}` : undefined
  },
})
