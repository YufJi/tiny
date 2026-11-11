import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'
import { buildComponentSchemas } from '../src/service/render/component-schema'

const PAGE = 'pages/ready/index'
const HOST = 'components/host/index'
const CHILD = 'components/child/index'

function artifact(
  path: string,
  using: Record<string, string>,
): PageArtifact | ComponentArtifact {
  return {
    path,
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: { usingComponents: using },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [artifact(PAGE, { host: `/${HOST}`, child: `/${CHILD}` })],
    components: [
      artifact(HOST, { child: `/${CHILD}` }),
      artifact(CHILD, {}),
    ],
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
  group.addTmpl(
    PAGE,
    '<host wx:if="{{showHost}}" inner="{{showInner}}">'
      + '<child wx:if="{{showChild}}" tag="slot" />'
      + '</host>',
  )
  group.addTmpl(
    HOST,
    '<child wx:if="{{inner}}" tag="inner" /><slot />',
  )
  group.addTmpl(CHILD, '<view>{{tag}}</view>')
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

describe('component ready order', () => {
  test('matches WeChat for template and slot children under wx:if', async () => {
    const manifest = createManifest()
    const ready: string[] = []
    const definitions = new Map([
      [HOST, normalizeComponentDefinition({
        properties: { inner: { type: Boolean, value: true } },
        lifetimes: {
          ready() {
            ready.push('host')
          },
        },
      }, HOST)],
      [CHILD, normalizeComponentDefinition({
        properties: { tag: { type: String, value: '' } },
        lifetimes: {
          ready() {
            const self = this as unknown as { data: { tag: string } }
            ready.push(`child:${self.data.tag}`)
          },
        },
      }, CHILD)],
    ])
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(
      buildComponentSchemas(manifest.components, definitions),
    )
    tree.mountPage(PAGE, {
      showHost: true,
      showChild: true,
      showInner: true,
    }, 'page-1')
    await tree.glass.whenRendered()
    expect(ready).toEqual(['child:inner', 'host', 'child:slot'])

    const flushReady = async (patch: Record<string, unknown>) => {
      ready.length = 0
      tree.applyPageData('page-1', patch)
      const update = tree.updateRenderTree('page-1')
      await new Promise((resolve) => setTimeout(resolve, 0))
      return update.patches
    }

    await flushReady({ showChild: false })
    expect(ready).toEqual([])
    await flushReady({ showChild: true })
    expect(ready).toEqual(['child:slot'])
    const hiddenInner = await flushReady({ showInner: false })
    expect(ready).toEqual([])
    expect(hiddenInner).toContainEqual({
      type: 'component-instances',
      target: expect.any(String),
      instances: [],
    })
    await flushReady({ showInner: true })
    expect(ready).toEqual(['child:inner'])
    await flushReady({ showHost: false })
    expect(ready).toEqual([])
    await flushReady({ showHost: true })
    expect(ready).toEqual(['child:inner', 'host', 'child:slot'])
  })
})
