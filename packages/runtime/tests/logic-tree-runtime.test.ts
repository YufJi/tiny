import { describe, expect, test } from 'vitest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type ComponentArtifact,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { buildComponentSchemas } from '../src/component-schema'
import { normalizeComponentDefinition } from '../src/component-definition'
import { LogicTreeAdapter } from '../src/logic/tree'

const PAGE_PATH = 'pages/index/index'
const PARENT_PATH = 'components/parent/index'
const CHILD_PATH = 'components/child/index'

function createTemplates() {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(PAGE_PATH, '<parent id="parent" />')
  group.addTmpl(PARENT_PATH, '<view id="probe" class="probe" data-count="{{ count }}" data-date="{{ date }}" bindtap="onTap">{{ seen }}</view><switch id="sw" bindchange="onSwitch" /><checkbox-group id="group" bindchange="onGroupChange" /><child id="child" fn="{{ fn }}" bind:custom="onCustom" />')
  group.addTmpl(CHILD_PATH, '<view id="fire" bindtap="fire">fire</view><view>{{ seen }}</view>')
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
    pages: [artifact(PAGE_PATH, { parent: `/${PARENT_PATH}` })],
    components: [
      artifact(PARENT_PATH, { child: `/${CHILD_PATH}` }, 'component'),
      artifact(CHILD_PATH, {}, 'component'),
    ],
    styles: [],
    assets: [],
  }
}

