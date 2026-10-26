import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import {
  APP_PAGE_SCOPE_CLASS_SIGN,
  type Manifest,
  type PageArtifact,
  type StyleArtifact,
} from '@tiny/manifest'
import { GlassEaselRuntimeAdapter } from '../src/glass-easel-adapter'
import type { MiniProgramComponentSchema } from '../src/types'

const PAGE_PATH = 'pages/index/index'
const COMPONENT_PATH = 'components/box/box'
const APP_SCOPE = 'tiny-pages-index-index'
const COMPONENT_SCOPE = 'tiny-components-box-box'

const APP_CSS = '.box { color: red }'
const APP_PAGE_SCOPE_CSS = `./*${APP_PAGE_SCOPE_CLASS_SIGN}*/box { color: red }`

class RecordingBackend extends glassEasel.EmptyBackendContext {
  readonly styleSheets = new Map<string, unknown>()
  readonly styleSheetPaths: Array<{ path: string; scope?: number }> = []

  registerStyleSheetContent(path: string, content: unknown): void {
    this.styleSheets.set(path, content)
  }

  appendStyleSheetPath(path: string, styleScope?: number): number {
    this.styleSheetPaths.push({ path, scope: styleScope })
    return super.appendStyleSheetPath(path, styleScope)
  }
}

function createTemplateRegistry() {
  const group = TmplGroup.newDev()
  group.addTmpl(PAGE_PATH, '<box />')
  group.addTmpl(COMPONENT_PATH, '<view class="box" />')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const componentGroup = groupList[path]
      if (!componentGroup) throw new Error(`template not found: ${path}`)
      return componentGroup(name)
    },
  }
}

function createManifest(isolation: 'isolated' | 'apply-shared' | 'shared'): Manifest {
  const pageStyle: StyleArtifact = {
    path: `${PAGE_PATH}.wxss`,
    sourcePath: `${PAGE_PATH}.wxss`,
    outputPath: `styles/${PAGE_PATH}.wxss.css`,
    scope: APP_SCOPE,
  }
  const componentStyle: StyleArtifact = {
    path: `${COMPONENT_PATH}.wxss`,
    sourcePath: `${COMPONENT_PATH}.wxss`,
    outputPath: `styles/${COMPONENT_PATH}.wxss.css`,
    scope: COMPONENT_SCOPE,
  }
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    style: pageStyle,
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { usingComponents: { box: `/${COMPONENT_PATH}` } },
      usingComponents: { box: `/${COMPONENT_PATH}` },
      usingComponentsSource: { box: 'local' },
    },
  }
  return {
    schemaVersion: 1,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [page],
    components: [{
      path: COMPONENT_PATH,
      template: {
        path: COMPONENT_PATH,
        outputPath: 'templates.js',
        sourcePath: `${COMPONENT_PATH}.wxml`,
      },
      style: componentStyle,
      configuration: { path: COMPONENT_PATH, sourcePath: `${COMPONENT_PATH}.json`, effective: {} },
    }],
    styles: [
      { path: 'app.wxss', sourcePath: 'app.wxss', outputPath: 'styles/app.wxss.css' },
      {
        path: 'app.wxss@page-scope',
        sourcePath: 'app.wxss',
        outputPath: 'styles/app.wxss.page-scope.css',
        pageScopeClassSign: APP_PAGE_SCOPE_CLASS_SIGN,
      },
      pageStyle,
      componentStyle,
    ],
    assets: [],
  }
}

function createSchema(isolation: 'isolated' | 'apply-shared' | 'shared'): MiniProgramComponentSchema {
  return {
    componentId: COMPONENT_PATH,
    path: COMPONENT_PATH,
    data: {},
    properties: {},
    using: {},
    options: { styleIsolation: isolation },
  }
}

function createAdapter(isolation: 'isolated' | 'apply-shared' | 'shared') {
  const manifest = createManifest(isolation)
  const backend = new RecordingBackend()
  const contents: Record<string, string> = {
    'styles/app.wxss.css': APP_CSS,
    'styles/app.wxss.page-scope.css': APP_PAGE_SCOPE_CSS,
    [`styles/${PAGE_PATH}.wxss.css`]: '.page { padding: 0 }',
    [`styles/${COMPONENT_PATH}.wxss.css`]: '.box { display: block }',
  }
  const adapter = new GlassEaselRuntimeAdapter({
    backend,
    manifest,
    templates: createTemplateRegistry(),
  })
  const schema = createSchema(isolation)
  adapter.registerStyles(manifest, (path) => contents[path] ?? '', [schema])
  adapter.registerComponentSchemas([schema])
  adapter.registerPage(manifest.pages[0]!, {})
  return { adapter, backend }
}

describe('app.wxss page-scope delivery', () => {
  test.each(['apply-shared', 'shared'] as const)(
    're-scopes app.wxss for %s components',
    (isolation) => {
      const { backend } = createAdapter(isolation)
      const sheet = backend.styleSheetPaths.find((item) => item.path.includes('@page:'))
      expect(sheet).toBeDefined()
      const css = backend.styleSheets.get(sheet!.path)
      expect(css).toBe(`.${APP_SCOPE}--box { color: red }`)
      expect(css).not.toContain(APP_PAGE_SCOPE_CLASS_SIGN)
      // The template itself is never registered as a standalone sheet.
      expect(backend.styleSheetPaths.some(
        (item) => item.path === 'styles/app.wxss.page-scope.css',
      )).toBe(false)
      // Cascade order: app.wxss < its page-scoped copy < page wxss < component wxss.
      const paths = backend.styleSheetPaths.map((item) => item.path)
      const appIndex = paths.indexOf('styles/app.wxss.css')
      const copyIndex = paths.indexOf(sheet!.path)
      const pageIndex = paths.indexOf(`styles/${PAGE_PATH}.wxss.css`)
      const componentIndex = paths.indexOf(`styles/${COMPONENT_PATH}.wxss.css`)
      expect(appIndex).toBeLessThan(copyIndex)
      expect(copyIndex).toBeLessThan(pageIndex)
      expect(pageIndex).toBeLessThan(componentIndex)
    },
  )

  test('keeps isolated components on their own scope', () => {
    const { backend } = createAdapter('isolated')
    expect(backend.styleSheetPaths.some((item) => item.path.includes('@page:'))).toBe(false)
  })
})
