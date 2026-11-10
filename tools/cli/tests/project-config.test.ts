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
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-project-'))
  const appRoot = path.join(root, 'miniprogram')
  await write(appRoot, 'app.json', JSON.stringify({
    pages: ['pages/index/index'],
    subPackages: [{
      root: 'pkg',
      pages: ['pages/a/a'],
    }],
    tabBar: {
      list: [{ pagePath: 'pages/missing/missing', text: 'Missing' }],
    },
    preloadRule: {
      'pages/index/index': { network: 'wifi', packages: ['pkg', 'unknown'] },
      'pages/missing/missing': { packages: ['pkg'] },
    },
    lazyCodeLoading: 'unknownMode',
  }))
  await write(appRoot, 'app.js', 'App({})\n')
  await write(appRoot, 'shared/state.js', 'export const sharedMarker = "SHARED_MODULE_MARKER"\n')
  await write(appRoot, 'pages/index/index.js', "import { sharedMarker } from '../../shared/state.js'\nPage({ data: { sharedMarker } })\n")
  await write(appRoot, 'pages/index/index.json', JSON.stringify({
    usingComponents: { shared: '/components/shared/shared' },
  }))
  await write(appRoot, 'pages/index/index.wxml', '<view>index</view>\n')
  await write(appRoot, 'pkg/pages/a/a.js', 'Page({})\n')
  await write(appRoot, 'pkg/pages/a/a.json', JSON.stringify({
    usingComponents: {
      shared: '/components/shared/shared',
      box: '/pkg/components/box/box',
    },
    componentPlaceholder: {
      box: 'view',
      ghost: 'view',
      shared: 'not-a-tag',
    },
  }))
  await write(appRoot, 'pkg/pages/a/a.wxml', '<view>a</view>\n')
  await write(appRoot, 'components/shared/shared.js', 'Component({})\n')
  await write(appRoot, 'components/shared/shared.json', '{ "component": true }\n')
  await write(appRoot, 'components/shared/shared.wxml', '<view>shared</view>\n')
  await write(appRoot, 'pkg/components/box/box.js', "import { sharedMarker } from '../../../shared/state.js'\nComponent({ data: { sharedMarker } })\n")
  await write(appRoot, 'pkg/components/box/box.json', '{ "component": true }\n')
  await write(appRoot, 'pkg/components/box/box.wxml', '<view>box</view>\n')
  await write(appRoot, 'assets/logo.png', Buffer.from([1]))
  await write(appRoot, 'assets/ignored/logo.png', Buffer.from([2]))
  await write(root, 'project.config.json', JSON.stringify({
    miniprogramRoot: 'miniprogram',
    compileType: 'miniprogram',
    packOptions: {
      ignore: [
        { type: 'folder', value: 'assets/ignored' },
        'ignored/**',
      ],
    },
    setting: { es6: true },
  }))
})

afterAll(async () => {
  delete globals.__tinyWxsRuntime
  wxsRuntime.dispose()
  await fs.rm(root, { recursive: true, force: true })
})

