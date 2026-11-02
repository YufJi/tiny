import { resolveAssetPath } from '@tiny/runtime'
import { bootBrowserRenderEntry } from '@tiny/host-browser'
import { createGlassRenderEntry } from '@tiny/host-web-components'
import { installRemoteCanvas } from './canvas'
import { bootNativeRenderEntry } from './render-native'

const params = new URLSearchParams(window.location.search)
const appId = params.get('app') ?? ''
const assetsBase = new URL(
  `../apps/${encodeURIComponent(appId)}/assets/`,
  window.location.href,
).href

installRemoteCanvas()

const entry = createGlassRenderEntry({
  container: document.getElementById('app') ?? document.body,
  resolveAssetUrl: (src, sourcePath) => {
    const resolved = resolveAssetPath(sourcePath || '', src)
    if (!resolved) return undefined
    return assetsBase + resolved.split('/').map(encodeURIComponent).join('/')
  },
})

if (params.get('native') === '1') {
  entry.prepare?.()
  bootNativeRenderEntry({
    pageId: params.get('pageId') ?? undefined,
    renderer: entry.createRenderer(),
  })
} else {
  bootBrowserRenderEntry(entry)
}
