import { BridgeConnection } from '@tiny/bridge'
import type { Transport } from '@tiny/bridge'

/** Test-side render entry: the host owns the connection, like the browser/iOS entries. */
export function createRenderConnection(transport: Transport): BridgeConnection {
  return new BridgeConnection({
    localRole: 'render',
    peerRole: 'host',
    transport,
    capabilities: { role: 'render', mode: 'tree' },
  })
}
