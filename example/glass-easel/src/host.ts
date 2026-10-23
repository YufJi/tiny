import { createStandaloneDualThreadHost } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
  container: document.getElementById('app') ?? document.body,
  systemInfo: {
    pixelRatio: window.devicePixelRatio,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  },
})

await runtime.host.bootstrap()

;(window as unknown as Record<string, unknown>).__tinyRuntime = runtime
