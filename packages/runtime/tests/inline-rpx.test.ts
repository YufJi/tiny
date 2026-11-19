import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { LogicTreeAdapter } from '../src/service/logic-tree/adapter'
import type { RenderElement, RenderNode } from '../src/tree-protocol/protocol'

const PAGE = 'pages/rpx/rpx'

const WXML = [
  '<view id="mixed" style="width:100rpx; color: {{c}}"></view>',
  '<view id="static" style="width:100rpx; height:20rpx"></view>',
  '<view id="bound" style:width="{{w}}rpx" style:height="20rpx"></view>',
  '<view id="url" style=\'background-image:url("/a-10rpx.png"); content:"100rpx"\'></view>',
].join('')

function createManifest(): Manifest {
  const page: PageArtifact = {
    path: PAGE,
    template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
    configuration: { path: PAGE, sourcePath: `${PAGE}.json`, effective: {} },
  }
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [page],
    components: [],
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
  group.addTmpl(PAGE, WXML)
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

function findById(node: RenderNode | null, id: string): RenderElement | undefined {
  if (!node || node.type !== 'element') return undefined
  if (node.props?.id === id) return node
  for (const child of node.children ?? []) {
    const found = findById(child, id)
    if (found) return found
  }
  return undefined
}

describe('inline style rpx', () => {
  test('converts static, interpolated and style: bindings; leaves url() alone', async () => {
    const tree = new LogicTreeAdapter({
      manifest: createManifest(),
      templates: createTemplates(),
    })
    tree.mountPage(PAGE, { c: 'red', w: 100 }, 'page-rpx')
    await tree.glass.whenRendered()
    const snapshot = tree.snapshotRenderTree('page-rpx')

    const compact = (value: unknown): string => String(value ?? '').replace(/\s+/g, '')

    const mixed = compact(findById(snapshot, 'mixed')?.props?.style)
    expect(mixed).toContain('width:13.3333vw')
    expect(mixed).toContain('color:red')

    const staticStyle = compact(findById(snapshot, 'static')?.props?.style)
    expect(staticStyle).toContain('width:13.3333vw')
    expect(staticStyle).toContain('height:2.66667vw')

    const bound = compact(findById(snapshot, 'bound')?.props?.style)
    expect(bound).toContain('13.3333vw')
    expect(bound).toContain('2.66667vw')

    const url = String(findById(snapshot, 'url')?.props?.style ?? '')
    expect(url).toContain('a-10rpx.png')
    expect(url).toContain('"100rpx"')
    expect(url).not.toContain('1.33333vw')
  })
})
