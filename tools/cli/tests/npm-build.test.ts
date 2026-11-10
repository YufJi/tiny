import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/wxs-runtime'
import { compileMiniProgram } from '../src'

let root: string
let outputDir: string
const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
const globals = globalThis as unknown as { __tinyWxsRuntime?: unknown }

beforeAll(async () => {
  globals.__tinyWxsRuntime = wxsRuntime
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-npm-'))
  outputDir = path.join(root, 'dist')
  await write('app.json', JSON.stringify({
    pages: ['pages/index/index'],
    usingComponents: { 'demo-lib': 'demo-lib/index' },
  }))
  await write('app.js', 'App({})\n')
  await write('app.wxss', '.page { color: red; }\n')
  await write('pages/index/index.js', 'Page({ data: { ok: true } })\n')
  await write('pages/index/index.json', '{ "usingComponents": {} }\n')
  await write('pages/index/index.wxml', '<view class="page"><demo-lib /></view>\n')
  await write('pages/index/index.wxss', '.page { padding: 0; }\n')
  await write('package.json', JSON.stringify({
    dependencies: { 'demo-lib': '1.0.0' },
  }))
  await write('node_modules/demo-lib/package.json', JSON.stringify({
    name: 'demo-lib',
    version: '1.0.0',
    miniprogram: 'dist',
    dependencies: { 'dep-util': '1.0.0' },
  }))
  await write('node_modules/demo-lib/dist/index.js', [
    "const helper = require('dep-util/helper')",
    "Component({ properties: { msg: String }, data: { helper } })",
    '',
  ].join('\n'))
  await write('node_modules/demo-lib/dist/index.json', '{ "component": true }\n')
  await write('node_modules/demo-lib/dist/index.wxml', '<view class="demo">{{msg}}</view>\n')
  await write('node_modules/demo-lib/dist/index.wxss', '.demo { color: blue; }\n')
  await fs.mkdir(path.join(root, 'node_modules/demo-lib/dist'), { recursive: true })
  await fs.writeFile(path.join(root, 'node_modules/demo-lib/dist/logo.png'), Buffer.from([1, 2, 3]))
  await write('node_modules/dep-util/package.json', JSON.stringify({
    name: 'dep-util',
    version: '1.0.0',
  }))
  await write('node_modules/dep-util/helper.js', 'module.exports = { value: 1 }\n')
})

afterAll(async () => {
  delete globals.__tinyWxsRuntime
  wxsRuntime.dispose()
  await fs.rm(root, { recursive: true, force: true })
})

describe('npm build', () => {
  test('mirrors declared dependencies into miniprogram_npm and compiles them', async () => {
    const result = await compileMiniProgram({ sourceDir: root, outputDir, clean: true })
    const manifest = result.manifest
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])

    const component = manifest.components.find(
      (item) => item.path === 'miniprogram_npm/demo-lib/index',
    )
    expect(component).toBeDefined()
    expect(component?.script?.path).toBe('scripts/miniprogram_npm/demo-lib/index.js')
    expect(component?.template?.path).toBe('miniprogram_npm/demo-lib/index')
    expect(component?.style?.outputPath).toBe('styles/miniprogram_npm/demo-lib/index.wxss.css')

    const script = await fs.readFile(
      path.join(outputDir, 'scripts/miniprogram_npm/demo-lib/index.js'),
      'utf8',
    )
    expect(script).toContain('../dep-util/helper.js')

    await expect(fs.stat(path.join(
      outputDir,
      'scripts/miniprogram_npm/dep-util/helper.js',
    ))).resolves.toBeTruthy()
    const service = await fs.readFile(path.join(outputDir, 'service.all.js'), 'utf8')
    expect(service).toContain('value: 1')

    expect(manifest.assets.map((asset) => asset.path)).toContain(
      'miniprogram_npm/demo-lib/logo.png',
    )
    await expect(fs.stat(path.join(outputDir, 'miniprogram_npm/demo-lib/logo.png')))
      .resolves.toBeTruthy()
    await expect(fs.stat(path.join(outputDir, '.tiny-npm'))).rejects.toBeTruthy()
  })

  test('keeps a checked-in miniprogram_npm tree instead of rebuilding node_modules', async () => {
    const prebuiltRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-npm-prebuilt-'))
    try {
      await fs.mkdir(path.join(prebuiltRoot, 'miniprogram_npm/prebuilt'), { recursive: true })
      await fs.writeFile(path.join(prebuiltRoot, 'app.json'), JSON.stringify({
        pages: ['pages/index/index'],
        usingComponents: { prebuilt: 'prebuilt/index' },
      }))
      await fs.writeFile(path.join(prebuiltRoot, 'app.js'), 'App({})\n')
      await fs.mkdir(path.join(prebuiltRoot, 'pages/index'), { recursive: true })
      await fs.writeFile(path.join(prebuiltRoot, 'pages/index/index.js'), 'Page({})\n')
      await fs.writeFile(path.join(prebuiltRoot, 'pages/index/index.wxml'), '<prebuilt />\n')
      await fs.writeFile(path.join(prebuiltRoot, 'package.json'), JSON.stringify({
        dependencies: { missing: '1.0.0' },
      }))
      await fs.writeFile(path.join(prebuiltRoot, 'miniprogram_npm/prebuilt/index.js'), 'Component({})\n')
      await fs.writeFile(
        path.join(prebuiltRoot, 'miniprogram_npm/prebuilt/index.json'),
        '{ "component": true }\n',
      )
      await fs.writeFile(path.join(prebuiltRoot, 'miniprogram_npm/prebuilt/index.wxml'), '<view />\n')
      const result = await compileMiniProgram({
        sourceDir: prebuiltRoot,
        outputDir: path.join(prebuiltRoot, 'dist'),
        clean: true,
      })
      expect(result.manifest.components.map((item) => item.path)).toContain(
        'miniprogram_npm/prebuilt/index',
      )
      expect(result.diagnostics.some((item) => item.code === 'NPM_PACKAGE_NOT_FOUND')).toBe(false)
      expect(result.diagnostics.some((item) => item.code === 'NPM_PREBUILT_SOURCE')).toBe(true)
    } finally {
      await fs.rm(prebuiltRoot, { recursive: true, force: true })
    }
  })
})

async function write(relative: string, content: string): Promise<void> {
  const target = path.join(root, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content, 'utf8')
}
