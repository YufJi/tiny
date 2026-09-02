import { createStandaloneDualThreadHost } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/todos/todos',
})

await runtime.host.bootstrap()
