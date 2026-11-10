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
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-theme-'))
  outputDir = path.join(root, 'dist')
  await write(root, 'app.json', JSON.stringify({
    pages: ['pages/index/index'],
    themeLocation: 'theme.json',
    window: {
      navigationBarTitleText: 'Theme',
      navigationBarBackgroundColor: '@navBg',
      navigationBarTextStyle: '@navText',
      backgroundColor: '@bg',
    },
  }))
  await write(root, 'app.js', 'App({})\n')
  await write(root, 'app.wxss', '.page { color: var(--fg); }\n')
  await write(root, 'theme.json', JSON.stringify({
    light: { navBg: '#f7f7f7', navText: 'black', bg: '#ffffff', fg: '#111111' },
    dark: { navBg: '#1f1f1f', navText: 'white', bg: '#000000', fg: '#eeeeee' },
  }))
  await write(root, 'pages/index/index.js', 'Page({})\n')
  await write(root, 'pages/index/index.json', JSON.stringify({
    backgroundColor: '@bg',
    backgroundTextStyle: '@missing',
  }))
  await write(root, 'pages/index/index.wxml', '<view class="page" />\n')
  await write(root, 'pages/index/index.wxss', '.page { background: var(--bg); }\n')
})

afterAll(async () => {
  delete globals.__tinyWxsRuntime
  wxsRuntime.dispose()
  await fs.rm(root, { recursive: true, force: true })
})

describe('theme.json variables', () => {
  test('resolves @references for light/dark and injects CSS variables', async () => {
    const result = await compileMiniProgram({ sourceDir: root, outputDir, clean: true })
    expect(result.manifest.theme).toEqual({
      light: { navBg: '#f7f7f7', navText: 'black', bg: '#ffffff', fg: '#111111' },
      dark: { navBg: '#1f1f1f', navText: 'white', bg: '#000000', fg: '#eeeeee' },
    })
    const app = result.manifest.app?.configuration
    expect(app?.effective.window).toMatchObject({
      navigationBarBackgroundColor: '#f7f7f7',
      navigationBarTextStyle: 'black',
      backgroundColor: '#ffffff',
    })
    expect(app?.darkEffective?.window).toMatchObject({
      navigationBarBackgroundColor: '#1f1f1f',
      navigationBarTextStyle: 'white',
      backgroundColor: '#000000',
    })
    const page = result.manifest.pages[0]?.configuration
    expect(page?.effective.backgroundColor).toBe('#ffffff')
    expect(page?.darkEffective?.backgroundColor).toBe('#000000')

    const css = await fs.readFile(path.join(outputDir, 'styles/app.wxss.css'), 'utf8')
    expect(css).toContain(':root{--navBg:#f7f7f7;')
    expect(css).toContain('@media (prefers-color-scheme: dark){:root{--navBg:#1f1f1f;')

    expect(result.diagnostics.some((item) => item.code === 'THEME_VARIABLE_NOT_FOUND'))
      .toBe(true)
    expect(page?.effective.backgroundTextStyle).toBe('@missing')
  })

  test('creates a theme stylesheet when the app has no app.wxss', async () => {
    const bareRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-theme-bare-'))
    try {
      await write(bareRoot, 'app.json', JSON.stringify({
        pages: ['pages/index/index'],
        darkmode: true,
      }))
      await write(bareRoot, 'app.js', 'App({})\n')
      await write(bareRoot, 'theme.json', JSON.stringify({
        light: { bg: '#fff' },
        dark: { bg: '#000' },
      }))
      await write(bareRoot, 'pages/index/index.js', 'Page({})\n')
      await write(bareRoot, 'pages/index/index.wxml', '<view />\n')
      const result = await compileMiniProgram({
        sourceDir: bareRoot,
        outputDir: path.join(bareRoot, 'dist'),
        clean: true,
      })
      expect(result.manifest.app?.style?.outputPath).toBe('styles/theme.css')
      const css = await fs.readFile(path.join(bareRoot, 'dist/styles/theme.css'), 'utf8')
      expect(css).toContain(':root{--bg:#fff;}')
    } finally {
      await fs.rm(bareRoot, { recursive: true, force: true })
    }
  })
})

async function write(base: string, relative: string, content: string): Promise<void> {
  const target = path.join(base, relative)
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content, 'utf8')
}
