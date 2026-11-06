import type { ApiHost } from './context'

/**
 * File system manager stub.
 *
 * Tiny has no app-scoped file system yet, so every operation fails through the
 * callback contract instead of silently succeeding. When a host gains real
 * storage this file is the only place that changes.
 */
export function createFileSystemApi(): ApiHost {
  return {
    getFileSystemManager: () => createFileSystemManagerStub(),
  }
}

function createFileSystemManagerStub(): Record<string, unknown> {
  const fail = (apiName: string, params: unknown) => {
    const callbacks = (params ?? {}) as {
      fail?: (value: unknown) => void
      complete?: (value: unknown) => void
    }
    const result = { errMsg: `${apiName}:fail not supported by the Tiny runtime` }
    callbacks.fail?.(result)
    callbacks.complete?.(result)
  }
  return {
    access: (params: unknown) => fail('access', params),
    readFile: (params: unknown) => fail('readFile', params),
    writeFile: (params: unknown) => fail('writeFile', params),
    mkdir: (params: unknown) => fail('mkdir', params),
    readdir: (params: unknown) => fail('readdir', params),
    stat: (params: unknown) => fail('stat', params),
    unlink: (params: unknown) => fail('unlink', params),
    rmdir: (params: unknown) => fail('rmdir', params),
  }
}
