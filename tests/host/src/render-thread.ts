import { resolveAssetReference } from '@tiny/runtime'
import type { TemplateRegistry } from '@tiny/runtime'
import { bootRenderEntry } from '@tiny/host-web'
import { currentAppId, generatedBaseFor, importGenerated } from './test-app'

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined
const pageFrame = new URLSearchParams(window.location.search).get('pageFrame') === '1'
const generatedBase = generatedBaseFor(currentAppId())

bootRenderEntry({
  pageId: initialPageId,
  pageFrame,
  loadTemplates: async () =>
    (await importGenerated<{ default: TemplateRegistry }>(`${generatedBase}/templates.js`)).default,
  resolveAssetUrl: (src, sourcePath) => {
    const reference = resolveAssetReference(sourcePath || '', src)
    return reference ? `${generatedBase}/${reference.path}${reference.suffix}` : undefined
  },
})
