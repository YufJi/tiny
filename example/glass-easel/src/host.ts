import { createStandaloneDualThreadHost } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

const runtime = await createStandaloneDualThreadHost({
  manifest,
  serviceUrl: '/service.html',
  renderUrl: '/render.html',
  initialPath: 'pages/index/index',
  initialData: { message: 'Hello glass-easel' },
})

await runtime.host.bootstrap()
