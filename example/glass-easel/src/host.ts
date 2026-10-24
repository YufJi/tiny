import { createStandaloneDualThreadHost } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

const initialPath = new URLSearchParams(window.location.search).get('path') || 'pages/todos/todos'

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
