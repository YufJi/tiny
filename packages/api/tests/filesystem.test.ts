import { describe, expect, test } from 'vitest'
import type { ApiContext } from '../src'
import { createApiHost } from '../src'

function createHost() {
  const calls: Array<{ method: string; params: Record<string, unknown>; sync: boolean }> = []
  const store = new Map<string, string>()
  const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
    'fs.copyFile': (params) => ({ errMsg: 'copyFile:ok', src: params.srcPath, dest: params.destPath }),
    'fs.rename': (params) => ({ errMsg: 'rename:ok', old: params.oldPath, next: params.newPath }),
    'fs.appendFile': (params) => ({ errMsg: 'appendFile:ok', base64: params.base64 }),
    'fs.saveFile': (params) => ({ savedFilePath: 'wxfile://usr/saved/a.png', errMsg: 'saveFile:ok', temp: params.tempUrl }),
    'fs.writeFile': (params) => {
      store.set(String(params.path), String(params.base64))
      return { errMsg: 'writeFile:ok' }
    },
    'fs.readFile': (params) => {
      const data = store.get(String(params.path))
      return data === undefined
        ? { errMsg: 'readFile:fail no such file or directory' }
        : { data, errMsg: 'readFile:ok' }
    },
    'fs.readdir': (params) => ({ files: ['a.txt', 'b.txt'], errMsg: 'readdir:ok', path: params.path }),
    'fs.stat': (params) => (
      String(params.path).endsWith('/')
        ? { stats: { size: 0, isDirectory: true }, errMsg: 'stat:ok' }
        : { stats: { size: 5, isDirectory: false }, errMsg: 'stat:ok' }
    ),
  }
  const connection = {
    sendDiagnostic: () => undefined,
    call: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: false })
      return Promise.resolve(handlers[method]?.(params))
    },
    callSync: (_domain: string, method: string, params: Record<string, unknown> = {}) => {
      calls.push({ method, params, sync: true })
      const handler = handlers[method]
      if (!handler) throw new Error(`unsupported sync host API: ${method}`)
      return handler(params)
    },
  }
  const context = {
    connection,
    apiName: 'wx',
    apiNamespaces: ['wx'],
    launchOptions: {},
    getCurrentPagePath: () => 'pages/index/index',
    pageId: 'page-1',
  } as unknown as ApiContext
  return {
    host: createApiHost(context) as unknown as Record<string, (...args: unknown[]) => any>,
    calls,
    store,
  }
}

describe('file system manager', () => {
  test('writeFile and readFile round-trip text and binary', async () => {
    const { host, calls } = createHost()
    const fs = host.getFileSystemManager()

    await fs.writeFile({ filePath: 'wxfile://usr/a.txt', data: 'hello' })
    expect(calls[0].params).toMatchObject({ path: 'wxfile://usr/a.txt', base64: 'aGVsbG8=' })

    await expect(fs.readFile({ filePath: 'wxfile://usr/a.txt', encoding: 'utf-8' })).resolves.toEqual({
      data: 'hello',
      errMsg: 'readFile:ok',
    })

    const binary = await fs.readFile({ filePath: 'wxfile://usr/a.txt' })
    expect(binary.data).toBeInstanceOf(ArrayBuffer)
    expect(new TextDecoder().decode(binary.data)).toBe('hello')
  })

  test('sync variants use the synchronous channel', () => {
    const { host, calls } = createHost()
    const fs = host.getFileSystemManager()
    fs.writeFileSync('wxfile://usr/b.txt', 'sync')
    expect(calls.at(-1)).toMatchObject({ method: 'fs.writeFile', sync: true })
    expect(fs.readFileSync('wxfile://usr/b.txt', 'utf-8')).toBe('sync')
    expect(fs.readdirSync('wxfile://usr')).toEqual(['a.txt', 'b.txt'])
  })

  test('stat exposes Stats methods instead of a plain flag', async () => {
    const { host } = createHost()
    const fs = host.getFileSystemManager()
    const file = await fs.stat({ path: 'wxfile://usr/a.txt' })
    expect(file.stats.isFile()).toBe(true)
    expect(file.stats.isDirectory()).toBe(false)
    expect(file.stats.size).toBe(5)
    const dir = fs.statSync('wxfile://usr/dir/')
    expect(dir.isDirectory()).toBe(true)
  })

  test('a missing file reaches fail for async and throws for sync', async () => {
    const { host } = createHost()
    const fs = host.getFileSystemManager()
    const failures: Array<{ errMsg?: string }> = []
    await fs.readFile({
      filePath: 'wxfile://usr/missing.txt',
      fail: (value: { errMsg?: string }) => failures.push(value),
    })
    expect(failures).toHaveLength(1)
    expect(failures[0].errMsg).toContain('readFile:fail')
    expect(() => fs.readFileSync('wxfile://usr/missing.txt')).toThrow(/readFile:fail/)
  })

  test('directory operations forward dirPath and the recursive flag', async () => {
    const { host, calls } = createHost()
    const fs = host.getFileSystemManager()
    await fs.mkdir({ dirPath: 'wxfile://usr/dir', recursive: true })
    expect(calls.at(-1)).toMatchObject({
      method: 'fs.mkdir',
      params: { path: 'wxfile://usr/dir', recursive: true },
    })
    await fs.rmdir({ dirPath: 'wxfile://usr/dir', recursive: true })
    expect(calls.at(-1)).toMatchObject({
      method: 'fs.rmdir',
      params: { path: 'wxfile://usr/dir', recursive: true },
    })
  })

  test('copy, rename, append and save reach the host', async () => {
    const { host, calls } = createHost()
    const fs = host.getFileSystemManager()
    await fs.copyFile({ srcPath: 'wxfile://usr/a', destPath: 'wxfile://usr/b' })
    await fs.rename({ oldPath: 'wxfile://usr/b', newPath: 'wxfile://usr/c' })
    await fs.appendFile({ filePath: 'wxfile://usr/c', data: 'hi' })
    await expect(fs.saveFile({ tempFilePath: 'blob:temp' })).resolves.toMatchObject({
      savedFilePath: 'wxfile://usr/saved/a.png',
    })

    expect(calls.map((call) => call.method)).toEqual([
      'fs.copyFile',
      'fs.rename',
      'fs.appendFile',
      'fs.saveFile',
    ])
    expect(calls[2].params).toMatchObject({ path: 'wxfile://usr/c', base64: 'aGk=' })
  })

  test('the sync variants use the synchronous channel', () => {
    const { host, calls } = createHost()
    const fs = host.getFileSystemManager()
    fs.copyFileSync('wxfile://usr/a', 'wxfile://usr/b')
    fs.renameSync('wxfile://usr/b', 'wxfile://usr/c')
    fs.appendFileSync('wxfile://usr/c', 'x')
    expect(calls.map((call) => call.sync)).toEqual([true, true, true])
  })

  test('openDocument and saveFileToDisk forward to the host', async () => {
    const { host, calls } = createHost()
    await host.openDocument({ filePath: 'blob:doc', fileType: 'pdf' })
    await host.saveFileToDisk({ filePath: 'blob:doc' })
    expect(calls.map((call) => call.method)).toEqual(['file.openDocument', 'file.saveToDisk'])
  })
})
