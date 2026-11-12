import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import { WECHAT_RUNTIME_COMPATIBILITY, type Manifest } from '@tiny/manifest'
import { buildComponentSchemas } from '../src/service/render-bridge/component-schema'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { LogicTreeAdapter } from '../src/service/logic-tree/adapter'

const PAGE = 'pages/index/index'
const HEAVY = 'components/heavy/index'
const PLACEHOLDER = 'components/placeholder/index'

function templates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE, '<view><heavy id="heavy" /></view>')
  group.addTmpl(HEAVY, '<view id="real">real</view>')
  group.addTmpl(PLACEHOLDER, '<view id="loading">loading</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<string, unknown>
  return {
    groupList,
    content(path: string, name = '') {
      return (groupList[path] as (name?: string) => unknown)(name)
    },
  }
}

function manifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [{
      path: PAGE,
      template: { path: PAGE, outputPath: 'templates.js', sourcePath: `${PAGE}.wxml` },
      configuration: {
        path: PAGE,
        sourcePath: `${PAGE}.json`,
        effective: {
          usingComponents: {
            heavy: `/${HEAVY}`,
            placeholder: `/${PLACEHOLDER}`,
          },
          componentPlaceholder: { heavy: 'placeholder' },
        },
      },
    }],
    components: [{
      path: PLACEHOLDER,
      template: { path: PLACEHOLDER, outputPath: 'templates.js', sourcePath: `${PLACEHOLDER}.wxml` },
      configuration: { path: PLACEHOLDER, sourcePath: `${PLACEHOLDER}.json`, effective: {} },
    }, {
      path: HEAVY,
      template: { path: HEAVY, outputPath: 'templates.js', sourcePath: `${HEAVY}.wxml` },
      configuration: { path: HEAVY, sourcePath: `${HEAVY}.json`, effective: {} },
    }],
    styles: [],
    assets: [],
  }
}

describe('async component boundary', () => {
  test('renders the configured placeholder while the definition is missing', async () => {
    const m = manifest()
    const definitions = new Map([
      [PLACEHOLDER, normalizeComponentDefinition({}, PLACEHOLDER)],
    ])
    const tree = new LogicTreeAdapter({
      manifest: m,
      templates: templates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(
      m.components.filter((item) => item.path === PLACEHOLDER),
      definitions,
    ))
    tree.mountPage(PAGE, {}, 'page-1')
    await tree.glass.whenRendered()

    const snapshot = tree.snapshotRenderTree('page-1') as unknown as {
      children: Array<{ children: Array<Record<string, unknown>> }>
    }
    const node = snapshot.children[0]!.children[0]!
    // Glass-easel resolves `componentPlaceholder` to a real component boundary;
    // the render tree can show it before the heavy definition is registered.
    expect(node).toMatchObject({
      tag: 'heavy',
      component: true,
      componentPath: PLACEHOLDER,
    })

    definitions.set(HEAVY, normalizeComponentDefinition({}, HEAVY))
    tree.registerComponentSchemas(buildComponentSchemas(
      m.components.filter((item) => item.path === HEAVY),
      definitions,
    ))
    await tree.glass.whenRendered()

    const after = tree.snapshotRenderTree('page-1') as unknown as {
      children: Array<{ children: Array<Record<string, unknown>> }>
    }
    expect(after.children[0]!.children[0]).toMatchObject({
      tag: 'heavy',
      component: true,
      componentPath: HEAVY,
    })
  })
})
