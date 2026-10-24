import { bootServiceThread } from '@tiny/runtime'
import {
  createBridgedCanvas,
  createLegacyCanvasContext,
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

installBrowserCanvasCompat()

listenForRuntimePort('service', (transport) => {
  bootServiceThread({
    transport,
    manifest,
    initialPath: 'pages/todos/todos',
    apiExtensions: createHostApiExtensions(),
    canvas: {
      createLegacyCanvasContext,
      createCanvasNode: (width, height, canvasId, send) => {
        const bridged = createBridgedCanvas(width, height, canvasId, send)
        return bridged?.canvas ?? null
      },
    },
    loadArtifacts: async () => {
      await import('../generated/service.js')
    },
  })
})
