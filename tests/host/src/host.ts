import init, { WasmHostCore } from '@tiny/host-core-wasm'
import { WasmBrowserHost } from '@tiny/host-browser'
import manifest from '../generated/manifest.json'

const search = new URLSearchParams(window.location.search)
const initialPath = search.get('path') || manifest.pages[0]?.path || ''

await init()
const wasmHost = new WasmBrowserHost({
  appId: 'test-host',
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath,
  container: document.getElementById('app') ?? document.body,
  systemInfo: {
    pixelRatio: window.devicePixelRatio,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  },
}, async (config) => {
  const core = new WasmHostCore(config)
  return {
    start: (now) => core.start(now),
    handle_event: (event, now) => core.handle_event(event, now),
    set_app_visible: (visible) => core.set_app_visible(visible),
    page_stack_json: () => core.page_stack_json(),
    diagnostics_json: () => core.diagnostics_json(),
  }
})

await wasmHost.launch()
;(window as unknown as Record<string, unknown>).__tinyRuntime = {
  host: wasmHost,
}
