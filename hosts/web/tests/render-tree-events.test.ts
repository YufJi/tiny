import { describe, expect, test } from 'vitest'
import * as glassEasel from '@tiny/runtime/glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { EVENT_RETURN_TOKEN_FIELD } from '@tiny/host-web-components'
import { createGlassRenderTree } from '../src/render/tree'
import type { GlassRenderEvent } from '../src/render/tree'

type MockElement = {
  type: 'element'
  id: string
  tag: string
  events: Array<{ name: string; capture?: boolean; catch?: boolean }>
  children: MockElement[]
}

const element = (
  id: string,
  tag: string,
  events: MockElement['events'] = [],
  children: MockElement[] = [],
): MockElement => ({ type: 'element', id, tag, events, children })

const mountTree = () => {
  const events: GlassRenderEvent[] = []
  const tree = createGlassRenderTree({
    backend: new glassEasel.EmptyBackendContext(),
    onEvent: (event) => events.push(event),
  })
  tree.mount(element('root', 'view', [], [
    element('parent', 'view', [{ name: 'tap' }], [
      element('child', 'view', [{ name: 'tap' }, { name: 'longpress' }], []),
    ]),
  ]) as never)
  return { tree, events }
}

const fire = (
  tree: ReturnType<typeof mountTree>['tree'],
  id: string,
  name: string,
  detail: unknown = {},
  originalEvent?: unknown,
): void => {
  const target = tree.getNode(id) as never
  glassEasel.Event.triggerEvent(target, name, detail, {
    bubbles: true,
    composed: true,
    ...(originalEvent === undefined ? {} : { originalEvent }),
  })
}

describe('render tree event forwarding', () => {
  test('a child tap bubbles to ancestor bindings', () => {
    const { tree, events } = mountTree()
    fire(tree, 'child', 'tap', { x: 1, y: 2 })
    expect(events.map((event) => event.id)).toEqual(['root#0.0', 'root#0'])
    expect(events[0]?.detail).toEqual({ x: 1, y: 2 })
  })

  test('catch stops the parent binding', () => {
    // Re-mount with catch on the child binding.
    const caught: GlassRenderEvent[] = []
    const caughtTree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      onEvent: (event) => caught.push(event),
    })
    caughtTree.mount(element('root', 'view', [], [
      element('parent', 'view', [{ name: 'tap' }], [
        element('child', 'view', [{ name: 'tap', catch: true }], []),
      ]),
    ]) as never)
    fire(caughtTree, 'child', 'tap', { x: 3, y: 4 })
    expect(caught.map((event) => event.id)).toEqual(['root#0.0'])
  })

  test('longpress reaches page bindings', () => {
    const { tree, events } = mountTree()
    fire(tree, 'child', 'longpress', { x: 5, y: 6 })
    expect(events.map((event) => event.name)).toEqual(['longpress'])
    expect(events[0]?.id).toBe('root#0.0')
  })

  test('raw transitionend reaches page bindings', () => {
    const raw: GlassRenderEvent[] = []
    const rawTree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      onEvent: (event) => raw.push(event),
    })
    rawTree.mount(element('root', 'view', [], [
      element('parent', 'view', [], [
        element('child', 'view', [{ name: 'transitionend' }], []),
      ]),
    ]) as never)
    fire(rawTree, 'child', 'transitionend', { propertyName: 'left' }, {})
    expect(raw.map((event) => event.name)).toEqual(['transitionend'])
  })

  test('raw non-projection events are not forwarded twice', () => {
    const { tree, events } = mountTree()
    // `input` is emitted by the input component via triggerEvent; the raw DOM
    // projection carries an original event and must be ignored.
    fire(tree, 'child', 'input', { value: 'x' }, {})
    expect(events).toEqual([])
  })

  test('forwards the host listener-return token as an opaque field', () => {
    const events: GlassRenderEvent[] = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      onEvent: (event) => events.push(event),
    })
    tree.mount(element('root', 'view', [], [
      element('input', 'input', [{ name: 'input' }]),
    ]) as never)
    const target = tree.getNode('input') as never
    glassEasel.Event.triggerEvent(target, 'input', { value: '2' }, {
      bubbles: true,
      composed: true,
      extraFields: { [EVENT_RETURN_TOKEN_FIELD]: 'input-7' },
    })
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      name: 'input',
      eventToken: 'input-7',
      detail: { value: '2' },
    })
  })

  test('native tap crosses a component boundary but native click is not projected', () => {
    const events: GlassRenderEvent[] = []
    const path = 'components/card/card'
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      componentDefinitions: {
        [path]: { path, properties: {}, data: {}, methods: [], using: {} },
      },
      onEvent: (event) => events.push(event),
    })
    tree.mount(element('root', 'view', [], [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: path,
      events: [{ name: 'click' }, { name: 'tap' }],
    }]) as never)

    fire(tree, 'card', 'click', { x: 1, y: 2 }, {})
    expect(events).toEqual([])

    fire(tree, 'card', 'tap', { x: 3, y: 4 }, {})
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ name: 'tap', detail: { x: 3, y: 4 } })

    events.length = 0
    fire(tree, 'card', 'click', { date: '2026-11-13' })
    expect(events).toHaveLength(1)
    expect(events[0]?.detail).toEqual({ date: '2026-11-13' })
  })

  test('installs a dynamic tap handler on initial render', () => {
    const path = 'components/button/button'
    const group = TmplGroup.newDev({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addTmpl(
      path,
      '<button id="button" data-detail="{{ missing }}" bindtap="{{ disabled || loading ? \'\' : \'onClick\' }}">OK</button>',
    )
    const generated = group.getTmplGenObjectGroups()
    group.free()
    const groupList = new Function(`return ${generated}`)() as Record<string, (name?: string) => unknown>
    const templateEvents: Array<{ handler?: string; name?: string }> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates: {
        groupList,
        content: (entry, name = '') => groupList[entry]!(name),
      },
      componentDefinitions: {
        [path]: {
          path,
          properties: {},
          data: { disabled: false, loading: false },
          methods: ['onClick'],
          using: {},
        },
      },
    })
    tree.setTemplateEventSink?.((event) => templateEvents.push(event))
    tree.mount(element('root', 'view', [], [{
      type: 'element',
      id: 'button-component',
      tag: 'button-component',
      component: true,
      componentPath: path,
    }]) as never)

    const component = tree.getNode('button-component') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown }
    }
    const button = component.getShadowRoot().getElementById('button')
    glassEasel.Event.triggerEvent(button as never, 'tap', { x: 1 }, { bubbles: true })

    expect(templateEvents).toContainEqual(expect.objectContaining({
      handler: 'onClick',
      name: 'tap',
    }))
    expect((templateEvents[0] as { dataset?: Record<string, unknown> }).dataset).toBeUndefined()
  })
})

