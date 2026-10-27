import { describe, expect, test } from 'vitest'
import { ComponentTree } from '../src/component/component-tree'

function createTree() {
  const tree = new ComponentTree()
  tree.ensurePage('page-1', 'pages/index/index')
  tree.add({ componentId: 'parent', pageId: 'page-1', path: 'components/parent/parent', tag: 'parent', id: 'parent', className: 'panel' })
  tree.add({ componentId: 'child-a', pageId: 'page-1', path: 'components/child/child', tag: 'child', id: 'a', className: 'item active', parentId: 'parent' })
  tree.add({ componentId: 'child-b', pageId: 'page-1', path: 'components/child/child', tag: 'child', id: 'b', className: 'item', parentId: 'parent' })
  tree.add({ componentId: 'nested', pageId: 'page-1', path: 'components/nested/nested', tag: 'nested', id: 'nested', parentId: 'child-a' })
  return tree
}

describe('ComponentTree', () => {
  test('tracks ancestors, descendants and page roots', () => {
    const tree = createTree()
    expect(tree.ancestors('nested').map((node) => node.componentId)).toEqual(['child-a', 'parent'])
    expect(tree.descendants('parent').map((node) => node.componentId)).toEqual([
      'child-a',
      'nested',
      'child-b',
    ])
    expect(tree.owner('nested')?.componentId).toBe('child-a')
    expect(tree.owner('parent')).toBeUndefined()
  })

  test('selects by id, class, tag, child and descendant', () => {
    const tree = createTree()
    // Normal selectors stay inside one component boundary.
    expect(tree.select('page:page-1', '#a', false)).toEqual([])
    expect(tree.select('page:page-1', '.item.active', false)).toEqual([])
    expect(tree.select('page:page-1', 'parent', false).map((node) => node.componentId)).toEqual(['parent'])
    expect(tree.select('page:page-1', 'parent >>> #a', false).map((node) => node.componentId)).toEqual(['child-a'])
    expect(tree.select('page:page-1', 'parent >>> .item.active', false).map((node) => node.componentId)).toEqual(['child-a'])
    expect(tree.select('page:page-1', 'parent >>> nested', true).map((node) => node.componentId)).toEqual([
      'nested',
    ])
    expect(tree.select('parent', 'child', true).map((node) => node.componentId)).toEqual([
      'child-a',
      'child-b',
    ])
    expect(tree.select('page:page-1', 'parent >>> #a, parent >>> #b', true).map((node) => node.componentId)).toEqual([
      'child-a',
      'child-b',
    ])
  })

  test('scopes selection to a component', () => {
    const tree = createTree()
    expect(tree.select('child-a', 'nested', true).map((node) => node.componentId)).toEqual(['nested'])
    expect(tree.select('child-a', 'child', true)).toEqual([])
  })

  test('removes subtrees and pages', () => {
    const tree = createTree()
    expect(tree.remove('child-a')).toEqual(['nested', 'child-a'])
    expect(tree.get('nested')).toBeUndefined()
    expect(tree.removePage('page-1').sort()).toEqual(['child-b', 'page:page-1', 'parent'])
    expect(tree.pageRoot('page-1')).toBeUndefined()
  })

  test('returns empty result for invalid selectors', () => {
    const tree = createTree()
    expect(tree.select('page:page-1', '>', true)).toEqual([])
    expect(tree.select('page:page-1', '.', true)).toEqual([])
  })
})
