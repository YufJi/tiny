import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { createGlassRenderTree } from '../src/render-tree'
import type { GlassRenderEvent } from '../src/render-tree'

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
    expect(events.map((event) => event.id)).toEqual(['child', 'parent'])
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
    expect(caught.map((event) => event.id)).toEqual(['child'])
  })

  test('longpress reaches page bindings', () => {
    const { tree, events } = mountTree()
    fire(tree, 'child', 'longpress', { x: 5, y: 6 })
    expect(events.map((event) => event.name)).toEqual(['longpress'])
    expect(events[0]?.id).toBe('child')
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
})
