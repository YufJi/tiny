import type { ApiHost, ApiContext } from './context'
import { decodeBase64, encodeBase64 } from './encoding'
import { callHost, callHostSync, runApi } from './run-api'

/**
 * `wx.getFileSystemManager()`.
 *
 * The host owns the bytes (see `hosts/web/src/file-system.ts`); this module
 * only keeps WeChat's manager shape: callback-style async methods, throwing
 * `*Sync` methods, `Stats` objects with methods, and binary data carried over
 * the JSON bridge as base64.
 *
 * Only the `wxfile://usr/...` tree exists today. The temp tree is backed by the
 * media temp-file registry (`wxfile://tmp`), which is not a file system, so a
 * temp path fails here instead of resolving to the wrong bytes.
 */

type Params = Record<string, unknown>

function readPath(params: Params): string {
  return String(params.path ?? params.filePath ?? params.dirPath ?? '')
}

function toBytes(data: unknown, encoding: unknown): Uint8Array {
  if (typeof data === 'string') {
    return new TextEncoder().encode(data)
  }
  if (data instanceof ArrayBuffer) return new Uint8Array(data)
  if (ArrayBuffer.isView(data)) {
    const view = data as ArrayBufferView
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
  }
  if (data === undefined || data === null) {
    return new Uint8Array(0)
  }
  void encoding
  return new TextEncoder().encode(String(data))
}

function decodeText(buffer: ArrayBuffer, encoding: unknown): string | ArrayBuffer {
  if (typeof encoding !== 'string' || encoding.length === 0) return buffer
  const normalized = encoding.toLowerCase().replace('utf8', 'utf-8')
  if (normalized !== 'utf-8') return buffer
  return new TextDecoder('utf-8').decode(buffer)
}

function toStats(raw: unknown): Record<string, unknown> {
  const value = (raw ?? {}) as {
    size?: unknown
    lastAccessedTime?: unknown
    lastModifiedTime?: unknown
    isDirectory?: unknown
  }
  const isDirectory = value.isDirectory === true
  return {
    mode: 0,
    size: Number(value.size ?? 0),
    lastAccessedTime: Number(value.lastAccessedTime ?? 0),
    lastModifiedTime: Number(value.lastModifiedTime ?? 0),
    isDirectory: () => isDirectory,
    isFile: () => !isDirectory,
  }
}

function isFailure(result: unknown): boolean {
  const errMsg = (result as { errMsg?: unknown } | undefined)?.errMsg
  return typeof errMsg === 'string' && errMsg.includes(':fail')
}

function assertSync<T>(result: T, apiName: string): T {
  const errMsg = (result as { errMsg?: unknown } | undefined)?.errMsg
  if (typeof errMsg === 'string' && errMsg.includes(':fail')) {
    throw new Error(errMsg.replace(':fail', `:fail ${apiName} called with fail:`))
  }
  return result
}

export function createFileSystemApi(context: ApiContext): ApiHost {
  return {
    getFileSystemManager: () => createFileSystemManager(context),
  }
}

function createFileSystemManager(context: ApiContext): Record<string, unknown> {
  const call = (method: string, payload: Params) => callHost(context, `fs.${method}`, payload)
  const callSync = (method: string, payload: Params) => callHostSync(context, `fs.${method}`, payload)

  const readFile = async (params: Params) => {
    const result = await call('readFile', { path: readPath(params) }) as { data?: unknown }
    // A host failure must reach `fail`, not become an empty successful read.
    if (isFailure(result)) return result
    const buffer = decodeBase64(String(result?.data ?? ''))
    return { data: decodeText(buffer, params.encoding), errMsg: 'readFile:ok' }
  }

  const writeFile = async (params: Params) => {
    const bytes = toBytes(params.data, params.encoding)
    const result = await call('writeFile', { path: readPath(params), base64: encodeBase64(bytes) })
    return isFailure(result) ? result : { errMsg: 'writeFile:ok' }
  }

  return {
    access: (params: Params = {}) => runApi(params, 'access', () => call('access', { path: readPath(params) })),
    readFile: (params: Params = {}) => runApi(params, 'readFile', () => readFile(params)),
    writeFile: (params: Params = {}) => runApi(params, 'writeFile', () => writeFile(params)),
    mkdir: (params: Params = {}) => runApi(params, 'mkdir', () => call('mkdir', {
      path: readPath(params),
      recursive: params.recursive === true,
    })),
    readdir: (params: Params = {}) => runApi(params, 'readdir', () => call('readdir', {
      path: readPath(params),
    })),
    stat: (params: Params = {}) => runApi(params, 'stat', async () => {
      const result = await call('stat', { path: readPath(params) }) as { stats?: unknown }
      if (isFailure(result)) return result
      return { stats: toStats(result?.stats), errMsg: 'stat:ok' }
    }),
    unlink: (params: Params = {}) => runApi(params, 'unlink', () => call('unlink', {
      path: readPath(params),
    })),
    rmdir: (params: Params = {}) => runApi(params, 'rmdir', () => call('rmdir', {
      path: readPath(params),
      recursive: params.recursive === true,
    })),

    accessSync: (filePath: unknown) => {
      assertSync(callSync('access', { path: String(filePath ?? '') }), 'access')
      return undefined
    },
    readFileSync: (filePath: unknown, encoding?: unknown) => {
      const result = assertSync(
        callSync('readFile', { path: String(filePath ?? '') }) as { data?: unknown },
        'readFile',
      )
      return decodeText(decodeBase64(String(result?.data ?? '')), encoding)
    },
    writeFileSync: (filePath: unknown, data: unknown, encoding?: unknown) => {
      assertSync(callSync('writeFile', {
        path: String(filePath ?? ''),
        base64: encodeBase64(toBytes(data, encoding)),
      }), 'writeFile')
      return undefined
    },
    mkdirSync: (dirPath: unknown, recursive?: unknown) => {
      assertSync(callSync('mkdir', {
        path: String(dirPath ?? ''),
        recursive: recursive === true,
      }), 'mkdir')
      return undefined
    },
    readdirSync: (dirPath: unknown) => {
      const result = assertSync(
        callSync('readdir', { path: String(dirPath ?? '') }) as { files?: unknown },
        'readdir',
      )
      return Array.isArray(result?.files) ? result.files.map(String) : []
    },
    statSync: (path: unknown) => {
      const result = assertSync(
        callSync('stat', { path: String(path ?? '') }) as { stats?: unknown },
        'stat',
      )
      return toStats(result?.stats)
    },
    unlinkSync: (filePath: unknown) => {
      assertSync(callSync('unlink', { path: String(filePath ?? '') }), 'unlink')
      return undefined
    },
    rmdirSync: (dirPath: unknown, recursive?: unknown) => {
      assertSync(callSync('rmdir', {
        path: String(dirPath ?? ''),
        recursive: recursive === true,
      }), 'rmdir')
      return undefined
    },
  }
}
