import type { BridgeConnection } from '@tiny/bridge'
import { cloneJsonSafe } from '../../../src/data'
import type {
  HostApiHandler,
  HostApiHandlers,
  HostApiParams,
  RuntimeHostOptions,
  StorageSnapshot,
  SystemInfoSnapshot,
} from '../../../src/types'
import type { SyncHostChannel } from '../../../src/service/types'

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
    'storage.remove': (params) => {
      delete storage[String(params.key)]
      return { errMsg: 'removeStorageSync:ok' }
    },
    'storage.clear': () => {
      for (const key of Object.keys(storage)) delete storage[key]
      return { errMsg: 'clearStorageSync:ok' }
    },
    'storage.info': () => {
      const keys = Object.keys(storage)
      return { keys, currentSize: JSON.stringify(storage).length, limitSize: 10240 }
    },
    'toast.show': () => ({ errMsg: 'showToast:ok' }),
    'navigate.to': () => ({ errMsg: 'navigateTo:ok' }),
    'navigate.switchTab': () => ({ errMsg: 'switchTab:ok' }),
    'navigate.back': () => ({ errMsg: 'navigateBack:ok' }),
    'navigate.redirectTo': () => ({ errMsg: 'redirectTo:ok' }),
    'navigate.reLaunch': () => ({ errMsg: 'reLaunch:ok' }),
    'page.pullDownRefresh': () => ({ errMsg: 'startPullDownRefresh:ok' }),
    'page.stopPullDownRefresh': () => ({ errMsg: 'stopPullDownRefresh:ok' }),
    ...options.apiHandlers,
  }
  return { systemInfo, storage, handlers }
}

/**
 * Synchronous host channel backed by the same handlers the async path uses.
 * The test host lives in the same realm, so `*Sync` APIs can exercise the real
 * host contract without a browser sync bridge.
 */
export function createHostSyncChannel(registry: HostApiRegistry): SyncHostChannel {
  return {
    call: (domain, method, payload) => {
      if (domain !== 'api') throw new Error(`unsupported sync host domain: ${domain}`)
      const handler = registry.handlers[method]
      if (typeof handler !== 'function') throw new Error(`unsupported sync host API: ${method}`)
      const result = handler(payload, {})
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        throw new Error(`sync host API ${method} returned a promise`)
      }
      return result
    },
  }
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