describe('render-resolved event target', () => {
  test('a template event carries the target id/dataset without a service lookup', () => {
    const pagePath = 'pages/target/target'
    const group = TmplGroup.newDev({
      directivePrefix: 'wx',
      templateExtension: '.wxml',
      templateScriptExtension: '.wxs',
    })
    group.addTmpl(
      pagePath,
      '<view id="outer" data-kind="outer" bindtap="onOuter">'
        + '<view id="inner" data-kind="inner" data-role="target">tap me</view>'
        + '</view>',
    )
    const generated = group.getTmplGenObjectGroups()
    group.free()
    const groupList = new Function(`return ${generated}`)() as Record<string, (name?: string) => unknown>
    const templateEvents: Array<Record<string, unknown>> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates: {
        groupList,
        content: (entry, name = '') => groupList[entry]!(name),
      },
    })
    tree.setTemplateEventSink?.((event) => templateEvents.push(event as unknown as Record<string, unknown>))
    tree.mountPage({
      pageId: 'page-1',
      pagePath,
      data: {},
      methods: ['onOuter'],
    })

    const shadow = tree.root.shadowRoot as unknown as {
      getElementById?: (id: string) => unknown
      querySelector?: (selector: string) => unknown
    }
    const inner = shadow.getElementById?.('inner') ?? shadow.querySelector?.('#inner')
    expect(inner).toBeDefined()
    glassEasel.Event.triggerEvent(inner as never, 'tap', { x: 1 }, { bubbles: true })

    expect(templateEvents).toHaveLength(1)
    expect(templateEvents[0]).toMatchObject({
      handler: 'onOuter',
      name: 'tap',
      id: 'outer',
      dataset: { kind: 'outer' },
      targetNode: {
        id: 'inner',
        dataset: { kind: 'inner', role: 'target' },
      },
    })
    expect((templateEvents[0]!.targetNode as { nodeId?: string }).nodeId).toMatch(/^r:/)
  })
})
