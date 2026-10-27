import { describe, expect, test } from 'vitest'
import { createNativeTreeRenderer, type NativeTreeHost } from '../src/tree/native-renderer'
import type { RenderNode } from '../src/tree/protocol'

function createHost() {
  const operations: string[] = []
  const props = new Map<string, Record<string, unknown>>()
  const host: NativeTreeHost = {
    clear: () => operations.push('clear'),
    createNode: (spec) => {
      operations.push(`create:${spec.id}:${spec.tag}`)
      if (spec.props) props.set(spec.id, spec.props)
    },
    setText: (id, text) => operations.push(`text:${id}:${text}`),
    setProps: (id, value) => {
      operations.push(`props:${id}`)
      props.set(id, value)
    },
    insert: (parentId, index, id) => operations.push(`insert:${parentId}:${index}:${id}`),
    remove: (parentId, index, count) => operations.push(`remove:${parentId}:${index}:${count}`),
    reorder: (parentId) => operations.push(`reorder:${parentId}`),
    replace: (id) => operations.push(`replace:${id}`),
    measure: (ids) => Object.fromEntries(ids.map((id) => [id, { width: 10, height: 20 }])),
    query: (selector, all) => [{ selector, all }],
  }
  return { host, operations, props }
}

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  props: { class: 'page' },
  children: [
    { type: 'element', id: 'view', tag: 'view', props: { class: 'card' }, children: [] },
    { type: 'text', id: 'text', text: 'hello' },
  ],
}

describe('native tree renderer', () => {
  test('mounts and patches a native view tree by service node id', () => {
    const { host, operations, props } = createHost()
    const renderer = createNativeTreeRenderer(host)
    renderer.mount(tree)
    expect(operations).toEqual([
      'clear',
      'create:page:page',
      'create:view:view',
      'insert:page:0:view',
      'create:text:#text',
      'insert:page:1:text',
    ])

    renderer.applyPatches([
      { type: 'text', id: 'text', text: 'bye' },
      { type: 'props', id: 'view', props: { hidden: true } },
      { type: 'insert', parentId: 'view', index: 0, node: { type: 'element', id: 'icon', tag: 'icon' } },
      { type: 'remove', parentId: 'page', index: 0, count: 1 },
    ])
    expect(operations).toContain('text:text:bye')
    expect(props.get('view')).toMatchObject({ hidden: true })
    expect(operations).toContain('insert:view:0:icon')
    expect(operations).toContain('remove:page:0:1')
    expect(renderer.getNode('icon')).toMatchObject({ tag: 'icon' })
  })

  test('dispatches native events with stable ids and exposes measure/query', () => {
    const { host } = createHost()
    const renderer = createNativeTreeRenderer(host)
    renderer.mount(tree)
    const events: unknown[] = []
    renderer.setEventSink((event) => events.push(event))
    renderer.dispatchEvent({ id: 'view', name: 'tap', native: { clientX: 2 } })
    expect(events[0]).toMatchObject({ id: 'view', name: 'tap' })
    expect(renderer.measure(['page'])).toEqual({ page: { width: 10, height: 20 } })
    expect(renderer.query('.card', false)).toEqual([{ selector: '.card', all: false }])
  })
})
