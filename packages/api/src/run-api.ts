import type { ApiContext } from './context'

export type ApiCallbacks = {
  success?: (value: unknown) => void
  fail?: (value: unknown) => void
  complete?: (value: unknown) => void
}

export function readCallbacks(params: unknown): ApiCallbacks {
  return (params ?? {}) as ApiCallbacks
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
  return context.connection.call('api', method, payload, { pageId: context.pageId })
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
  return context.connection.callSync('api', method, payload, { pageId: context.pageId })
}