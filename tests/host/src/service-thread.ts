import { bootServiceThread } from '@tiny/runtime'
import {
  createBrowserCanvasAdapter,
  installBrowserCanvasCompat,
  listenForRuntimePort,
} from '@tiny/host-browser'
import manifest from '../generated/manifest.json'

const createHostApiExtensions = () => ({
  getMenuButtonBoundingClientRect: () => {
    const width = typeof window === 'undefined' ? 375 : window.innerWidth
    return {
      width: 87,
      height: 32,
      top: 24,
      right: width - 10,
      bottom: 56,
      left: Math.max(0, width - 97),
    }
  },
  getPerformance: () => ({
    createObserver: () => ({
      observe() {},
      disconnect() {},
      connect() {},
    }),
    now: () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
    mark() {},
    measure() {},
    clearMarks() {},
    clearMeasures() {},
    getEntries: () => [],
    getEntriesByName: () => [],
    getEntriesByType: () => [],
  }),
})

const resolveAssetUrl = (assetPath: string): string => (
  `/generated/${assetPath.split('/').map(encodeURIComponent).join('/')}`
)

installBrowserCanvasCompat()

const logicLayer = new URLSearchParams(window.location.search).get('logic') === 'service'
  ? 'service' as const
  : undefined
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

listenForRuntimePort('service', (transport) => {

  bootServiceThread({
    transport,
    manifest,
    initialPath: 'pages/todos/todos',
    ...(logicLayer ? {
      logicLayer,
      loadTemplates: async () => (await import('../generated/templates.js')).default,
      loadStyle: (stylePath) => styles[stylePath] ?? '',
    } : {}),
    apiExtensions: createHostApiExtensions(),
    resolveAssetUrl,
    canvas: createBrowserCanvasAdapter(),
    loadArtifacts: async () => {
      await import('../generated/service.js')
    },
  })
})
