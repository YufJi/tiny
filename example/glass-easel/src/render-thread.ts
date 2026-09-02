import { CurrentWindowBackendContext } from 'glass-easel'
import { bootRenderThread, listenForRuntimePort } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

listenForRuntimePort('render', async (transport) => {
  const renderModule = await import('../generated/render.js')
  const styles = Object.fromEntries(
    await Promise.all(
      manifest.styles.map(async (style) => {
        const response = await fetch(`/generated/${style.outputPath}`)
        return [style.outputPath, await response.text()]
      }),
    ),
  )

  bootRenderThread({
    transport,
    manifest,
    artifacts: { templates: renderModule.default.templates },
    backend: new CurrentWindowBackendContext(),
    initialPath: 'pages/todos/todos',
    loadStyle: (path) => styles[path] ?? '',
  })
})
