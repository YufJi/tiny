import { describe, expect, test } from 'vitest'
import { ComponentTree } from '../src/component/component-tree'
import { RelationManager, type RelationInstance } from '../src/component/relation-manager'
import type { NormalizedRelation } from '../src/component/component-definition'

function instance(componentId: string, path: string): RelationInstance & { calls: string[] } {
  return {
    componentId,
    path,
    calls: [],
    invokeMethod(name: string, args: unknown[] = []) {
      this.calls.push(`${name}:${(args[0] as RelationInstance | undefined)?.componentId ?? ''}`)
      return undefined
    },
  }
}

function createManager(relations: Map<string, NormalizedRelation[]>) {
  const tree = new ComponentTree()
  const instances = new Map<string, RelationInstance>()
  const errors: string[] = []
  tree.ensurePage('page-1', 'pages/index/index')
  const manager = new RelationManager({
    tree,
    getInstance: (componentId) => instances.get(componentId),
    getRelations: (componentId) => relations.get(componentId) ?? [],
    onError: (code) => errors.push(code),
  })
  return { tree, instances, errors, manager }
}

function parentChildRelations(linked: string[]): Map<string, NormalizedRelation[]> {
  return new Map([
    ['parent', [{
      key: './child',
      type: 'child',
      targetPath: 'components/child/child',
      linked: (target) => linked.push(`parent:linked:${(target as RelationInstance).componentId}`),
      unlinked: (target) => linked.push(`parent:unlinked:${(target as RelationInstance).componentId}`),
      linkChanged: (target) => linked.push(`parent:changed:${(target as RelationInstance).componentId}`),
    }]],
    ['child', [{
      key: '../parent/parent',
      type: 'parent',
      targetPath: 'components/parent/parent',
      linked: (target) => linked.push(`child:linked:${(target as RelationInstance).componentId}`),
      unlinked: (target) => linked.push(`child:unlinked:${(target as RelationInstance).componentId}`),
      linkChanged: (target) => linked.push(`child:changed:${(target as RelationInstance).componentId}`),
    }]],
  ])
}

describe('RelationManager', () => {
  test('links reciprocal parent/child components and unlinks on detach', () => {
    const linked: string[] = []
    const { tree, instances, manager } = createManager(parentChildRelations(linked))
    const parent = instance('parent', 'components/parent/parent')
    const child = instance('child', 'components/child/child')
    instances.set('parent', parent)
    instances.set('child', child)
    tree.add({ componentId: 'parent', pageId: 'page-1', path: 'components/parent/parent', tag: 'parent' })
    manager.handleAttach('parent')
    tree.add({ componentId: 'child', pageId: 'page-1', path: 'components/child/child', tag: 'child', parentId: 'parent' })
    manager.handleAttach('child')

    expect(linked).toEqual(expect.arrayContaining([
      'parent:linked:child',
      'child:linked:parent',
    ]))
    expect(manager.getRelationNodes('parent', './child').map((node) => node.componentId)).toEqual(['child'])
    expect(manager.getRelationNodes('child', '../parent/parent').map((node) => node.componentId)).toEqual(['parent'])

    manager.handleDetach('child')
    expect(linked).toEqual(expect.arrayContaining([
      'parent:unlinked:child',
      'child:unlinked:parent',
    ]))
    expect(manager.getRelationNodes('parent', './child')).toEqual([])
  })

  test('returns relation nodes in tree order', () => {
    const linked: string[] = []
    const relations = parentChildRelations(linked)
    relations.set('child-1', relations.get('child')!)
    relations.set('child-2', relations.get('child')!)
    const { tree, instances, manager } = createManager(relations)
    instances.set('parent', instance('parent', 'components/parent/parent'))
    instances.set('child-1', instance('child-1', 'components/child/child'))
    instances.set('child-2', instance('child-2', 'components/child/child'))
    tree.add({ componentId: 'parent', pageId: 'page-1', path: 'components/parent/parent', tag: 'parent' })
    manager.handleAttach('parent')
    tree.add({ componentId: 'child-1', pageId: 'page-1', path: 'components/child/child', tag: 'child', parentId: 'parent' })
    manager.handleAttach('child-1')
    tree.add({ componentId: 'child-2', pageId: 'page-1', path: 'components/child/child', tag: 'child', parentId: 'parent' })
    manager.handleAttach('child-2')
    expect(manager.getRelationNodes('parent', './child').map((node) => node.componentId)).toEqual([
      'child-1',
      'child-2',
    ])
  })

  test('does not link when only one side declares the relation', () => {
    const linked: string[] = []
    const relations = parentChildRelations(linked)
    relations.delete('child')
    const { tree, instances, manager } = createManager(relations)
    instances.set('parent', instance('parent', 'components/parent/parent'))
    instances.set('child', instance('child', 'components/child/child'))
    tree.add({ componentId: 'parent', pageId: 'page-1', path: 'components/parent/parent', tag: 'parent' })
    manager.handleAttach('parent')
    tree.add({ componentId: 'child', pageId: 'page-1', path: 'components/child/child', tag: 'child', parentId: 'parent' })
    manager.handleAttach('child')
    expect(linked).toEqual([])
    expect(manager.getRelationNodes('parent', './child')).toEqual([])
  })

  test('supports ancestor/descendant relations and linkChanged on move', () => {
    const linked: string[] = []
    const relations = new Map<string, NormalizedRelation[]>([
      ['container', [{
        key: './item',
        type: 'descendant',
        targetPath: 'components/item/item',
        linked: (target) => linked.push(`container:linked:${(target as RelationInstance).componentId}`),
        unlinked: (target) => linked.push(`container:unlinked:${(target as RelationInstance).componentId}`),
        linkChanged: (target) => linked.push(`container:changed:${(target as RelationInstance).componentId}`),
      }]],
      ['item', [{
        key: '../container/container',
        type: 'ancestor',
        targetPath: 'components/container/container',
        linked: (target) => linked.push(`item:linked:${(target as RelationInstance).componentId}`),
        linkChanged: (target) => linked.push(`item:changed:${(target as RelationInstance).componentId}`),
      }]],
    ])
    const { tree, instances, manager } = createManager(relations)
    instances.set('container', instance('container', 'components/container/container'))
    instances.set('middle', instance('middle', 'components/middle/middle'))
    instances.set('item', instance('item', 'components/item/item'))
    tree.add({ componentId: 'container', pageId: 'page-1', path: 'components/container/container', tag: 'container' })
    manager.handleAttach('container')
    tree.add({ componentId: 'middle', pageId: 'page-1', path: 'components/middle/middle', tag: 'middle', parentId: 'container' })
    manager.handleAttach('middle')
    tree.add({ componentId: 'item', pageId: 'page-1', path: 'components/item/item', tag: 'item', parentId: 'middle' })
    manager.handleAttach('item')
    expect(linked).toEqual(expect.arrayContaining([
      'container:linked:item',
      'item:linked:container',
    ]))

    tree.move('item', 'container')
    manager.handleMove('item')
    expect(linked).toEqual(expect.arrayContaining([
      'container:changed:item',
      'item:changed:container',
    ]))
  })
})
