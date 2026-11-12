import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from '../src/service/render-bridge/component-schema'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { LogicTreeAdapter } from '../src/service/logic-tree/adapter'
import type { MiniProgramComponentSchema } from '../src/component/schema'

const PAGE_PATH = 'pages/index/index'
const CHILD_PATH = 'components/child/index'
const PAGE_WXML = [
  '<child id="child" container="{{ container }}" data-date="{{ date }}" data-count="{{ count }}"><text>slotted</text></child>',
  '<view class="after" slot="refresher" style="color: red">{{ label }}</view>',
  '<image id="pic" src="/a.png" mode="aspectFit" />',
].join('')
const CHILD_WXML = '<view class="child">{{ label }}<slot /></view>'

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, PAGE_WXML)
  group.addTmpl(CHILD_PATH, CHILD_WXML)
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

function createManifest(): Manifest {
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
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page],
    components: [component],
    styles: [],
    assets: [],
  }
}

function createSchemas(manifest: Manifest): MiniProgramComponentSchema[] {
  const definition = normalizeComponentDefinition({
    data: { label: 'child' },
    properties: { container: null },
  }, CHILD_PATH)
  return buildComponentSchemas(manifest.components, new Map([[CHILD_PATH, definition]]))
}

describe('logic backend', () => {
  test('records a serializable view tree with typed dataset values', async () => {
    const manifest = createManifest()
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
    })
    tree.registerComponentSchemas(createSchemas(manifest))

    const container = () => 'container'
    const date = new Date('2012-02-01T00:00:00.000Z')
    const renderTree = tree.mountPage(PAGE_PATH, {
      container,
      date,
      count: 3,
      label: 'page',
    }, 'page-1')
    await tree.glass.whenRendered()

    expect(renderTree?.type).toBe('element')
    const children = renderTree && 'children' in renderTree ? renderTree.children ?? [] : []
    const elements = children.filter((node) => node.type === 'element')
    expect(elements.map((node) => node.tag)).toEqual(['child', 'view', 'image'])

    const child = elements[0]
    expect(child?.type === 'element' ? child.dataset : undefined).toMatchObject({ count: 3 })
    // A custom component keeps its boundary: the render thread resolves the
    // definition through `componentPath` instead of treating it as a built-in.
    expect(child?.type === 'element' ? child.component : undefined).toBe(true)
    expect(child?.type === 'element' ? child.componentPath : undefined).toBe(CHILD_PATH)
    // Built-in tags and the page root never carry the component marker.
    expect(elements[1]?.type === 'element' ? elements[1].component : undefined).toBeUndefined()
    expect(renderTree?.type === 'element' ? renderTree.component : undefined).toBeUndefined()
    const childDate = child?.type === 'element' ? child.dataset?.date : undefined
    expect(childDate).toBeInstanceOf(Date)
    expect((childDate as Date).toISOString()).toBe(date.toISOString())

    const after = elements[1]
    expect(after?.type === 'element' ? after.props?.class : undefined).toContain('after')
    expect(after?.type === 'element' ? after.slot : undefined).toBe('refresher')
    expect(after?.type === 'element' ? after.props?.style : undefined).toBe('color: red')
    expect(after?.type === 'element' ? after.scopes : undefined).toContain('page-pages-index-index')
    expect(after?.type === 'element' ? after.children?.[0] : undefined).toMatchObject({
      type: 'text',
      text: 'page',
    })

    tree.applyPageData('page-1', { count: 4 })
    const updated = tree.snapshotRenderTree('page-1')
    const updatedElements = updated && 'children' in updated ? updated.children ?? [] : []
    const updatedChild = updatedElements.find((node) => node.type === 'element' && node.tag === 'child')
    expect(updatedChild?.type === 'element' ? updatedChild.dataset?.count : undefined).toBe(4)
    const image = updatedElements.find((node) => node.type === 'element' && node.tag === 'image')
    expect(image?.type === 'element' ? image.props?.src : undefined).toBe('/a.png')
    expect(image?.type === 'element' ? image.children : undefined).toBeUndefined()

    const page = tree.glass.getMountedComponentByPageId('page-1')
    const childLogic = page?.shadowRoot?.getElementById('child')?.asGeneralComponent()
    expect(childLogic?.data.container).toBe(container)
  })

  test('keeps custom-component light children in the snapshot', async () => {
    const manifest = createManifest()
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
    })
    tree.registerComponentSchemas(createSchemas(manifest))

    const renderTree = tree.mountPage(PAGE_PATH, { label: 'page' }, 'page-2')
    await tree.glass.whenRendered()

    const children = renderTree && 'children' in renderTree ? renderTree.children ?? [] : []
    const child = children.find((node) => node.type === 'element' && node.tag === 'child')
    expect(child?.type === 'element' ? child.component : undefined).toBe(true)
    // The render thread evaluates the shadow tree, so the snapshot only keeps
    // the WXML-provided (`<text>slotted</text>`) light children.
    const light = child?.type === 'element' ? child.children ?? [] : []
    expect(light.map((node) => (node.type === 'text' ? '#text' : node.tag))).toEqual(['text'])
    expect(light[0]?.type === 'element' ? light[0].children?.[0] : undefined)
      .toMatchObject({ type: 'text', text: 'slotted' })
  })
  test('lists nested component instances in document order', async () => {
    const PAGE = 'pages/nested/nested'
    const OUTER = 'components/outer/outer'
    const INNER = 'components/inner/inner'
    const group = TmplGroup.newDev({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addTmpl(PAGE, '<outer /><view class="after" />')
    group.addTmpl(OUTER, '<view><inner /><inner /></view>')
    group.addTmpl(INNER, '<text>inner</text>')
    const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
    const templates = {
      groupList,
      content(path: string, name = '') {
        const entry = groupList[path]
        if (!entry) throw new Error(`template not found: ${path}`)
        return (entry as (name?: string) => unknown)(name)
      },
    }
    const artifact = (path: string, using: Record<string, string>) => ({
      path,
      template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
      configuration: {
        path,
        sourcePath: `${path}.json`,
        effective: { component: true, usingComponents: using },
      },
    })
    const manifest: Manifest = {
      schemaVersion: 2,
      runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
      entries: { service: 'service.js', templates: 'templates.js' },
      pages: [{
        path: PAGE,
        template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
        configuration: {
          path: PAGE,
          sourcePath: `${PAGE}.json`,
          effective: { usingComponents: { outer: `/${OUTER}` } },
        },
      }],
      components: [artifact(OUTER, { inner: `/${INNER}` }), artifact(INNER, {})],
      styles: [],
      assets: [],
    }
    const tree = new LogicTreeAdapter({ manifest, templates })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [OUTER, normalizeComponentDefinition({}, OUTER)],
      [INNER, normalizeComponentDefinition({}, INNER)],
    ])))
    const renderTree = tree.mountPage(PAGE, {}, 'page-nested')
    await tree.glass.whenRendered()

    const after = tree.snapshotRenderTree('page-nested')
    const children = after && 'children' in after ? after.children ?? [] : []
    const outer = children.find((node) => node.type === 'element' && node.tag === 'outer')
    const instances = outer?.type === 'element' ? outer.componentInstances ?? [] : []
    expect(instances.map((entry) => entry.path)).toEqual([INNER, INNER])
    expect(new Set(instances.map((entry) => entry.id)).size).toBe(2)
    // The instances are addressable: the ids resolve back to logic nodes.
    for (const entry of instances) {
      expect(tree.findNodeByViewId(entry.id)).toBeDefined()
    }
  })
  test('lists component instances passed through a slot as light children', async () => {
    const PAGE = 'pages/slot-instances/slot-instances'
    const OUTER = 'components/slot-outer/slot-outer'
    const INNER = 'components/slot-inner/slot-inner'
    const group = TmplGroup.newDev({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addTmpl(PAGE, '<outer><inner wx:if="{{ showInner }}" /></outer>')
    group.addTmpl(OUTER, '<view><slot /></view>')
    group.addTmpl(INNER, '<text>inner</text>')
    const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
    const templates = {
      groupList,
      content(path: string, name = '') {
        const entry = groupList[path]
        if (!entry) throw new Error(`template not found: ${path}`)
        return (entry as (name?: string) => unknown)(name)
      },
    }
    const artifact = (path: string, using: Record<string, string>) => ({
      path,
      template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
      configuration: {
        path,
        sourcePath: `${path}.json`,
        effective: { component: true, usingComponents: using },
      },
    })
    const manifest: Manifest = {
      schemaVersion: 2,
      runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
      entries: { service: 'service.js', templates: 'templates.js' },
      pages: [{
        path: PAGE,
        template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
        configuration: {
          path: PAGE,
          sourcePath: `${PAGE}.json`,
          effective: { usingComponents: { outer: `/${OUTER}`, inner: `/${INNER}` } },
        },
      }],
      components: [artifact(OUTER, { inner: `/${INNER}` }), artifact(INNER, {})],
      styles: [],
      assets: [],
    }
    const tree = new LogicTreeAdapter({ manifest, templates })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, new Map([
      [OUTER, normalizeComponentDefinition({}, OUTER)],
      [INNER, normalizeComponentDefinition({}, INNER)],
    ])))
    tree.mountPage(PAGE, { showInner: true }, 'page-slot-instances')
    await tree.glass.whenRendered()

    const readOuterInstances = () => {
      const page = tree.snapshotRenderTree('page-slot-instances')
      const children = page && 'children' in page ? page.children ?? [] : []
      const outer = children.find((node) => node.type === 'element' && node.tag === 'outer')
      return outer?.type === 'element' ? outer.componentInstances ?? [] : []
    }
    let instances = readOuterInstances()
    expect(instances.map((entry) => entry.path)).toEqual([INNER])
    expect(tree.findNodeByViewId(instances[0]!.id)).toBeDefined()

    tree.applyPageData('page-slot-instances', { showInner: false })
    await tree.glass.whenRendered()
    expect(readOuterInstances()).toEqual([])

    tree.applyPageData('page-slot-instances', { showInner: true })
    await tree.glass.whenRendered()
    instances = readOuterInstances()
    expect(instances.map((entry) => entry.path)).toEqual([INNER])
  })
  test('exposes the page usingComponents map for the render tree', async () => {
    const manifest = createManifest()
    const tree = new LogicTreeAdapter({ manifest, templates: createTemplates() })
    tree.registerComponentSchemas(createSchemas(manifest))
    tree.mountPage(PAGE_PATH, {}, 'page-using')
    await tree.glass.whenRendered()
    expect(tree.pageUsingComponents('page-using')).toEqual({ child: 'components/child/index' })
    expect(tree.pageUsingComponents('missing-page')).toEqual({})
  })
})
