import type { BridgeConnection } from '@tiny/bridge'
import { cloneJsonSafe } from './data'
import type {
  HostApiHandler,
  HostApiHandlers,
  HostApiParams,
  RuntimeHostOptions,
  StorageSnapshot,
  SystemInfoSnapshot,
} from './types'

export type HostApiRegistry = {
  systemInfo: SystemInfoSnapshot
  storage: StorageSnapshot
  handlers: HostApiHandlers
}

export function createHostApiRegistry(options: RuntimeHostOptions): HostApiRegistry {
  const systemInfo: SystemInfoSnapshot = {
    pixelRatio: options.systemInfo?.pixelRatio ?? 1,
    windowWidth: options.systemInfo?.windowWidth ?? 0,
    windowHeight: options.systemInfo?.windowHeight ?? 0,
    ...options.systemInfo,
  }
  const storage: StorageSnapshot = cloneJsonSafe(options.storage ?? {})
  const handlers: HostApiHandlers = {
    'system.info': () => cloneJsonSafe(systemInfo),
    'storage.get': (params) => ({
      value: cloneJsonSafe(storage[String(params.key)]),
    }),
    'storage.set': (params) => {
      storage[String(params.key)] = cloneJsonSafe(params.value)
      return { errMsg: 'setStorageSync:ok' }
    },
    'toast.show': () => ({ errMsg: 'showToast:ok' }),
    'navigate.to': () => ({ errMsg: 'navigateTo:ok' }),
    'navigate.back': () => ({ errMsg: 'navigateBack:ok' }),
    ...options.apiHandlers,
  }
  return { systemInfo, storage, handlers }
}

export function registerHostApiHandlers(
  connection: BridgeConnection,
  registry: HostApiRegistry,
): void {
  for (const [method, handler] of Object.entries(registry.handlers)) {
    if (typeof handler !== 'function') continue
    connection.onCall('api', method, (message) => {
      const apiHandler = handler as HostApiHandler
      const params = (message.payload ?? {}) as HostApiParams
      return apiHandler(params, { pageId: message.pageId })
    })
  }
}
