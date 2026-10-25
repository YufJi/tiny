import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, describe, expect, test } from 'vitest'
import { compileMiniProgram } from '../src'

const fixtureRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fixtureDir = path.join(fixtureRoot, 'mini')
const namingFixtureDir = path.join(fixtureRoot, 'naming')
let outputDir: string

beforeAll(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-'))
  await compileMiniProgram({
    sourceDir: fixtureDir,
    outputDir,
    clean: true,
    dev: true,
  })
})

afterAll(async () => {
  await fs.rm(outputDir, { recursive: true, force: true })
})

describe('compileMiniProgram', () => {
  test('emits a versioned manifest with all artifact classes', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    expect(manifest.schemaVersion).toBe(1)
    expect(manifest.entries).toEqual({
      service: 'service.js',
      render: 'render.js',
      templates: 'templates.js',
    })
    expect(manifest.pages).toHaveLength(1)
    expect(manifest.components).toHaveLength(1)
    expect(manifest.styles.length).toBeGreaterThan(0)
    expect(manifest.assets).toEqual([])
    expect(manifest.naming).toMatchObject({
      prefix: 'wx-',
      directive: 'wx',
      api: 'wx',
      hostAttribute: 'wx-host',
      tagClassPrefix: 'wx-tag-',
    })
  })

  test('maps global app.wxss tag selectors to built-in hosts', async () => {
    const css = await fs.readFile(path.join(outputDir, 'styles/app.wxss.css'), 'utf8')
    expect(css).toContain('tiny-button')
    expect(css).not.toMatch(/(^|[\s,])button\s*\{/)
  })

  test('registers external WXS files with and without their extension', async () => {
    const templates = await fs.readFile(path.join(outputDir, 'templates.js'), 'utf8')
    expect(templates).toContain('W["pages/index/utils.wxs"]')
    expect(templates).toContain('W["pages/index/utils"]')
  })

  test('resolves and merges component configuration', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    const page = manifest.pages[0]
    expect(page.configuration.effective.usingComponents).toEqual({
      badge: './components/badge/badge',
    })
    expect(page.configuration.usingComponentsSource).toEqual({ badge: 'global' })
  })

  test('emits loadable service and render entry points', async () => {
    const service = await fs.readFile(path.join(outputDir, 'service.js'), 'utf8')
    const render = await fs.readFile(path.join(outputDir, 'render.js'), 'utf8')
    expect(service).toContain('App({')
    expect(service).toContain('Page({')
    expect(service).toContain('Component({')
    expect(service).not.toContain("import './scripts/")
    expect(render).toContain("import templates from './templates.js'")
    await expect(fs.access(path.join(outputDir, 'service.js.map'))).resolves.toBeUndefined()
    await expect(fs.access(path.join(outputDir, 'scripts/app.js'))).resolves.toBeUndefined()
    await expect(fs.access(path.join(outputDir, 'templates.js'))).resolves.toBeUndefined()
  })

  test('transpiles TypeScript with source maps', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    const script = manifest.pages[0].script
    expect(script.sourceMapPath).toBe(`${script.path}.map`)
    const map = JSON.parse(await fs.readFile(path.join(outputDir, script.sourceMapPath), 'utf8'))
    expect(map.sources[0]).toContain('index.ts')
    expect(map.sourcesContent[0]).toContain('interface IndexData')
  })

  test('emits scoped styles, rpx conversion, and source maps', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    const style = manifest.pages[0].style
    expect(style.scope).toBe('tiny-pages-index-index')
    const css = await fs.readFile(path.join(outputDir, style.outputPath), 'utf8')
    const map = JSON.parse(await fs.readFile(path.join(outputDir, style.sourceMapPath), 'utf8'))
    expect(css).toContain(`.${style.scope}--page`)
    expect(css).toContain('vw')
    expect(map.sourcesContent[0]).toContain('100rpx')
  })

  test('compiles inline WXS into the shared template group', async () => {
    const templates = await fs.readFile(path.join(outputDir, 'templates.js'), 'utf8')
    expect(templates).toContain('modules')
    expect(templates).toContain('pages/index/index')
    expect(templates).toContain('components/badge/badge')
    expect(templates).toContain('R,C,D,U,A')
    expect(templates).toContain('A||{')
  })

  test('emits an executable template group', async () => {
    const templates = await fs.readFile(path.join(outputDir, 'templates.js'), 'utf8')
    const encoded = Buffer.from(templates).toString('base64')
    const module = await import(`data:text/javascript;base64,${encoded}`)
    expect(Object.keys(module.default.groupList)).toEqual(
      expect.arrayContaining(['pages/index/index', 'components/badge/badge']),
    )
    expect(typeof module.default.content('pages/index/index')).toBe('function')
  })

  test('scopes tag selectors and injects tag marker classes', async () => {
    const pageCss = await fs.readFile(path.join(outputDir, 'styles/pages/index/index.wxss.css'), 'utf8')
    const componentCss = await fs.readFile(path.join(outputDir, 'styles/components/badge/badge.wxss.css'), 'utf8')
    const templates = await fs.readFile(path.join(outputDir, 'templates.js'), 'utf8')
    expect(pageCss).toContain('.tiny-pages-index-index--wx-tag-view')
    expect(componentCss).toContain('.tiny-components-badge-badge--wx-tag-text')
    expect(templates).toContain('wx-tag-view')
  })

  test('does not report errors for the valid fixture', async () => {
    const result = await compileMiniProgram({
      sourceDir: fixtureDir,
      outputDir,
      clean: true,
      dev: true,
    })
    expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
  })
})

describe('compileMiniProgram — naming config', () => {
  test('applies the prefix from tiny.config.json to directives, markers and the manifest', async () => {
    const namingOutputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-naming-'))
    try {
      const result = await compileMiniProgram({
        sourceDir: namingFixtureDir,
        outputDir: namingOutputDir,
        clean: true,
        dev: true,
      })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      expect(result.manifest.naming).toMatchObject({
        prefix: 'tiny-',
        directive: 'tiny',
        api: 'tiny',
        hostAttribute: 'tiny-host',
        tagClassPrefix: 'tiny-tag-',
      })

      const templates = await fs.readFile(path.join(namingOutputDir, 'templates.js'), 'utf8')
      expect(templates).toContain('tiny-tag-view')
      const css = await fs.readFile(
        path.join(namingOutputDir, 'styles/pages/index/index.wxss.css'),
        'utf8',
      )
      expect(css).toContain('--tiny-tag-view')
      expect(css).not.toContain('wx-tag-')
    } finally {
      await fs.rm(namingOutputDir, { recursive: true, force: true })
    }
  })
})
