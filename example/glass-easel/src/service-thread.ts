import { bootServiceThread, listenForRuntimePort } from '@tiny/runtime'
import manifest from '../generated/manifest.json'

listenForRuntimePort('service', (transport) => {
  bootServiceThread({
    transport,
    manifest,
    initialPath: 'pages/index/index',
  })
  void import('../generated/service.js')
})
