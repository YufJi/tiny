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

function createManifest(
  isolation: 'isolated' | 'apply-shared' | 'shared',
  styleExtension = '.wxss',
): Manifest {
  const appStyle: StyleArtifact = {
    path: `app${styleExtension}`,
    sourcePath: `app${styleExtension}`,
    outputPath: `styles/app${styleExtension}.css`,
  }
  const pageStyle: StyleArtifact = {
    path: `${PAGE_PATH}${styleExtension}`,
    sourcePath: `${PAGE_PATH}${styleExtension}`,
    outputPath: `styles/${PAGE_PATH}${styleExtension}.css`,
    scope: APP_SCOPE,
  }
  const componentStyle: StyleArtifact = {
    path: `${COMPONENT_PATH}${styleExtension}`,
    sourcePath: `${COMPONENT_PATH}${styleExtension}`,
    outputPath: `styles/${COMPONENT_PATH}${styleExtension}.css`,
    scope: COMPONENT_SCOPE,
  }
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    style: pageStyle,
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { styleIsolation: 'isolated', usingComponents: { box: `/${COMPONENT_PATH}` } },
      usingComponents: { box: `/${COMPONENT_PATH}` },
      usingComponentsSource: { box: 'local' },
    },
  }
  return {
    schemaVersion: 1,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    app: {
      path: 'app',
      style: appStyle,
      configuration: { path: 'app', sourcePath: 'app.json', effective: {} },
    },
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
      appStyle,
      {
        path: `app${styleExtension}@page-scope`,
        sourcePath: `app${styleExtension}`,
        outputPath: `styles/app${styleExtension}.page-scope.css`,
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

function createAdapter(
  isolation: 'isolated' | 'apply-shared' | 'shared',
  styleExtension = '.wxss',
  pagePath?: string,
) {
  const manifest = createManifest(isolation, styleExtension)
  const backend = new RecordingBackend()
  const contents: Record<string, string> = {
    [`styles/app${styleExtension}.css`]: APP_CSS,
    [`styles/app${styleExtension}.page-scope.css`]: APP_PAGE_SCOPE_CSS,
    [`styles/${PAGE_PATH}${styleExtension}.css`]: '.page { padding: 0 }',
    [`styles/${COMPONENT_PATH}${styleExtension}.css`]: '.box { display: block }',
  }
  const adapter = new GlassEaselRuntimeAdapter({
    backend,
    manifest,
    templates: createTemplateRegistry(),
  })
  const schema = createSchema(isolation)
  adapter.registerStyles(manifest, (path) => contents[path] ?? '', [schema], {
    ...(pagePath ? { pagePath } : {}),
  })
  adapter.registerComponentSchemas([schema])
  adapter.registerPage(manifest.pages[0]!, {})
  return { adapter, backend }
}

describe('app stylesheet page-scope delivery', () => {
  test.each(['apply-shared', 'shared'] as const)(
    're-scopes the app stylesheet for %s components',
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
      // Cascade order: app style < its page-scoped copy < page style < component style.
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

  test.each(['.wxss', '.acss'])(
    'identifies app and entry styles from manifest references (%s)',
    (styleExtension) => {
      const { backend } = createAdapter('shared', styleExtension, PAGE_PATH)
      const paths = backend.styleSheetPaths.map((item) => item.path)
      expect(paths).toContain(`styles/app${styleExtension}.css`)
      expect(paths).toContain(`styles/${PAGE_PATH}${styleExtension}.css`)
      expect(paths).toContain(`styles/${COMPONENT_PATH}${styleExtension}.css`)
      expect(paths.filter((path) => path.includes('@page:'))).toHaveLength(1)
      expect(paths.some((path) => path.includes('@shared:'))).toBe(true)
    },
  )

  test('registers only styles reachable from the selected page', () => {
    const manifest = createManifest('shared')
    const otherPagePath = 'pages/other/other'
    const otherPageStyle: StyleArtifact = {
      path: `${otherPagePath}.wxss`,
      sourcePath: `${otherPagePath}.wxss`,
      outputPath: `styles/${otherPagePath}.wxss.css`,
      scope: 'tiny-pages-other-other',
    }
    const otherPage: PageArtifact = {
      path: otherPagePath,
      template: {
        path: otherPagePath,
        outputPath: 'templates.js',
        sourcePath: `${otherPagePath}.wxml`,
      },
      style: otherPageStyle,
      configuration: {
        path: otherPagePath,
        sourcePath: `${otherPagePath}.json`,
        effective: { styleIsolation: 'isolated', usingComponents: { box: `/${COMPONENT_PATH}` } },
        usingComponents: { box: `/${COMPONENT_PATH}` },
        usingComponentsSource: { box: 'local' },
      },
    }
    manifest.pages.push(otherPage)
    manifest.styles.push(otherPageStyle)

    const backend = new RecordingBackend()
    const adapter = new GlassEaselRuntimeAdapter({
      backend,
      manifest,
      templates: createTemplateRegistry(),
    })
    const schema = createSchema('shared')
    const contents: Record<string, string> = {
      'styles/app.wxss.css': APP_CSS,
      'styles/app.wxss.page-scope.css': APP_PAGE_SCOPE_CSS,
      [`styles/${PAGE_PATH}.wxss.css`]: '.page { padding: 0 }',
      [`styles/${otherPagePath}.wxss.css`]: '.other { padding: 0 }',
      [`styles/${COMPONENT_PATH}.wxss.css`]: '.box { display: block }',
    }
    const loadedPaths: string[] = []

    adapter.registerStyles(
      manifest,
      (path) => {
        loadedPaths.push(path)
        return contents[path] ?? ''
      },
      [schema],
      { pagePath: PAGE_PATH },
    )

    const paths = backend.styleSheetPaths.map((item) => item.path)
    expect(paths).toContain(`styles/${PAGE_PATH}.wxss.css`)
    expect(paths).toContain(`styles/${COMPONENT_PATH}.wxss.css`)
    expect(paths).not.toContain(`styles/${otherPagePath}.wxss.css`)
    expect(paths.filter((path) => path.includes('@page:'))).toHaveLength(1)
    expect(backend.styleSheets.has(`styles/${otherPagePath}.wxss.css`)).toBe(false)
    expect(loadedPaths).not.toContain(`styles/${otherPagePath}.wxss.css`)
  })

  test('registers low-priority host styles before normal page and component sheets', () => {
    const manifest = createManifest('isolated')
    const component = manifest.components[0]!
    const style = component.style!
    style.lowPriorityPath = `styles/${COMPONENT_PATH}.wxss.low.css`
    const backend = new RecordingBackend()
    const adapter = new GlassEaselRuntimeAdapter({
      backend,
      manifest,
      templates: createTemplateRegistry(),
    })
    const lowPriorityKey = `${style.outputPath}@low-priority`
    adapter.registerStyles(
      manifest,
      (path) => path === style.lowPriorityPath ? ':host { color: red }' : '.probe { color: red }',
      [createSchema('isolated')],
      { pagePath: PAGE_PATH },
    )

    const paths = backend.styleSheetPaths.map((item) => item.path)
    expect(paths[0]).toBe(lowPriorityKey)
    expect(paths.indexOf(lowPriorityKey)).toBeLessThan(paths.indexOf('styles/app.wxss.css'))
    expect(backend.styleSheets.get(lowPriorityKey)).toBe(':host { color: red }')
  })
})
