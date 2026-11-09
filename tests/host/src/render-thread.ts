import { resolveAssetPath } from '@tiny/runtime'
import type { TemplateRegistry } from '@tiny/runtime'
import { bootRenderEntry } from '@tiny/host-web'
import { currentAppId, generatedBaseFor, importGenerated } from './test-app'

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined
const generatedBase = generatedBaseFor(currentAppId())

bootRenderEntry({
  pageId: initialPageId,
  loadTemplates: async () =>
    (await importGenerated<{ default: TemplateRegistry }>(`${generatedBase}/templates.js`)).default,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    return resolved ? `${generatedBase}/${resolved}` : undefined
  },
})
