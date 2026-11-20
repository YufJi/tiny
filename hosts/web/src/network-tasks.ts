/**
 * Host-side file transfers with progress.
 *
 * The service creates a task id per transfer and polls `network.taskProgress`;
 * these handlers keep the bytes moving and publish `{ loaded, total, done }`.
 * Uploads go through XHR (the only browser API with upload progress), downloads
 * through a streamed fetch body.
 */
import type { TempFileRegistry } from './media-files'

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type TaskRecord = {
  loaded: number
  total: number
  done: boolean
  abort: () => void
}

export type NetworkHandlerOptions = {
  registry: TempFileRegistry
}

export function createNetworkHandlers(
  options: NetworkHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const tasks = new Map<string, TaskRecord>()
  return {
    'network.uploadFile': (params) => uploadFile(options.registry, tasks, params),
    'network.downloadFile': (params) => downloadFile(options.registry, tasks, params),
    'network.taskProgress': (params) => taskProgress(tasks, params),
    'network.abortTask': (params) => abortTask(tasks, params),
  }
}

function taskProgress(tasks: Map<string, TaskRecord>, params: HandlerParams): HandlerResult {
  const record = tasks.get(String(params.taskId ?? ''))
  if (!record) return { loaded: 0, total: 0, done: false }
  return { loaded: record.loaded, total: record.total, done: record.done }
}

function abortTask(tasks: Map<string, TaskRecord>, params: HandlerParams): HandlerResult {
  const record = tasks.get(String(params.taskId ?? ''))
  if (!record) return { errMsg: 'abortTask:ok' }
  record.abort()
  record.done = true
  return { errMsg: 'abortTask:ok' }
}

function uploadFile(
  registry: TempFileRegistry,
  tasks: Map<string, TaskRecord>,
  params: HandlerParams,
): Promise<HandlerResult> {
  const taskId = String(params.taskId ?? '')
  const filePath = String(params.filePath ?? '')
  const entry = registry.get(filePath)
  if (!entry) {
    return Promise.resolve({ errMsg: `uploadFile:fail temp file not found: ${filePath}` })
  }
  if (typeof XMLHttpRequest === 'undefined') {
    return Promise.resolve({ errMsg: 'uploadFile:fail XMLHttpRequest is not available in this runtime' })
  }
  const form = new FormData()
  form.append(String(params.name ?? 'file'), entry.blob, entry.name)
  const formData = params.formData
  if (formData && typeof formData === 'object') {
    for (const [key, value] of Object.entries(formData)) form.append(key, String(value))
  }
  const header = params.header
  const timeout = Number(params.timeout ?? 0)

  return new Promise<HandlerResult>((resolve) => {
    const xhr = new XMLHttpRequest()
    const record: TaskRecord = {
      loaded: 0,
      total: 0,
      done: false,
      abort: () => xhr.abort(),
    }
    tasks.set(taskId, record)
    xhr.open('POST', String(params.url ?? ''), true)
    if (header && typeof header === 'object') {
      for (const [key, value] of Object.entries(header)) xhr.setRequestHeader(key, String(value))
    }
    if (timeout > 0) xhr.timeout = timeout
    xhr.upload.onprogress = (event) => {
      record.loaded = event.loaded
      record.total = event.total
    }
    xhr.onload = () => {
      record.done = true
      record.loaded = record.total || record.loaded
      resolve({ data: xhr.responseText, statusCode: xhr.status, errMsg: 'uploadFile:ok' })
    }
    xhr.onerror = () => {
      record.done = true
      resolve({ errMsg: 'uploadFile:fail network error' })
    }
    xhr.ontimeout = () => {
      record.done = true
      resolve({ errMsg: 'uploadFile:fail timeout' })
    }
    xhr.onabort = () => {
      record.done = true
      resolve({ errMsg: 'uploadFile:fail abort' })
    }
    try {
      xhr.send(form)
    } catch (error) {
      record.done = true
      const message = error instanceof Error ? error.message : String(error)
      resolve({ errMsg: `uploadFile:fail ${message}` })
    }
  })
}

async function downloadFile(
  registry: TempFileRegistry,
  tasks: Map<string, TaskRecord>,
  params: HandlerParams,
): Promise<HandlerResult> {
  const taskId = String(params.taskId ?? '')
  const url = String(params.url ?? '')
  if (!url) return { errMsg: 'downloadFile:fail url is required' }
  const controller = typeof AbortController === 'undefined' ? undefined : new AbortController()
  const record: TaskRecord = {
    loaded: 0,
    total: 0,
    done: false,
    abort: () => controller?.abort(),
  }
  tasks.set(taskId, record)

  const header = params.header
  const timeout = Number(params.timeout ?? 0)
  const timer = timeout > 0 && controller ? setTimeout(() => controller.abort(), timeout) : undefined
  try {
    const response = await fetch(url, {
      headers: header && typeof header === 'object'
        ? Object.fromEntries(Object.entries(header).map(([key, value]) => [key, String(value)]))
        : undefined,
      signal: controller?.signal,
    })
    if (!response.ok) {
      record.done = true
      return { errMsg: `downloadFile:fail HTTP ${response.status}` }
    }
    record.total = Number(response.headers.get('content-length') ?? 0)
    const chunks: BlobPart[] = []
    const reader = response.body?.getReader()
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          chunks.push(value as unknown as BlobPart)
          record.loaded += value.byteLength
        }
      }
    } else {
      const buffer = await response.arrayBuffer()
      chunks.push(buffer)
      record.loaded = buffer.byteLength
      record.total = record.total || buffer.byteLength
    }
    record.done = true
    const entry = registry.add(new Blob(chunks), fileNameFromUrl(url))
    return { tempFilePath: entry.url, statusCode: response.status, errMsg: 'downloadFile:ok' }
  } catch (error) {
    record.done = true
    const message = error instanceof Error ? error.message : String(error)
    const reason = error instanceof Error && error.name === 'AbortError' ? 'abort' : message
    return { errMsg: `downloadFile:fail ${reason}` }
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

function fileNameFromUrl(url: string): string {
  const clean = url.split(/[?#]/)[0]
  const name = clean.slice(clean.lastIndexOf('/') + 1)
  return name || 'download'
}
