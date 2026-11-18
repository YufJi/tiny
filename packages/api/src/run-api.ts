import type { ApiContext } from './context'

export type ApiCallbacks = {
  success?: (value: unknown) => void
  fail?: (value: unknown) => void
  complete?: (value: unknown) => void
}

export function readCallbacks(params: unknown): ApiCallbacks {
  return (params ?? {}) as ApiCallbacks
}

/** WeChat completion callbacks run in the service realm, never in the host. */
const API_CALLBACK_KEYS = new Set(['success', 'fail', 'complete'])

/**
 * Copy API params for the bridge.
 *
 * The host owns platform behavior, so it receives the API arguments only: the
 * `success` / `fail` / `complete` callbacks stay in the service realm, where
 * `runApi` invokes them. Functions and `undefined` cannot cross a JSON bridge
 * at all (`assertJsonSafe` rejects them), and a third-party wrapper commonly
 * passes an extra completion function next to the WeChat ones — dropping every
 * top-level function keeps the call valid instead of failing the request.
 */
export function apiPayload(params: unknown): Record<string, unknown> {
  if (!params || typeof params !== 'object') return {}
  const payload: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (API_CALLBACK_KEYS.has(key)) continue
    if (value === undefined || typeof value === 'function') continue
    payload[key] = value
  }
  return payload
}

/** Run an API body against WeChat's `success` / `fail` / `complete` convention. */
export function runApi(
  params: unknown,
  apiName: string,
  task: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const callbacks = readCallbacks(params)
  return Promise.resolve()
    .then(task)
    .then((result) => {
      callbacks.success?.(result)
      callbacks.complete?.(result)
      return result
    })
    .catch((error) => {
      const result = {
        errMsg: `${apiName}:fail ${error instanceof Error ? error.message : String(error)}`,
      }
      callbacks.fail?.(result)
      callbacks.complete?.(result)
      return result
    })
}

/**
 * Forward one call to the host's `api` domain. The host owns the platform side
 * (DOM, fetch, clipboard, native bridge); the service side only names the
 * protocol method.
 */
export function callHost(
  context: ApiContext,
  method: string,
  payload: Record<string, unknown> = {},
): Promise<unknown> {
  return context.connection.call('api', method, apiPayload(payload), {
    pageId: context.pageId,
  })
}

/**
 * Call the host synchronously, for WeChat's `*Sync` variants.
 *
 * Delegates to `connection.callSync`; the connection fails when the host
 * handle has no synchronous path instead of falling back to cached state.
 */
export function callHostSync(
  context: ApiContext,
  method: string,
  payload: Record<string, unknown> = {},
): unknown {
  return context.connection.callSync('api', method, apiPayload(payload), {
    pageId: context.pageId,
  })
}