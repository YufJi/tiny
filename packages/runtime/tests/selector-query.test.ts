import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { buildComponentSchemas } from '../src/component/component-schema'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'

const PAGE_PATH = 'pages/query/query'
const CHILD_PATH = 'components/child/child'
const RECT = { left: 10, top: 20, right: 30, bottom: 40, width: 20, height: 20, scrollLeft: 0, scrollTop: 0 }

function createFixture() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<child id="child" /><view id="page-node" />')
  group.addTmpl(CHILD_PATH, '<view id="inner">inner</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  const templates = {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`template not found: ${path}`)
      return (entry as (name?: string) => unknown)(name)
    },
  }
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { usingComponents: { child: `/${CHILD_PATH}` } },
    },
  }
  const component: ComponentArtifact = {
    path: CHILD_PATH,
    template: { path: CHILD_PATH, outputPath: 'templates.js', sourcePath: `${CHILD_PATH}.wxml` },
    configuration: {
      path: CHILD_PATH,
      sourcePath: `${CHILD_PATH}.json`,
      effective: { component: true, usingComponents: {} },
    },
  }
  const manifest: Manifest = {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page],
    components: [component],
    styles: [],
    assets: [],
  }
  return { manifest, templates }
}

const runQuery = async (tree: LogicTreeAdapter, pageId: string, selector: string): Promise<unknown> => {
  const query = tree.pageSelectorQuery(pageId) as {
    select: (value: string) => {
      boundingClientRect: (callback: (value: unknown) => void) => { exec: () => void }
    }
  }
  return new Promise((resolve) => {
    query.select(selector).boundingClientRect((value) => resolve(value)).exec()
  })
}

describe('selector query geometry', () => {
  test('falls back to a scoped render query for nodes without a render id', async () => {
    const { manifest, templates } = createFixture()
    const calls: Array<{ selector: string; all: boolean; scopeId?: string }> = []
    const tree = new LogicTreeAdapter({
      manifest,
      templates,
      measureView: async () => ({}),
      queryView: async (request) => {
        calls.push({ selector: request.selector, all: request.all, scopeId: request.scopeId })
        return [RECT]
      },
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [CHILD_PATH, normalizeComponentDefinition({}, CHILD_PATH)],
    ])))
    tree.mountPage(PAGE_PATH, {}, 'page-query')
    await tree.glass.whenRendered()

    const value = await runQuery(tree, 'page-query', '#inner') as Record<string, unknown>

    expect(value).toMatchObject({ left: 10, top: 20, width: 20, height: 20 })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ selector: '#inner', all: false })
    expect(calls[0]?.scopeId).toBeTruthy()
  })

  test('prefers id-based measurement when the render tree has a rect', async () => {
    const { manifest, templates } = createFixture()
    const tree = new LogicTreeAdapter({
      manifest,
      templates,
      measureView: async (viewIds) => Object.fromEntries(viewIds.map((id) => [id, RECT])),
      queryView: async () => {
        throw new Error('queryView must not be used when measurement resolves')
      },
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [CHILD_PATH, normalizeComponentDefinition({}, CHILD_PATH)],
    ])))
    tree.mountPage(PAGE_PATH, {}, 'page-measured')
    await tree.glass.whenRendered()

    const value = await runQuery(tree, 'page-measured', '#page-node') as Record<string, unknown>
    expect(value).toMatchObject({ left: 10, top: 20, width: 20, height: 20 })
  })
  test('sends the selector and scope with an animation request', async () => {
    const { manifest, templates } = createFixture()
    const plays: Array<{ selector?: string; scopeId?: string; viewIds: string[] }> = []
    const tree = new LogicTreeAdapter({
      manifest,
      templates,
      viewAnimation: {
        play: (request) => { plays.push(request as never) },
        clear: () => {},
      },
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [CHILD_PATH, normalizeComponentDefinition({}, CHILD_PATH)],
    ])))
    tree.mountPage(PAGE_PATH, {}, 'page-animate')
    await tree.glass.whenRendered()

    const page = tree.glass.getMountedComponentByPageId('page-animate')
    const started = tree.animateFor(page, '#inner', [{ opacity: 1 }], 300)

    expect(started).toBe(true)
    expect(plays).toHaveLength(1)
    expect(plays[0]).toMatchObject({ selector: '#inner' })
    expect(plays[0]?.scopeId).toBeTruthy()
    expect(plays[0]?.viewIds).toHaveLength(1)
  })
  test('measures page-level elements by locator', async () => {
    const { manifest, templates } = createFixture()
    const locatorCalls: string[][] = []
    const tree = new LogicTreeAdapter({
      manifest,
      templates,
      measureView: async () => ({}),
      measureLocators: async (locators) => {
        locatorCalls.push(locators)
        return Object.fromEntries(locators.map((locator) => [locator, RECT]))
      },
      queryView: async () => {
        throw new Error('queryView must not be used when locators resolve')
      },
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [CHILD_PATH, normalizeComponentDefinition({}, CHILD_PATH)],
    ])))
    tree.mountPage(PAGE_PATH, {}, 'page-locator')
    await tree.glass.whenRendered()

    const value = await runQuery(tree, 'page-locator', '#page-node') as Record<string, unknown>
    expect(value).toMatchObject({ left: 10, top: 20, width: 20, height: 20 })
    expect(locatorCalls.length).toBeGreaterThan(0)
    expect(locatorCalls[0]?.[0]).toMatch(/^view-\d+#\d+$/)
  })
})
