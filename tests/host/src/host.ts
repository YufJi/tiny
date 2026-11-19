import init, { WasmHostCore } from '@tiny/host-core-wasm'
import { createPersistentStorage } from '@tiny/host-web'
import { TestBrowserHost } from './test-host'
import { createTestHostApiHandlers, createTestHostSyncApiHandlers } from './host-api'
import { resolveTestApp } from './test-app'

const search = new URLSearchParams(window.location.search)
const { app, manifest } = await resolveTestApp(search.get('app'))
const initialPath = search.get('path') || manifest.pages[0]?.path || ''
let emitGlobalEvent: (name: string, payload?: unknown) => void = () => undefined
const persistent = createPersistentStorage(`tiny.storage.${app.id}`)
const storage = persistent.values
const baseSystemInfo = {
  SDKVersion: '3.17.5',
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
  container: document.getElementById('app') ?? document.body,
  storage,
  apiHandlers: createTestHostApiHandlers(storage, getSystemInfo, {
    appId: app.id,
    onStorageChange: persistent.flush,
    emitGlobalEvent: (name, payload) => emitGlobalEvent(name, payload),
  }),
  syncApiHandlers: createTestHostSyncApiHandlers(storage, getSystemInfo, {
    appId: app.id,
    onStorageChange: persistent.flush,
  }),
}, async (config) => {
  const core = new WasmHostCore(config)
  return {
    start: (now) => core.start(now),
    handle_event: (event, now) => core.handle_event(event, now),
  }
})

emitGlobalEvent = (name, payload) => wasmHost.emitGlobalEvent(name, payload)
await wasmHost.launch()
;(window as unknown as Record<string, unknown>).__tinyRuntime = {
  host: wasmHost,
}
