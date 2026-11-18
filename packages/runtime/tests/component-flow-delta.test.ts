import { describe, expect, test } from 'vitest'
import { diffComponentOwners } from '../src/tree-protocol/flow'
import type { RenderElement, RenderNode } from '../src/tree-protocol/protocol'

function card(id: string, instances?: Array<{ id: string; path: string }>): RenderElement {
  return {
    type: 'element',
    id,
    tag: id,
    component: true,
    componentPath: `components/${id}/${id}`,
    props: {},
    ...(instances ? { componentInstances: instances } : {}),
  }
}

function page(children: RenderNode[]): RenderNode {
  return {
    type: 'element',
    id: 'page-1',
    tag: 'page',
    children: [{ type: 'element', id: 'view-1', tag: 'view', children }],
  }
}

describe('component flow delta', () => {
  test('a data-only change produces no component flow', () => {
    expect(diffComponentOwners(page([card('a')]), page([card('a')]))).toBeUndefined()
  })

  test('an appended component crosses as one add with its document index', () => {
    const delta = diffComponentOwners(page([card('a')]), page([card('a'), card('b')]))
    expect(delta).toEqual({
      owners: [{ id: 'page-1', add: [{ id: 'b', path: 'components/b/b', index: 1 }] }],
    })
  })

  test('a removed component crosses as one remove', () => {
    const delta = diffComponentOwners(page([card('a'), card('b')]), page([card('b')]))
    expect(delta).toEqual({ owners: [{ id: 'page-1', remove: ['a'] }] })
  })

  test('a keyed reorder sends the surviving order instead of identities', () => {
    const delta = diffComponentOwners(page([card('a'), card('b')]), page([card('b'), card('a')]))
    expect(delta).toEqual({ owners: [{ id: 'page-1', order: ['b', 'a'] }] })
  })

  test('an owner whose list became empty emits the removals', () => {
    const delta = diffComponentOwners(
      page([card('a', [{ id: 'x', path: 'components/x/x' }])]),
      page([card('a')]),
    )
    expect(delta).toEqual({ owners: [{ id: 'a', remove: ['x'] }] })
  })

  test('a removed component also releases its own descendant list', () => {
    const delta = diffComponentOwners(
      page([card('a', [{ id: 'x', path: 'components/x/x' }])]),
      page([]),
    )
    expect(delta).toEqual({
      owners: [
        { id: 'page-1', remove: ['a'] },
        { id: 'a', remove: ['x'] },
      ],
    })
  })

  test('a nested component change is addressed to its owner', () => {
    const delta = diffComponentOwners(
      page([card('a', [{ id: 'x', path: 'components/x/x' }])]),
      page([card('a', [
        { id: 'x', path: 'components/x/x' },
        { id: 'y', path: 'components/y/y' },
      ])]),
    )
    expect(delta).toEqual({
      owners: [{
        id: 'a',
        add: [{ id: 'y', path: 'components/y/y', index: 1 }],
      }],
    })
  })

  test('a new component brings its own nested list in the same batch', () => {
    const delta = diffComponentOwners(
      page([]),
      page([card('a', [{ id: 'x', path: 'components/x/x' }])]),
    )
    expect(delta).toEqual({
      owners: [
        { id: 'page-1', add: [{ id: 'a', path: 'components/a/a', index: 0 }] },
        { id: 'a', add: [{ id: 'x', path: 'components/x/x', index: 0 }] },
      ],
    })
  })
})
