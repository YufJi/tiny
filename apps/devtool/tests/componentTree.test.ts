import { describe, expect, test } from 'vitest'
import type { InspectNode } from '@tiny/runtime'
import { projectComponentTree } from '../src/componentTree'

type NodeOptions = Partial<Omit<InspectNode, 'children'>> & { children?: InspectNode[] }

function element(overrides: NodeOptions = {}): InspectNode {
  return {
    id: 'node',
    type: 'element',
    tag: 'div',
    children: [],
    ...overrides,
  }
}

/** A node the page flow created: carries the render tree's node id. */
function renderNode(overrides: NodeOptions = {}): InspectNode {
  return element({
    attributes: { 'data-tiny-node-id': 'view-1' },
    ...overrides,
  })
}

function text(id: string, value: string): InspectNode {
  return { id, type: 'text', tag: '#text', text: value, children: [] }
}

describe('projectComponentTree', () => {
  test('keeps the page and flattens host wrappers around components', () => {
    const tree = renderNode({
      id: 'page',
      tag: 'tiny-page',
      children: [
        element({
          id: 'scroll-wrapper',
          children: [
            renderNode({
              id: 'view',
              tag: 'tiny-view',
              children: [
                element({
                  id: 'span',
                  tag: 'span',
                  children: [text('text', 'hello')],
                }),
              ],
            }),
          ],
        }),
        element({ id: 'scrollbar' }),
      ],
    })

    expect(projectComponentTree(tree)).toEqual({
      id: 'page',
      type: 'component',
      tag: 'tiny-page',
      children: [
        {
          id: 'view',
          type: 'component',
          tag: 'tiny-view',
          children: [text('text', 'hello')],
        },
      ],
    })
  })

  test('keeps a root that has no render node id yet', () => {
    const tree = element({ id: 'page', tag: 'tiny-page', children: [renderNode({ id: 'view' })] })

    const projected = projectComponentTree(tree)

    expect(projected?.tag).toBe('tiny-page')
    expect(projected?.children.map((child) => child.id)).toEqual(['view'])
  })

  test('keeps pageframe WXML hosts even when they have no render node id', () => {
    const tree = element({
      id: 'page',
      tag: 'tiny-page',
      children: [
        element({
          id: 'host-wrapper',
          tag: 'div',
          children: [
            element({
              id: 'view',
              tag: 'tiny-view',
              children: [text('label', 'visible')],
            }),
          ],
        }),
      ],
    })

    expect(projectComponentTree(tree)?.children).toEqual([{
      id: 'view',
      type: 'component',
      tag: 'tiny-view',
      children: [text('label', 'visible')],
    }])
  })

  test('drops text of hidden host wrappers instead of duplicating slots', () => {
    const tree = renderNode({
      id: 'page',
      tag: 'tiny-page',
      children: [
        element({
          id: 'slot',
          tag: 'span',
          style: 'display: none;',
          children: [text('hidden-copy', 'swiper')],
        }),
        element({
          id: 'visible',
          tag: 'span',
          children: [text('visible-copy', 'swiper')],
        }),
      ],
    })

    const projected = projectComponentTree(tree)

    expect(projected?.children).toEqual([text('visible-copy', 'swiper')])
  })

  test('keeps text inside a component even when the component is hidden', () => {
    const tree = renderNode({
      id: 'page',
      tag: 'tiny-page',
      children: [
        renderNode({
          id: 'view',
          tag: 'tiny-view',
          attributes: { 'data-tiny-node-id': 'view-2', hidden: '' },
          children: [text('label', 'still here')],
        }),
      ],
    })

    const projected = projectComponentTree(tree)

    expect(projected?.children[0]?.children).toEqual([text('label', 'still here')])
  })

  test('hides engine classes and attributes but keeps authored ones', () => {
    const tree = renderNode({
      id: 'view',
      tag: 'tiny-view',
      className: [
        'page-head',
        'tiny-tag-view',
        'tiny-scope',
        'tiny-page-component-index--page-head',
        'tiny-page-component-index--tiny-tag-view',
        'weui-cell__bd',
        'foo--bar',
      ].join(' '),
      attributes: {
        'data-tiny-node-id': 'view-1',
        'wx-host': 'view',
        'wx-style-scope': 'tiny-page-component-index',
        class: 'page-head',
        style: 'color: red',
        'scroll-y': 'true',
      },
      style: 'color: red',
    })

    expect(projectComponentTree(tree)).toEqual({
      id: 'view',
      type: 'component',
      tag: 'tiny-view',
      children: [],
      className: 'page-head weui-cell__bd foo--bar',
      attributes: { 'scroll-y': 'true' },
      style: 'color: red',
    })
  })

  test('returns null without a tree', () => {
    expect(projectComponentTree(null)).toBeNull()
    expect(projectComponentTree(text('text', 'orphan'))).toBeNull()
  })
})
