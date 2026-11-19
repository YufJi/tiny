import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { buildComponentSchemas } from '../src/service/render-bridge/component-schema'
import { LogicTreeAdapter } from '../src/service/logic-tree/adapter'

const PAGE = 'pages/copy/copy'
const CHILD = 'components/child/child'

const PAGE_WXML = '<view id="probe">{{value}}</view><child id="child" />'
const CHILD_WXML = '<view id="box">{{obj.n}}</view>'

function artifact(
  path: string,
  using?: Record<string, string>,
): PageArtifact | ComponentArtifact {
  return {
    path,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: using ? { usingComponents: using } : { component: true },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [artifact(PAGE, { child: `/${CHILD}` })],
    components: [artifact(CHILD)],
    styles: [],
    assets: [],
  }
}

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE, PAGE_WXML)
  group.addTmpl(CHILD, CHILD_WXML)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`template not found: ${path}`)
      return (entry as (name?: string) => unknown)(name)
    },
  }
}

type PageMethods = Record<string, (...args: unknown[]) => unknown>

function mount(methods: PageMethods, componentMethods: Record<string, (...args: unknown[]) => unknown> = {}) {
  const manifest = createManifest()
  const definitions = new Map([
    [CHILD, normalizeComponentDefinition({ methods: componentMethods }, CHILD)],
  ])
  // The page definition is not in `componentDefinitions`; its methods come
  // through `pageOptions` like the real page registry.
  const tree = new LogicTreeAdapter({
    manifest,
    templates: createTemplates(),
    componentDefinitions: definitions,
    pageOptions: new Map([[PAGE, { methods }]]),
  })
  tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))
  return { tree, manifest }
}

function pageData(tree: LogicTreeAdapter, pageId: string): Record<string, unknown> {
  const page = tree.glass.getMountedComponentByPageId(pageId) as unknown as {
    data: Record<string, unknown>
  }
  return page.data
}

function dispatch(
  tree: LogicTreeAdapter,
  pageId: string,
  id: string,
  handler: string,
): void {
  expect(tree.dispatchTemplateHandler({
    componentId: id,
    handler,
    name: 'tap',
    pageId,
    detail: {},
  })).toBe(true)
}

describe('dataDeepCopy and groupSetData', () => {
  test('setData copies caller data (mutating it afterwards does not leak)', async () => {
    const shared = { nested: { n: 1 } }
    const { tree } = mount({
      capture() {
        this.setData({ obj: shared, date: new Date('2012-02-01T00:00:00.000Z') })
        shared.nested.n = 2
      },
    })
    tree.mountPage(PAGE, {}, 'page-copy')
    await tree.glass.whenRendered()
    const rootId = tree.snapshotRenderTree('page-copy')!.id!
    dispatch(tree, 'page-copy', rootId, 'capture')
    const data = pageData(tree, 'page-copy')
    expect((data.obj as { nested: { n: number } }).nested.n).toBe(1)
    expect(data.date).toBeInstanceOf(Date)
    expect((data.date as Date).getTime()).toBe(Date.parse('2012-02-01T00:00:00.000Z'))
  })

  test('component setData copies data and keeps function values', async () => {
    const shared = { n: 1 }
    function keep() { return 1 }
    const { tree } = mount({}, {
      capture() {
        this.setData({ obj: shared, fn: keep })
        shared.n = 2
      },
    })
    tree.mountPage(PAGE, {}, 'page-component')
    await tree.glass.whenRendered()
    const snapshot = tree.snapshotRenderTree('page-component')!
    const child = snapshot.children?.find((node) => node.type === 'element' && node.id) as
      { id?: string } | undefined
    expect(child?.id).toBeTruthy()
    dispatch(tree, 'page-component', child!.id!, 'capture')
    const component = tree.glass.getComponentSnapshot().find((item) => item.path === CHILD)
    expect(component).toBeDefined()
    const mounted = tree.glass.getMountedComponentByComponentId(component!.componentId) as unknown as {
      data: Record<string, unknown>
    }
    expect((mounted.data.obj as { n: number }).n).toBe(1)
    expect(mounted.data.fn).toBe(keep)
  })

  test('recursive data is cloned without overflowing', async () => {
    const cyclic: Record<string, unknown> = { n: 1 }
    cyclic.self = cyclic
    const { tree } = mount({
      capture() {
        this.setData({ cyclic })
      },
    })
    tree.mountPage(PAGE, {}, 'page-cycle')
    await tree.glass.whenRendered()
    const rootId = tree.snapshotRenderTree('page-cycle')!.id!
    dispatch(tree, 'page-cycle', rootId, 'capture')
    const data = pageData(tree, 'page-cycle')
    const cloned = data.cyclic as Record<string, unknown>
    expect(cloned.n).toBe(1)
    expect(cloned.self).toBe(cloned)
  })

  test('groupSetData calls back with the caller as this (page and component)', async () => {
    let pageOuter: unknown
    let componentOuter: unknown
    const { tree } = mount({
      group() {
        pageOuter = this
        this.groupSetData(function (this: unknown) {
          this.setData({ grouped: this === pageOuter ? 'same' : 'diff' })
        })
      },
    }, {
      groupChild() {
        componentOuter = this
        this.groupSetData(function (this: unknown) {
          this.setData({ grouped: this === componentOuter ? 'same' : 'diff' })
        })
      },
    })
    tree.mountPage(PAGE, {}, 'page-group')
    await tree.glass.whenRendered()
    const rootId = tree.snapshotRenderTree('page-group')!.id!
    dispatch(tree, 'page-group', rootId, 'group')
    expect(pageData(tree, 'page-group').grouped).toBe('same')

    const child = tree.snapshotRenderTree('page-group')!.children
      ?.find((node) => node.type === 'element' && node.id) as { id?: string } | undefined
    dispatch(tree, 'page-group', child!.id!, 'groupChild')
    const component = tree.glass.getComponentSnapshot().find((item) => item.path === CHILD)
    const mounted = tree.glass.getMountedComponentByComponentId(component!.componentId) as unknown as {
      data: Record<string, unknown>
    }
    expect(mounted.data.grouped).toBe('same')
  })
})
