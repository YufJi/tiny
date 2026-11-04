import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { TmplGroup } from '@tiny/template-compiler'
import {
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_COMPONENT_TAGS,
  BUILTIN_HOST_STYLES,
  createBuiltinComponents,
} from '../src'
import precompiledTemplates from '../src/generated/templates'
import { applyHostProps } from '../src/render-tree'
import { transformTextContent } from '../src/components/text/content'

function compilePage(source: string): glassEasel.template.ComponentTemplate {
  const group = TmplGroup.newDev({ directivePrefix: 'wx', templateExtension: '.wxml', templateScriptExtension: '.wxs' })
  group.addTmpl('', source)
  const generated = group.getTmplGenObjectGroups()
  group.free()
  const groupList = new Function(`return ${generated}`)() as Record<string, unknown>
  return {
    groupList,
    content: (name = '') => {
      const group = groupList[name]
      if (!group) throw new Error(`template not found: ${name}`)
      return group(name)
    },
  }
}

// The template-driven tests build a detached tree; the render tree attaches
// pages with `pretendAttached`, so group/item registration needs the same.
function attach(instance: unknown): void {
  glassEasel.Element.pretendAttached(instance as glassEasel.Element)
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('P0 built-in components', () => {
  test('ships a precompiled template for every tag', () => {
    const templateKeys = Object.keys(precompiledTemplates).filter((key) => key !== 'pull-down-refresher')
    expect(templateKeys.sort()).toEqual([...BUILTIN_COMPONENT_TAGS].sort())
    expect(Object.keys(precompiledTemplates)).toContain('pull-down-refresher')
  })

  test('exposes every P0 component tag', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const definitions = createBuiltinComponents(space)
    expect(Object.keys(definitions)).toHaveLength(BUILTIN_COMPONENT_TAGS.length)
    expect(Object.keys(definitions)).toEqual(expect.arrayContaining([...BUILTIN_COMPONENT_TAGS]))
  })

  // `text` has no author display rule, so the UA `[hidden]` rule applies;
  // WeChat also declares no `wx-text[hidden]`.
  const TAGS_WITHOUT_AUTHOR_HIDDEN = new Set<string>(['label', 'text', 'root-portal'])

  test('hides every built-in host tag with an author [hidden] rule or the UA default', () => {
    for (const tag of BUILTIN_COMPONENT_TAGS) {
      const selector = `${TINY_ENGINE_NAMING.hostTagPrefix}${tag}[hidden]`
      if (TAGS_WITHOUT_AUTHOR_HIDDEN.has(tag)) {
        expect(BUILTIN_HOST_STYLES).not.toContain(selector)
        continue
      }
      expect(BUILTIN_HOST_STYLES).toContain(selector)
    }
  })

  test('ships the WeChat 2.30.1 document base and universal margin reset', () => {
    // WeChat's page WebView starts with these document rules; app WXSS written
    // for WeChat assumes the `* { margin: 0 }` reset is already in place.
    expect(BUILTIN_HOST_STYLES).toContain('body,\nhtml {\n  -webkit-touch-callout: none;')
    expect(BUILTIN_HOST_STYLES).toContain('body {\n  -webkit-text-size-adjust: none;')
    expect(BUILTIN_HOST_STYLES).toContain('* {\n  margin: 0;')
    expect(BUILTIN_HOST_STYLES).toContain('--safe-area-inset-top: env(safe-area-inset-top);')
    expect(BUILTIN_HOST_STYLES).toContain('@font-face')
    expect(BUILTIN_HOST_STYLES).toContain('font-family: weui;')
  })

  test('keeps cross-component layout in public host CSS and private styles in component scopes', () => {
    // WeChat absolutely positions each swiper-item and translates it from the
    // swiper, so the host rule must not depend on the swiper's internals.
    expect(BUILTIN_HOST_STYLES).toContain('tiny-swiper-item {\n  display: block;\n  overflow: hidden;')
    expect(BUILTIN_HOST_STYLES).toContain('width: 100%;')
    expect(BUILTIN_HOST_STYLES).not.toContain('.tiny-swiper.is-vertical tiny-swiper-item')

    const swiperStyles = BUILTIN_COMPONENT_STYLES.find((style) => style.tag === 'swiper')
    expect(swiperStyles?.scope).toBe('tiny-builtin-swiper')
    expect(swiperStyles?.content).not.toContain(' tiny-swiper-item')
  })

  test('boolean host props are presence-only attributes', () => {
    const attributes = new Map<string, string>()
    const element = {
      setAttribute: (name: string, value: string) => attributes.set(name, value),
      removeAttribute: (name: string) => attributes.delete(name),
    }
    const component = { getBackendElement: () => element } as unknown as Parameters<typeof applyHostProps>[0]
    // `disabled="false"` would still match `[disabled]` selectors, so a false
    // boolean must clear the attribute instead of writing the string.
    applyHostProps(component, { disabled: true, plain: false, 'data-id': 'x', count: 0 })
    expect(attributes.get('disabled')).toBe('true')
    expect(attributes.has('plain')).toBe(false)
    expect(attributes.get('data-id')).toBe('x')
    expect(attributes.get('count')).toBe('0')
    attributes.set('plain', 'false')
    applyHostProps(component, { plain: false })
    expect(attributes.has('plain')).toBe(false)
  })

  test('button catches native taps and emits a mini-program tap event', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const taps: Array<Record<string, unknown>> = []
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      template: compilePage('<button id="button" bindtap="onTap">Tap</button>'),
      methods: {
        onTap(event: glassEasel.ShadowedEvent<unknown>) {
          taps.push(event.detail as Record<string, unknown>)
        },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()
    expect(buttonHost).toBeDefined()
    buttonHost?.triggerEvent('tap', { value: 'ok' })
    expect(taps).toEqual([{ value: 'ok' }])
  })


  test('button applies WeChat type, size, plain and loading classes', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      data: { type: 'primary', size: 'mini', plain: true, loading: true, disabled: false },
      template: compilePage(
        '<button id="button" type="{{type}}" size="{{size}}" plain="{{plain}}" loading="{{loading}}" disabled="{{disabled}}">Tap</button>',
      ),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()
    expect(buttonHost).toBeDefined()
    expect(buttonHost!.data.type).toBe('primary')
    expect(buttonHost!.data.size).toBe('mini')
    expect(buttonHost!.data.plain).toBe(true)
    expect(buttonHost!.data.loading).toBe(true)
  })

  test('button applies hover after hoverStartTime and clears it after hoverStayTime', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      template: compilePage('<button id="button">Tap</button>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()!
    attach(buttonHost)
    buttonHost.triggerEvent('touchstart', { touches: [{}] })
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(buttonHost.data.hovering).toBe(true)
    expect(buttonHost.class).toContain('button-hover')
    buttonHost.triggerEvent('touchend', {})
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(buttonHost.data.hovering).toBe(false)
    expect(buttonHost.class).not.toContain('button-hover')
  })

  test('button suppresses disabled taps and emits form/open-type semantics', () => {
    const diagnostics: Array<Record<string, unknown>> = []
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic as unknown as Record<string, unknown>),
    })
    const taps: unknown[] = []
    const submits: unknown[] = []
    const resets: unknown[] = []
    const errors: unknown[] = []
    const userInfos: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      data: { formType: 'submit', openType: 'getUserInfo', disabled: false },
      template: compilePage(
        '<button id="button" form-type="{{formType}}" open-type="{{openType}}" disabled="{{disabled}}" bindtap="onTap" bind:formSubmit="onSubmit" bind:formReset="onReset" bind:error="onError" bind:getuserinfo="onUserInfo">Tap</button>',
      ),
      methods: {
        onTap(event: glassEasel.ShadowedEvent<unknown>) {
          taps.push(event.detail)
        },
        onSubmit(event: glassEasel.ShadowedEvent<unknown>) {
          submits.push(event.detail)
        },
        onReset(event: glassEasel.ShadowedEvent<unknown>) {
          resets.push(event.detail)
        },
        onError(event: glassEasel.ShadowedEvent<unknown>) {
          errors.push(event.detail)
        },
        onUserInfo(event: glassEasel.ShadowedEvent<unknown>) {
          userInfos.push(event.detail)
        },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()!
    buttonHost.triggerEvent('tap', {})
    expect(taps).toEqual([{}])
    expect(submits).toEqual([{ formId: '', formPluginId: '' }])
    expect(diagnostics.map((item) => item.code)).toContain('UNSUPPORTED_BUTTON_OPEN_TYPE')
    expect(errors).toEqual([{ errMsg: 'getUserInfo:fail not supported by the Tiny runtime' }])
    expect(userInfos).toEqual([{ errMsg: 'getUserInfo:fail not supported by the Tiny runtime' }])

    buttonHost.setData({ formType: 'reset' })
    buttonHost.triggerEvent('tap', {})
    expect(resets).toEqual([undefined])

    buttonHost.setData({ disabled: true })
    buttonHost.triggerEvent('tap', {})
    // Direct triggerEvent bypasses CSS `pointer-events: none`; the component
    // must at least not emit form/open-type semantics while disabled.
    expect(submits).toHaveLength(1)
    expect(diagnostics.filter((item) => item.code === 'UNSUPPORTED_BUTTON_OPEN_TYPE')).toHaveLength(2)

    buttonHost.setData({ native: true })
    const nativeHtml = glassEasel.dumpElementToString(buttonHost, true)
    expect(nativeHtml).toContain('tiny-button-cover-view-wrapper')
    expect(nativeHtml).toContain('tiny-button-cover-view')
  })


  test('button emits longtap and canceltap without also emitting tap', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: string[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      template: compilePage('<button id="button" bindlongtap="onLong" bindcanceltap="onCancel">Tap</button>'),
      methods: {
        onLong() { events.push('longtap') },
        onCancel() { events.push('canceltap') },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const button = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()!
    button.triggerEvent('longpress', { x: 10, y: 20 })
    expect(events).toEqual(['longtap'])
    // The compositor owns canceltap; the button only tracks the flag.
    button.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    button.triggerEvent('canceltap', {}, { bubbles: true, composed: true })
    expect(events).toEqual(['longtap', 'canceltap'])
  })

  test('view reuses the shared base and hover behaviors', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { view: builtins.view },
      template: compilePage('<view id="box" hover-class="hovered">content</view>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const viewHost = instance.getShadowRoot()?.getElementById('box')?.asGeneralComponent()!
    attach(viewHost)
    viewHost.setData({ hidden: true })
    expect(viewHost.data.hidden).toBe(true)
    expect(viewHost.class).not.toContain('hovered')
    viewHost.setData({ hidden: false })

    viewHost.triggerEvent('touchstart', { touches: [{}] })
    await new Promise((resolve) => setTimeout(resolve, 70))
    expect(viewHost.data.hovering).toBe(true)
    expect(viewHost.class).toContain('hovered')
    viewHost.triggerEvent('touchend', {})
    await new Promise((resolve) => setTimeout(resolve, 450))
    expect(viewHost.data.hovering).toBe(false)
    expect(viewHost.class).not.toContain('hovered')
  })

  test('view inherits the wx-base aria surface and maps ariaRole to role', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { view: builtins.view },
      template: compilePage(
        '<view id="box" aria-role="button" aria-label="hello" aria-valuenow="3" tabindex="2">content</view>',
      ),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const viewHost = instance.getShadowRoot()?.getElementById('box')?.asGeneralComponent()!
    expect(viewHost.data.ariaRole).toBe('button')
    expect(viewHost.data.ariaLabel).toBe('hello')
    expect(viewHost.data.ariaValuenow).toBe(3)
    expect(viewHost.data.tabindex).toBe(2)

    const attributes = new Map<string, string>()
    ;(viewHost as unknown as { getBackendElement: () => unknown }).getBackendElement = () => ({
      setAttribute: (name: string, value: string) => attributes.set(name, String(value)),
      removeAttribute: (name: string) => attributes.delete(name),
    })
    viewHost.setData({ ariaRole: 'link' })
    expect(attributes.get('role')).toBe('link')
    ;(viewHost as unknown as { setAriaRoleDefault: (role: string) => void }).setAriaRoleDefault('img')
    viewHost.setData({ ariaRole: '' })
    expect(attributes.get('role')).toBe('img')
  })

  test('view saves and restores scroll state through the reload behavior', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { view: builtins.view },
      template: compilePage('<view id="box">content</view>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const viewHost = instance.getShadowRoot()?.getElementById('box')?.asGeneralComponent()!
    attach(viewHost)
    ;(viewHost as unknown as { getBackendElement: () => unknown }).getBackendElement = () => ({
      scrollTop: 120,
      scrollLeft: 7,
    })
    const state: Record<string, unknown> = {}
    ;(viewHost as unknown as {
      saved: (state: Record<string, unknown>) => void
    }).saved(state)
    const runtime = viewHost as unknown as { _scrollTop: number; _scrollLeft: number }
    expect(runtime._scrollTop).toBe(120)
    expect(runtime._scrollLeft).toBe(7)

    runtime._scrollTop = 0
    runtime._scrollLeft = 0
    ;(viewHost as unknown as {
      restored: (state: Record<string, unknown>) => void
    }).restored(state)
    expect(runtime._scrollTop).toBe(120)
    expect(runtime._scrollLeft).toBe(7)
  })

  test('canceltap clears a pending hover immediately', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      template: compilePage('<button id="button">Tap</button>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()!
    attach(buttonHost)
    buttonHost.triggerEvent('touchstart', { touches: [{}] })
    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(buttonHost.data.hovering).toBe(true)
    buttonHost.triggerEvent('canceltap', {}, { bubbles: true, composed: true })
    expect(buttonHost.data.hovering).toBe(false)
  })


  test('input syncs value and emits normalized input events', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { input: builtins.input },
      template: compilePage('<input id="input" value="{{value}}" bindinput="onInput" />'),
      data: { value: '' },
      methods: {
        onInput(event: glassEasel.ShadowedEvent<unknown>) {
          changes.push(event.detail)
        },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const inputHost = instance.getShadowRoot()?.getElementById('input')?.asGeneralComponent()
    expect(inputHost).toBeDefined()
    inputHost?.setData({ value: 'initial' })
    const nativeInput = inputHost?.getShadowRoot()?.getElementById('native-input')
    expect(nativeInput).toBeDefined()
    nativeInput?.triggerEvent('input', { value: 'typed' })
    expect(changes).toEqual([{ value: 'typed', cursor: -1, keyCode: 0 }])
    expect(inputHost?.data.value).toBe('typed')

    inputHost?.setData({ maxlength: 3, value: 'abcdef' })
    expect(inputHost?.data.value).toBe('abc')
    const inputRuntime = inputHost as unknown as {
      autofillGetValue: () => unknown
      autofillSetValue: (value: unknown) => void
    }
    inputRuntime.autofillSetValue('autofilled')
    expect(inputRuntime.autofillGetValue()).toBe('autofilled')
    expect(inputHost?.data.value).toBe('autofilled')
  })

  test('checkbox toggles on tap and slider/switch normalize control values', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: Record<string, unknown> = {}
    const page = space.defineComponent({
      is: 'page',
      using: {
        checkbox: builtins.checkbox,
        slider: builtins.slider,
        switch: builtins.switch,
      },
      template: compilePage(
        '<checkbox id="checkbox" value="one" /><slider id="slider" value="10" bindchange="onSlider" /><switch id="switch" checked="{{true}}" bindchange="onSwitch" />',
      ),
      methods: {
        onSlider(event: glassEasel.ShadowedEvent<unknown>) {
          events.slider = event.detail
        },
        onSwitch(event: glassEasel.ShadowedEvent<unknown>) {
          events.switch = event.detail
        },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()
    host('checkbox')?.triggerEvent('tap', {})
    expect(host('checkbox')?.data.checked).toBe(true)
    const slider = host('slider')!
    ;(slider as unknown as { getShadowRoot: () => unknown }).getShadowRoot = () => ({
      getElementById: () => ({
        getBackendElement: () => ({
          offsetWidth: 100,
          getBoundingClientRect: () => ({ left: 0 }),
        }),
      }),
    })
    ;(slider as unknown as { _onTap: (event: unknown) => void })._onTap({ detail: { x: 42 } })
    expect(events.slider).toEqual({ value: 42 })
    host('switch')?.triggerEvent('tap', {})
    expect(events.switch).toEqual({ value: false })
  })


  test('switch type=checkbox renders the checkbox branch and toggles', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { switch: builtins.switch },
      template: compilePage('<switch id="switch" type="checkbox" checked="{{true}}" bindchange="onChange" />'),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { events.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = instance.getShadowRoot()?.getElementById('switch')?.asGeneralComponent()!
    const html = glassEasel.dumpElementToString(host, true)
    expect(html).toContain('tiny-checkbox-input-checked')
    expect(html).toContain('tiny-switch-input-checked')
    expect(html).not.toContain('<input')
    host.triggerEvent('tap', {})
    expect(host.data.checked).toBe(false)
    expect(events).toEqual([{ value: false }])
  })

  test('radio group keeps a single checked item and emits group change', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: {
        'radio-group': builtins['radio-group'],
        radio: builtins.radio,
      },
      template: compilePage(`
        <radio-group id="group" bindchange="onChange">
          <radio id="a" value="a" checked="{{true}}" />
          <radio id="b" value="b" />
        </radio-group>
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) {
          changes.push(event.detail)
        },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    host('b').triggerEvent('tap', {})
    expect(changes).toEqual([{ value: 'b' }])
    expect(host('a').data.checked).toBe(false)
    expect(host('b').data.checked).toBe(true)
    const html = glassEasel.dumpElementToString(host('b'), true)
    expect(html).toContain('tiny-radio-input-checked')
  })


  test('checkbox-group derives value from items and never writes them back', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { 'checkbox-group': builtins['checkbox-group'], checkbox: builtins.checkbox },
      template: compilePage(`
        <checkbox-group id="group">
          <checkbox id="a" value="a" />
          <checkbox id="b" value="b" checked="{{true}}" />
        </checkbox-group>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('b').data.checked).toBe(true)
    expect(host('group').data.value).toEqual(['b'])

    // Page-driven `checked` changes flow into the derived value.
    host('a').setData({ checked: true })
    expect(host('group').data.value).toEqual(['b', 'a'])

    // Unsupported value writes are ignored and never touch the items.
    host('group').setData({ value: ['z'] })
    expect(host('a').data.checked).toBe(true)
    expect(host('b').data.checked).toBe(true)

    // The next item change republishes the value derived from the items.
    host('b').setData({ checked: false })
    expect(host('group').data.value).toEqual(['a'])
  })

  test('checkbox-group keeps empty and duplicate values like WeChat', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { 'checkbox-group': builtins['checkbox-group'], checkbox: builtins.checkbox },
      template: compilePage(`
        <checkbox-group id="group">
          <checkbox id="a" value="" />
          <checkbox id="b" value="" />
          <checkbox id="c" value="c" />
        </checkbox-group>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const toggle = (id: string) => {
      host(id).triggerEvent('tap', {})
    }
    toggle('a')
    toggle('b')
    expect(host('group').data.value).toEqual(['', ''])
    toggle('c')
    expect(host('group').data.value).toEqual(['', '', 'c'])
    toggle('a')
    expect(host('group').data.value).toEqual(['', 'c'])
  })

  test('checkbox-group emits change only for user taps', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { 'checkbox-group': builtins['checkbox-group'], checkbox: builtins.checkbox },
      template: compilePage(`
        <checkbox-group id="group" bindchange="onChange">
          <checkbox id="a" value="a" />
        </checkbox-group>
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    host('a').setData({ checked: true })
    expect(changes).toEqual([])
    host('a').triggerEvent('tap', {})
    host('a').triggerEvent('tap', {})
    expect(changes).toEqual([{ value: [] }, { value: ['a'] }])
  })

  test('checkbox-group never clears checked items', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { 'checkbox-group': builtins['checkbox-group'], checkbox: builtins.checkbox },
      template: compilePage(`
        <checkbox-group id="group">
          <checkbox id="a" value="" />
          <checkbox id="b" value="" />
        </checkbox-group>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const toggle = (id: string) => {
      host(id).triggerEvent('tap', {})
    }
    toggle('a')
    toggle('b')
    expect(host('group').data.value).toEqual(['', ''])
    // Any late value write must not be written back to the items.
    host('group').setData({ value: [] })
    expect(host('a').data.checked).toBe(true)
    expect(host('b').data.checked).toBe(true)
  })

  test('radio-group keeps the newest checked item and ignores output writes', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { 'radio-group': builtins['radio-group'], radio: builtins.radio },
      template: compilePage(`
        <radio-group id="group" bindchange="onChange">
          <radio id="a" value="a" checked="{{true}}" />
          <radio id="b" value="b" checked="{{true}}" />
          <radio id="c" value="c" />
        </radio-group>
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const tap = (id: string) => {
      host(id).triggerEvent('tap', {})
    }
    // The last checked item attached wins, like WeChat's `addItem`.
    expect(host('a').data.checked).toBe(false)
    expect(host('b').data.checked).toBe(true)
    expect(host('group').data.value).toBe('b')

    tap('c')
    expect(host('c').data.checked).toBe(true)
    expect(host('b').data.checked).toBe(false)
    expect(host('group').data.value).toBe('c')
    expect(changes).toEqual([{ value: 'c' }])

    // Tapping the selected radio again is a no-op.
    tap('c')
    expect(changes).toEqual([{ value: 'c' }])

    // Page-driven `checked` changes update the value without a change event.
    host('b').setData({ checked: true })
    expect(host('b').data.checked).toBe(true)
    expect(host('c').data.checked).toBe(false)
    expect(host('group').data.value).toBe('b')
    expect(changes).toEqual([{ value: 'c' }])

    // Unsupported value writes never select an item.
    host('group').setData({ value: 'z' })
    expect(host('b').data.checked).toBe(true)
    tap('a')
    expect(host('group').data.value).toBe('a')
    expect(changes).toEqual([{ value: 'c' }, { value: 'a' }])
  })

  test('form waits for an open picker before submitting', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    let resolvePicker: ((value: unknown) => void) | undefined
    const builtins = createBuiltinComponents(space, {
      hostRequest: async (method) => {
        if (method === 'showPicker') {
          return new Promise((resolve) => { resolvePicker = resolve })
        }
        return { events: [] }
      },
    })
    const submits: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { form: builtins.form, picker: builtins.picker, button: builtins.button },
      template: compilePage(`
        <form id="form" bindsubmit="onSubmit">
          <picker id="picker" name="choice" range="{{['a', 'b']}}" />
          <button id="submit" form-type="submit">Submit</button>
        </form>
      `),
      methods: {
        onSubmit(event: glassEasel.ShadowedEvent<unknown>) { submits.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    host('picker').triggerEvent('tap', {})
    await flush()
    host('submit').triggerEvent('tap', {})
    expect(submits).toEqual([])
    resolvePicker?.({ status: 'ok', value: '1' })
    await flush()
    expect(submits).toEqual([{
      value: { choice: '1' },
      target: { id: 'submit', dataset: {}, offsetTop: 0, offsetLeft: 0 },
    }])
  })

  test('form reads and resets the derived group value', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { form: builtins.form, 'checkbox-group': builtins['checkbox-group'], checkbox: builtins.checkbox },
      template: compilePage(`
        <form id="form">
          <checkbox-group id="group" name="tags">
            <checkbox id="a" value="a" checked="{{true}}" />
            <checkbox id="b" value="b" />
          </checkbox-group>
        </form>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    attach(instance)
    await flush()
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect((host('group') as unknown as { getFormData: () => unknown }).getFormData()).toEqual(['a'])
    ;(host('group') as unknown as { resetFormData: () => void }).resetFormData()
    expect(host('group').data.value).toEqual([])
    expect((host('group') as unknown as { getFormData: () => unknown }).getFormData()).toEqual([])
  })

  test('label dispatches label-target taps by wrapping and for id', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        label: builtins.label,
        'checkbox-group': builtins['checkbox-group'],
        checkbox: builtins.checkbox,
        radio: builtins.radio,
        switch: builtins.switch,
      },
      template: compilePage(`
        <checkbox-group id="group"><label id="wrap"><view>wrap</view><checkbox id="checkbox" value="a" /></label></checkbox-group>
        <label id="for-label" for="radio">radio</label>
        <radio id="radio" value="r" />
        <label id="switch-label" for="switch">switch</label>
        <switch id="switch" />
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const tap = (id: string) => {
      const label = host(id) as unknown as { onTap: (event: unknown) => void }
      label.onTap({ target: host(id), detail: {} })
    }
    attach(instance)
    expect((host('checkbox') as unknown as { _relatedLabel?: unknown })._relatedLabel).toBe(host('wrap'))
    expect((host('radio') as unknown as { _relatedLabel?: unknown })._relatedLabel).toBe(host('for-label'))
    expect((host('switch') as unknown as { _relatedLabel?: unknown })._relatedLabel).toBe(host('switch-label'))
    tap('wrap')
    expect(host('checkbox').data.checked).toBe(true)
    expect(host('group').data.value).toEqual(['a'])
    tap('for-label')
    expect(host('radio').data.checked).toBe(true)
    tap('switch-label')
    expect(host('switch').data.checked).toBe(true)
  })

  test('text applies WeChat space and decode semantics', () => {
    expect(transformTextContent('a b c', { space: 'nbsp' })).toBe('a\u00A0b\u00A0c')
    expect(transformTextContent('a b', { space: 'ensp' })).toBe('a\u2002b')
    expect(transformTextContent('a b', { space: 'emsp' })).toBe('a\u2003b')
    expect(transformTextContent('a b', { space: 'other' })).toBe('a b')
    expect(transformTextContent('&lt;b&gt; &amp; &quot;q&quot; &apos;s&apos; &nbsp;', { decode: true }))
      .toBe('<b> & "q" \'s\'  ')
    expect(transformTextContent('&amp;', { decode: false })).toBe('&amp;')
  })

  test('icon normalizes size through the shared size-normalizer', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { icon: builtins.icon },
      template: compilePage('<icon id="icon" type="success" size="46rpx" />'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const icon = instance.getShadowRoot()?.getElementById('icon')?.asGeneralComponent()!
    const normalizeSizeStr = (icon as unknown as {
      normalizeSizeStr: (value: unknown) => string
    }).normalizeSizeStr
    expect(normalizeSizeStr.call(icon, 23)).toBe('23px')
    expect(normalizeSizeStr.call(icon, '23')).toBe('23px')
    expect(normalizeSizeStr.call(icon, '23px')).toBe('23px')
    expect(normalizeSizeStr.call(icon, '46rpx')).toBe('6.13333vw')
    expect(normalizeSizeStr.call(icon, '1.2em')).toBe('1.2em')
    expect(icon.data.fontSize).toBe('6.13333vw')
  })

  test('text follows wx-text selectable/user-select CSS semantics', () => {
    expect(BUILTIN_HOST_STYLES).toContain('tiny-text {\n  cursor: text;')
    expect(BUILTIN_HOST_STYLES).toContain('tiny-text[selectable], tiny-text[user-select] {')
    expect(BUILTIN_HOST_STYLES).not.toContain('tiny-text[selectable="true"]')
  })

  test('text user-select toggles the selectable region on #main', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { text: builtins.text },
      template: compilePage('<text id="text" user-select>hello</text>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const textHost = instance.getShadowRoot()?.getElementById('text')?.asGeneralComponent()!
    const added: string[] = []
    const removed: string[] = []
    const main = {
      style: {} as Record<string, string>,
      classList: {
        add: (name: string) => added.push(name),
        remove: (name: string) => removed.push(name),
      },
    }
    ;(textHost as unknown as { _textMain: unknown })._textMain = main
    ;(textHost as unknown as { userSelectChanged: (next: boolean) => void }).userSelectChanged(true)
    expect(main.style.display).toBe('inline-block')
    expect(main.style.willChange).toBe('transform')
    expect(added).toContain('__wa_selectable_region')

    ;(textHost as unknown as { userSelectChanged: (next: boolean) => void }).userSelectChanged(false)
    expect(main.style.display).toBe('inline')
    expect(main.style.willChange).toBe('unset')
    expect(removed).toContain('__wa_selectable_region')
  })

  test('text selectable emits the 2.30.1 deprecation diagnostic', () => {
    const diagnostics: Array<{ code?: string }> = []
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic as { code?: string }),
    })
    const page = space.defineComponent({
      is: 'page',
      using: { text: builtins.text },
      template: compilePage('<text id="text" selectable>hello</text>'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const textHost = instance.getShadowRoot()?.getElementById('text')?.asGeneralComponent()!
    attach(textHost)
    expect(diagnostics.map((item) => item.code)).toContain('DEPRECATED_TEXT_SELECTABLE')
  })

  test('text, icon, image and form controls expose aligned properties', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        text: builtins.text,
        icon: builtins.icon,
        image: builtins.image,
        checkbox: builtins.checkbox,
        radio: builtins.radio,
        switch: builtins.switch,
        input: builtins.input,
      },
      template: compilePage(`
        <text id="text" selectable space="nbsp">text</text>
        <icon id="icon" type="success" size="32" color="#ff0000" />
        <image id="image" src="/a.png" mode="aspectFit" lazy-load webp />
        <image id="image2" src="/b.png" mode="aspectFit" background-size="cover" background-position="top left" />
        <checkbox id="checkbox" color="#ff0000" />
        <radio id="radio" color="#00ff00" />
        <switch id="switch" color="#0000ff" />
        <input id="input" password maxlength="20" />
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()
    const textHtml = glassEasel.dumpElementToString(host('text')!, true)
    expect(textHtml).toContain('id="raw"')
    expect(textHtml).toContain('id="main"')

    const iconHtml = glassEasel.dumpElementToString(host('icon')!, true)
    expect(iconHtml).toContain('font-size: 32px')
    expect(iconHtml).toContain('color: #ff0000')

    const imageHtml = glassEasel.dumpElementToString(host('image')!, true)
    expect(imageHtml).toContain('id="div"')
    expect(glassEasel.dumpElementToString(host('input')!, true)).toContain('tiny-input-dropdown')
    const image2 = host('image2')!
    const imageDiv = { style: {} as Record<string, string> }
    ;(image2 as unknown as { getShadowRoot: () => unknown }).getShadowRoot = () => ({
      getElementById: () => ({ getBackendElement: () => imageDiv }),
    })
    ;(image2 as unknown as { modeChanged: (mode: string) => void }).modeChanged('aspectFit')
    expect(imageDiv.style.backgroundSize).toBe('contain')
    expect(imageDiv.style.backgroundPosition).toBe('center center')
    // Once the mode owns the background, the raw background-* props are ignored.
    ;(image2 as unknown as { backgroundSizeChanged: (value: string) => void })
      .backgroundSizeChanged('cover')
    expect(imageDiv.style.backgroundSize).toBe('contain')

    host('checkbox')!.setData({ checked: true })
    const checkboxHtml = glassEasel.dumpElementToString(host('checkbox')!, true)
    expect(checkboxHtml).toContain('tiny-checkbox-input')
    expect(checkboxHtml).toContain('tiny-checkbox-input-checked')
    expect(checkboxHtml).toContain('color: #ff0000')
    host('radio')!.setData({ checked: true })
    const radioHtml = glassEasel.dumpElementToString(host('radio')!, true)
    expect(radioHtml).toContain('tiny-radio-input')
    expect(radioHtml).toContain('background-color: #00ff00')
    host('switch')!.setData({ checked: true })
    const switchHtml = glassEasel.dumpElementToString(host('switch')!, true)
    expect(switchHtml).toContain('tiny-switch-input')
    expect(switchHtml).toContain('background-color: #0000ff')

    const inputHtml = glassEasel.dumpElementToString(host('input')!, true)
    expect(inputHtml).toContain('type="password"')
    expect(inputHtml).toContain('maxlength="20"')
  })

  test('image resolves src through the host asset resolver', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      resolveAssetUrl: (src) => `https://cdn.example${src}`,
    })
    const page = space.defineComponent({
      is: 'page',
      using: { image: builtins.image },
      template: compilePage('<image id="image" src="/a.png" mode="aspectFit" />'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const imageHost = instance.getShadowRoot()?.getElementById('image')?.asGeneralComponent()
    expect(imageHost).toBeDefined()
    const resolveSrc = (imageHost as unknown as { resolveSrc: (src: string) => string }).resolveSrc
    expect(resolveSrc.call(imageHost, '/a.png')).toBe('https://cdn.example/a.png')
    imageHost!.setData({ src: '/b.png' })
    expect(resolveSrc.call(imageHost, '/b.png')).toBe('https://cdn.example/b.png')
  })

  test('slider and progress expose aligned color and display options', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { slider: builtins.slider, progress: builtins.progress },
      template: compilePage(`
        <slider id="slider" value="42" show-value active-color="#112233" backgroundColor="#eeeeee" block-size="32" />
        <progress id="progress" percent="42" show-info stroke-width="10" active-color="#445566" background-color="#dddddd" border-radius="4" font-size="20" />
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()
    const sliderHtml = glassEasel.dumpElementToString(host('slider')!, true)
    expect(sliderHtml).toContain('tiny-slider-value')
    expect(sliderHtml).toContain('width: 42%')
    expect(sliderHtml).toContain('background-color: #eeeeee')
    expect(sliderHtml).toContain('background-color: #112233')
    expect(sliderHtml).toContain('width: 28px')
    expect(sliderHtml).toContain('margin-left: -14px')
    const progressHtml = glassEasel.dumpElementToString(host('progress')!, true)
    expect(progressHtml).toContain('height: 10px')
    expect(progressHtml).toContain('background-color: #445566')
    expect(progressHtml).toContain('font-size: 20px')
    expect(progressHtml).toContain('42%')
  })

  test('progress exposes progressbar aria on the host', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { progress: builtins.progress },
      template: compilePage('<progress id="progress" percent="42" />'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const progress = instance.getShadowRoot()?.getElementById('progress')?.asGeneralComponent()!
    const attributes = new Map<string, string>()
    ;(progress as unknown as { getBackendElement: () => unknown }).getBackendElement = () => ({
      setAttribute: (name: string, value: string) => attributes.set(name, String(value)),
    })
    attach(progress)
    expect(attributes.get('role')).toBe('progressbar')
    expect(attributes.get('aria-valuemin')).toBe('0')
    expect(attributes.get('aria-valuemax')).toBe('100')
    expect(attributes.get('aria-valuenow')).toBe('42')
  })


  test('scroll-view reports scroll boundaries and swiper exposes indicator colors', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: Record<string, unknown> = {}
    const page = space.defineComponent({
      is: 'page',
      using: {
        'scroll-view': builtins['scroll-view'],
        swiper: builtins.swiper,
        'swiper-item': builtins['swiper-item'],
      },
      template: compilePage(`
        <scroll-view id="scroll" scroll-y upper-threshold="10" lower-threshold="20" refresher-enabled paging-enabled show-scrollbar="{{false}}" bindscroll="onScroll" bindscrolltoupper="onUpper" bindscrolltolower="onLower" bindrefresherrefresh="onRefresh" binddragstart="onDragStart"><view>content</view></scroll-view>
        <swiper id="swiper" indicator-dots indicator-color="#112233" indicator-active-color="#445566" current-item-id="b" previous-margin="20px" next-margin="10px"><swiper-item id="item-a" item-id="a">a</swiper-item><swiper-item id="item-b" item-id="b">b</swiper-item></swiper>
      `),
      methods: {
        onScroll(event: glassEasel.ShadowedEvent<unknown>) { events.scroll = event.detail },
        onUpper(event: glassEasel.ShadowedEvent<unknown>) { events.upper = event.detail },
        onLower(event: glassEasel.ShadowedEvent<unknown>) { events.lower = event.detail },
        onRefresh(event: glassEasel.ShadowedEvent<unknown>) { events.refresh = event.detail },
        onDragStart(event: glassEasel.ShadowedEvent<unknown>) { events.dragstart = event.detail },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const scrollHost = instance.getShadowRoot()?.getElementById('scroll')?.asGeneralComponent()!
    const nativeScroll = scrollHost.getShadowRoot()?.getElementById('main')!
    const scrollHtml = glassEasel.dumpElementToString(nativeScroll, true)
    expect(scrollHtml).toContain('is-paging')
    expect(scrollHtml).toContain('is-hidden-scrollbar')
    nativeScroll.triggerEvent('scroll', { scrollTop: 35, scrollHeight: 100, clientHeight: 50 })
    expect(events.scroll).toMatchObject({ scrollTop: 35, scrollHeight: 100 })
    expect(events.lower).toEqual({ direction: 'bottom' })
    nativeScroll.triggerEvent('scroll', { scrollTop: 5, scrollHeight: 100, clientHeight: 50 })
    expect(events.upper).toEqual({ direction: 'top' })
    expect(scrollHost.isScrolling?.()).toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 120))
    expect(scrollHost.isScrolling?.()).toBe(false)

    nativeScroll.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    nativeScroll.triggerEvent('touchmove', { touches: [{ clientX: 120, clientY: 20 }] })
    expect(events.dragstart).toMatchObject({ scrollTop: expect.any(Number) })
    nativeScroll.triggerEvent('touchend', { changedTouches: [{ clientX: 120, clientY: 20 }] })

    ;(scrollHost as unknown as { handleRefresherRefresh: (event: unknown) => void })
      .handleRefresherRefresh({ detail: { dy: 80 } })
    expect(events.refresh).toMatchObject({ dy: 80 })
    expect(scrollHost.data.refresherTriggered).toBe(true)

    await new Promise((resolve) => setTimeout(resolve, 30))
    const swiperHost = instance.getShadowRoot()?.getElementById('swiper')?.asGeneralComponent()!
    const swiperHtml = glassEasel.dumpElementToString(swiperHost, true)
    expect(swiperHtml).toContain('tiny-swiper-wrapper')
    expect(swiperHtml).toContain('tiny-swiper-dots')
    expect(swiperHost.data.indicatorColor).toBe('#112233')
    expect(swiperHost.data.indicatorActiveColor).toBe('#445566')
    expect(swiperHost.data.previousMargin).toBe('20px')
    expect(swiperHost.data.nextMargin).toBe('10px')
  })

  test('swiper keeps hidden items in the list and exposes displayMultipleItems', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { swiper: builtins.swiper, 'swiper-item': builtins['swiper-item'] },
      template: compilePage(`
        <swiper id="multi" display-multiple-items="2" current="1">
          <swiper-item>a</swiper-item><swiper-item>b</swiper-item><swiper-item>c</swiper-item>
        </swiper>
        <swiper id="hidden" indicator-dots skip-hidden-item-layout>
          <swiper-item>a</swiper-item><swiper-item hidden>b</swiper-item><swiper-item>c</swiper-item>
        </swiper>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    await new Promise((resolve) => setTimeout(resolve, 30))
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('multi').data.displayMultipleItems).toBe(2)
    expect(host('multi').childNodes).toHaveLength(3)
    // WeChat keeps hidden items in the item list; skip-hidden-item-layout only
    // removes them from layout.
    expect(host('hidden').data.skipHiddenItemLayout).toBe(true)
    expect(host('hidden').childNodes).toHaveLength(3)
  })

  test('form controls reuse tiny-disabled, tiny-label-target and group/item behaviors', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        'checkbox-group': builtins['checkbox-group'],
        checkbox: builtins.checkbox,
        input: builtins.input,
      },
      template: compilePage('<checkbox-group id="group"><checkbox id="checkbox" value="a" /></checkbox-group><input id="input" value="text" />'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('checkbox').hasBehavior('tiny-disabled')).toBe(true)
    expect(host('checkbox').hasBehavior('tiny-label-target')).toBe(true)
    expect(host('checkbox').hasBehavior('tiny-item')).toBe(true)
    expect(host('group').hasBehavior('tiny-group')).toBe(true)
    expect(host('input').hasBehavior('tiny-data-component')).toBe(true)
  })


  test('form collects custom wx://form-field components and mocks reportSubmit', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const formField = space.defineBehavior({
      is: 'tiny-form-field',
      properties: {
        name: { type: String, value: '' },
        value: { type: String, value: '' },
      },
    })
    const field = space.defineComponent({
      is: 'field',
      behaviors: [formField],
      template: compilePage('<slot />'),
    })
    const events: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { form: builtins.form, input: builtins.input, button: builtins.button, field },
      template: compilePage(`
        <form id="form" report-submit bindsubmit="onSubmit" bindbeforereportsubmit="onBefore" bindreset="onReset">
          <field id="field" name="custom" value="v" />
          <input id="input" name="title" value="hello" />
          <button id="submit" form-type="submit">Submit</button>
          <button id="reset" form-type="reset">Reset</button>
        </form>
      `),
      methods: {
        onSubmit(event: glassEasel.ShadowedEvent<unknown>) { events.push({ type: 'submit', detail: event.detail }) },
        onBefore(event: glassEasel.ShadowedEvent<unknown>) { events.push({ type: 'before', detail: event.detail }) },
        onReset(event: glassEasel.ShadowedEvent<unknown>) { events.push({ type: 'reset', detail: event.detail }) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('field').hasBehavior('tiny-form-field')).toBe(true)
    expect(host('field').data).toMatchObject({ name: 'custom', value: 'v' })
    host('submit').triggerEvent('tap', {})
    expect(events).toEqual([
      { type: 'before', detail: { value: { custom: 'v', title: 'hello' } } },
      {
        type: 'submit',
        detail: {
          value: { custom: 'v', title: 'hello' },
          target: { id: 'submit', dataset: {}, offsetTop: 0, offsetLeft: 0 },
          formId: 'the formId is a mock one',
        },
      },
    ])
    expect(host('form').data.reportSubmit).toBe(true)

    host('input').setData({ value: 'changed' })
    host('reset').triggerEvent('tap', {})
    expect(host('input').data.value).toBe('')
    expect(events.at(-1)).toEqual({
      type: 'reset',
      detail: { target: { id: 'reset', dataset: {}, offsetTop: 0, offsetLeft: 0 } },
    })
  })

  test('textarea normalizes maxlength and autofill values', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { textarea: builtins.textarea },
      template: compilePage('<textarea id="textarea" maxlength="{{3}}" value="abcdef" bindchange="onInput" />'),
      methods: {
        onInput(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = instance.getShadowRoot()?.getElementById('textarea')?.asGeneralComponent()!
    expect(host.data.value).toBe('abc')
    const runtime = host as unknown as {
      autofillGetValue: () => unknown
      autofillSetValue: (value: unknown) => void
    }
    runtime.autofillSetValue('hello')
    expect(runtime.autofillGetValue()).toBe('hello')
    expect(host.data.value).toBe('hello')
    expect(changes).toEqual([{ value: 'hello' }])
  })

  test('textarea renders placeholder/compute layers and auto-height state', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: { textarea: builtins.textarea },
      template: compilePage('<textarea id="textarea" placeholder="say something" auto-height placeholder-style="color: #123456" />'),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = instance.getShadowRoot()?.getElementById('textarea')?.asGeneralComponent()!
    const html = glassEasel.dumpElementToString(host, true)
    expect(html).toContain('tiny-textarea-wrapper')
    expect(html).toContain('tiny-textarea-placeholder')
    expect(html).toContain('say something')
    expect(html).toContain('is-auto-height')
    expect(html).toContain('tiny-textarea-compute')
    expect(html).toContain('tiny-textarea-stylecompute')
    expect(html).toContain('color: #123456')
  })

  test('canvas and input emit their native event surface', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: Record<string, unknown> = {}
    const touchstarts: Array<{ detail: unknown; touches: unknown; changedTouches: unknown }> = []
    const page = space.defineComponent({
      is: 'page',
      using: { canvas: builtins.canvas, input: builtins.input },
      template: compilePage(`
        <canvas id="canvas" bindtouchstart="onTouchStart" bindtouchend="onTouchEnd" binderror="onCanvasError" />
        <input id="input" bindkeyboardcompositionend="onCompositionEnd" bindselectionchange="onSelection" />
      `),
      methods: {
        onTouchStart(event: glassEasel.ShadowedEvent<unknown>) {
          events.touchstart = event.detail
          touchstarts.push({
            detail: event.detail,
            touches: (event as unknown as Record<string, unknown>).touches,
            changedTouches: (event as unknown as Record<string, unknown>).changedTouches,
          })
        },
        onTouchEnd(event: glassEasel.ShadowedEvent<unknown>) { events.touchend = event.detail },
        onCanvasError(event: glassEasel.ShadowedEvent<unknown>) { events.canvasError = event.detail },
        onCompositionEnd(event: glassEasel.ShadowedEvent<unknown>) { events.composition = event.detail },
        onSelection(event: glassEasel.ShadowedEvent<unknown>) { events.selection = event.detail },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const nativeCanvas = host('canvas').getShadowRoot()?.getElementById('native-canvas')!

    // Mouse input is projected into touch by the event compositor; the canvas
    // template only owns the touch surface now.
    nativeCanvas.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] }, { bubbles: true, composed: true })
    nativeCanvas.triggerEvent('touchend', { changedTouches: [{ clientX: 12, clientY: 22 }] }, { bubbles: true, composed: true })
    expect(touchstarts[0]?.touches).toMatchObject([{ clientX: 10, clientY: 20, x: 10, y: 20 }])
    nativeCanvas.triggerEvent('error', { errMsg: 'canvas:fail' })
    // Native touches bubble through the browser event dispatcher; the
    // EmptyBackendContext does not forward them across the built-in host, so
    // browser-level touch coverage lives in the acceptance tests.
    expect(events.canvasError).toEqual({ errMsg: 'canvas:fail' })

    const nativeInput = host('input').getShadowRoot()?.getElementById('native-input')!
    nativeInput.triggerEvent('compositionend', { value: '汉字' })
    nativeInput.triggerEvent('select', {})
    expect(events.composition).toEqual({ value: '汉字' })
    expect(events.selection).toMatchObject({ selectionStart: expect.any(Number), selectionEnd: expect.any(Number) })
  })

  test('canvas reports the mirrored-canvas limitation', () => {
    const diagnostics: Array<Record<string, unknown>> = []
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic as unknown as Record<string, unknown>),
    })
    const page = space.defineComponent({
      is: 'page',
      using: { canvas: builtins.canvas },
      template: compilePage('<canvas canvas-id="chart" type="2d" />'),
    })
    space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    expect(diagnostics).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'UNSUPPORTED_CANVAS',
      message: expect.stringContaining('bridged'),
    }))
  })


  test('textarea, form and picker expose the new built-in surfaces', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      hostRequest: async () => ({ status: 'ok', value: '1' }),
    })
    const events: Record<string, unknown> = {}
    const page = space.defineComponent({
      is: 'page',
      using: { textarea: builtins.textarea, form: builtins.form, input: builtins.input, picker: builtins.picker, button: builtins.button },
      template: compilePage(`
        <form id="form" bindsubmit="onSubmit"><input id="input" name="title" value="hello" /><button id="submit" form-type="submit">Submit</button></form>
        <textarea id="textarea" bindinput="onTextarea" />
        <picker id="picker" mode="selector" range="{{['a', 'b']}}" custom-item="Other" bindchange="onPicker" />
      `),
      methods: {
        onSubmit(event: glassEasel.ShadowedEvent<unknown>) { events.submit = event.detail },
        onTextarea(event: glassEasel.ShadowedEvent<unknown>) { events.textarea = event.detail },
        onPicker(event: glassEasel.ShadowedEvent<unknown>) { events.picker = event.detail },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const nativeTextarea = host('textarea').getShadowRoot()?.getElementById('native-textarea')!
    nativeTextarea.triggerEvent('input', { value: 'next' })
    expect(events.textarea).toEqual({ value: 'next' })
    expect(host('textarea').data.value).toBe('next')

    host('submit').triggerEvent('tap', {})
    expect(events.submit).toEqual({
      value: { title: 'hello' },
      target: { id: 'submit', dataset: {}, offsetTop: 0, offsetLeft: 0 },
    })

    host('picker').triggerEvent('tap', {})
    await flush()
    expect(events.picker).toEqual({ value: '1' })
    expect(host('picker').data.value).toBe('1')
  })


  test('picker delegates opening to the host and applies the selected value', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const requests: Array<Record<string, unknown>> = []
    const builtins = createBuiltinComponents(space, {
      hostRequest: async (method, request) => {
        requests.push({ method, ...(request as Record<string, unknown>) })
        return { status: 'ok', value: '2017-12-31' }
      },
    })
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { picker: builtins.picker },
      template: compilePage(`
        <picker id="picker" mode="date" value="2016-09-01" start="2015-09-01" end="2017-09-01" bindchange="onChange" />
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const picker = instance.getShadowRoot()?.getElementById('picker')?.asGeneralComponent()!
    picker.triggerEvent('tap', {})
    await flush()
    expect(requests[0]).toMatchObject({
      method: 'showPicker',
      mode: 'date',
      value: '2016-09-01',
      start: '2015-09-01',
      end: '2017-09-01',
      fields: 'day',
    })
    expect(picker.data.value).toBe('2017-12-31')
    expect(changes).toEqual([{ value: '2017-12-31' }])
  })

  test('picker forwards selector cancellation to the cancel event', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      hostRequest: async () => ({ status: 'cancel' }),
    })
    const cancels: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { picker: builtins.picker },
      data: { range: ['a', 'b'] },
      template: compilePage('<picker id="picker" range="{{range}}" bindcancel="onCancel" />'),
      methods: {
        onCancel(event: glassEasel.ShadowedEvent<unknown>) { cancels.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const picker = instance.getShadowRoot()?.getElementById('picker')?.asGeneralComponent()!
    picker.triggerEvent('tap', {})
    await flush()
    expect(cancels).toEqual([{}])
  })

  test('picker exposes wx-autofill get/set values', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const changes: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: { picker: builtins.picker },
      template: compilePage(`
        <picker id="select" mode="selector" range="{{[{label: 'A'}, {label: 'B'}]}}" range-key="label" value="{{0}}" bindchange="onChange" />
        <picker id="date" mode="date" bindchange="onChange" />
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const select = host('select') as unknown as {
      autofillGetValue: () => unknown
      autofillSetValue: (value: unknown) => void
    }
    expect(host('select').hasBehavior('tiny-autofill')).toBe(true)
    host('select').setData({ autoFill: 'foo.phone' })
    expect(select).toMatchObject({
      _autofillGroupKey: 'phone_info',
      _autofillFieldName: 'phone',
      _autofill: 'phone_info.phone',
    })
    expect(select.autofillGetValue()).toBe('A')
    select.autofillSetValue('B')
    expect(host('select').data.value).toBe(1)
    const date = host('date') as unknown as {
      autofillSetValue: (value: unknown) => void
    }
    date.autofillSetValue([2020, 1, 2])
    expect(host('date').data.value).toBe('2020-01-02')
    expect(changes).toEqual([{ value: 1 }, { value: '2020-01-02' }])
  })

  test('picker reflects live value changes into an open multi picker', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const requests: Array<Record<string, unknown>> = []
    let resolvePicker: ((value: unknown) => void) | undefined
    const builtins = createBuiltinComponents(space, {
      hostRequest: async (method, payload) => {
        requests.push({ method, ...(payload as Record<string, unknown>) })
        if (method === 'showPicker') {
          return new Promise((resolve) => { resolvePicker = resolve })
        }
        return { status: 'ok' }
      },
    })
    const page = space.defineComponent({
      is: 'page',
      using: { picker: builtins.picker },
      template: compilePage(`
        <picker id="picker" mode="multiSelector" range="{{[['a', 'b'], ['c', 'd']]}}" value="{{[0, 0]}}" />
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const picker = instance.getShadowRoot()?.getElementById('picker')?.asGeneralComponent()!
    picker.triggerEvent('tap', {})
    await flush()
    expect(requests[0]).toMatchObject({ method: 'showPicker', mode: 'multiSelector' })
    picker.setData({ value: [1, 0] })
    await flush()
    expect(requests.find((request) => request.method === 'updatePicker')).toMatchObject({
      method: 'updatePicker',
      mode: 'multiSelector',
      value: [1, 0],
    })
    picker.setData({ range: [['a', 'b', 'c'], ['c', 'd']] })
    await flush()
    expect(requests.filter((request) => request.method === 'updatePicker').at(-1)).toMatchObject({
      method: 'updatePicker',
      range: [['a', 'b', 'c'], ['c', 'd']],
    })
    resolvePicker?.({ status: 'cancel' })
    await flush()
  })

  test('picker polls multi column changes into columnchange events', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    let delivered = false
    let resolvePicker: ((value: unknown) => void) | undefined
    const changes: unknown[] = []
    const builtins = createBuiltinComponents(space, {
      hostRequest: async (method) => {
        if (method === 'showPicker') {
          return new Promise((resolve) => { resolvePicker = resolve })
        }
        if (method === 'pollPicker' && !delivered) {
          delivered = true
          return { events: [{ column: 1, value: 1 }] }
        }
        return { events: [] }
      },
    })
    const page = space.defineComponent({
      is: 'page',
      using: { picker: builtins.picker },
      template: compilePage(`
        <picker id="picker" mode="multiSelector" range="{{[['a', 'b'], ['c', 'd']]}}" value="{{[0, 0]}}" bindcolumnchange="onColumn" />
      `),
      methods: {
        onColumn(event: glassEasel.ShadowedEvent<unknown>) { changes.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const picker = instance.getShadowRoot()?.getElementById('picker')?.asGeneralComponent()!
    picker.triggerEvent('tap', {})
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(changes).toEqual([{ column: 1, value: 1 }])
    expect(picker.data.value).toEqual([0, 1])
    resolvePicker?.({ status: 'cancel' })
    await flush()
  })

  test('picker-view receives column changes and updates its value array', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: unknown[] = []
    const page = space.defineComponent({
      is: 'page',
      using: {
        'picker-view': builtins['picker-view'],
        'picker-view-column': builtins['picker-view-column'],
      },
      template: compilePage(`
        <picker-view id="view" value="{{[0, 0]}}" bindchange="onChange">
          <picker-view-column id="col-0"><view>a</view><view>b</view></picker-view-column>
          <picker-view-column id="col-1"><view>c</view><view>d</view></picker-view-column>
        </picker-view>
      `),
      methods: {
        onChange(event: glassEasel.ShadowedEvent<unknown>) { events.push(event.detail) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const view = instance.getShadowRoot()?.getElementById('view')?.asGeneralComponent()!
    ;(view as unknown as { handleColumnChange: (event: unknown) => void }).handleColumnChange({ detail: { column: 1, value: 1 } })
    expect(view.data.value).toEqual([0, 1])
    expect(events).toEqual([{ value: [0, 1] }])
  })

  test('picker-view initializes its columns from value', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        'picker-view': builtins['picker-view'],
        'picker-view-column': builtins['picker-view-column'],
      },
      template: compilePage(`
        <picker-view id="view" value="{{[1]}}">
          <picker-view-column id="col"><view>a</view><view>b</view><view>c</view></picker-view-column>
        </picker-view>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    await new Promise((resolve) => setTimeout(resolve, 20))
    const column = instance.getShadowRoot()?.getElementById('col')?.asGeneralComponent()
    expect(column).toBeDefined()
    expect(column?.data.current).toBe(1)
    expect(column?.data.translate).toBe(-34)
  })

  test('picker-view column snaps to an item and updates the parent value', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        'picker-view': builtins['picker-view'],
        'picker-view-column': builtins['picker-view-column'],
      },
      template: compilePage(`
        <picker-view id="view" value="{{[0]}}">
          <picker-view-column id="col"><view>a</view><view>b</view><view>c</view></picker-view-column>
        </picker-view>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    await new Promise((resolve) => setTimeout(resolve, 20))
    const view = instance.getShadowRoot()?.getElementById('view')?.asGeneralComponent()!
    const column = instance.getShadowRoot()?.getElementById('col')?.asGeneralComponent() as unknown as {
      handleTouchStart: (event: unknown) => void
      handleTouchMove: (event: unknown) => void
      handleTouchEnd: (event: unknown) => void
    }
    column.handleTouchStart({ touches: [{ clientY: 100 }] })
    column.handleTouchMove({ touches: [{ clientY: 10 }] })
    column.handleTouchEnd({ changedTouches: [{ clientY: 10 }] })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect((instance.getShadowRoot()?.getElementById('col')?.asGeneralComponent()?.data as { current: number }).current).toBe(2)
    expect(view.data.value).toEqual([2])
  })

  test('progress, swiper, and icon render structure and state', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        progress: builtins.progress,
        swiper: builtins.swiper,
        'swiper-item': builtins['swiper-item'],
        icon: builtins.icon,
      },
      template: compilePage(
        '<progress percent="25" show-info /><swiper indicator-dots="{{true}}"><swiper-item>first</swiper-item><swiper-item>second</swiper-item></swiper><icon type="success" />',
      ),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const html = glassEasel.dumpElementToString(instance, true)
    expect(html).toContain('25%')
    expect(html).toContain('first')
    expect(html).toContain('second')
    expect(html).toContain('tiny-icon-success')
  })
})

describe('navigator', () => {
  function mountNavigator(
    attributes: string,
    hostActions: Array<Record<string, unknown>>,
    diagnostics: Array<Record<string, unknown>>,
  ) {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space, {
      hostAction: (action) => hostActions.push(action as unknown as Record<string, unknown>),
      onDiagnostic: (diagnostic) => diagnostics.push(diagnostic as unknown as Record<string, unknown>),
    })
    const page = space.defineComponent({
      is: 'page',
      using: { navigator: builtins.navigator },
      template: compilePage(`<navigator id="nav" ${attributes}>Go</navigator>`),
    })
    const instance = space.createComponentByUrl(
      'root',
      'page',
      null,
      new glassEasel.EmptyBackendContext(),
    )
    const navigator = instance.getShadowRoot()?.getElementById('nav')?.asGeneralComponent()
    expect(navigator).toBeDefined()
    return navigator!
  }

  test('routes every open-type through a host action', () => {
    const hostActions: Array<Record<string, unknown>> = []
    const diagnostics: Array<Record<string, unknown>> = []
    const cases: Array<[string, Record<string, unknown>]> = [
      ['url="/pages/a/a"', { action: 'navigateTo', url: '/pages/a/a' }],
      ['open-type="redirect" url="/pages/a/a"', { action: 'redirectTo', url: '/pages/a/a' }],
      ['redirect url="/pages/a/a"', { action: 'redirectTo', url: '/pages/a/a' }],
      ['open-type="switchTab" url="/pages/b/b"', { action: 'switchTab', url: '/pages/b/b' }],
      ['open-type="reLaunch" url="/pages/c/c"', { action: 'reLaunch', url: '/pages/c/c' }],
      ['open-type="navigateBack" delta="2"', { action: 'navigateBack', delta: 2 }],
      ['open-type="exit"', { action: 'exit' }],
    ]
    for (const [attributes, expected] of cases) {
      const navigator = mountNavigator(attributes, hostActions, diagnostics)
      navigator.triggerEvent('tap', {})
      expect(hostActions.pop()).toEqual(expected)
    }
    expect(diagnostics).toEqual([])
  })

  test('reports an unsupported target instead of navigating', () => {
    const hostActions: Array<Record<string, unknown>> = []
    const diagnostics: Array<Record<string, unknown>> = []
    const navigator = mountNavigator(
      'target="miniProgram" app-id="wx123" url="/pages/a/a"',
      hostActions,
      diagnostics,
    )
    navigator.triggerEvent('tap', {})
    expect(hostActions).toEqual([])
    expect(diagnostics).toMatchObject([
      { severity: 'warning', code: 'UNSUPPORTED_NAVIGATOR_TARGET', details: { target: 'miniProgram' } },
    ])
  })

  test('reports a missing url and an unknown open-type', () => {
    const hostActions: Array<Record<string, unknown>> = []
    const diagnostics: Array<Record<string, unknown>> = []
    mountNavigator('url=""', hostActions, diagnostics).triggerEvent('tap', {})
    mountNavigator('open-type="teleport" url="/a"', hostActions, diagnostics).triggerEvent('tap', {})
    expect(hostActions).toEqual([])
    expect(diagnostics.map((item) => item.code)).toEqual([
      'INVALID_NAVIGATOR_URL',
      'INVALID_NAVIGATOR_OPEN_TYPE',
    ])
  })

  test('uses the navigator-hover default class without overriding hover-class', () => {
    const navigator = mountNavigator('url="/pages/a/a"', [], []) as unknown as {
      data: Record<string, unknown>
      _defaultHoverClass: string
    }
    expect(navigator.data.hoverClass).toBe('')
    expect(navigator._defaultHoverClass).toBe('navigator-hover')
    expect(navigator.data.hoverStartTime).toBe(50)
    expect(navigator.data.hoverStayTime).toBe(600)
  })
})
