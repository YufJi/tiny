import type { ApiHost, ApiContext } from './context'
import { cloneJsonSafe } from './json'
import { callHost, callHostSync, runApi } from './run-api'

/** How often a file task asks the host for progress while it is in flight. */
const PROGRESS_POLL_MS = 50

type ProgressEvent = {
  progress: number
  totalBytesWritten: number
  totalBytesExpectedToWrite: number
}

type ProgressListener = (event: ProgressEvent) => void

/**
 * A file transfer task.
 *
 * WeChat exposes progress through task callbacks. The bridge only has
 * request/response calls today, so the service polls a host-side task record;
 * each task carries the id the host writes to, which keeps callbacks in the
 * service realm and lets `abort()` cancel the transfer.
 */
export type FileTaskHandle = {
  onProgressUpdate(listener: ProgressListener): void
  offProgressUpdate(listener: ProgressListener): void
  abort(): void
}

/**
 * Network and battery APIs. The host owns `fetch`, `navigator`, XHR and the
 * battery/navigator primitives; the service side keeps the mini-program call
 * shape (including task handles).
 */
export function createNetworkApi(context: ApiContext): ApiHost {
  return {
    getNetworkType: (params: unknown = {}) => runApi(params, 'getNetworkType', () => callHost(
      context,
      'network.type',
    )),
    getBatteryInfo: (params: unknown = {}) => runApi(params, 'getBatteryInfo', () => callHost(
      context,
      'battery.get',
    )),
    getBatteryInfoSync: () => cloneJsonSafe(callHostSync(context, 'battery.infoSync')),
    request: (params: unknown = {}) => {
      const options = (params ?? {}) as Record<string, unknown>
      const taskId = createTaskId()
      void runApi(params, 'request', () => callHost(context, 'network.request', { ...options, taskId }))
      return {
        abort: () => {
          void callHost(context, 'network.abortTask', { taskId })
        },
      }
    },
    uploadFile: (params: unknown = {}) => createFileTask(context, 'uploadFile', params),
    downloadFile: (params: unknown = {}) => createFileTask(context, 'downloadFile', params),
  }
}

function createTaskId(): string {
  return `wx-task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createFileTask(context: ApiContext, apiName: string, params: unknown): FileTaskHandle {
  const options = (params ?? {}) as Record<string, unknown>
  const taskId = createTaskId()
  const listeners = new Set<ProgressListener>()
  let settled = false
  let timer: ReturnType<typeof setInterval> | undefined
  let lastWritten = -1

  const stop = (): void => {
    settled = true
    if (timer !== undefined) {
      clearInterval(timer)
      timer = undefined
    }
  }

  const applyProgress = (value: unknown): void => {
    if (settled) return
    const record = (value ?? {}) as { loaded?: unknown; total?: unknown; done?: unknown }
    const written = Number(record.loaded ?? 0)
    const total = Number(record.total ?? 0)
    if (written !== lastWritten) {
      lastWritten = written
      const event: ProgressEvent = {
        progress: total > 0 ? Math.min(100, Math.round((written / total) * 100)) : 0,
        totalBytesWritten: written,
        totalBytesExpectedToWrite: total,
      }
      for (const listener of listeners) listener(event)
    }
    if (record.done === true) stop()
  }

  const poll = (): void => {
    if (settled) return
    void callHost(context, 'network.taskProgress', { taskId })
      .then(applyProgress)
      .catch(() => stop())
  }

  timer = setInterval(poll, PROGRESS_POLL_MS)
  // `setInterval` may keep a node test process alive if the host never settles.
  ;(timer as unknown as { unref?: () => void }).unref?.()

  const transfer = runApi(params, apiName, () => callHost(
    context,
    `network.${apiName}`,
    { ...options, taskId },
  ))
  // Emit one final progress reading so listeners see the completed byte count.
  void transfer.finally(async () => {
    if (!settled) {
      try {
        applyProgress(await callHost(context, 'network.taskProgress', { taskId }))
      } catch {
        // A failed progress read must not hide the transfer result.
      }
    }
    stop()
  })

  return {
    onProgressUpdate: (listener) => {
      if (typeof listener === 'function') listeners.add(listener)
    },
    offProgressUpdate: (listener) => {
      listeners.delete(listener)
    },
    abort: () => {
      void callHost(context, 'network.abortTask', { taskId })
      stop()
    },
  }
}
