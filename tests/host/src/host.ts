import { createStandaloneDualThreadHost } from '@tiny/host-browser'
import manifest from '../generated/manifest.json'

const search = new URLSearchParams(window.location.search)
const initialPath = search.get('path') || manifest.pages[0]?.path || ''

const runtime = await createStandaloneDualThreadHost({
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
})

;(window as unknown as Record<string, unknown>).__tinyRuntime = runtime

await runtime.host.bootstrap()
