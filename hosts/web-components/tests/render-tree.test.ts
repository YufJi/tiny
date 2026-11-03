import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { applyClassProps, createGlassRenderTree } from '../src/render-tree'

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
      data: { value: string[] }
    }
    const checkbox = tree.getNode('checked') as unknown as {
      is: string
      parentNode: unknown
    }
    expect(group).toBeDefined()
    expect(checkbox).toBeDefined()
    expect(group.data.value).toEqual([])
    const ancestors: string[] = []
    let current: any = checkbox
    while (current) {
      ancestors.push(String(current.is ?? ''))
      current = current.parentNode
    }
    expect(ancestors.some((tag) => tag.endsWith('checkbox-group'))).toBe(true)

    // A page-driven `checked` change flows one way into the group value.
    tree.applyPatches([{ type: 'props', id: 'checked', props: { value: 'a', checked: true } }])
    expect(group.data.value).toEqual(['a'])
    expect((checkbox as unknown as { data: { checked: boolean } }).data.checked).toBe(true)
  })

  test('scopes external classes with both owner and page scopes', () => {
    let className = ''
    const element = {
      setAttribute: (name: string, value: string) => {
        if (name === 'class') className = value
      },
    } as unknown as HTMLElement
    applyClassProps(
      element,
      { class: 'custom-class' },
      ['owner-scope'],
      undefined,
      { 'custom-class': ['demo-home-nav__icon'] },
      ['page-scope'],
    )
    expect(className).toContain('demo-home-nav__icon')
    expect(className).toContain('owner-scope--demo-home-nav__icon')
    expect(className).toContain('page-scope--demo-home-nav__icon')
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
