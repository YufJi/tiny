import type { ApiHost, ApiContext } from './context'
import { cloneJsonSafe } from './json'
import { callHost, callHostSync, runApi } from './run-api'

type StorageInfo = {
  keys: string[]
  currentSize: number
  limitSize: number
  errMsg: string
}

function readStorageInfo(context: ApiContext): StorageInfo {
  const info = callHostSync(context, 'storage.info') as Partial<StorageInfo> | undefined
  return {
    keys: Array.isArray(info?.keys) ? info.keys.map(String) : [],
    currentSize: Number(info?.currentSize ?? 0),
    limitSize: Number(info?.limitSize ?? 10240),
    errMsg: 'getStorageInfoSync:ok',
  }
}

function storageValue(context: ApiContext, key: string): unknown {
  const result = callHostSync(context, 'storage.get', { key }) as { value?: unknown } | undefined
  return cloneJsonSafe(result?.value)
}

function readKeyList(value: unknown): string[] {
  const source = Array.isArray(value) ? value : (value as { keyList?: unknown } | undefined)?.keyList
  return Array.isArray(source) ? source.map(String) : []
}

function readKvList(value: unknown): Array<{ key: string; value: unknown }> {
  const source = Array.isArray(value) ? value : (value as { kvList?: unknown } | undefined)?.kvList
  if (!Array.isArray(source)) return []
  return source.map((entry) => {
    const item = (entry ?? {}) as { key?: unknown; value?: unknown }
    return { key: String(item.key), value: cloneJsonSafe(item.value) }
  })
}

/**
 * `wx.*Storage*`.
 *
 * The host owns storage: the synchronous variants use the host's synchronous
 * channel and the asynchronous variants await a real `storage.*` round-trip.
 * The runtime keeps no storage snapshot, so a write from another context is
 * never hidden behind stale state.
 */
export function createStorageApi(context: ApiContext): ApiHost {
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
    batchGetStorage: (params: unknown = {}) => runApi(params, 'batchGetStorage', async () => {
      const keyList = readKeyList(params)
      const result = await callHost(context, 'storage.batchGet', { keyList }) as { dataList?: unknown } | undefined
      return { dataList: cloneJsonSafe(result?.dataList ?? []), errMsg: 'batchGetStorage:ok' }
    }),
    batchGetStorageSync: (keyList: unknown) => {
      const result = callHostSync(context, 'storage.batchGet', {
        keyList: readKeyList(keyList),
      }) as { dataList?: unknown } | undefined
      return cloneJsonSafe(result?.dataList ?? [])
    },
    batchSetStorage: (params: unknown = {}) => runApi(params, 'batchSetStorage', async () => {
      await callHost(context, 'storage.batchSet', { kvList: readKvList(params) })
      return { errMsg: 'batchSetStorage:ok' }
    }),
    batchSetStorageSync: (kvList: unknown) => {
      callHostSync(context, 'storage.batchSet', { kvList: readKvList(kvList) })
      return undefined
    },
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