describe('project and app configuration', () => {
  test('honors miniprogramRoot, packOptions.ignore and subPackages metadata', async () => {
    const outputDir = path.join(root, 'dist')
    const result = await compileMiniProgram({ sourceDir: root, outputDir, clean: true })
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])

    expect(result.manifest.subPackages).toEqual([{
      root: 'pkg',
      pages: ['pkg/pages/a/a'],
      service: 'service.pkg.js',
    }])
    const subpackagePage = result.manifest.pages.find((page) => page.path === 'pkg/pages/a/a')
    expect(subpackagePage?.subpackage).toBe('pkg')
    expect(result.manifest.pages.find((page) => page.path === 'pages/index/index')?.subpackage)
      .toBeUndefined()

    const box = result.manifest.components.find(
      (component) => component.path === 'pkg/components/box/box',
    )
    expect(box?.subpackage).toBe('pkg')
    const ownerPage = result.manifest.pages.find((page) => page.path === 'pkg/pages/a/a')
    expect(ownerPage?.configuration?.placeholders).toEqual({ 'pkg/components/box/box': 'view' })
    const shared = result.manifest.components.find(
      (component) => component.path === 'components/shared/shared',
    )
    expect(shared?.subpackage).toBeUndefined()
    const packageService = await fs.readFile(path.join(outputDir, 'service.pkg.js'), 'utf8')
    expect(packageService).toContain('pkg/components/box/box')
    expect(packageService).not.toContain('components/shared/shared')
    const mainService = await fs.readFile(path.join(outputDir, 'service.js'), 'utf8')
    expect(mainService).toContain('components/shared/shared')
    const mainChunk = mainService.match(/chunks\/[^"']+\.js/)?.[0]
    const pkgChunk = packageService.match(/chunks\/[^"']+\.js/)?.[0]
    expect(mainChunk).toBeDefined()
    expect(pkgChunk).toBe(mainChunk)
    const chunkSource = await fs.readFile(path.join(outputDir, mainChunk!), 'utf8')
    expect(chunkSource).toContain('SHARED_MODULE_MARKER')

    expect(result.manifest.preloadRules).toEqual([{
      page: 'pages/index/index',
      network: 'wifi',
      packages: ['pkg'],
    }])
    const assets = result.manifest.assets.map((asset) => asset.path)
    expect(assets).toContain('assets/logo.png')
    expect(assets).not.toContain('assets/ignored/logo.png')

    const codes = result.diagnostics.map((item) => item.code)
    expect(codes).toContain('APP_TABBAR_PAGE_NOT_FOUND')
    expect(codes).toContain('APP_LAZY_CODE_LOADING_UNSUPPORTED')
    expect(codes).toContain('APP_PRELOAD_PACKAGE_NOT_FOUND')
    expect(codes).toContain('APP_PRELOAD_PAGE_NOT_FOUND')
    expect(codes).toContain('COMPONENT_PLACEHOLDER_UNKNOWN_TAG')
    expect(codes).toContain('COMPONENT_PLACEHOLDER_UNKNOWN_TARGET')
  })

  test('rejects a main-package component from an independent package', async () => {
    const independentRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-independent-'))
    try {
      await write(independentRoot, 'app.json', JSON.stringify({
        pages: ['pages/index/index'],
        subPackages: [{
          root: 'solo',
          pages: ['pages/solo/solo'],
          independent: true,
        }],
      }))
      await write(independentRoot, 'app.js', 'App({})\n')
      await write(independentRoot, 'pages/index/index.js', 'Page({})\n')
      await write(independentRoot, 'pages/index/index.wxml', '<view />\n')
      await write(independentRoot, 'components/main/main.js', 'Component({})\n')
      await write(independentRoot, 'components/main/main.json', '{ "component": true }\n')
      await write(independentRoot, 'components/main/main.wxml', '<view />\n')
      await write(independentRoot, 'solo/pages/solo/solo.js', 'Page({})\n')
      await write(independentRoot, 'solo/pages/solo/solo.json', JSON.stringify({
        usingComponents: { main: '/components/main/main' },
      }))
      await write(independentRoot, 'solo/pages/solo/solo.wxml', '<main />\n')
      const result = await compileMiniProgram({
        sourceDir: independentRoot,
        outputDir: path.join(independentRoot, 'dist'),
        clean: true,
      })
      expect(result.diagnostics.some(
        (item) => item.code === 'INDEPENDENT_PACKAGE_DEPENDENCY',
      )).toBe(true)
    } finally {
      await fs.rm(independentRoot, { recursive: true, force: true })
    }
  })

  test('rejects a non-miniprogram compile type', async () => {
    const pluginRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-plugin-'))
    try {
      await write(pluginRoot, 'project.config.json', JSON.stringify({
        compileType: 'plugin',
      }))
      await write(pluginRoot, 'app.json', JSON.stringify({ pages: ['pages/index/index'] }))
      await write(pluginRoot, 'app.js', 'App({})\n')
      await write(pluginRoot, 'pages/index/index.js', 'Page({})\n')
      await write(pluginRoot, 'pages/index/index.wxml', '<view />\n')
      const result = await compileMiniProgram({
        sourceDir: pluginRoot,
        outputDir: path.join(pluginRoot, 'dist'),
        clean: true,
      })
      expect(result.diagnostics.some((item) => item.code === 'PROJECT_COMPILE_TYPE_UNSUPPORTED'))
        .toBe(true)
    } finally {
      await fs.rm(pluginRoot, { recursive: true, force: true })
    }
  })
})

async function write(base: string, relative: string, content: string | Buffer): Promise<void> {
  const target = path.join(base, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
