import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/wxs-runtime'
import { compileMiniProgram } from '../src'

let root: string
const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
const globals = globalThis as unknown as { __tinyWxsRuntime?: unknown }

beforeAll(async () => {
  globals.__tinyWxsRuntime = wxsRuntime
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-typecheck-'))
  await write(root, 'app.json', JSON.stringify({ pages: ['pages/index/index'] }))
  await write(root, 'app.ts', 'App({ globalData: { ready: true } })\n')
  await write(root, 'pages/index/index.ts', [
    "const count: number = 'not a number'",
    "wx.getSystemInfoSync()",
    'Page({ data: { count } })',
    '',
  ].join('\n'))
  await write(root, 'pages/index/index.wxml', '<view>{{count}}</view>\n')
  await write(root, 'tsconfig.json', JSON.stringify({
    compilerOptions: {
      strict: true,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      target: 'ESNext',
    },
  }))
})

afterAll(async () => {
  delete globals.__tinyWxsRuntime
  wxsRuntime.dispose()
  await fs.rm(root, { recursive: true, force: true })
})

describe('TypeScript checking', () => {
  test('reports semantic errors from a tsconfig project', async () => {
    const result = await compileMiniProgram({
      sourceDir: root,
      outputDir: path.join(root, 'dist'),
      clean: true,
    })
    const typeError = result.diagnostics.find((item) => item.code === 'SCRIPT_TYPE_ERROR')
    expect(typeError).toBeDefined()
    expect(typeError?.severity).toBe('error')
    expect(typeError?.file).toBe('pages/index/index.ts')
    expect(typeError?.location?.line).toBe(1)
    expect(typeError?.message).toContain('not assignable')
  })

  test('opts out when typecheck is false and checks without tsconfig when true', async () => {
    const plainRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-typecheck-plain-'))
    try {
      await write(plainRoot, 'app.json', JSON.stringify({ pages: ['pages/index/index'] }))
      await write(plainRoot, 'app.ts', 'App({})\n')
      await write(plainRoot, 'pages/index/index.ts', 'Page({ data: { ok: 1 } })\n')
      await write(plainRoot, 'pages/index/index.wxml', '<view />\n')

      const skipped = await compileMiniProgram({
        sourceDir: plainRoot,
        outputDir: path.join(plainRoot, 'dist-skip'),
        clean: true,
      })
      expect(skipped.diagnostics.some((item) => item.code === 'SCRIPT_TYPE_ERROR')).toBe(false)

      const checked = await compileMiniProgram({
        sourceDir: plainRoot,
        outputDir: path.join(plainRoot, 'dist-check'),
        clean: true,
        typecheck: true,
      })
      expect(checked.diagnostics.some((item) => item.code === 'SCRIPT_TYPE_ERROR')).toBe(false)
    } finally {
      await fs.rm(plainRoot, { recursive: true, force: true })
    }
  })
})

async function write(base: string, relative: string, content: string): Promise<void> {
  const target = path.join(base, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content, 'utf8')
}
