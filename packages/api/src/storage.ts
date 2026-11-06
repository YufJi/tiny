import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { MiniProgramApiHost, ServiceApiContext, StorageSnapshot } from '@tiny/runtime'
import { cloneJsonSafe } from './json'
import { callHost, runApi } from './run-api'

function storageInfo(snapshot: StorageSnapshot): Record<string, unknown> {
  const keys = Object.keys(snapshot)
  return {
    keys,
    currentSize: JSON.stringify(snapshot).length,
    limitSize: 10240,
    errMsg: 'getStorageInfoSync:ok',
  }
}

/**
 * `wx.*Storage*`.
 *
 * The kernel keeps the in-memory snapshot so the sync variants stay
 * synchronous; persistence is the host's `storage.*` handlers. Write failures
 * are reported as structured diagnostics instead of thrown errors.
 */
export function createStorageApi(context: ServiceApiContext): MiniProgramApiHost {
  const reportWriteFailure = (key: string) => (error: unknown) => {
    context.connection.sendDiagnostic('error', {
      code: DIAGNOSTIC_CODES.API_STORAGE_WRITE_FAILED,
      message: error instanceof Error ? error.message : String(error),
      key,
    }, context.pageId)
  }
  return {
    getStorageSync: (key: unknown) => cloneJsonSafe(context.getStorageSnapshot()[String(key)]),
    setStorageSync: (key: unknown, value: unknown) => {
      const normalizedKey = String(key)
      const normalizedValue = cloneJsonSafe(value)
      context.setStorageSnapshot(normalizedKey, normalizedValue)
      void callHost(context, 'storage.set', { key: normalizedKey, value: normalizedValue })
        .catch(reportWriteFailure(normalizedKey))
      return undefined
    },
    getStorage: (params: unknown = {}) => runApi(params, 'getStorage', () => ({
      data: cloneJsonSafe(context.getStorageSnapshot()[String((params as { key?: unknown }).key)]),
      errMsg: 'getStorage:ok',
    })),
    setStorage: (params: unknown = {}) => {
      const payload = (params ?? {}) as { key?: unknown; data?: unknown; value?: unknown }
      return runApi(params, 'setStorage', async () => {
        const key = String(payload.key)
        // WeChat's parameter is `data`; `value` stays accepted for callers that
        // used the engine's earlier spelling.
        const value = cloneJsonSafe(payload.data !== undefined ? payload.data : payload.value)
        context.setStorageSnapshot(key, value)
        await callHost(context, 'storage.set', { key, value })
        return { errMsg: 'setStorage:ok' }
      })
    },
    removeStorage: (params: unknown = {}) => {
      const key = String((params as { key?: unknown }).key)
      return runApi(params, 'removeStorage', async () => {
        delete context.getStorageSnapshot()[key]
        await callHost(context, 'storage.remove', { key })
        return { errMsg: 'removeStorage:ok' }
      })
    },
    clearStorage: (params: unknown = {}) => runApi(params, 'clearStorage', async () => {
      const snapshot = context.getStorageSnapshot()
      for (const key of Object.keys(snapshot)) delete snapshot[key]
      await callHost(context, 'storage.clear')
      return { errMsg: 'clearStorage:ok' }
    }),
    getStorageInfo: (params: unknown = {}) => runApi(params, 'getStorageInfo', () => {
      const info = storageInfo(context.getStorageSnapshot())
      // The snapshot is authoritative; let the host observe the read without
      // letting a missing/optional handler fail the API.
      void callHost(context, 'storage.info').catch(() => undefined)
      return info
    }),
    getStorageInfoSync: () => storageInfo(context.getStorageSnapshot()),
    removeStorageSync: (key: unknown) => {
      delete context.getStorageSnapshot()[String(key)]
      void callHost(context, 'storage.remove', { key: String(key) }).catch(() => undefined)
    },
    clearStorageSync: () => {
      const snapshot = context.getStorageSnapshot()
      for (const key of Object.keys(snapshot)) delete snapshot[key]
      void callHost(context, 'storage.clear').catch(() => undefined)
    },
  }
}
