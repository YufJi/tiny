import { describe, expect, test } from 'vitest'
import { buildComponentFlow, collectComponentIdentities } from '../src/tree-protocol/flow'
import type { ComponentDefinitionPayload, RenderNode } from '../src/tree-protocol/protocol'

const CARD = 'components/card/card'

const definitions: Map<string, ComponentDefinitionPayload> = new Map([
  [CARD, { path: CARD, template: { path: `${CARD}.wxml` } }],
])

const tree: RenderNode = {
  type: 'element',
  id: 'page',
  tag: 'page',
  component: true,
  componentPath: 'pages/index/index',
  children: [
    { type: 'element', id: 'view', tag: 'view', children: [
      { type: 'element', id: 'card', tag: 'card', component: true, componentPath: CARD },
      { type: 'text', id: 'text', text: 'hi' },
    ] },
  ],
}

describe('component flow', () => {
  test('carries the snapshot as a tree and ends with ready', () => {
    const messages = buildComponentFlow(tree, definitions)
    expect(messages.at(-2)).toEqual({ type: 'tree', root: tree })
    expect(messages.at(-1)).toEqual({ type: 'ready' })
    expect(messages.some((entry) => entry.type === 'define' && entry.path === CARD)).toBe(true)
  })

  test('emits the definition before the tree when definitions are lazy', () => {
    const messages = buildComponentFlow(tree, definitions, { eagerDefinitions: false })
    const defineIndex = messages.findIndex(
      (entry) => entry.type === 'define' && entry.path === CARD,
    )
    const treeIndex = messages.findIndex((entry) => entry.type === 'tree')
    expect(defineIndex).toBeGreaterThanOrEqual(0)
    expect(defineIndex).toBeLessThan(treeIndex)
  })

  test('skips definitions that did not ship', () => {
    const messages = buildComponentFlow(tree, new Map())
    expect(messages.some((entry) => entry.type === 'define')).toBe(false)
    // The tree still states the component boundary; only the definition is missing.
    const treeMessage = messages.find((entry) => entry.type === 'tree')
    expect(treeMessage?.type === 'tree' && treeMessage.root).toEqual(tree)
  })

  test('collects component identities in pageframe creation order', () => {
    expect(collectComponentIdentities(tree)).toEqual([
      { id: 'page', path: 'pages/index/index' },
      { id: 'card', path: CARD },
    ])
  })
})
