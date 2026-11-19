import { describe, expect, test } from 'vitest'
import { createFileSystemHandlers } from '../src/file-system'

function encode(text: string): string {
  return btoa(text)
}

function decode(base64: string): string {
  return atob(base64)
}

describe('host file system', () => {
  test('writes, reads, stats and lists files', () => {
    const fs = createFileSystemHandlers()
    expect(fs['fs.mkdir']({ path: 'wxfile://usr/docs', recursive: true })).toMatchObject({ errMsg: 'mkdir:ok' })
    expect(fs['fs.writeFile']({
      path: 'wxfile://usr/docs/a.txt',
      base64: encode('hello'),
    })).toMatchObject({ errMsg: 'writeFile:ok' })

    expect(decode(String(fs['fs.readFile']({ path: 'wxfile://usr/docs/a.txt' }).data))).toBe('hello')
    expect(fs['fs.stat']({ path: 'wxfile://usr/docs/a.txt' })).toMatchObject({
      stats: { size: 5, isDirectory: false },
      errMsg: 'stat:ok',
    })
    expect(fs['fs.readdir']({ path: 'wxfile://usr/docs' })).toMatchObject({ files: ['a.txt'] })
    expect(fs['fs.readdir']({ path: 'wxfile://usr' })).toMatchObject({ files: ['docs'] })
  })

  test('rejects a missing parent directory', () => {
    const fs = createFileSystemHandlers()
    expect(fs['fs.writeFile']({
      path: 'wxfile://usr/nope/a.txt',
      base64: encode('x'),
    })).toMatchObject({ errMsg: 'writeFile:fail no such file or directory' })
  })

  test('removes files and refuses to remove a non-empty directory', () => {
    const fs = createFileSystemHandlers()
    fs['fs.mkdir']({ path: 'wxfile://usr/d', recursive: true })
    fs['fs.writeFile']({ path: 'wxfile://usr/d/a.txt', base64: encode('a') })
    expect(fs['fs.rmdir']({ path: 'wxfile://usr/d' })).toMatchObject({
      errMsg: 'rmdir:fail directory not empty',
    })
    expect(fs['fs.unlink']({ path: 'wxfile://usr/d/a.txt' })).toMatchObject({ errMsg: 'unlink:ok' })
    expect(fs['fs.rmdir']({ path: 'wxfile://usr/d' })).toMatchObject({ errMsg: 'rmdir:ok' })
  })

  test('rmdir with recursive removes the subtree', () => {
    const fs = createFileSystemHandlers()
    fs['fs.mkdir']({ path: 'wxfile://usr/d/e', recursive: true })
    fs['fs.writeFile']({ path: 'wxfile://usr/d/e/a.txt', base64: encode('a') })
    expect(fs['fs.rmdir']({ path: 'wxfile://usr/d', recursive: true })).toMatchObject({ errMsg: 'rmdir:ok' })
    expect(fs['fs.access']({ path: 'wxfile://usr/d/e/a.txt' })).toMatchObject({
      errMsg: 'access:fail no such file or directory',
    })
  })

  test('only the user tree is addressable', () => {
    const fs = createFileSystemHandlers()
    expect(fs['fs.readFile']({ path: 'wxfile://tmp/x.png' })).toMatchObject({
      errMsg: 'readFile:fail no such file or directory',
    })
    expect(fs['fs.readFile']({ path: 'wxfile://usr/../../etc/passwd' })).toMatchObject({
      errMsg: 'readFile:fail no such file or directory',
    })
    expect(fs['fs.mkdir']({ path: 'wxfile://usr/a/../../b' })).toMatchObject({
      errMsg: 'mkdir:fail no such file or directory',
    })
  })

  test('access reports existing files and directories', () => {
    const fs = createFileSystemHandlers()
    fs['fs.mkdir']({ path: 'wxfile://usr/d', recursive: true })
    fs['fs.writeFile']({ path: 'wxfile://usr/f.txt', base64: encode('f') })
    expect(fs['fs.access']({ path: 'wxfile://usr/d' })).toMatchObject({ errMsg: 'access:ok' })
    expect(fs['fs.access']({ path: 'wxfile://usr/f.txt' })).toMatchObject({ errMsg: 'access:ok' })
  })
})
