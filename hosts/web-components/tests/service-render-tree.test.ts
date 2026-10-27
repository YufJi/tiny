import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import type { RenderNode } from '@tiny/runtime'
import { createGlassRenderTree } from '../src/render-tree'

describe('projected render tree in glass', () => {
  test('mounts built-in composition and applies text/props/insert/remove patches', () => {
    const root: RenderNode = {
      type: 'element',
      id: 'page',
      tag: 'page',
      children: [
        {
          type: 'element',
          id: 'group',
          tag: 'checkbox-group',
          events: [{ name: 'change' }],
          children: [{
            type: 'element',
            id: 'label',
            tag: 'label',
            children: [
              {
                type: 'element',
                id: 'check',
                tag: 'checkbox',
                props: { value: 'a', checked: false },
              },
              { type: 'text', id: 'label-text', text: 'Label A' },
            ],
          }],
        },
        {
          type: 'element',
          id: 'footer-box',
          tag: 'view',
          children: [{ type: 'text', id: 'footer', text: 'hello hello' }],
        },
      ],
    }

    const render = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    render.mount(root)

    const group = render.getNode('group') as unknown as {
      hasItems: (nodes: unknown[]) => boolean
      childNodes: unknown[]
    }
    const checkbox = render.getNode('check') as unknown as { is: string; data: { checked: boolean } }
    const footer = render.getNode('footer') as unknown as { textContent: string }
    expect(group).toBeDefined()
    expect(checkbox).toBeDefined()
    expect(group.hasItems(group.childNodes)).toBe(true)
    expect(checkbox.is).toContain('checkbox')
    expect(footer.textContent).toBe('hello hello')

    render.applyPatches([
      { type: 'props', id: 'check', props: { value: 'a', checked: true } },
      { type: 'text', id: 'footer', text: 'hello bye' },
    ])
    expect((render.getNode('check') as unknown as { data: { checked: boolean } }).data.checked).toBe(true)
    expect((render.getNode('footer') as unknown as { textContent: string }).textContent).toBe('hello bye')

    render.applyPatches([{ type: 'remove', parentId: 'page', index: 1, count: 1 }])
    expect(render.getNode('footer')).toBeUndefined()

    render.applyPatches([{
      type: 'insert',
      parentId: 'page',
      index: 1,
      node: {
        type: 'element',
        id: 'footer-box-2',
        tag: 'view',
        children: [{ type: 'text', id: 'footer-2', text: 'hello bye' }],
      },
    }])
    expect((render.getNode('footer-2') as unknown as { textContent: string }).textContent).toBe('hello bye')
  })
})
