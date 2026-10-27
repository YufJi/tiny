import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { LogicTreeAdapter } from '@tiny/runtime'
import { createGlassRenderTree } from '../src/render-tree'

const PAGE_PATH = 'pages/index/index'
const WXML = `
<view class="page">
  <checkbox-group id="group" bindchange="onChange">
    <label id="label">
      <checkbox id="check" value="a" checked="{{checked}}" />
      <text id="label-text">Label A</text>
    </label>
  </checkbox-group>
  <text id="footer">hello {{label}}</text>
</view>
`

function templates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, WXML)
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      const entry = groupList[path]
      if (!entry) throw new Error(`missing template: ${path}`)
      return (entry as (name?: string) => unknown)(name)
    },
  }
}

function manifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE_PATH,
    template: { path: PAGE_PATH, outputPath: 'templates.js', sourcePath: `${PAGE_PATH}.wxml` },
    configuration: {
      path: PAGE_PATH,
      sourcePath: `${PAGE_PATH}.json`,
      effective: { usingComponents: {} },
    },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', render: 'render.js', templates: 'templates.js' },
    pages: [page],
    components: [],
    styles: [],
    assets: [],
  }
}

describe('service logic tree to glass render tree', () => {
  test('mounts a snapshot and preserves built-in composition', () => {
    const logic = new LogicTreeAdapter({ manifest: manifest(), templates: templates() })
    logic.registerComponentSchemas([])
    logic.mountPage(PAGE_PATH, { label: 'hello', checked: false }, 'page-1')
    const snapshot = logic.snapshotRenderTree('page-1')
    expect(snapshot).toBeTruthy()

    const render = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    render.mount(snapshot!)

    const findId = (node: any, tag: string): string | undefined => {
      if (node?.type === 'element' && node.tag === tag) return node.id
      for (const child of node?.children ?? []) {
        const found = findId(child, tag)
        if (found) return found
      }
      return undefined
    }
    const groupId = findId(snapshot, 'checkbox-group')
    const checkboxId = findId(snapshot, 'checkbox')
    const findTextId = (node: any): string | undefined => {
      if (node?.type === 'text' && String(node.text).includes('hello')) return node.id
      for (const child of node?.children ?? []) {
        const found = findTextId(child)
        if (found) return found
      }
      return undefined
    }
    const footerId = findTextId(snapshot)
    expect(groupId && checkboxId && footerId).toBeTruthy()
    const group = render.getNode(groupId!) as unknown as {
      hasItems: (nodes: unknown[]) => boolean
      childNodes: unknown[]
    }
    const checkbox = render.getNode(checkboxId!) as unknown as { is: string }
    const footer = render.getNode(footerId!) as unknown as { textContent: string }
    expect(group).toBeDefined()
    expect(checkbox).toBeDefined()
    expect(group.hasItems(group.childNodes)).toBe(true)
    expect(checkbox.is).toContain('checkbox')
    expect(footer).toBeDefined()
    expect((footer as unknown as { textContent: string }).textContent).toBe('hello hello')

    logic.setPageData('page-1', { label: 'bye', checked: true })
    const update = logic.updateRenderTree('page-1')
    render.applyPatches(update.patches)
    expect((render.getNode(footerId!) as unknown as { textContent: string }).textContent).toBe('hello bye')
    expect((render.getNode(checkboxId!) as unknown as { data: { checked: boolean } }).data.checked).toBe(true)
  })
})
