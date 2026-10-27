import * as glassEasel from 'glass-easel'
import { CurrentWindowBackendContext } from 'glass-easel'
import { bootRenderThread, bootTreeThread } from '@tiny/runtime'
import {
  createBrowserRenderQuery,
  installOffscreenCanvasResponder,
  listenForRuntimePort,
  measureBrowserCanvas,
} from '@tiny/host-browser'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
  createGlassRenderTree,
  webBuiltinComponents,
} from '@tiny/host-web-components'
import manifest from '../generated/manifest.json'

const renderModule = await import('../generated/render.js')
const stylePaths = [...new Set(manifest.styles.flatMap((style) => [
  style.outputPath,
  ...(style.lowPriorityPath ? [style.lowPriorityPath] : []),
]))]
const styles = Object.fromEntries(
  await Promise.all(
    stylePaths.map(async (stylePath) => {
      const response = await fetch(`/generated/${stylePath}?direct`)
      return [stylePath, await response.text()]
    }),
  ),
)

const backend = new CurrentWindowBackendContext()
backend.onEvent(glassEasel.Event.triggerBackendEvent)

const resolveAssetUrl = (assetPath: string): string => (
  `/generated/${assetPath.split('/').map(encodeURIComponent).join('/')}`
)

installOffscreenCanvasResponder()

const logicMode = new URLSearchParams(window.location.search).get('logic') === 'service'
const initialPageId = new URLSearchParams(window.location.search).get('pageId') ?? undefined

listenForRuntimePort('render', (transport) => {
  if (logicMode) {
    const style = document.createElement('style')
    style.setAttribute('data-tiny-tree-styles', '')
    style.textContent = [
      BUILTIN_BASE_STYLES,
      BUILTIN_HOST_STYLES,
      ...BUILTIN_COMPONENT_STYLES.map((item) => (
        typeof item === 'string' ? item : item.content
      )),
      ...Object.values(styles),
    ].join('\n')
    document.head.appendChild(style)
    const renderer = createGlassRenderTree({
      container: document.getElementById('app') ?? document.body,
    })
    bootTreeThread({ transport, renderer, initialPageId })
    return
  }
  bootRenderThread({
    transport,
    manifest,
    artifacts: { templates: renderModule.default.templates },
    backend,
    builtinComponents: webBuiltinComponents,
    initialPath: 'pages/todos/todos',
    loadStyle: (path) => styles[path] ?? '',
    resolveAssetUrl,
    canvas: {
      measure: measureBrowserCanvas,
    },
    query: createBrowserRenderQuery(),
    mountComponent: (component) => {
      const container = document.getElementById('app') ?? document.body
      const placeholder = document.createElement('div')
      container.appendChild(placeholder)
      glassEasel.Element.replaceDocumentElement(
        component as glassEasel.GeneralComponent,
        container,
        placeholder,
      )
    },
    unmountComponent: (component) => {
      const element = (component as glassEasel.GeneralComponent).getBackendElement?.()
      ;(element as unknown as { remove?: () => void } | null)?.remove?.()
    },
  })
})
