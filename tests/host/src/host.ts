import init, { WasmHostCore } from '@tiny/host-core-wasm'
import { TestBrowserHost } from './test-host'
import { createTestHostApiHandlers } from './host-api'
import manifest from '../generated/manifest.json'

const search = new URLSearchParams(window.location.search)
const initialPath = search.get('path') || manifest.pages[0]?.path || ''
const storage = {}

await init()
const wasmHost = new TestBrowserHost({
  appId: 'test-host',
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath,
  container: document.getElementById('app') ?? document.body,
  storage,
  apiHandlers: createTestHostApiHandlers(storage),
  systemInfo: {
    pixelRatio: window.devicePixelRatio,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    // WeChat always reports these; WeUI components read `system` directly.
    system: 'iOS 16.0',
    model: 'iPhone 13',
    brand: 'devtools',
    platform: 'devtools',
    statusBarHeight: 20,
  },
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
