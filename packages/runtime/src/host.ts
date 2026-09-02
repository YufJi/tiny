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
  render.onEvent('event', 'dispatch', (message) => {
    service.sendEvent('event', 'dispatch', message.payload, { pageId: message.pageId })
  })
  service.onEvent('data', 'setData', (message) => {
    render.sendEvent('data', 'setData', message.payload, { pageId: message.pageId })
  })

  return {
    service,
    render,
    async bootstrap() {
      const serviceResult = await service.control<Record<string, unknown>>('runtime', 'bootstrap', {
        manifest: options.manifest,
        initialPath: options.initialPath,
      })
      const initialData = (serviceResult.initialData as Record<string, unknown> | undefined) ?? options.initialData
      const pageId = serviceResult.pageId as string | undefined
      const renderResult = await render.control<Record<string, unknown>>('runtime', 'bootstrap', {
        manifest: options.manifest,
        initialPath: options.initialPath,
        initialData,
        pageId,
      })
      if (pageId) {
        await service.control('page', 'ready', { pageId })
      }
      return { service: serviceResult, render: renderResult }
    },
    async close() {
      await Promise.all([service.close(), render.close()])
    },
  }
}