describe('logic tree runtime options', () => {
  test('runs component lifetimes and methods so function properties propagate', async () => {
    const manifest = createManifest()
    const parentDefinition = normalizeComponentDefinition({
      data: { fn: null, seen: 'none', count: 3, custom: null, switchValue: false, groupValue: null, date: new Date('2012-02-01T00:00:00.000Z') },
      methods: {
        onTap() {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ seen: 'tapped' })
        },
        onCustom(event: { detail: { text: string } }) {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ custom: event.detail.text })
        },
        onSwitch(event: { detail: { value: boolean } }) {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ switchValue: event.detail.value })
        },
        onGroupChange(event: { detail: { value: string[] } }) {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ groupValue: event.detail.value })
        },
      },
      observers: {
        count(value: unknown) {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ seen: `count:${String(value)}` })
        },
      },
      lifetimes: {
        ready() {
          ;(this as unknown as { scratch?: boolean }).scratch = true
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ fn: () => 'ok' })
        },
      },
    }, PARENT_PATH)
    const childDefinition = normalizeComponentDefinition({
      data: { seen: 'none' },
      properties: { fn: null },
      methods: {
        fire() {
          ;(this as unknown as { setData: (patch: Record<string, unknown>) => void })
            .setData({ seen: 'fired' })
          ;(this as unknown as {
            triggerEvent: (name: string, detail: unknown, options?: Record<string, unknown>) => void
          }).triggerEvent('custom', { text: 'hi' }, { bubbles: true, composed: true })
        },
      },
    }, CHILD_PATH)
    const definitions = new Map([
      [PARENT_PATH, parentDefinition],
      [CHILD_PATH, childDefinition],
    ])
    const schemas = buildComponentSchemas(manifest.components, definitions)

    let intersectionRequest: {
      observerId: string
      viewIds: string[]
    } | null = null
    const tree = new LogicTreeAdapter({
      manifest,
      templates: createTemplates(),
      componentDefinitions: definitions,
      viewIntersection: {
        observe: (request) => {
          intersectionRequest = request
        },
        unobserve: () => undefined,
      },
      measureView: async (viewIds) => Object.fromEntries(viewIds.map((viewId) => [viewId, {
        left: 0,
        top: 0,
        right: 120,
        bottom: 40,
        width: 120,
        height: 40,
      }])),
    })
    tree.registerComponentSchemas(schemas)
    tree.mountPage(PAGE_PATH, {}, 'page-1')
    await tree.glass.whenRendered()
    await new Promise((resolve) => setTimeout(resolve, 20))

    const page = tree.glass.getMountedComponentByPageId('page-1')
    const parent = page?.shadowRoot?.getElementById('parent')?.asGeneralComponent()
    const child = parent?.shadowRoot?.getElementById('child')?.asGeneralComponent()
    expect(parent).toBeDefined()
    expect(child).toBeDefined()
    expect(typeof (parent as unknown as { data: { fn?: unknown } }).data.fn).toBe('function')
    expect(typeof (child as unknown as { data: { fn?: unknown } }).data.fn).toBe('function')

    const snapshot = tree.snapshot('page-1')
    const findProbe = (node: typeof snapshot.root | undefined): typeof snapshot.root | null => {
      if (!node) return null
      if (node.attributes?.id === 'probe') return node
      for (const childNode of node.children ?? []) {
        const found = findProbe(childNode)
        if (found) return found
      }
      return null
    }
    const probe = findProbe(snapshot.root)
    expect(probe).toBeDefined()
    const queried = tree.query('page-1', '.probe', false)
    expect(queried).toHaveLength(1)
    expect(queried[0]?.dataset.count).toBe(3)
    expect(queried[0]?.dataset.date).toBeInstanceOf(Date)
    expect(queried[0]?.viewId).toBe(probe!.viewId)
    let queryResult: { dataset?: Record<string, unknown>; width?: number } | null = null
    ;(parent as unknown as {
      createSelectorQuery: () => {
        select: (selector: string) => {
          boundingClientRect: (callback: (value: typeof queryResult) => void) => {
            exec: () => void
          }
        }
      }
    }).createSelectorQuery().select('.probe').boundingClientRect((value) => {
      queryResult = value
    }).exec()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(queryResult?.dataset?.date).toBeInstanceOf(Date)
    expect(queryResult?.width).toBe(120)

    const entries: Array<Record<string, unknown>> = []
    ;(parent as unknown as {
      createIntersectionObserver: (options?: Record<string, unknown>) => {
        relativeToViewport: () => {
          observe: (selector: string, callback: (entry: Record<string, unknown>) => void) => void
        }
      }
    }).createIntersectionObserver({ thresholds: [0] }).relativeToViewport().observe('.probe', (entry) => {
      entries.push(entry)
    })
    expect(intersectionRequest).toBeTruthy()
    tree.handleViewIntersection(intersectionRequest!.observerId, [{
      viewId: intersectionRequest!.viewIds[0]!,
      boundingClientRect: { left: 0, top: 0, right: 120, bottom: 40, width: 120, height: 40 },
      intersectionRect: { left: 0, top: 0, right: 120, bottom: 40, width: 120, height: 40 },
      relativeRect: { left: 0, top: 0, right: 375, bottom: 667, width: 375, height: 667 },
      intersectionRatio: 1,
      time: 1,
    }])
    expect(entries).toHaveLength(1)
    expect(entries[0]?.dataset).toMatchObject({ date: expect.any(Date), count: 3 })

    expect(tree.dispatchViewEvent({
      viewId: probe!.viewId,
      name: 'tap',
      native: { clientX: 1, clientY: 2 },
    })).toBe(true)
    const findById = (node: typeof snapshot.root | undefined, id: string): typeof snapshot.root | null => {
      if (!node) return null
      if (node.attributes?.id === id) return node
      for (const childNode of node.children ?? []) {
        const found = findById(childNode, id)
        if (found) return found
      }
      return null
    }
    const fire = findById(snapshot.root, 'fire')
    expect(fire).toBeDefined()
    expect(tree.dispatchViewEvent({ viewId: fire!.viewId, name: 'tap', native: {} })).toBe(true)
    expect((parent as unknown as { data: { custom?: string } }).data.custom).toBe('hi')
    const sw = findById(snapshot.root, 'sw')
    expect(sw).toBeDefined()
    // The host owns built-in event normalization; the service dispatches the
    // detail as-is instead of re-deriving switch/checkbox-group internals.
    expect(tree.dispatchViewEvent({
      viewId: sw!.viewId,
      name: 'change',
      detail: { value: true },
    })).toBe(true)
    expect((parent as unknown as { data: { switchValue?: boolean } }).data.switchValue).toBe(true)
    const group = findById(snapshot.root, 'group')
    expect(group).toBeDefined()
    expect(tree.dispatchViewEvent({
      viewId: group!.viewId,
      name: 'change',
      detail: { value: ['a', 'b'] },
    })).toBe(true)
    expect((parent as unknown as { data: { groupValue?: string[] } }).data.groupValue).toEqual(['a', 'b'])
    expect((parent as unknown as { data: { seen?: string } }).data.seen).toBe('tapped')
    const { patches } = tree.update('page-1')
    expect(patches.some((patch) => patch.type === 'text' && patch.text === 'tapped')).toBe(true)

    ;(parent as unknown as { setData: (patch: Record<string, unknown>) => void }).setData({ count: 4 })
    expect((parent as unknown as { data: { seen?: string } }).data.seen).toBe('count:4')
  })
})
