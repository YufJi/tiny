import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from '../src/component/component-schema'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import type { MiniProgramComponentSchema } from '../src/types'

const PAGE_PATH = 'pages/index/index'
const CHILD_PATH = 'components/child/index'
const PAGE_WXML = [
  '<child id="child" container="{{ container }}" data-date="{{ date }}" data-count="{{ count }}"><text>slotted</text></child>',
  '<view class="after" style="color: red">{{ label }}</view>',
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
    const childDate = child?.type === 'element' ? child.dataset?.date : undefined
    expect(childDate).toBeInstanceOf(Date)
    expect((childDate as Date).toISOString()).toBe(date.toISOString())

    const after = elements[1]
    expect(after?.type === 'element' ? after.props?.class : undefined).toContain('after')
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
})
