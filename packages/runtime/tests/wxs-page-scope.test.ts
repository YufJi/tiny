import { afterAll, describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { TINY_ENGINE_NAMING, WECHAT_RUNTIME_COMPATIBILITY, type Manifest } from '@tiny/manifest'
import { createDefaultWxsCompiler, createPageScopedWxsRuntime } from '@tiny/wxs-runtime'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import type { RenderNode } from '../src/tree/protocol'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { buildComponentSchemas } from '../src/service/render/component-schema'

const PAGE_A = 'pages/a/a'
const PAGE_B = 'pages/b/b'
const PROBE = 'components/probe/probe'
const COUNTER = 'wxs/counter.wxs'
const COMPONENT_COUNTER = 'wxs/component-counter.wxs'

const globals = globalThis as unknown as Record<string, unknown>
const previousRuntime = globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal]

afterAll(() => {
  if (previousRuntime === undefined) delete globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal]
  else globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = previousRuntime
})

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addScript(COUNTER, `
var count = 0
var seen = {}
function once(key) {
  if (seen[key]) return 'count:' + count
  seen[key] = true
  count += 1
  return 'count:' + count
}
module.exports = { once: once }
`)
  group.addScript(COMPONENT_COUNTER, `
var count = 0
var seen = {}
function once(key) {
  if (!key) return 'component:0'
  if (seen[key]) return 'component:' + count
  seen[key] = true
  count += 1
  return 'component:' + count
}
module.exports = { once: once }
`)
  group.addTmpl(PROBE, `
<wxs module="counter" src="/${COMPONENT_COUNTER}" />
<text id="component-count">{{counter.once(label)}}-{{label}}</text>
`)
  for (const path of [PAGE_A, PAGE_B]) {
    group.addTmpl(path, `
<wxs module="counter" src="/${COUNTER}" />
<text>{{counter.once(scopeKey + tick)}}-{{tick}}</text>
<probe id="probe" label="{{scopeKey}}" />
<probe id="probe2" label="{{scopeKey}}-2" />
`)
  }
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (inner?: string) => unknown)(name)
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [PAGE_A, PAGE_B].map((path) => ({
      path,
      template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
      configuration: {
        path,
        sourcePath: `${path}.json`,
        effective: { usingComponents: { probe: `/${PROBE}` } },
      },
    })),
    components: [{
      path: PROBE,
      template: { path: PROBE, outputPath: 'templates.js', sourcePath: `${PROBE}.wxml` },
      configuration: { path: PROBE, sourcePath: `${PROBE}.json`, effective: {} },
    }],
    styles: [],
    assets: [],
  }
}

function textOf(node: RenderNode | null): string {
  if (!node) return ''
  if (node.type === 'text') return node.text
  return (node.children ?? []).map((child) => textOf(child)).join('')
}

function componentNode(tree: LogicTreeAdapter, pageId: string, id: string) {
  const page = tree.glass.getMountedComponentByPageId(pageId) as unknown as {
    shadowRoot?: {
      getElementById: (id: string) => {
        asGeneralComponent?: () => {
          shadowRoot?: {
            childNodes?: GlassTextNode[]
          }
        }
      } | undefined
    }
  } | undefined
  return page?.shadowRoot?.getElementById(id)?.asGeneralComponent?.()
}

function componentCounts(tree: LogicTreeAdapter, pageId: string): number[] {
  return ['probe', 'probe2'].map((id) => {
    const component = componentNode(tree, pageId, id)
    const match = /component:(\d+)/.exec(glassText(component?.shadowRoot?.childNodes ?? []))
    return Number(match?.[1] ?? 0)
  }).sort((left, right) => left - right)
}

type GlassTextNode = {
  data?: string
  textContent?: string
  childNodes?: GlassTextNode[]
}

function glassText(nodes: GlassTextNode[]): string {
  return nodes.map((node) => {
    if (typeof node.data === 'string') return node.data
    if (node.childNodes && node.childNodes.length > 0) return glassText(node.childNodes)
    return node.textContent ?? ''
  }).join('')
}

describe('page-scoped WXS module state', () => {
  test('two page trees evaluate the same external WXS module independently', async () => {
    const wxsRuntime = createPageScopedWxsRuntime({
      compile: createDefaultWxsCompiler(),
    })
    globals[TINY_ENGINE_NAMING.wxsRuntimeGlobal] = wxsRuntime
    const manifest = createManifest()
    const templates = createTemplates()
    const componentDefinitions = new Map([
      [PROBE, normalizeComponentDefinition({
        properties: { label: { type: String, value: '' } },
      }, PROBE)],
    ])
    const tree = new LogicTreeAdapter({
      manifest,
      templates,
      wxsRuntime,
      componentDefinitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, componentDefinitions))
    tree.mountPage(PAGE_A, { scopeKey: 'a' }, 'page-a')
    await tree.glass.whenRendered()
    tree.mountPage(PAGE_B, { scopeKey: 'b' }, 'page-b')
    await tree.glass.whenRendered()

    expect(textOf(tree.snapshotRenderTree('page-a'))).toContain('count:1')
    expect(componentCounts(tree, 'page-a')).toEqual([2, 2])
    expect(textOf(tree.snapshotRenderTree('page-b'))).toContain('count:1')
    expect(componentCounts(tree, 'page-b')).toEqual([2, 2])

    // Updates keep state inside the same page and do not advance another page.
    tree.applyPageData('page-a', { tick: 1 })
    await tree.glass.whenRendered()
    expect(textOf(tree.snapshotRenderTree('page-a'))).toContain('count:2')
    expect(textOf(tree.snapshotRenderTree('page-b'))).toContain('count:1')

    // Destroying a page releases its module table; re-entry starts at one.
    tree.unmountPage('page-a')
    await tree.glass.whenRendered()
    tree.mountPage(PAGE_A, { scopeKey: 'a2' }, 'page-a2')
    await tree.glass.whenRendered()
    expect(textOf(tree.snapshotRenderTree('page-a2'))).toContain('count:1')
    expect(componentCounts(tree, 'page-a2')).toEqual([2, 2])
  })
})
