import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { buildComponentSchemas } from '../src/service/render/component-schema'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import type { RenderNode } from '../src/tree/protocol'
import type { MiniProgramComponentSchema } from '../src/types'

const PAGE_PATH = 'pages/home/home'
const TAB_BAR_PATH = 'custom-tab-bar/index'

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<view>home</view>')
  group.addTmpl(TAB_BAR_PATH, '<view id="bar">{{selected}}</view>')
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
      effective: { usingComponents: { 'custom-tab-bar': `/${TAB_BAR_PATH}` } },
    },
  }
  const component: ComponentArtifact = {
    path: TAB_BAR_PATH,
    template: { path: TAB_BAR_PATH, outputPath: 'templates.js', sourcePath: `${TAB_BAR_PATH}.wxml` },
    configuration: {
      path: TAB_BAR_PATH,
      sourcePath: `${TAB_BAR_PATH}.json`,
      effective: { component: true },
    },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    app: {
      path: 'app',
      configuration: {
        path: 'app',
        sourcePath: 'app.json',
        effective: {
          tabBar: {
            custom: true,
            list: [{ pagePath: PAGE_PATH, text: 'Home' }],
          },
        },
      },
    },
    pages: [page],
    components: [component],
    styles: [],
    assets: [],
  }
}

function containsTag(node: RenderNode | null | undefined, tag: string): boolean {
  if (!node || node.type !== 'element') return false
  if (node.tag === tag) return true
  return (node.children ?? []).some((child) => containsTag(child, tag))
}

describe('independent tabBar logic root', () => {
  test('projects the custom tabBar as a separate component root', () => {
    const manifest = createManifest()
    const definition = normalizeComponentDefinition({
      data: { selected: 0 },
    }, TAB_BAR_PATH)
    const definitions = new Map([[TAB_BAR_PATH, definition]])
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))

    const pageSnapshot = tree.mountPage(PAGE_PATH, {}, 'page-1')
    const pageTree = tree.pageTree('page-1')
    expect(pageTree?.getTabBarRoot()).toBeDefined()
    expect(tree.selectComponents('page-1', 'custom-tab-bar', false)).toHaveLength(1)
    expect(containsTag(pageSnapshot, 'custom-tab-bar')).toBe(false)

    const tabRoot = tree.snapshotTabBarTree('page-1')
    expect(tabRoot?.type).toBe('element')
    expect(tabRoot?.type === 'element' ? tabRoot.component : false).toBe(true)
    expect(tabRoot?.type === 'element' ? tabRoot.componentPath : undefined).toBe(TAB_BAR_PATH)
    expect(tabRoot?.type === 'element' ? tabRoot.tag : undefined).toBe('custom-tab-bar')
    expect(Object.values(tree.snapshotComponentData('page-1'))
      .some((data) => data.selected === 0)).toBe(true)

    const extraSchema: MiniProgramComponentSchema = {
      componentId: 'component-extra',
      path: 'components/extra/index',
      data: {},
      properties: {},
      using: {},
      placeholders: { lazy: 'view' },
    }
    tree.registerComponentSchemas([extraSchema])
    expect(pageTree?.components.has(TAB_BAR_PATH)).toBe(true)
    expect(pageTree?.components.has('components/extra/index')).toBe(true)
    expect(pageTree?.components.placeholderFor('lazy')).toBe('view')

    tree.unmountPage('page-1')
    expect(tree.pageTree('page-1')).toBeUndefined()
    expect(tree.glass.getComponentCount()).toBe(0)
  })
})
