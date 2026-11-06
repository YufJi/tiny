import { bootServiceEntry } from '@tiny/host-web'
import manifest from '../generated/manifest.json'

// Device identity is a host fact here: the service iframe has no viewport, so
// it mirrors the geometry the test host declares in `host.ts`.
const HOST_DEVICE = {
  SDKVersion: '3.0.0',
  brand: 'devtools',
  model: 'iPhone 13',
  system: 'iOS 16.0',
  platform: 'devtools',
  statusBarHeight: 20,
}

const createHostApiExtensions = () => ({
  getDeviceInfo: () => ({ ...HOST_DEVICE }),
  getWindowInfo: () => ({
    ...HOST_DEVICE,
    pixelRatio: 2,
    screenWidth: 390,
    screenHeight: 844,
    windowWidth: 390,
    windowHeight: 844,
    safeArea: { top: 20, bottom: 844, left: 0, right: 390, width: 390, height: 824 },
  }),
  getAppBaseInfo: () => ({
    SDKVersion: HOST_DEVICE.SDKVersion,
    language: 'zh_CN',
    version: '8.0.0',
    theme: 'light',
    host: 'WeChat',
    enableDebug: false,
  }),
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

bootServiceEntry({
  manifest,
  initialPath: manifest.pages[0]?.path ?? '',
  loadTemplates: async () => (await import('../generated/templates.js')).default,
  loadStyle: (stylePath) => styles[stylePath] ?? '',
  apiExtensions: createHostApiExtensions(),
  resolveAssetUrl,
  loadArtifacts: async () => {
    await import('../generated/service.js')
  },
})
