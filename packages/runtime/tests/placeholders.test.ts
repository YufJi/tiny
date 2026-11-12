import { describe, expect, test } from 'vitest'
import type { RenderNode } from '../src/tree-protocol/protocol'
import { applyComponentPlaceholders } from '../src/render/placeholders'

function missingComponentTree(): RenderNode {
  return {
    type: 'element',
    tag: 'page',
    children: [{
      type: 'element',
      tag: 'heavy-card',
      component: true,
      componentPath: 'pkg/components/heavy-card/heavy-card',
      children: [{ type: 'text', text: 'placeholder child' }],
    }],
  }
}

describe('componentPlaceholder resolution', () => {
  test('replaces a component without a definition with its built-in placeholder', () => {
    const result = applyComponentPlaceholders(
      missingComponentTree(),
      { 'pkg/components/heavy-card/heavy-card': 'view' },
      () => false,
    )
    const child = (result as { children: Array<Record<string, unknown>> }).children[0]!
    expect(child.tag).toBe('view')
    expect(child.component).toBeUndefined()
    expect(child.componentPath).toBeUndefined()
    expect(child.children).toEqual([{ type: 'text', text: 'placeholder child' }])
  })

  test('keeps a component that already has a definition', () => {
    const result = applyComponentPlaceholders(
      missingComponentTree(),
      { 'pkg/components/heavy-card/heavy-card': 'view' },
      () => true,
    )
    const child = (result as { children: Array<Record<string, unknown>> }).children[0]!
    expect(child.tag).toBe('heavy-card')
    expect(child.component).toBe(true)
  })

  test('matches paths with or without a leading slash', () => {
    const result = applyComponentPlaceholders(
      missingComponentTree(),
      { '/pkg/components/heavy-card/heavy-card': 'text' },
      () => false,
    )
    const child = (result as { children: Array<Record<string, unknown>> }).children[0]!
    expect(child.tag).toBe('text')
  })

  test('leaves nodes untouched when no placeholder is configured', () => {
    const tree = missingComponentTree()
    expect(applyComponentPlaceholders(tree, undefined, () => false)).toBe(tree)
    expect(applyComponentPlaceholders(tree, {}, () => false)).toBe(tree)
  })
})
