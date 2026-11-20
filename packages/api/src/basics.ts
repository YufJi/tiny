import type { ApiContext, ApiHost } from './context'
import { callHost, runApi } from './run-api'

/**
 * Service-side runtime utilities: randomness, buffer URLs, idle scheduling and
 * the update manager.
 *
 * These need no platform backend, so they live in the service realm. The two
 * exceptions are honest about their environment: `getRandomValues` requires Web
 * Crypto (JavaScriptCore has none) and `createBufferURL` requires `Blob` +
 * `URL.createObjectURL`, so both fail loudly instead of returning fake data.
 */
export function createBasicsApi(context: ApiContext): ApiHost {
  return {
    getRandomValues: (params: unknown = {}) => runApi(params, 'getRandomValues', () => {
      const length = Math.floor(Number((params as { length?: unknown }).length ?? 0))
      if (!Number.isFinite(length) || length <= 0) {
        throw new Error('length must be a positive number')
      }
      const bytes = new Uint8Array(length)
      const webcrypto = (globalThis as {
        crypto?: { getRandomValues?: (array: Uint8Array) => unknown }
      }).crypto
      if (typeof webcrypto?.getRandomValues !== 'function') {
        throw new Error('Web Crypto is not available in this runtime')
      }
      webcrypto.getRandomValues(bytes)
      return { randomValues: bytes.buffer, errMsg: 'getRandomValues:ok' }
    }),
    createBufferURL: (buffer: unknown) => createBufferURL(buffer),
    revokeBufferURL: (url: unknown) => revokeBufferURL(url),
    requestIdleCallback: (callback: unknown, options?: unknown) => requestIdle(callback, options),
    cancelIdleCallback: (handle: unknown) => cancelIdle(handle),
    getUpdateManager: () => createUpdateManager(context),
  }
}

function createBufferURL(buffer: unknown): string {
  const BlobConstructor = (globalThis as { Blob?: typeof Blob }).Blob
  const urlApi = (globalThis as { URL?: typeof URL }).URL
  if (!BlobConstructor || typeof urlApi?.createObjectURL !== 'function') {
    throw new Error('createBufferURL is not available in this runtime')
  }
  const part = toArrayBufferPart(buffer)
  return urlApi.createObjectURL(new BlobConstructor([part]))
}

function toArrayBufferPart(buffer: unknown): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) return buffer
  if (ArrayBuffer.isView(buffer)) {
    const view = buffer as ArrayBufferView
    return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer
  }
  throw new Error('createBufferURL expects an ArrayBuffer or a typed array')
}

function revokeBufferURL(url: unknown): void {
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('revokeBufferURL expects a URL string')
  }
  const urlApi = (globalThis as { URL?: typeof URL }).URL
  if (typeof urlApi?.revokeObjectURL === 'function') urlApi.revokeObjectURL(url)
}

type IdleScheduler = {
  requestIdleCallback?: (callback: (deadline: unknown) => void, options?: unknown) => number
  cancelIdleCallback?: (handle: number) => void
  setTimeout: (callback: () => void, delay?: number) => number
  clearTimeout: (handle: number) => void
}

function requestIdle(callback: unknown, options?: unknown): number {
  if (typeof callback !== 'function') throw new Error('requestIdleCallback expects a function')
  const scheduler = globalThis as unknown as IdleScheduler
  if (typeof scheduler.requestIdleCallback === 'function') {
    return scheduler.requestIdleCallback(callback as (deadline: unknown) => void, options)
  }
  const timeout = Math.max(0, Number((options as { timeout?: unknown } | undefined)?.timeout ?? 0))
  return scheduler.setTimeout(() => {
    ;(callback as (deadline: unknown) => void)({ didTimeout: timeout > 0, timeRemaining: () => 0 })
  }, timeout)
}

function cancelIdle(handle: unknown): void {
  if (typeof handle !== 'number') return
  const scheduler = globalThis as unknown as IdleScheduler
  if (typeof scheduler.cancelIdleCallback === 'function') scheduler.cancelIdleCallback(handle)
  else scheduler.clearTimeout(handle)
}

type UpdateManagerHandle = {
  onCheckForUpdate(callback: (result: { hasUpdate: boolean }) => void): void
  onUpdateReady(callback: () => void): void
  onUpdateFailed(callback: (error: { errMsg: string }) => void): void
  applyUpdate(): void
}

/**
 * WeChat checks for a new base-library/app version on launch and tells the app
 * through this manager. A browser host has no update channel, so the host
 * answers `{ hasUpdate: false }`; the manager still reports it, which is the
 * truthful answer rather than a silent no-op.
 */
function createUpdateManager(context: ApiContext): UpdateManagerHandle {
  const checkListeners: Array<(result: { hasUpdate: boolean }) => void> = []
  const readyListeners: Array<() => void> = []
  const failedListeners: Array<(error: { errMsg: string }) => void> = []
  let started = false

  const check = (): void => {
    if (started) return
    started = true
    void callHost(context, 'update.check')
      .then((result) => {
        const hasUpdate = Boolean((result as { hasUpdate?: unknown } | null)?.hasUpdate)
        for (const listener of checkListeners) listener({ hasUpdate })
        if (hasUpdate) for (const listener of readyListeners) listener()
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        for (const listener of failedListeners) listener({ errMsg: `getUpdateManager:fail ${message}` })
      })
  }

  // Defer the check so the app can subscribe right after creating the manager.
  const scheduler = globalThis as unknown as { setTimeout: (callback: () => void, delay?: number) => number }
  scheduler.setTimeout(check, 0)

  return {
    onCheckForUpdate: (callback) => {
      if (typeof callback === 'function') checkListeners.push(callback)
    },
    onUpdateReady: (callback) => {
      if (typeof callback === 'function') readyListeners.push(callback)
    },
    onUpdateFailed: (callback) => {
      if (typeof callback === 'function') failedListeners.push(callback)
    },
    applyUpdate: () => {
      // Nothing to apply when the host reports no pending update.
    },
  }
}
