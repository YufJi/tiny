import { bootServiceThread, listenForRuntimePort } from '@tiny/runtime'
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

listenForRuntimePort('service', (transport) => {
  bootServiceThread({
    transport,
    manifest,
    initialPath: 'pages/todos/todos',
    apiExtensions: createHostApiExtensions(),
    loadArtifacts: async () => {
      await import('../generated/service.js')
    },
  })
})
