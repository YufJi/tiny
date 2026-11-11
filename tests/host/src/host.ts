import init, { WasmHostCore } from '@tiny/host-core-wasm'
import { TestBrowserHost } from './test-host'
import { createTestHostApiHandlers, createTestHostSyncApiHandlers } from './host-api'
import { resolveTestApp } from './test-app'

const search = new URLSearchParams(window.location.search)
const { app, manifest } = await resolveTestApp(search.get('app'))
const initialPath = search.get('path') || manifest.pages[0]?.path || ''
const storage = {}
const baseSystemInfo = {
  SDKVersion: '3.0.0',
  // WeChat always reports these; WeUI components read `system` directly.
  system: 'iOS 16.0',
  model: 'iPhone 13',
  brand: 'devtools',
  platform: 'devtools',
  statusBarHeight: 20,
}
const getSystemInfo = () => ({
  ...baseSystemInfo,
  pixelRatio: window.devicePixelRatio,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
})

await init()
const wasmHost = new TestBrowserHost({
  appId: app.id,
  manifest,
  // The service and render documents load the same fixture's artifacts; pass
  // the selection through their URLs because each iframe owns its module graph.
  serviceUrl: `/service.html?app=${encodeURIComponent(app.id)}`,
  renderUrl: `/render.html?app=${encodeURIComponent(app.id)}`,
  initialPath,
  pageFrame: search.get('pageFrame') === '1',
  container: document.getElementById('app') ?? document.body,
  storage,
  apiHandlers: createTestHostApiHandlers(storage, getSystemInfo),
  syncApiHandlers: createTestHostSyncApiHandlers(storage, getSystemInfo),
}, async (config) => {
  const core = new WasmHostCore(config)
  return {
    start: (now) => core.start(now),
    handle_event: (event, now) => core.handle_event(event, now),
  }
})

await wasmHost.launch()
;(window as unknown as Record<string, unknown>).__tinyRuntime = {
  host: wasmHost,
}
