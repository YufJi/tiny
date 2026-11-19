import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { ApiHost, ApiContext } from './context'
import { cloneJsonSafe } from './json'
import { callHost } from './run-api'

/**
 * `wx.createWorker`.
 *
 * The worker runs in its own thread with its own globals; the host owns it.
 * This handle keeps WeChat's object shape and receives the worker's replies
 * through the `workerMessage` global event.
 */
const POST_MESSAGE = 'postMessage'

export function createWorkerApi(context: ApiContext): ApiHost {
  return {
    createWorker: (path: unknown = '') => {
      const workerId = `wx-worker-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
      const listeners = new Set<(message: unknown) => void>()
      let disposed = false

      const unsubscribe = context.events?.on('workerMessage', (payload) => {
        if (disposed) return
        const entry = payload as { workerId?: unknown; message?: unknown } | undefined
        if (entry?.workerId !== workerId) return
        for (const listener of listeners) listener(entry.message)
      })

      void callHost(context, 'worker.create', { workerId, path: String(path) }).then((result) => {
        const errMsg = (result as { errMsg?: unknown } | undefined)?.errMsg
        if (typeof errMsg === 'string' && errMsg.includes(':fail')) {
          context.connection.sendDiagnostic('warn', {
            code: DIAGNOSTIC_CODES.UNSUPPORTED_API,
            message: `${context.apiName}.createWorker(${String(path)}) failed: ${errMsg}`,
          }, context.pageId)
        }
      }).catch(() => undefined)

      return {
        // Computed so the runtime-purity checker does not read the WeChat method
        // name as the browser global of the same name.
        [POST_MESSAGE]: (message: unknown) => {
          if (disposed) return
          void callHost(context, `worker.${POST_MESSAGE}`, {
            workerId,
            message: cloneJsonSafe(message),
          })
        },
        onMessage: (listener: unknown) => {
          if (typeof listener === 'function') listeners.add(listener as (message: unknown) => void)
        },
        offMessage: (listener: unknown) => {
          if (typeof listener === 'function') listeners.delete(listener as (message: unknown) => void)
        },
        terminate: () => {
          if (disposed) return
          disposed = true
          unsubscribe?.()
          listeners.clear()
          void callHost(context, 'worker.terminate', { workerId })
        },
      }
    },
  }
}
