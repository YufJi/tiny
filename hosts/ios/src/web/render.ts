import { resolveAssetPath } from '@tiny/runtime'
import { bootBrowserRenderEntry } from '@tiny/host-browser'
import { createGlassRenderEntry } from '@tiny/host-web-components'
import type { TreeRenderer } from '@tiny/runtime'
import { installRemoteCanvas } from './canvas'
import { bootNativeRenderEntry } from './render-native'

const params = new URLSearchParams(window.location.search)
const appId = params.get('app') ?? ''
const assetsBase = new URL(
  `../apps/${encodeURIComponent(appId)}/assets/`,
  window.location.href,
).href

installRemoteCanvas()

const renderer = createGlassRenderEntry({
  container: document.getElementById('app') ?? document.body,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    if (!resolved) return undefined
    return assetsBase + resolved.split('/').map(encodeURIComponent).join('/')
  },
}) as TreeRenderer

if (params.get('native') === '1') {
  bootNativeRenderEntry({
    pageId: params.get('pageId') ?? undefined,
    renderer,
  })
} else {
  bootBrowserRenderEntry(renderer)
}
