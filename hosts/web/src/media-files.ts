/**
 * Host-owned temp files for the media APIs.
 *
 * `wx.chooseImage` must hand the app a path the render tree can display and a
 * later `wx.uploadFile` can read, so the host keeps the blob and returns a URL.
 * The URL is opaque to the app: do not parse it, only pass it back.
 */

export type TempFile = {
  /** Opaque path returned to the mini program. */
  url: string
  name: string
  type: string
  size: number
  blob: Blob
}

export type TempFileRegistry = {
  add(blob: Blob, name?: string): TempFile
  get(url: string): TempFile | undefined
  remove(url: string): void
  clear(): void
  list(): TempFile[]
}

export type TempFileUrlFactory = (blob: Blob) => string

const defaultCreateUrl: TempFileUrlFactory = (blob) => URL.createObjectURL(blob)

/**
 * Keeps blobs alive for as long as the app may use the path. `createUrl` is a
 * seam for tests (node has no `URL.createObjectURL`).
 */
export function createTempFileRegistry(
  createUrl: TempFileUrlFactory = defaultCreateUrl,
): TempFileRegistry {
  const files = new Map<string, TempFile>()
  return {
    add(blob, name) {
      const url = createUrl(blob)
      const file: TempFile = {
        url,
        name: name ?? 'file',
        type: blob.type,
        size: blob.size,
        blob,
      }
      files.set(url, file)
      return file
    },
    get: (url) => files.get(url),
    remove(url) {
      const file = files.get(url)
      if (!file) return
      files.delete(url)
      revokeUrl(url)
    },
    clear() {
      for (const url of files.keys()) revokeUrl(url)
      files.clear()
    },
    list: () => [...files.values()],
  }
}

function revokeUrl(url: string): void {
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url)
  }
}

export type PickFilesOptions = {
  accept?: string
  multiple?: boolean
}

/**
 * Open the host file chooser.
 *
 * Chrome allows this from a transient user activation, which survives the
 * service→host round trip (the activation window is time-based, not task-based).
 */
export function pickFiles(options: PickFilesOptions = {}): Promise<File[]> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('file picking is not available in this runtime'))
  }
  return new Promise<File[]>((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    if (options.accept) input.accept = options.accept
    if (options.multiple) input.multiple = true
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    input.style.opacity = '0'
    const cleanup = (): void => {
      input.remove()
    }
    input.addEventListener('change', () => {
      const files = input.files ? [...input.files] : []
      cleanup()
      resolve(files)
    })
    input.addEventListener('cancel', () => {
      cleanup()
      resolve([])
    })
    document.body.appendChild(input)
    try {
      input.click()
    } catch (error) {
      cleanup()
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

/** Read intrinsic size/type without adding the image to the document. */
export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`failed to load image: ${src}`))
    image.src = src
  })
}


export type MediaHandlerOptions = {
  registry: TempFileRegistry
  /** Test/debug seam; defaults to the browser file chooser. */
  pick?: typeof pickFiles
}

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

/**
 * Host-side implementations for the media APIs. Both the acceptance host and
 * the devtool mount the same handlers so temp-file paths and result shapes
 * cannot drift between hosts.
 */
export function createMediaHandlers(
  options: MediaHandlerOptions,
): Record<string, (params: HandlerParams) => Promise<HandlerResult> | HandlerResult> {
  const pick = options.pick ?? pickFiles
  return {
    'media.chooseImage': (params) => chooseImage(options.registry, pick, params),
    'media.chooseMedia': (params) => chooseMedia(options.registry, pick, params),
    'media.previewImage': (params) => previewImage(params),
    'media.getImageInfo': (params) => imageInfo(options.registry, params),
  }
}

function clampCount(value: unknown, fallback: number): number {
  const count = Math.floor(Number(value ?? fallback))
  if (!Number.isFinite(count) || count < 1) return 1
  return Math.min(count, 9)
}

async function chooseImage(
  registry: TempFileRegistry,
  pick: typeof pickFiles,
  params: HandlerParams,
): Promise<HandlerResult> {
  const count = clampCount(params.count, 9)
  const picked = await pick({ accept: 'image/*', multiple: count > 1 })
  const files = picked.slice(0, count)
  if (files.length === 0) return { errMsg: 'chooseImage:fail cancel' }
  const entries = files.map((file) => registry.add(file, file.name))
  return {
    tempFilePaths: entries.map((entry) => entry.url),
    tempFiles: entries.map((entry) => ({ path: entry.url, size: entry.size })),
    errMsg: 'chooseImage:ok',
  }
}

async function chooseMedia(
  registry: TempFileRegistry,
  pick: typeof pickFiles,
  params: HandlerParams,
): Promise<HandlerResult> {
  const count = clampCount(params.count, 9)
  const requested = Array.isArray(params.mediaType) && params.mediaType.length > 0
    ? params.mediaType.map(String)
    : ['image', 'video']
  const accept = requested
    .map((type) => (type === 'video' ? 'video/*' : 'image/*'))
    .join(',')
  const picked = await pick({ accept, multiple: count > 1 })
  const files = picked.slice(0, count)
  if (files.length === 0) return { errMsg: 'chooseMedia:fail cancel' }
  const entries = files.map((file) => registry.add(file, file.name))
  const kinds = new Set(entries.map((entry) => (entry.type.startsWith('video') ? 'video' : 'image')))
  return {
    type: kinds.size > 1 ? 'mix' : [...kinds][0],
    tempFiles: entries.map((entry) => ({
      tempFilePath: entry.url,
      size: entry.size,
      fileType: entry.type.startsWith('video') ? 'video' : 'image',
      ...(entry.type.startsWith('video') ? {} : { thumbTempFilePath: entry.url }),
    })),
    errMsg: 'chooseMedia:ok',
  }
}

function previewImage(params: HandlerParams): HandlerResult {
  const urls = Array.isArray(params.urls) ? params.urls.map(String).filter(Boolean) : []
  if (urls.length === 0) return { errMsg: 'previewImage:fail urls is required' }
  if (typeof document === 'undefined') return { errMsg: 'previewImage:fail no document' }
  const current = String(params.current ?? urls[0])
  const overlay = document.createElement('div')
  overlay.setAttribute('data-tiny-preview', current)
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483000',
    'background:#000',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'cursor:zoom-out',
  ].join(';')
  const image = document.createElement('img')
  image.src = current
  image.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;'
  overlay.addEventListener('click', () => overlay.remove())
  overlay.appendChild(image)
  document.body.appendChild(overlay)
  return { errMsg: 'previewImage:ok' }
}

async function imageInfo(registry: TempFileRegistry, params: HandlerParams): Promise<HandlerResult> {
  const src = String(params.src ?? '')
  if (!src) return { errMsg: 'getImageInfo:fail src is required' }
  if (typeof Image === 'undefined') {
    return { errMsg: 'getImageInfo:fail image decoding is not available in this runtime' }
  }
  try {
    const image = await loadImageElement(src)
    const entry = registry.get(src)
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      path: src,
      orientation: 'up',
      type: entry?.type || mimeFromPath(src) || 'image/png',
      errMsg: 'getImageInfo:ok',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { errMsg: `getImageInfo:fail ${message}` }
  }
}

function mimeFromPath(src: string): string | undefined {
  const match = /\.(png|jpe?g|gif|webp|bmp|svg)(?:$|[?#])/i.exec(src)
  if (!match) return undefined
  const extension = match[1].toLowerCase()
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
  if (extension === 'svg') return 'image/svg+xml'
  return `image/${extension}`
}
