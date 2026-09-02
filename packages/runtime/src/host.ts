import { BridgeConnection } from '@tiny/bridge'
import type { RuntimeHostOptions } from './types'
import { createHostApiRegistry, registerHostApiHandlers } from './host-api'
import type { HostApiRegistry } from './host-api'

export type TinyRuntimeHost = {
  service: BridgeConnection
  render: BridgeConnection
  bootstrap(): Promise<{ service: unknown; render: unknown }>
  close(): Promise<void>
  apiRegistry: HostApiRegistry
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
  const apiRegistry = createHostApiRegistry(options)
  registerHostApiHandlers(service, apiRegistry)
  render.onEvent('event', 'dispatch', (message) => {
    service.sendEvent('event', 'dispatch', message.payload, { pageId: message.pageId })
  })
  render.onEvent('runtime', 'componentLifecycle', (message) => {
    service.sendEvent('runtime', 'componentLifecycle', message.payload)
  })
  render.onEvent('runtime', 'componentPageLifetime', (message) => {
    service.sendEvent('runtime', 'componentPageLifetime', message.payload)
  })
  service.onEvent('event', 'trigger', (message) => {
    render.sendEvent('event', 'trigger', message.payload)
  })
  service.onEvent('data', 'setData', (message) => {
    render.sendEvent('data', 'setData', message.payload, { pageId: message.pageId })
  })

    return {
    service,
    render,
    apiRegistry,
    async bootstrap() {
      const serviceResult = await service.control<Record<string, unknown>>('runtime', 'bootstrap', {
        manifest: options.manifest,
        initialPath: options.initialPath,
        systemInfo: apiRegistry.systemInfo,
        storage: apiRegistry.storage,
      })
      const initialData = (serviceResult.initialData as Record<string, unknown> | undefined) ?? options.initialData
      const pageId = serviceResult.pageId as string | undefined
      const componentSchemas = serviceResult.componentSchemas as import('./types').MiniProgramComponentSchema[] | undefined
      const renderResult = await render.control<Record<string, unknown>>('runtime', 'bootstrap', {
        manifest: options.manifest,
        initialPath: options.initialPath,
        initialData,
        pageId,
        componentSchemas,
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
