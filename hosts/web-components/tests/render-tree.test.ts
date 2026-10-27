import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { createGlassRenderTree } from '../src/render-tree'

function element(id: string, tag: string, props: Record<string, unknown> = {}, children: any[] = []): any {
  return { type: 'element', id, tag, props, children }
}

describe('glass render tree', () => {
  test('composes built-ins into a real ancestor tree', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.mount(element('root', 'view', { class: 'page' }, [
      element('group', 'checkbox-group', {}, [
        element('label', 'label', {}, [
          element('checked', 'checkbox', { value: 'a', checked: false }, [
            { type: 'text', id: 'checked-text', text: 'A' },
          ]),
        ]),
      ]),
    ]))

    const group = tree.getNode('group') as unknown as {
      hasItems: (nodes: unknown[]) => boolean
      syncSelected: () => string[]
      childNodes: unknown[]
    }
    const checkbox = tree.getNode('checked') as unknown as {
      is: string
      parentNode: unknown
    }
    expect(group).toBeDefined()
    expect(checkbox).toBeDefined()
    expect(group.hasItems(group.childNodes)).toBe(true)
    const ancestors: string[] = []
    let current: any = checkbox
    while (current) {
      ancestors.push(String(current.is ?? ''))
      current = current.parentNode
    }
    expect(ancestors.some((tag) => tag.endsWith('checkbox-group'))).toBe(true)
  })

  test('keeps custom render containers as parent hosts', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.mount(element('root', 'view', {}, [
      element('card', 'some-card', { class: 'card' }, [
        element('inner', 'view', { class: 'inner' }),
      ]),
    ]))
    const card = tree.getNode('card')
    const inner = tree.getNode('inner')
    expect(card).toBeDefined()
    expect(inner).toBeDefined()
  })
})
