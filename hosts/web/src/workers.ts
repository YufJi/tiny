/**
 * `wx.createWorker` for a browser host.
 *
 * Worker scripts are shipped verbatim by the compiler under `app.json.workers`.
 * The host wraps each script with a small bootstrap that provides the `worker`
 * global WeChat exposes (`worker.onMessage` / `worker.postMessage`), runs it in
 * a real Web Worker, and relays messages to the service as `workerMessage`
 * global events.
 *
 * Worker code cannot import the service modules; it gets its own thread, its own
 * globals and only the message channel — same as WeChat.
 */

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

export type WorkerHandlerOptions = {
  /** Turn a mini-program path such as `workers/fib/index.js` into a URL. */
  resolveWorkerUrl: (path: string) => string
  /** Relay a worker reply as a service global event. */
  emit: (name: string, payload?: unknown) => void
  /** Test seam: load the script text. */
  fetchSource?: (url: string) => Promise<string>
  /** Test seam: build the running worker from the wrapped source. */
  spawn?: (source: string) => WorkerLike
}

type WorkerLike = {
  postMessage(message: unknown): void
  terminate(): void
  onmessage: ((event: { data?: unknown }) => void) | null
}

/** The `worker` global WeChat worker scripts expect. */
export const WORKER_BOOTSTRAP = `;(function () {
  var listeners = []
  globalThis.worker = {
    onMessage: function (callback) { if (typeof callback === 'function') listeners.push(callback) },
    postMessage: function (data) { globalThis.postMessage({ __tinyWorker: true, data: data }) },
    terminate: function () {}
  }
  globalThis.onmessage = function (event) {
    var payload = event && event.data && event.data.__tinyWorkerHost ? event.data.data : (event ? event.data : undefined)
    for (var index = 0; index < listeners.length; index++) listeners[index](payload)
  }
})()
`

export function wrapWorkerSource(source: string): string {
  return `${WORKER_BOOTSTRAP}\n${source}`
}

export function createWorkerHandlers(
  options: WorkerHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const workers = new Map<string, WorkerLike>()
  const pending = new Map<string, unknown[]>()
  const fetchSource = options.fetchSource ?? defaultFetchSource
  const spawn = options.spawn ?? defaultSpawn

  const reply = (workerId: string, event: { data?: unknown }): void => {
    const envelope = event.data as { __tinyWorker?: boolean; data?: unknown } | undefined
    const message = envelope && envelope.__tinyWorker ? envelope.data : event.data
    options.emit('workerMessage', { workerId, message })
  }

  return {
    'worker.create': async (params) => {
      const workerId = String(params.workerId ?? '')
      const path = String(params.path ?? '')
      if (!workerId || !path) return { errMsg: 'createWorker:fail workerId and path are required' }
      try {
        const source = await fetchSource(options.resolveWorkerUrl(path))
        const worker = spawn(wrapWorkerSource(source))
        worker.onmessage = (event) => reply(workerId, event)
        workers.set(workerId, worker)
        const queued = pending.get(workerId) ?? []
        pending.delete(workerId)
        for (const message of queued) worker.postMessage({ __tinyWorkerHost: true, data: message })
        return { errMsg: 'createWorker:ok' }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return { errMsg: `createWorker:fail ${message}` }
      }
    },
    'worker.postMessage': (params) => {
      const workerId = String(params.workerId ?? '')
      const worker = workers.get(workerId)
      if (worker) {
        worker.postMessage({ __tinyWorkerHost: true, data: params.message })
        return { errMsg: 'postMessage:ok' }
      }
      // The worker may still be loading; keep the last messages so an early
      // postMessage is not silently lost.
      const queue = pending.get(workerId) ?? []
      queue.push(params.message)
      if (queue.length > 100) queue.shift()
      pending.set(workerId, queue)
      return { errMsg: 'postMessage:ok' }
    },
    'worker.terminate': (params) => {
      const workerId = String(params.workerId ?? '')
      workers.get(workerId)?.terminate()
      workers.delete(workerId)
      pending.delete(workerId)
      return { errMsg: 'terminateWorker:ok' }
    },
  }
}

async function defaultFetchSource(url: string): Promise<string> {
  if (typeof fetch !== 'function') throw new Error('fetch is not available in this runtime')
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.text()
}

function defaultSpawn(source: string): WorkerLike {
  if (typeof Worker === 'undefined') throw new Error('Web Workers are not available in this runtime')
  const blob = new Blob([source], { type: 'text/javascript' })
  const worker = new Worker(URL.createObjectURL(blob))
  return worker as unknown as WorkerLike
}
