import { bootTreeThread, resolveAssetPath } from '@tiny/runtime'
import {
  installOffscreenCanvasResponder,
  listenForRuntimePort,
} from '@tiny/host-browser'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
  createGlassRenderTree,
} from '@tiny/host-web-components'

installOffscreenCanvasResponder()

const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined

listenForRuntimePort('render', (transport) => {
  const style = document.createElement('style')
  style.setAttribute('data-tiny-tree-styles', '')
  style.textContent = [
    BUILTIN_BASE_STYLES,
    BUILTIN_HOST_STYLES,
    ...BUILTIN_COMPONENT_STYLES.map((item) => (
      typeof item === 'string' ? item : item.content
    )),
  ].join('\n')
  document.head.appendChild(style)
  const renderer = createGlassRenderTree({
    container: document.getElementById('app') ?? document.body,
    resolveAssetUrl: (src, sourcePath) => {
      const resolved = resolveAssetPath(sourcePath || '', src)
      return resolved ? `/generated/${resolved}` : undefined
    },
  })
  bootTreeThread({ transport, renderer, initialPageId })
})
