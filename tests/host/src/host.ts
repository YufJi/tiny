import init, { WasmHostCore } from '@tiny/host-core-wasm'
import {
  createEnvHandlers,
  createFileSystemHandlers,
  createPersistentStorage,
  HOST_CORE_API_KEYS,
} from '@tiny/host-web'
import { TestBrowserHost } from './test-host'
import {
  createTestHostApiHandlers,
  createTestHostSyncApiHandlers,
  TEST_HOST_UNSUPPORTED_KEYS,
} from './host-api'
import { generatedBaseFor, resolveTestApp } from './test-app'

const search = new URLSearchParams(window.location.search)
const { app, manifest } = await resolveTestApp(search.get('app'))
const initialPath = search.get('path') || manifest.pages[0]?.path || ''
let emitGlobalEvent: (name: string, payload?: unknown) => void = () => undefined
const persistent = createPersistentStorage(`tiny.storage.${app.id}`)
const generatedBase = generatedBaseFor(app.id)
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
const fileSystem = createFileSystemHandlers()
const env = createEnvHandlers()
const apiHandlers = createTestHostApiHandlers(storage, getSystemInfo, {
  appId: app.id,
  onStorageChange: persistent.flush,
  emitGlobalEvent: (name, payload) => emitGlobalEvent(name, payload),
  resolveWorkerUrl: (workerPath) => (
    `${generatedBase}/${workerPath.split('/').map(encodeURIComponent).join('/')}`
  ),
  fileSystem,
  env,
})
const syncApiHandlers = createTestHostSyncApiHandlers(storage, getSystemInfo, {
  appId: app.id,
  onStorageChange: persistent.flush,
  fileSystem,
  env,
})
const apiCapabilities = [
  ...Object.keys(apiHandlers),
  ...Object.keys(syncApiHandlers),
  ...HOST_CORE_API_KEYS,
].filter((key) => !TEST_HOST_UNSUPPORTED_KEYS.has(key))

const wasmHost = new TestBrowserHost({
  appId: app.id,
  manifest,
  // The service and render documents load the same fixture's artifacts; pass
  // the selection through their URLs because each iframe owns its module graph.
  serviceUrl: `/service.html?app=${encodeURIComponent(app.id)}`
    + `&apiCapabilities=${encodeURIComponent(apiCapabilities.join(','))}`,
  renderUrl: `/render.html?app=${encodeURIComponent(app.id)}`,
  initialPath,
  container: document.getElementById('app') ?? document.body,
  storage,
  apiHandlers,
  syncApiHandlers,
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
