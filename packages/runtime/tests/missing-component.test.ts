import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest } from '@tiny/manifest'
import { LogicTreeAdapter } from '../src/tree/logic/adapter'

const PAGE = 'pages/index/index'

function templates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE, '<view><heavy id="heavy" /></view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (name?: string) => unknown)(name)
    },
  }
}

describe('missing component definition', () => {
  test('records how the logic tree serializes an unregistered component', async () => {
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
          effective: { usingComponents: { heavy: '/components/heavy/index' } },
        },
      }],
      components: [],
      styles: [],
      assets: [],
    }
    const tree = new LogicTreeAdapter({
      manifest,
      templates: templates(),
      componentDefinitions: new Map(),
    })
    tree.mountPage(PAGE, {}, 'page-1')
    await tree.glass.whenRendered()
    const snapshot = tree.snapshotRenderTree('page-1') as unknown as {
      children: Array<{ children: Array<Record<string, unknown>> }>
    }
    const heavy = snapshot.children[0]!.children[0]!
    // The service logic tree cannot express an async component boundary until
    // its definition exists: it falls back to a plain element. The render-side
    // `componentPlaceholder` therefore only applies to real component nodes.
    expect(heavy).toMatchObject({ tag: 'heavy', props: { id: 'heavy' } })
    expect(heavy.component).toBeUndefined()
    expect(heavy.componentPath).toBeUndefined()
  })
})
