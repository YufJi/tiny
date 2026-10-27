import { describe, expect, test } from 'vitest'
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

const FIRST_PAGE = 'pages/todos/todos'
const SECOND_PAGE = 'pages/add-todo/add-todo'
const CARD_PATH = 'components/card/card'

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(
    FIRST_PAGE,
    '<view id="probe" bindtap="onTap">{{ value }}</view><card id="card" />'
      + '<card wx:if="{{ showLazy }}" id="lazy-card" />',
  )
  group.addTmpl(SECOND_PAGE, '<view id="probe">{{ value }}</view>')
  group.addTmpl(CARD_PATH, '<view id="card-probe" bindtap="onTap">{{ value }}</view>')
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

function artifact(
  path: string,
  using: Record<string, string>,
  bodyType?: 'component',
): PageArtifact | ComponentArtifact {
  return {
    path,
    ...(bodyType ? { bodyType } : {}),
    template: { path, outputPath: 'templates.js', sourcePath: `${path}.wxml` },
    configuration: {
      path,
      sourcePath: `${path}.json`,
      effective: { ...(bodyType ? { component: true } : {}), usingComponents: using },
    },
  }
}

function createManifest(): Manifest {
  return {
    schemaVersion: 2,
    runtimeCompatibility: WECHAT_RUNTIME_COMPATIBILITY,
    entries: { service: 'service.js', templates: 'templates.js' },
    pages: [
      artifact(FIRST_PAGE, { card: `/${CARD_PATH}` }),
      artifact(SECOND_PAGE, {}),
    ],
    components: [artifact(CARD_PATH, {}, 'component')],
    styles: [],
    assets: [],
  }
}

function setData(target: unknown, patch: Record<string, unknown>): void {
  ;(target as { setData: (value: Record<string, unknown>) => void }).setData(patch)
}

function createTree(
  onDataChange: (pageId: string) => void,
  pageOptions: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>,
) {
  const manifest = createManifest()
  const cardDefinition = normalizeComponentDefinition({
    data: { value: 'card' },
    methods: {
      onTap() {
        setData(this, { value: 'card-tapped' })
      },
    },
  }, CARD_PATH)
  const definitions = new Map([[CARD_PATH, cardDefinition]])
  const tree = new LogicTreeAdapter({
    manifest,
    templates: createTemplates(),
    componentDefinitions: definitions,
    pageOptions,
    onDataChange,
  })
  tree.registerComponentSchemas(buildComponentSchemas(manifest.components, definitions))
  return tree
}

const PAGE_OPTIONS = new Map([[FIRST_PAGE, {
  data: { value: 'first' },
  methods: {
    onTap(this: unknown) {
      setData(this, { value: 'first-tapped' })
    },
  },
}], [SECOND_PAGE, {
  data: { value: 'second' },
}]])

type RenderView = {
  id: string
  props?: Record<string, unknown>
  children?: RenderView[]
}

function findById(node: RenderView | null | undefined, id: string): RenderView | null {
  if (!node) return null
  if (node.props?.id === id) return node
  for (const child of node.children ?? []) {
    const found = findById(child, id)
    if (found) return found
  }
  return null
}

describe('logic tree with multiple mounted pages', () => {
  test('routes page event data changes back to the page that owns the event', async () => {
    const changes: string[] = []
    const tree = createTree((pageId) => changes.push(pageId), PAGE_OPTIONS)
    tree.mountPage(FIRST_PAGE, { value: 'first' }, 'page-1')
    tree.mountPage(SECOND_PAGE, { value: 'second' }, 'page-2')
    await tree.glass.whenRendered()

    const first = tree.snapshotRenderTree('page-1') as unknown as RenderView | null
    const probe = findById(first, 'probe')
    expect(probe).toBeDefined()

    changes.length = 0
    expect(tree.dispatchViewEvent({
      viewId: probe!.id,
      name: 'tap',
      pageId: 'page-1',
      native: { clientX: 1, clientY: 1 },
    })).toBe(true)
    expect(changes).toEqual(['page-1'])
    const firstPage = tree.glass.getMountedComponentByPageId('page-1') as unknown as {
      data: { value?: string }
    }
    const secondPage = tree.glass.getMountedComponentByPageId('page-2') as unknown as {
      data: { value?: string }
    }
    expect(firstPage.data.value).toBe('first-tapped')
    expect(secondPage.data.value).toBe('second')
    const { patches } = tree.updateRenderTree('page-1')
    expect(patches.some((patch) => patch.type === 'text' && patch.text === 'first-tapped')).toBe(true)
  })

  test('routes a hidden page component data change to its own page', async () => {
    const changes: string[] = []
    const tree = createTree((pageId) => changes.push(pageId), PAGE_OPTIONS)
    tree.mountPage(FIRST_PAGE, { value: 'first' }, 'page-1')
    tree.mountPage(SECOND_PAGE, { value: 'second' }, 'page-2')
    await tree.glass.whenRendered()

    const page = tree.glass.getMountedComponentByPageId('page-1')
    const card = page?.shadowRoot?.getElementById('card')?.asGeneralComponent()
    expect(card).toBeDefined()
    changes.length = 0
    setData(card, { value: 'card-updated' })
    expect(changes).toEqual(['page-1'])
    expect((card as unknown as { data: { value?: string } }).data.value).toBe('card-updated')
  })

  test('scopes components created by a hidden page update to that page', async () => {
    const tree = createTree(() => undefined, PAGE_OPTIONS)
    tree.mountPage(FIRST_PAGE, { value: 'first' }, 'page-1')
    tree.mountPage(SECOND_PAGE, { value: 'second' }, 'page-2')
    await tree.glass.whenRendered()

    // page-1 is no longer the most recently mounted page; a lazily created
    // component must still receive page-1's component id prefix.
    tree.applyPageData('page-1', { showLazy: true })
    await tree.glass.whenRendered()
    const page = tree.glass.getMountedComponentByPageId('page-1')
    const lazy = page?.shadowRoot?.getElementById('lazy-card')?.asGeneralComponent()
    expect(lazy).toBeDefined()
    const componentId = tree.glass.componentIdOf(lazy)
    expect(componentId).toMatch(/^page-1:/)
    expect(tree.glass.getMountedComponentByComponentId(componentId!)).toBe(lazy)
  })
})
