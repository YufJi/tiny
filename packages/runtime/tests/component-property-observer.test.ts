import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from '../src/service/render-bridge/component-schema'
import { normalizeComponentDefinition } from '../src/component/component-definition'
import { LogicTreeAdapter } from '../src/service/logic-tree/adapter'

const PAGE_PATH = 'pages/observer/index'
const FIELD_PATH = 'components/field/index'

function artifact(path: string, using?: Record<string, string>): PageArtifact {
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

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<field id="field" value="{{ value }}" />')
  group.addTmpl(FIELD_PATH, '<view>{{ innerValue }}</view>')
  const groupList = new Function(`return ${group.getTmplGenObjectGroups()}`)() as Record<
    string,
    (name?: string) => unknown
  >
  return {
    groupList,
    content(path: string, name = '') {
      return groupList[path]!(name)
    },
  }
}

describe('component property observers', () => {
  test('expose the previous property value during watch callbacks', async () => {
    const manifest: Manifest = {
      schemaVersion: 2,
      runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
      entries: { service: 'service.js', templates: 'templates.js' },
      pages: [artifact(PAGE_PATH, { field: `/${FIELD_PATH}` })],
      components: [artifact(FIELD_PATH)],
      styles: [],
      assets: [],
    }
    const fieldDefinition = normalizeComponentDefinition({
      properties: { value: String },
      data: { innerValue: '' },
      lifetimes: {
        attached() {
          const self = this as unknown as {
            value: string
            setData: (patch: Record<string, unknown>) => void
          }
          self.value = self.value ?? ''
          self.setData({ innerValue: self.value })
        },
      },
      observers: {
        value(value: string) {
          const self = this as unknown as {
            value: string
            pending: string
            applyValue: () => void
          }
          if (value !== self.value) {
            self.value = value
            self.pending = value
            self.applyValue()
          }
        },
      },
      methods: {
        applyValue() {
          const self = this as unknown as {
            pending: string
            setData: (patch: Record<string, unknown>) => void
          }
          self.setData({ innerValue: self.pending })
        },
      },
    }, FIELD_PATH)
    const definitions = new Map([[FIELD_PATH, fieldDefinition]])
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
    })
    tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))
    tree.mountPage(PAGE_PATH, { value: 'first' }, 'page-1')
    await tree.glass.whenRendered()
    const field = tree.glass
      .getMountedComponentByPageId('page-1')
      ?.shadowRoot?.getElementById('field')
      ?.asGeneralComponent()
    expect(field?.data.innerValue).toBe('first')

    tree.applyPageData('page-1', { value: 'second' })
    await tree.glass.whenRendered()
    expect(field?.data.innerValue).toBe('second')
  })
})
