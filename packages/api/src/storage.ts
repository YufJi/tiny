import type { MiniProgramApiHost, ServiceApiContext } from '@tiny/runtime'
import { cloneJsonSafe } from './json'
import { callHost, callHostSync, runApi } from './run-api'

type StorageInfo = {
  keys: string[]
  currentSize: number
  limitSize: number
  errMsg: string
}

function readStorageInfo(context: ServiceApiContext): StorageInfo {
  const info = callHostSync(context, 'storage.info') as Partial<StorageInfo> | undefined
  return {
    keys: Array.isArray(info?.keys) ? info.keys.map(String) : [],
    currentSize: Number(info?.currentSize ?? 0),
    limitSize: Number(info?.limitSize ?? 10240),
    errMsg: 'getStorageInfoSync:ok',
  }
}

function storageValue(context: ServiceApiContext, key: string): unknown {
  const result = callHostSync(context, 'storage.get', { key }) as { value?: unknown } | undefined
  return cloneJsonSafe(result?.value)
}

/**
 * `wx.*Storage*`.
 *
 * The host owns storage: the synchronous variants use the host's synchronous
 * channel and the asynchronous variants await a real `storage.*` round-trip.
 * The runtime keeps no storage snapshot, so a write from another context is
 * never hidden behind stale state.
 */
export function createStorageApi(context: ServiceApiContext): MiniProgramApiHost {
  return {
    getStorageSync: (key: unknown) => storageValue(context, String(key)),
    setStorageSync: (key: unknown, value: unknown) => {
      callHostSync(context, 'storage.set', {
        key: String(key),
        value: cloneJsonSafe(value),
      })
      return undefined
    },
    getStorage: (params: unknown = {}) => runApi(params, 'getStorage', async () => {
      const key = String((params as { key?: unknown }).key)
      const result = await callHost(context, 'storage.get', { key }) as { value?: unknown } | undefined
      return { data: cloneJsonSafe(result?.value), errMsg: 'getStorage:ok' }
    }),
    setStorage: (params: unknown = {}) => {
      const payload = (params ?? {}) as { key?: unknown; data?: unknown; value?: unknown }
      return runApi(params, 'setStorage', async () => {
        const key = String(payload.key)
        // WeChat's parameter is `data`; `value` stays accepted for callers that
        // used the engine's earlier spelling.
        const value = cloneJsonSafe(payload.data !== undefined ? payload.data : payload.value)
        await callHost(context, 'storage.set', { key, value })
        return { errMsg: 'setStorage:ok' }
      })
    },
    removeStorage: (params: unknown = {}) => runApi(params, 'removeStorage', async () => {
      const key = String((params as { key?: unknown }).key)
      await callHost(context, 'storage.remove', { key })
      return { errMsg: 'removeStorage:ok' }
    }),
    clearStorage: (params: unknown = {}) => runApi(params, 'clearStorage', async () => {
      await callHost(context, 'storage.clear')
      return { errMsg: 'clearStorage:ok' }
    }),
    getStorageInfo: (params: unknown = {}) => runApi(params, 'getStorageInfo', async () => {
      const info = await callHost(context, 'storage.info') as Partial<StorageInfo> | undefined
      return {
        keys: Array.isArray(info?.keys) ? info.keys.map(String) : [],
        currentSize: Number(info?.currentSize ?? 0),
        limitSize: Number(info?.limitSize ?? 10240),
        errMsg: 'getStorageInfo:ok',
      }
    }),
    getStorageInfoSync: () => readStorageInfo(context),
    removeStorageSync: (key: unknown) => {
      callHostSync(context, 'storage.remove', { key: String(key) })
      return undefined
    },
    clearStorageSync: () => {
      callHostSync(context, 'storage.clear')
      return undefined
    },
  }
}
