import * as glassEasel from 'glass-easel'
import { CurrentWindowBackendContext } from 'glass-easel'
import { bootRenderThread, listenForRuntimePort } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

const renderModule = await import('../generated/render.js')
const styles = Object.fromEntries(
  await Promise.all(
    manifest.styles.map(async (style) => {
      const response = await fetch(`/generated/${style.outputPath}?direct`)
      return [style.outputPath, await response.text()]
    }),
  ),
)

const backend = new CurrentWindowBackendContext()
backend.onEvent(glassEasel.Event.triggerBackendEvent)

listenForRuntimePort('render', (transport) => {
  bootRenderThread({
    transport,
    manifest,
    artifacts: { templates: renderModule.default.templates },
    backend,
    initialPath: 'pages/todos/todos',
    loadStyle: (path) => styles[path] ?? '',
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
