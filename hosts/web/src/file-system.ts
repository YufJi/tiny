/**
 * Host file system for `wx.getFileSystemManager()`.
 *
 * Browser storage cannot provide the synchronous file API WeChat exposes, so
 * the host keeps a small in-memory VFS (10MB cap, same as WeChat's user file
 * quota) and answers both the async and the sync channel from it. Paths are
 * WeChat's `wxfile://usr/...`; any other scheme fails instead of silently
 * landing in the wrong place.
 */
import type { StorageValues } from '@tiny/api'

type HandlerParams = Record<string, unknown>
type HandlerResult = Record<string, unknown>

type FileEntry = {
  bytes: Uint8Array
  modifiedAt: number
}

const USER_ROOT = 'wxfile://usr'
const MAX_BYTES = 10 * 1024 * 1024

export type FileSystemHandlerOptions = {
  /** Share the WebView's storage area? Kept for future persistence. */
  storage?: StorageValues
}

export function createFileSystemHandlers(
  _options: FileSystemHandlerOptions = {},
): Record<string, (params: HandlerParams) => HandlerResult> {
  const files = new Map<string, FileEntry>()
  const directories = new Set<string>(['/'])

  const fail = (apiName: string, reason: string): HandlerResult => ({
    errMsg: `${apiName}:fail ${reason}`,
  })

  const normalize = (filePath: unknown): string | null => {
    const raw = String(filePath ?? '')
    if (!raw.startsWith(USER_ROOT)) return null
    const rest = raw.slice(USER_ROOT.length)
    if (rest === '' || rest === '/') return '/'
    if (!rest.startsWith('/')) return null
    const segments: string[] = []
    for (const segment of rest.split('/')) {
      if (segment === '' || segment === '.') continue
      if (segment === '..') {
        if (segments.length === 0) return null
        segments.pop()
        continue
      }
      segments.push(segment)
    }
    return `/${segments.join('/')}`
  }

  const parentOf = (path: string): string => {
    const index = path.lastIndexOf('/')
    return index <= 0 ? '/' : path.slice(0, index)
  }

  const baseName = (path: string): string => path.slice(path.lastIndexOf('/') + 1)

  const usedBytes = (): number => {
    let total = 0
    for (const entry of files.values()) total += entry.bytes.byteLength
    return total
  }

  const exists = (path: string): boolean => files.has(path) || directories.has(path)

  return {
    'fs.access': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('access', 'no such file or directory')
      if (!exists(path)) return fail('access', 'no such file or directory')
      return { errMsg: 'access:ok' }
    },
    'fs.readFile': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('readFile', 'no such file or directory')
      const entry = files.get(path)
      if (!entry) return fail('readFile', 'no such file or directory')
      return { data: base64Of(entry.bytes), errMsg: 'readFile:ok' }
    },
    'fs.writeFile': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('writeFile', 'no such file or directory')
      if (directories.has(path)) return fail('writeFile', 'is a directory')
      if (!directories.has(parentOf(path))) return fail('writeFile', 'no such file or directory')
      const bytes = bytesOf(String(params.base64 ?? ''))
      if (usedBytes() - (files.get(path)?.bytes.byteLength ?? 0) + bytes.byteLength > MAX_BYTES) {
        return fail('writeFile', 'the maximum size of the file storage limit is exceeded')
      }
      files.set(path, { bytes, modifiedAt: Date.now() })
      return { errMsg: 'writeFile:ok' }
    },
    'fs.mkdir': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('mkdir', 'no such file or directory')
      if (exists(path)) return fail('mkdir', 'file already exists')
      const recursive = params.recursive === true
      const missing: string[] = []
      let current = path
      while (current !== '/' && !directories.has(current)) {
        missing.push(current)
        current = parentOf(current)
      }
      if (!recursive && missing.length > 1) {
        return fail('mkdir', 'no such file or directory')
      }
      for (const directory of missing.reverse()) directories.add(directory)
      return { errMsg: 'mkdir:ok' }
    },
    'fs.readdir': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('readdir', 'no such file or directory')
      if (!directories.has(path)) {
        return fail('readdir', files.has(path) ? 'not a directory' : 'no such file or directory')
      }
      const prefix = path === '/' ? '/' : `${path}/`
      const names = new Set<string>()
      for (const file of files.keys()) {
        if (!file.startsWith(prefix)) continue
        const rest = file.slice(prefix.length)
        if (rest && !rest.includes('/')) names.add(rest)
      }
      for (const directory of directories) {
        if (!directory.startsWith(prefix) || directory === path) continue
        const rest = directory.slice(prefix.length)
        if (rest && !rest.includes('/')) names.add(rest)
      }
      return { files: [...names].sort(), errMsg: 'readdir:ok' }
    },
    'fs.stat': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('stat', 'no such file or directory')
      const entry = files.get(path)
      if (entry) {
        return {
          stats: {
            size: entry.bytes.byteLength,
            lastModifiedTime: entry.modifiedAt,
            lastAccessedTime: entry.modifiedAt,
            isDirectory: false,
          },
          errMsg: 'stat:ok',
        }
      }
      if (directories.has(path)) {
        return {
          stats: {
            size: 0,
            lastModifiedTime: 0,
            lastAccessedTime: 0,
            isDirectory: true,
          },
          errMsg: 'stat:ok',
        }
      }
      return fail('stat', 'no such file or directory')
    },
    'fs.unlink': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('unlink', 'no such file or directory')
      if (!files.has(path)) {
        return fail('unlink', directories.has(path) ? 'is a directory' : 'no such file or directory')
      }
      files.delete(path)
      return { errMsg: 'unlink:ok' }
    },
    'fs.rmdir': (params) => {
      const path = normalize(params.path)
      if (path === null) return fail('rmdir', 'no such file or directory')
      if (!directories.has(path) || path === '/') {
        return fail('rmdir', files.has(path) ? 'not a directory' : 'no such file or directory')
      }
      const prefix = `${path}/`
      const children = [...files.keys(), ...directories].filter((entry) => entry.startsWith(prefix))
      if (children.length > 0 && params.recursive !== true) return fail('rmdir', 'directory not empty')
      for (const file of [...files.keys()]) {
        if (file.startsWith(prefix)) files.delete(file)
      }
      for (const directory of [...directories]) {
        if (directory.startsWith(prefix)) directories.delete(directory)
      }
      directories.delete(path)
      return { errMsg: 'rmdir:ok' }
    },
  }
}

function bytesOf(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function base64Of(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk))
  }
  return btoa(binary)
}

/** Exposed for tests: the file name a path ends in. */
export function fileNameOfPath(path: string): string {
  return path.slice(path.lastIndexOf('/') + 1)
}

/** Exposed for tests: root directory marker. */
export const FILE_SYSTEM_USER_ROOT = USER_ROOT
