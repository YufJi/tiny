import { describe, expect, test } from 'vitest'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { diffComponentOwners } from '../src/tree-protocol/flow'
import type { RenderElement, RenderNode } from '../src/tree-protocol/protocol'

function card(
  id: string,
  instances?: Array<{ id: string; path: string; wxsProps?: string }>,
  wxsProps?: string,
): RenderElement {
  return {
    type: 'element',
    id,
    tag: id,
    component: true,
    componentPath: `components/${id}/${id}`,
    props: wxsProps ? { [TINY_ENGINE_NAMING.wxsPropsAttribute]: wxsProps } : {},
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
  test('change:prop bindings ride on the identity payload', () => {
    const bindings = JSON.stringify([
      { prop: 'label', moduleId: 'pages/index/index.wxs', exportPath: ['observe'] },
    ])
    const delta = diffComponentOwners(page([]), page([card('a', undefined, bindings)]))
    expect(delta).toEqual({
      owners: [{
        id: 'page-1',
        add: [{
          id: 'a',
          path: 'components/a/a',
          wxsProps: bindings,
          index: 0,
        }],
      }],
    })
  })

  test('nested change:prop bindings ride on the owner list', () => {
    const bindings = JSON.stringify([
      { prop: 'value', moduleId: 'pages/index/index.wxs', exportPath: ['observe'] },
    ])
    const delta = diffComponentOwners(
      page([card('a')]),
      page([card('a', [{ id: 'x', path: 'components/x/x', wxsProps: bindings }])]),
    )
    expect(delta).toEqual({
      owners: [{
        id: 'a',
        add: [{
          id: 'x',
          path: 'components/x/x',
          wxsProps: bindings,
          index: 0,
        }],
      }],
    })
  })

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
