import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, describe, expect, test } from 'vitest'
import { compileMiniProgram } from '../src'

const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/mini')
let outputDir: string

beforeAll(async () => {
  outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'compiler-next-'))
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
    expect(service).toContain("import './scripts/app.js'")
    expect(service).toContain("import './scripts/pages/index/index.js'")
    expect(service).toContain("import './scripts/components/badge/badge.js'")
    expect(render).toContain("import templates from './templates.js'")
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
