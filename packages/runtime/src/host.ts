import { BridgeConnection } from '@tiny/bridge'
import type { RuntimeHostOptions } from './types'

export type TinyRuntimeHost = {
  service: BridgeConnection
  render: BridgeConnection
  bootstrap(): Promise<{ service: unknown; render: unknown }>
  close(): Promise<void>
}

export function createTinyRuntime(options: RuntimeHostOptions): TinyRuntimeHost {
  const service = new BridgeConnection({
    localRole: 'host',
    peerRole: 'service',
    transport: options.serviceTransport,
    respondToHello: false,
  })
  const render = new BridgeConnection({
    localRole: 'host',
    peerRole: 'render',
    transport: options.renderTransport,
    respondToHello: false,
  })

  return {
    service,
    render,
    async bootstrap() {
      const payload = {
        manifest: options.manifest,
        initialPath: options.initialPath,
        initialData: options.initialData,
      }
      const [serviceResult, renderResult] = await Promise.all([
        service.control<Record<string, unknown>>('runtime', 'bootstrap', payload),
        render.control<Record<string, unknown>>('runtime', 'bootstrap', payload),
      ])
      return { service: serviceResult, render: renderResult }
    },
    async close() {
      await Promise.all([service.close(), render.close()])
    },
  }
}
