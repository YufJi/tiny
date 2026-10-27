import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, afterAll, describe, expect, test } from 'vitest'
import {
  APP_PAGE_SCOPE_CLASS_SIGN,
  TINY_ENGINE_NAMING,
} from '@tiny/manifest'
import { compileMiniProgram } from '../src'

const HOST_ATTRIBUTE = TINY_ENGINE_NAMING.hostAttribute
const fixtureRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')
const fixtureDir = path.join(fixtureRoot, 'mini')
const compatibilityFixtureDir = path.join(fixtureRoot, 'compatibility')
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
    expect(manifest.schemaVersion).toBe(2)
    expect(manifest.entries).toEqual({
      service: 'service.js',
      render: 'render.js',
      templates: 'templates.js',
    })
    expect(manifest.pages).toHaveLength(1)
    expect(manifest.components).toHaveLength(1)
    expect(manifest.styles.length).toBeGreaterThan(0)
    expect(manifest.assets).toEqual([])
    expect(manifest.runtimeCompatibility).toMatchObject({
      api: { global: 'wx', aliases: [] },
      globals: {
        app: 'App',
        page: 'Page',
        component: 'Component',
        behavior: 'Behavior',
      },
      behaviorScheme: 'wx://',
    })
    expect(manifest.naming).toBeUndefined()
  })

  test('maps global app.wxss tag selectors to built-in hosts', async () => {
    const css = await fs.readFile(path.join(outputDir, 'styles/app.wxss.css'), 'utf8')
    expect(css).toContain('tiny-button')
    expect(css).toContain('tiny-button:where(.tiny-scope)')
    expect(css).toContain(':where(.tiny-scope).app-shell')
    expect(css).toContain('tiny-page:where(.tiny-scope)')
    expect(css).not.toMatch(/(^|[\s,])button\s*\{/)
    expect(css).not.toContain(APP_PAGE_SCOPE_CLASS_SIGN)
  })

  test('emits a page-scope app.wxss template for apply-shared components', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    const template = manifest.styles.find(
      (style: { pageScopeClassSign?: string }) => style.pageScopeClassSign === APP_PAGE_SCOPE_CLASS_SIGN,
    )
    expect(template).toMatchObject({
      path: 'app.wxss@page-scope',
      outputPath: 'styles/app.wxss.page-scope.css',
    })
    expect(template.scope).toBeUndefined()
    const css = await fs.readFile(path.join(outputDir, template.outputPath), 'utf8')
    const marker = `:where(.${APP_PAGE_SCOPE_CLASS_SIGN}, [${HOST_ATTRIBUTE}="${APP_PAGE_SCOPE_CLASS_SIGN}"])`
    expect(css).toContain(`*${marker}`)
    expect(css).toContain(`span${marker}`)
    expect(css).toContain(`${marker}./*${APP_PAGE_SCOPE_CLASS_SIGN}*/app-shell`)
    expect(css).toContain(`tiny-button${marker}`)
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
      badge: '/components/badge/badge',
    })
    expect(page.configuration.usingComponentsSource).toEqual({ badge: 'global' })
  })

  test('resolves npm-style usingComponents through miniprogram_npm', async () => {
    const sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-npm-components-'))
    const npmOutput = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-npm-output-'))
    try {
      await fs.mkdir(path.join(sourceDir, 'pages/index'), { recursive: true })
      await fs.mkdir(path.join(sourceDir, 'miniprogram_npm/pkg/button'), { recursive: true })
      await fs.writeFile(path.join(sourceDir, 'app.json'), JSON.stringify({
        pages: ['pages/index/index'],
      }))
      await fs.writeFile(path.join(sourceDir, 'app.js'), 'App({})')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.js'), 'Page({})')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.json'), JSON.stringify({
        usingComponents: { 'pkg-button': 'pkg/button/index' },
      }))
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.wxml'), '<pkg-button />')
      await fs.writeFile(
        path.join(sourceDir, 'miniprogram_npm/pkg/button/index.js'),
        'Component({ properties: { label: String } })',
      )
      await fs.writeFile(
        path.join(sourceDir, 'miniprogram_npm/pkg/button/index.json'),
        JSON.stringify({ component: true }),
      )
      await fs.writeFile(path.join(sourceDir, 'miniprogram_npm/pkg/button/index.wxml'), '<view>{{label}}</view>')

      const result = await compileMiniProgram({ sourceDir, outputDir: npmOutput, clean: true, dev: true })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      const manifest = JSON.parse(await fs.readFile(path.join(npmOutput, 'manifest.json'), 'utf8'))
      expect(manifest.pages[0].configuration.usingComponents).toEqual({
        'pkg-button': '/miniprogram_npm/pkg/button/index',
      })
      expect(manifest.components.map((component: { path: string }) => component.path))
        .toContain('miniprogram_npm/pkg/button/index')
    } finally {
      await fs.rm(sourceDir, { recursive: true, force: true })
      await fs.rm(npmOutput, { recursive: true, force: true })
    }
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

  test('routes :host rules to scoped low-priority CSS', async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.json'), 'utf8'))
    const badge = manifest.components.find((component: { path: string }) => component.path === 'components/badge/badge')
    const style = badge.style
    const normal = await fs.readFile(path.join(outputDir, style.outputPath), 'utf8')
    const lowPriority = await fs.readFile(path.join(outputDir, style.lowPriorityPath), 'utf8')
    expect(normal).not.toContain(':host')
    expect(lowPriority).toContain(`[${HOST_ATTRIBUTE}="tiny-components-badge-badge"]`)
    expect(lowPriority).toContain('color: rgb(1, 2, 3)')
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
    expect(pageCss).toContain('tiny-view:where(.tiny-pages-index-index--tiny-tag-view)')
    expect(componentCss).toContain('tiny-text:where(.tiny-components-badge-badge--tiny-tag-text)')
    expect(templates).toContain('tiny-tag-view')
    expect(templates).toContain('tiny-scope')
  })

  test('injects scope markers into components without a local stylesheet', async () => {
    const sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-unstyled-component-'))
    const unstyledOutput = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-unstyled-output-'))
    try {
      await fs.mkdir(path.join(sourceDir, 'pages/index'), { recursive: true })
      await fs.mkdir(path.join(sourceDir, 'components/plain'), { recursive: true })
      await fs.writeFile(path.join(sourceDir, 'app.json'), JSON.stringify({
        pages: ['pages/index/index'],
      }))
      await fs.writeFile(path.join(sourceDir, 'app.js'), 'App({})')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.js'), 'Page({})')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.json'), JSON.stringify({
        usingComponents: { plain: '../../components/plain/plain' },
      }))
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.wxml'), '<plain />')
      await fs.writeFile(
        path.join(sourceDir, 'components/plain/plain.js'),
        'Component({ options: { styleIsolation: "apply-shared" } })',
      )
      await fs.writeFile(
        path.join(sourceDir, 'components/plain/plain.json'),
        JSON.stringify({ component: true, styleIsolation: 'apply-shared' }),
      )
      await fs.writeFile(
        path.join(sourceDir, 'components/plain/plain.wxml'),
        '<inner-probe />',
      )

      const result = await compileMiniProgram({
        sourceDir,
        outputDir: unstyledOutput,
        clean: true,
        dev: true,
      })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      const component = result.manifest.components.find((item) => item.path === 'components/plain/plain')
      expect(component?.style).toBeUndefined()
      const templates = await fs.readFile(path.join(unstyledOutput, 'templates.js'), 'utf8')
      expect(templates).toContain('tiny-tag-inner-probe')
      expect(templates).toContain('tiny-scope')
    } finally {
      await fs.rm(sourceDir, { recursive: true, force: true })
      await fs.rm(unstyledOutput, { recursive: true, force: true })
    }
  })

  test('honors configured stylesheet extensions throughout compilation', async () => {
    const sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-acss-'))
    const acssOutput = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-acss-output-'))
    try {
      await fs.mkdir(path.join(sourceDir, 'pages/index'), { recursive: true })
      await fs.writeFile(path.join(sourceDir, 'app.json'), JSON.stringify({
        pages: ['pages/index/index'],
      }))
      await fs.writeFile(path.join(sourceDir, 'app.js'), 'App({})')
      await fs.writeFile(path.join(sourceDir, 'app.acss'), 'button { display: flex }')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.js'), 'Page({})')
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.json'), '{}')
      await fs.writeFile(
        path.join(sourceDir, 'pages/index/index.wxml'),
        '<view><button>Go</button></view>',
      )
      await fs.writeFile(
        path.join(sourceDir, 'pages/index/index.acss'),
        '@import "./common.acss"; view { color: red }',
      )
      await fs.writeFile(path.join(sourceDir, 'pages/index/common.acss'), '.imported { color: blue }')

      const result = await compileMiniProgram({
        sourceDir,
        outputDir: acssOutput,
        clean: true,
        dev: true,
        compatibility: { extensions: { style: ['.acss'] } },
      })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      expect(result.manifest.app?.style?.path).toBe('app.acss')
      expect(result.manifest.pages[0]?.style?.path).toBe('pages/index/index.acss')

      const appCss = await fs.readFile(path.join(acssOutput, 'styles/app.acss.css'), 'utf8')
      const appPageScopeStyle = result.manifest.styles.find(
        (style) => style.pageScopeClassSign === APP_PAGE_SCOPE_CLASS_SIGN,
      )
      expect(appPageScopeStyle).toBeDefined()
      const appPageScopeCss = await fs.readFile(
        path.join(acssOutput, appPageScopeStyle!.outputPath),
        'utf8',
      )
      const pageCss = await fs.readFile(path.join(acssOutput, 'styles/pages/index/index.acss.css'), 'utf8')
      const templates = await fs.readFile(path.join(acssOutput, 'templates.js'), 'utf8')
      expect(appCss).toContain('tiny-button')
      expect(appPageScopeCss).toContain(
        `tiny-button:where(.${APP_PAGE_SCOPE_CLASS_SIGN}, [${HOST_ATTRIBUTE}="${APP_PAGE_SCOPE_CLASS_SIGN}"])`,
      )
      expect(pageCss).toContain('tiny-view:where(.tiny-pages-index-index--tiny-tag-view)')
      expect(pageCss).toContain('.tiny-pages-index-index--imported')
      expect(templates).toContain('tiny-scope')
    } finally {
      await fs.rm(sourceDir, { recursive: true, force: true })
      await fs.rm(acssOutput, { recursive: true, force: true })
    }
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

describe('compileMiniProgram — compatibility config', () => {
  test('honors fully custom file, directive, API and global conventions', async () => {
    const sourceDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-custom-conventions-'))
    const customOutput = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-custom-output-'))
    try {
      await fs.mkdir(path.join(sourceDir, 'pages/index'), { recursive: true })
      await fs.writeFile(path.join(sourceDir, 'tiny.config.json'), JSON.stringify({
        compatibility: {
          extensions: {
            script: ['.mjs'],
            template: ['.view'],
            style: ['.mcss'],
            templateScript: ['.tpl'],
            config: ['.mjson'],
          },
          files: {
            appConfig: 'app.mjson',
            projectConfig: 'project.mjson',
          },
          directiveNamespace: 'directive',
          api: { global: 'my', aliases: ['wx'] },
          globals: {
            app: 'HostApp',
            page: 'HostPage',
            component: 'HostComponent',
            behavior: 'HostBehavior',
            getApp: 'hostGetApp',
            getCurrentPages: 'hostGetCurrentPages',
          },
          behaviorScheme: 'my://',
        },
      }))
      await fs.writeFile(path.join(sourceDir, 'app.mjson'), JSON.stringify({
        pages: ['pages/index/index'],
      }))
      await fs.writeFile(path.join(sourceDir, 'app.mjs'), 'HostApp({})')
      await fs.writeFile(
        path.join(sourceDir, 'pages/index/index.mjs'),
        'HostPage({ data: { visible: true } })',
      )
      await fs.writeFile(path.join(sourceDir, 'pages/index/index.mjson'), '{}')
      await fs.writeFile(path.join(sourceDir, 'pages/index/utils.tpl'), 'exports.ok = true')
      await fs.writeFile(
        path.join(sourceDir, 'pages/index/index.view'),
        '<wxs module="utils" src="./utils" />' +
          '<view directive:if="{{utils.ok}}"><button>Go</button></view>',
      )
      await fs.writeFile(
        path.join(sourceDir, 'pages/index/index.mcss'),
        '@import "./shared.mcss"; view { color: red }',
      )
      await fs.writeFile(path.join(sourceDir, 'pages/index/shared.mcss'), '.shared { color: blue }')

      const result = await compileMiniProgram({
        sourceDir,
        outputDir: customOutput,
        clean: true,
      })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      expect(result.manifest.runtimeCompatibility).toMatchObject({
        api: { global: 'my', aliases: ['wx'] },
        globals: { app: 'HostApp', page: 'HostPage' },
        behaviorScheme: 'my://',
      })
      expect(result.manifest.app?.configuration?.sourcePath).toBe('app.mjson')
      expect(result.manifest.pages[0]?.configuration?.sourcePath).toBe('pages/index/index.mjson')
      expect(result.manifest.app?.script?.path).toBe('scripts/app.js')
      expect(result.manifest.pages[0]?.script?.path).toBe('scripts/pages/index/index.js')
      expect(result.manifest.pages[0]?.template?.path).toBe('pages/index/index')
      expect(result.manifest.pages[0]?.style?.path).toBe('pages/index/index.mcss')

      const templates = await fs.readFile(path.join(customOutput, 'templates.js'), 'utf8')
      expect(templates).toContain('utils.tpl')
      expect(templates).toContain('utils')
      const css = await fs.readFile(
        path.join(customOutput, 'styles/pages/index/index.mcss.css'),
        'utf8',
      )
      expect(css).toContain('--tiny-tag-view')
      expect(css).toContain('.tiny-pages-index-index--shared')
      expect(css).not.toContain('wx-tag-')
      expect(css).not.toContain('wx-scope')
    } finally {
      await fs.rm(sourceDir, { recursive: true, force: true })
      await fs.rm(customOutput, { recursive: true, force: true })
    }
  })

  test('uses configured directives/API without changing Tiny internal names', async () => {
    const namingOutputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-compatibility-'))
    try {
      const result = await compileMiniProgram({
        sourceDir: compatibilityFixtureDir,
        outputDir: namingOutputDir,
        clean: true,
        dev: true,
      })
      expect(result.diagnostics.filter((item) => item.severity === 'error')).toEqual([])
      expect(result.manifest.runtimeCompatibility).toMatchObject({
        api: { global: 'tiny', aliases: [] },
        behaviorScheme: 'wx://',
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
