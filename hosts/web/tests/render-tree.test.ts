import { describe, expect, test } from 'vitest'
import * as glassEasel from '@tiny/runtime/glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { applyClassProps, createGlassRenderTree, matchComponentInstances } from '../src/render/tree'

function element(id: string, tag: string, props: Record<string, unknown> = {}, children: any[] = []): any {
  return { type: 'element', id, tag, props, children }
}

function templatesForMany(entries: Array<[string, string]>) {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  for (const [path, source] of entries) group.addTmpl(path, source)
  const generated = group.getTmplGenObjectGroups()
  group.free()
  const groupList = new Function(`return ${generated}`)() as Record<string, (name?: string) => unknown>
  return {
    groupList,
    content: (entry: string, name = '') => groupList[entry]!(name),
  }
}

function templatesFor(path: string, source: string) {
  const group = TmplGroup.newDev({
    directivePrefix: 'wx',
    templateExtension: '.wxml',
    templateScriptExtension: '.wxs',
  })
  group.addTmpl(path, source)
  const generated = group.getTmplGenObjectGroups()
  group.free()
  const groupList = new Function(`return ${generated}`)() as Record<string, (name?: string) => unknown>
  return {
    groupList,
    content: (entry: string, name = '') => groupList[entry]!(name),
  }
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
    tree.applyPatches([{ type: 'props', target: 'root#0.0.0', props: { value: 'a', checked: true } }])
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

  test('registers a real component for a defined component path', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.({
      'components/card/card': {
        path: 'components/card/card',
        properties: { label: { type: 'string', value: 'default' } },
      },
    })
    tree.mount({
      type: 'element',
      id: 'root',
      tag: 'view',
      children: [{
        type: 'element',
        id: 'card',
        tag: 'card',
        component: true,
        componentPath: 'components/card/card',
        children: [{ type: 'element', id: 'inner', tag: 'view' }],
      }],
    })

    const card = tree.getNode('card') as unknown as { is: string; data: Record<string, unknown> }
    // The render instance is registered under the artifact path, the same `is`
    // the service uses, so behavior/ancestor lookups can identify it.
    expect(card.is).toBe('components/card/card')
    expect(card.data.label).toBe('default')
    // Light children still render through the component host.
    expect(tree.getNode('inner')).toBeDefined()
  })

  test('keeps the path identity when the definition has not arrived', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.mount({
      type: 'element',
      id: 'root',
      tag: 'view',
      children: [{
        type: 'element',
        id: 'unknown',
        tag: 'some-card',
        component: true,
        componentPath: 'components/unknown/unknown',
      }],
    })
    const unknown = tree.getNode('unknown') as unknown as { is: string }
    expect(unknown.is).toBe('components/unknown/unknown')
  })

  test('falls back to a tag-keyed container when the node has no path', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.mount(element('root', 'view', {}, [element('legacy', 'some-card')]))
    const legacy = tree.getNode('legacy') as unknown as { is: string }
    expect(legacy.is).toContain('tiny-render-container:')
  })

  test('resolves wx:// behaviors and projects declared properties', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.({
      'components/field/field': {
        path: 'components/field/field',
        properties: {
          name: { type: 'string', value: '' },
          value: { value: '' },
        },
        behaviors: ['wx://form-field'],
      },
    })
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'field',
      tag: 'field',
      component: true,
      componentPath: 'components/field/field',
      props: { name: 'email', value: 'a@b' },
    }]))

    const field = tree.getNode('field') as unknown as { data: Record<string, unknown> }
    // Declared properties are projected into the render instance so form and
    // label consumers can read `this.data` (the `wx://` alias chain itself is
    // covered in `builtin-behaviors.test.ts`).
    expect(field.data.name).toBe('email')
    expect(field.data.value).toBe('a@b')
  })

  test('evaluates a component template in the render thread', () => {
    const templates = templatesFor('components/card/card', '<view id="inner">{{ label }}</view>')
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/card/card': {
          path: 'components/card/card',
          properties: { label: { type: 'string', value: 'hi' } },
        },
      },
    })
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: 'components/card/card',
    }]))

    const card = tree.getNode('card') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown } | null
    }
    expect(card.getShadowRoot()?.getElementById('inner')).toBeDefined()
  })

  test('resolves component-relative assets against the owning component path', () => {
    const templates = templatesFor(
      'components/card/card',
      '<image id="image" src="./icon.png" />',
    )
    const resolved: Array<{ src: string; sourcePath?: string }> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/card/card': { path: 'components/card/card' },
      },
      resolveAssetUrl: (src, sourcePath) => {
        resolved.push({ src, sourcePath })
        return `${sourcePath ?? ''}/${src}`
      },
    })
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: 'components/card/card',
    }]))

    const card = tree.getNode('card') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown } | null
    }
    const image = card.getShadowRoot()?.getElementById('image') as unknown as {
      asGeneralComponent: () => { resolveSrc: (value: string) => string } | undefined
    } | undefined
    const component = image?.asGeneralComponent()
    expect(component).toBeDefined()
    expect(component!.resolveSrc('./icon.png')).toBe('components/card/card/./icon.png')
    expect(resolved).toContainEqual({ src: './icon.png', sourcePath: 'components/card/card' })
    ;(component as unknown as { setData: (value: Record<string, unknown>) => void })
      .setData({ src: './updated.png' })
    const updated = (component as unknown as { data: { src: string } }).data.src
    expect(component!.resolveSrc(updated)).toBe('components/card/card/./updated.png')
  })

  test('resolves page-level assets against the active page path', () => {
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      resolveAssetUrl: (src, sourcePath) => `${sourcePath ?? ''}|${src}`,
    })
    tree.setPagePath('pages/index/index')
    tree.mount(element('root', 'page', {}, [
      element('image', 'image', { src: './icon.png' }),
    ]))

    const image = tree.getNode('image') as unknown as {
      resolveSrc: (value: string) => string
    }
    expect(image.resolveSrc('./icon.png')).toBe('pages/index/index|./icon.png')
    expect(image.resolveSrc('../shared/icon.png')).toBe('pages/index/index|../shared/icon.png')
  })

  test('forwards template handlers instead of running them locally', () => {
    const templates = templatesFor(
      'components/card/card',
      '<view id="inner" bindtap="onTap" bindtouchstart="onTouch">hi</view>',
    )
    const events: Array<Record<string, unknown>> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/card/card': {
          path: 'components/card/card',
          methods: ['onTap', 'onTouch'],
        },
      },
    })
    tree.setTemplateEventSink?.((event) => events.push(event as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: 'components/card/card',
    }]))

    const card = tree.getNode('card') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown } | null
    }
    const inner = card.getShadowRoot()?.getElementById('inner')
    glassEasel.triggerEvent(inner as never, 'tap', { x: 1 })

    expect(events[0]).toMatchObject({
      componentId: 'card',
      handler: 'onTap',
      name: 'tap',
      detail: { x: 1 },
    })

    // Touch projections from the compositor carry `touches` as extra fields.
    glassEasel.triggerEvent(inner as never, 'touchstart', {}, {
      extraFields: {
        touches: [{ identifier: 0, pageX: 5, pageY: 6, clientX: 5, clientY: 6 }],
        changedTouches: [{ identifier: 0, pageX: 5, pageY: 6, clientX: 5, clientY: 6 }],
      },
    } as never)
    expect(events[1]).toMatchObject({
      componentId: 'card',
      handler: 'onTouch',
      name: 'touchstart',
      touches: [{ identifier: 0, clientX: 5, clientY: 6 }],
    })
  })

  test('removes non-JSON values from forwarded event details', () => {
    const templates = templatesFor(
      'components/card/card',
      '<view id="inner" bindtap="onTap">hi</view>',
    )
    const events: Array<Record<string, unknown>> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/card/card': { path: 'components/card/card', methods: ['onTap'] },
      },
    })
    tree.setTemplateEventSink?.((event) => events.push(event as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: 'components/card/card',
    }]))

    const card = tree.getNode('card') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown } | null
    }
    const inner = card.getShadowRoot()?.getElementById('inner')
    // Glass copies a DOM event into the detail; `touches`/`targetTouches` stay
    // live `TouchList` instances there and the bridge rejects them.
    class TouchListLike { length = 1 }
    glassEasel.triggerEvent(inner as never, 'tap', {
      clientX: 1,
      touches: new TouchListLike(),
      handler: () => undefined,
    })

    expect(events[0]?.detail).toEqual({ clientX: 1 })
  })

  test('forwards a normalized touch projection only once', () => {
    const templates = templatesFor(
      'components/card/card',
      '<view id="inner" bindtouchstart="onTouch">hi</view>',
    )
    const events: Array<Record<string, unknown>> = []
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/card/card': { path: 'components/card/card', methods: ['onTouch'] },
      },
    })
    tree.setTemplateEventSink?.((event) => events.push(event as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'card',
      tag: 'card',
      component: true,
      componentPath: 'components/card/card',
    }]))

    const card = tree.getNode('card') as unknown as {
      getShadowRoot: () => { getElementById: (id: string) => unknown } | null
    }
    const inner = card.getShadowRoot()?.getElementById('inner')
    const rawTouch = { [Symbol.for('tiny.handledNativeEvent')]: true }
    const touch = { identifier: 0, clientX: 5, clientY: 6, x: 5, y: 6 }
    // The raw DOM projection the canvas built-in already re-emitted.
    glassEasel.triggerEvent(inner as never, 'touchstart', {}, {
      originalEvent: rawTouch,
      extraFields: { touches: [touch], changedTouches: [touch] },
    } as never)
    expect(events).toHaveLength(0)

    // The built-in's normalized event has no original event and is forwarded.
    glassEasel.triggerEvent(inner as never, 'touchstart', {}, {
      extraFields: { touches: [touch], changedTouches: [touch] },
    } as never)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ handler: 'onTouch', name: 'touchstart', touches: [touch] })
  })
  test('matches created component instances positionally by path', () => {
    const result = matchComponentInstances(
      ['components/card/card', 'components/card/card'],
      [
        { id: 'card-first', path: 'components/card/card' },
        { id: 'card-second', path: 'components/card/card' },
      ],
    )

    expect(result.desync).toBeUndefined()
    expect(result.matched).toEqual([
      { index: 0, id: 'card-first' },
      { index: 1, id: 'card-second' },
    ])
  })

  test('stops at the first path mismatch and reports a desync', () => {
    const result = matchComponentInstances(
      ['components/card/card', 'components/card/card'],
      [
        { id: 'card-first', path: 'components/card/card' },
        { id: 'card-second', path: 'components/other/other' },
      ],
    )

    expect(result.matched).toEqual([{ index: 0, id: 'card-first' }])
    expect(result.desync).toEqual({
      kind: 'order',
      index: 1,
      expected: 'components/other/other',
      actual: 'components/card/card',
    })
  })

  test('reports extra render components as a desync', () => {
    const result = matchComponentInstances(
      ['components/card/card', 'components/card/card'],
      [{ id: 'card-first', path: 'components/card/card' }],
    )

    expect(result.matched).toEqual([{ index: 0, id: 'card-first' }])
    expect(result.desync).toEqual({
      kind: 'count',
      created: ['components/card/card', 'components/card/card'],
      expected: ['components/card/card'],
    })
  })

  test('treats a missing render component as desync only in the strict pass', () => {
    const created = ['components/card/card']
    const expected = [
      { id: 'card-first', path: 'components/card/card' },
      { id: 'card-second', path: 'components/card/card' },
    ]

    // Later passes can observe a render lag; only the post-mount pass is strict.
    expect(matchComponentInstances(created, expected).desync).toBeUndefined()
    expect(matchComponentInstances(created, expected, { strictCount: true }).desync).toEqual({
      kind: 'count',
      created: ['components/card/card'],
      expected: ['components/card/card', 'components/card/card'],
    })
  })
  test('resolves componentGenerics defaults while evaluating a template', () => {
    const templates = templatesForMany([
      ['components/generic/generic', '<view><pick /></view>'],
      ['components/generic/default-pick', '<text>pick</text>'],
    ])
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/generic/generic': {
          path: 'components/generic/generic',
          generics: { pick: { default: './default-pick' } },
        },
        'components/generic/default-pick': { path: 'components/generic/default-pick' },
      },
    })
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'generic',
      tag: 'generic',
      component: true,
      componentPath: 'components/generic/generic',
    }]))

    const collect = (node: any, out: any[] = []): any[] => {
      const light = node?.childNodes ?? []
      const shadow = node?.shadowRoot?.childNodes ?? []
      for (const child of [...light, ...shadow]) {
        out.push(child)
        collect(child, out)
      }
      return out
    }
    const generic = tree.getNode('generic')
    expect(Object.keys((generic as any)?._$genericImpls ?? {})).toEqual(['pick'])
    const rendered = collect(generic)
    expect(rendered.some((node) => node?.is === 'components/generic/default-pick')).toBe(true)
  })
  test('forwards virtualHost and multipleSlots to the render definition', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.({
      'components/virtual/virtual': {
        path: 'components/virtual/virtual',
        options: { virtualHost: true, multipleSlots: true },
      },
    })
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'virtual',
      tag: 'virtual',
      component: true,
      componentPath: 'components/virtual/virtual',
    }]))

    const options = (tree.getNode('virtual') as unknown as {
      _$behavior?: { _$options?: Record<string, unknown> }
    })._$behavior?._$options ?? {}
    expect(options.virtualHost).toBe(true)
    expect(options.multipleSlots).toBe(true)
  })
  test('warns when a page-level generic override cannot be resolved', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.setComponentDefinitions?.({
      'components/generic/generic': { path: 'components/generic/generic', generics: { pick: true } },
    })
    const diagnostics: Array<{ code: string; severity: string }> = []
    tree.setDiagnosticSink?.((diagnostic) => diagnostics.push(diagnostic as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'generic',
      tag: 'generic',
      component: true,
      componentPath: 'components/generic/generic',
      props: { 'generic:pick': 'item' },
    }]))

    expect(diagnostics).toContainEqual(expect.objectContaining({
      code: 'UNSUPPORTED_COMPONENT_GENERIC',
      severity: 'warning',
    }))
  })

  test('resolves a generic override inside an evaluated template', () => {
    const templates = templatesForMany([
      ['components/parent/parent', '<child generic:pick="item" />'],
      ['components/parent/child', '<pick />'],
      ['components/parent/item', '<text>item</text>'],
    ])
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/parent/parent': {
          path: 'components/parent/parent',
          using: {
            child: 'components/parent/child',
            item: 'components/parent/item',
          },
        },
        'components/parent/child': {
          path: 'components/parent/child',
          generics: { pick: true },
        },
        'components/parent/item': { path: 'components/parent/item' },
      },
    })
    const diagnostics: Array<{ code: string }> = []
    tree.setDiagnosticSink?.((diagnostic) => diagnostics.push(diagnostic as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'parent',
      tag: 'parent',
      component: true,
      componentPath: 'components/parent/parent',
    }]))

    const collect = (node: any, out: any[] = []): any[] => {
      for (const child of [...(node?.childNodes ?? []), ...(node?.shadowRoot?.childNodes ?? [])]) {
        out.push(child)
        collect(child, out)
      }
      return out
    }
    const child = collect(tree.getNode('parent'))
      .find((node) => node?.is === 'components/parent/child')
    expect(child).toBeDefined()
    expect(Object.keys((child as any)?._$genericImpls ?? {})).toEqual(['pick'])
    expect(diagnostics).toEqual([])
  })
  test('form collects a page-level custom field whose name arrives as a prop', () => {
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      componentDefinitions: {
        'components/field/field': {
          path: 'components/field/field',
          behaviors: ['wx://form-field'],
        },
      },
    })
    tree.mount(element('root', 'view', {}, [
      element('form', 'form', {}, [
        {
          type: 'element',
          id: 'field',
          tag: 'field',
          component: true,
          componentPath: 'components/field/field',
          props: { name: 'custom', value: 'v' },
        },
        element('submit', 'button', { 'form-type': 'submit' }),
      ]),
    ]))

    const submitted: unknown[] = []
    const form = tree.getNode('form') as unknown as {
      addListener: (name: string, listener: (event: { detail: unknown }) => void) => void
    }
    form.addListener('submit', (event) => submitted.push(event.detail))
    const button = tree.getNode('submit') as unknown as glassEasel.Element
    glassEasel.triggerEvent(button, 'tap', {})

    expect(submitted).toEqual([expect.objectContaining({ value: { custom: 'v' } })])
  })
  test('form collects a nested field through captured template props', () => {
    const templates = templatesForMany([
      ['components/group/group', '<field name="custom" value="v" />'],
      ['components/field/field', '<slot />'],
    ])
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      templates,
      componentDefinitions: {
        'components/group/group': {
          path: 'components/group/group',
          using: { field: 'components/field/field' },
          behaviors: ['wx://form-field-group'],
        },
        'components/field/field': {
          path: 'components/field/field',
          behaviors: ['wx://form-field'],
        },
      },
    })
    tree.mount(element('root', 'view', {}, [
      element('form', 'form', {}, [
        {
          type: 'element',
          id: 'group',
          tag: 'group',
          component: true,
          componentPath: 'components/group/group',
        },
        element('submit', 'button', { 'form-type': 'submit' }),
      ]),
    ]))

    const submitted: unknown[] = []
    const form = tree.getNode('form') as unknown as {
      addListener: (name: string, listener: (event: { detail: unknown }) => void) => void
    }
    form.addListener('submit', (event) => submitted.push(event.detail))
    glassEasel.triggerEvent(tree.getNode('submit') as never, 'tap', {})

    expect(submitted).toEqual([expect.objectContaining({ value: { custom: 'v' } })])
  })
  test('resolves a page-level generic override through the page using map', () => {
    const tree = createGlassRenderTree({
      backend: new glassEasel.EmptyBackendContext(),
      componentDefinitions: {
        'components/generic/generic': {
          path: 'components/generic/generic',
          generics: { pick: true },
        },
        'components/item/item': { path: 'components/item/item' },
      },
    })
    tree.setPageUsing?.({ item: 'components/item/item' })
    const diagnostics: Array<{ code: string }> = []
    tree.setDiagnosticSink?.((diagnostic) => diagnostics.push(diagnostic as never))
    tree.mount(element('root', 'view', {}, [{
      type: 'element',
      id: 'generic',
      tag: 'generic',
      component: true,
      componentPath: 'components/generic/generic',
      props: { 'generic:pick': 'item' },
    }]))

    const generic = tree.getNode('generic') as unknown as {
      _$genericImpls?: Record<string, { final?: { is?: string } }>
    }
    expect(Object.keys(generic?._$genericImpls ?? {})).toEqual(['pick'])
    expect(generic?._$genericImpls?.pick?.final?.is).toBe('components/item/item')
    expect(diagnostics).toEqual([])
  })
  test('resolves component-scoped locators for geometry', () => {
    const tree = createGlassRenderTree({ backend: new glassEasel.EmptyBackendContext() })
    tree.mount(element('root', 'view', {}, [element('page-node', 'view')]))

    // `owner#index.path`: owner is the page root, path is the child index chain.
    expect(Object.keys(tree.measureLocators?.(['root#0']) ?? {})).toEqual(['root#0'])
    expect(tree.measureLocators?.(['root#9'])).toEqual({})
    expect(tree.measureLocators?.(['missing#0'])).toEqual({})
    expect(tree.measureLocators?.(['invalid'])).toEqual({})
  })
})
