import { describe, expect, test } from 'vitest'
import { diffRenderTree } from '../src/tree/diff'
import type { RenderElement, RenderNode } from '../src/tree/protocol'

function element(id: string, tag: string, extras: Partial<RenderElement> = {}): RenderElement {
  return { type: 'element', id, tag, ...extras }
}

function tree(): RenderNode {
  return element('root', 'view', {
    props: { class: 'page' },
    children: [
      element('a', 'view', { props: { hidden: false } }),
      { type: 'text', id: 'label', text: 'hello' },
    ],
  })
}

describe('render tree diff', () => {
  test('emits text, props and child patches without touching unchanged nodes', () => {
    const next = tree() as RenderElement
    next.children = [
      element('a', 'view', { props: { hidden: true } }),
      { type: 'text', id: 'label', text: 'hi' },
      element('b', 'button', { props: { type: 'primary' } }),
    ]
    const patches = diffRenderTree(tree(), next)
    expect(patches).toContainEqual({ type: 'props', id: 'a', props: { hidden: true }, removed: [] })
    expect(patches).toContainEqual({ type: 'text', id: 'label', text: 'hi' })
    expect(patches.some((patch) => patch.type === 'insert' && patch.parentId === 'root')).toBe(true)
  })

  test('removes children back-to-front and reorders stable keyed children', () => {
    const previous = element('list', 'view', {
      children: [
        element('a', 'view', { key: 'a' }),
        element('b', 'view', { key: 'b' }),
        element('c', 'view', { key: 'c' }),
      ],
    })
    const next = element('list', 'view', {
      children: [
        element('c', 'view', { key: 'c' }),
        element('a', 'view', { key: 'a' }),
      ],
    })
    const patches = diffRenderTree(previous, next)
    expect(patches.find((patch) => patch.type === 'remove')).toMatchObject({
      parentId: 'list',
      index: 1,
      count: 1,
    })
    expect(patches.find((patch) => patch.type === 'reorder')).toBeDefined()
  })
})
