import { resolveAssetPath } from '@tiny/runtime'
import {
  installOffscreenCanvasResponder,
  listenForRuntimePort,
} from '@tiny/host-browser'
import { bootGlassRenderEntry } from '@tiny/host-web-components'

installOffscreenCanvasResponder()

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined

listenForRuntimePort('render', (transport) => {
  bootGlassRenderEntry({
    transport,
    pageId: initialPageId,
    resolveAssetUrl: (src, sourcePath) => {
      const resolved = resolveAssetPath(sourcePath || '', src)
      return resolved ? `/generated/${resolved}` : undefined
    },
  })
})
