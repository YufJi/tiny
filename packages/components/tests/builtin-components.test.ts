import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { BUILTIN_COMPONENT_TAGS, createBuiltinComponents } from '../src'
import precompiledTemplates from '../src/generated/templates'

function compilePage(source: string): glassEasel.template.ComponentTemplate {
  const group = TmplGroup.newDev()
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

describe('P0 built-in components', () => {
  test('ships a precompiled template for every tag', () => {
    expect(Object.keys(precompiledTemplates).sort()).toEqual([...BUILTIN_COMPONENT_TAGS].sort())
  })

  test('exposes every P0 component tag', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const definitions = createBuiltinComponents(space)
    expect(Object.keys(definitions)).toHaveLength(BUILTIN_COMPONENT_TAGS.length)
    expect(Object.keys(definitions)).toEqual(expect.arrayContaining([...BUILTIN_COMPONENT_TAGS]))
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
    const html = glassEasel.dumpElementToString(buttonHost!, true)
    expect(html).toContain('tiny-button-primary')
    expect(html).toContain('tiny-button-mini')
    expect(html).toContain('tiny-button-plain')
    expect(html).toContain('tiny-button-loading')
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
    const nativeButton = buttonHost.getShadowRoot()?.getElementById('native-button')!
    nativeButton.triggerEvent('touchstart', { touches: [{}] })
    await new Promise((resolve) => setTimeout(resolve, 40))
    expect(buttonHost.data.hovering).toBe(true)
    expect(glassEasel.dumpElementToString(buttonHost, true)).toContain('button-hover')
    nativeButton.triggerEvent('touchend', {})
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(buttonHost.data.hovering).toBe(false)
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
    const page = space.defineComponent({
      is: 'page',
      using: { button: builtins.button },
      data: { formType: 'submit', openType: 'getUserInfo', disabled: false },
      template: compilePage(
        '<button id="button" form-type="{{formType}}" open-type="{{openType}}" disabled="{{disabled}}" bindtap="onTap" bind:formSubmit="onSubmit" bind:formReset="onReset">Tap</button>',
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
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const buttonHost = instance.getShadowRoot()?.getElementById('button')?.asGeneralComponent()!
    const nativeButton = buttonHost.getShadowRoot()?.getElementById('native-button')!
    nativeButton.triggerEvent('tap', {})
    expect(taps).toEqual([{}])
    expect(submits).toEqual([{ formId: '', formPluginId: '' }])
    expect(diagnostics.map((item) => item.code)).toContain('UNSUPPORTED_BUTTON_OPEN_TYPE')

    buttonHost.setData({ formType: 'reset' })
    nativeButton.triggerEvent('tap', {})
    expect(resets).toEqual([undefined])

    buttonHost.setData({ disabled: true })
    nativeButton.triggerEvent('tap', {})
    expect(taps).toHaveLength(2)
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
    const nativeView = viewHost.getShadowRoot()?.getElementById('native-view')!
    viewHost.setData({ hidden: true })
    expect(glassEasel.dumpElementToString(viewHost, true)).toContain('tiny-hidden')
    viewHost.setData({ hidden: false })

    nativeView.triggerEvent('touchstart', { touches: [{}] })
    await new Promise((resolve) => setTimeout(resolve, 70))
    expect(viewHost.data.hovering).toBe(true)
    expect(glassEasel.dumpElementToString(viewHost, true)).toContain('hovered')
    nativeView.triggerEvent('touchend', {})
    await new Promise((resolve) => setTimeout(resolve, 450))
    expect(viewHost.data.hovering).toBe(false)
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
  })

  test('checkbox, slider, and switch normalize control values', () => {
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
        '<checkbox id="checkbox" value="one" bindchange="onCheckbox" /><slider id="slider" value="10" bindchange="onSlider" /><switch id="switch" checked="{{true}}" bindchange="onSwitch" />',
      ),
      methods: {
        onCheckbox(event: glassEasel.ShadowedEvent<unknown>) {
          events.checkbox = event.detail
        },
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
    host('checkbox')?.triggerEvent('change', { value: 'one', checked: true })
    host('slider')?.triggerEvent('change', { value: 42 })
    host('switch')?.triggerEvent('change', { value: true })
    expect(events.checkbox).toEqual({ value: 'one', checked: true })
    expect(events.slider).toEqual({ value: 42 })
    expect(events.switch).toEqual({ value: true })
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
        <checkbox id="checkbox" color="#ff0000" />
        <radio id="radio" color="#00ff00" />
        <switch id="switch" color="#0000ff" />
        <input id="input" password maxlength="20" />
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()
    const textHtml = glassEasel.dumpElementToString(host('text')!, true)
    expect(textHtml).toContain('tiny-text-selectable')
    expect(textHtml).toContain('tiny-text-space-nbsp')

    const iconHtml = glassEasel.dumpElementToString(host('icon')!, true)
    expect(iconHtml).toContain('font-size: 32px')
    expect(iconHtml).toContain('color: #ff0000')

    const imageHtml = glassEasel.dumpElementToString(host('image')!, true)
    expect(imageHtml).toContain('tiny-image-mode-aspectFit')
    expect(imageHtml).toContain('loading="lazy"')

    expect(glassEasel.dumpElementToString(host('checkbox')!, true)).toContain('accent-color: #ff0000')
    expect(glassEasel.dumpElementToString(host('radio')!, true)).toContain('accent-color: #00ff00')
    expect(glassEasel.dumpElementToString(host('switch')!, true)).toContain('accent-color: #0000ff')

    const inputHtml = glassEasel.dumpElementToString(host('input')!, true)
    expect(inputHtml).toContain('type="password"')
    expect(inputHtml).toContain('maxlength="20"')
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
    expect(sliderHtml).toContain('--tiny-slider-active: #112233')
    expect(sliderHtml).toContain('--tiny-slider-block-size: 32px')
    const progressHtml = glassEasel.dumpElementToString(host('progress')!, true)
    expect(progressHtml).toContain('height: 10px')
    expect(progressHtml).toContain('background-color: #445566')
    expect(progressHtml).toContain('font-size: 20px')
    expect(progressHtml).toContain('42%')
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
        <scroll-view id="scroll" scroll-y upper-threshold="10" lower-threshold="20" bindscroll="onScroll" bindscrolltoupper="onUpper" bindscrolltolower="onLower"><view>content</view></scroll-view>
        <swiper id="swiper" indicator-dots indicator-color="#112233" indicator-active-color="#445566"><swiper-item>a</swiper-item></swiper>
      `),
      methods: {
        onScroll(event: glassEasel.ShadowedEvent<unknown>) { events.scroll = event.detail },
        onUpper(event: glassEasel.ShadowedEvent<unknown>) { events.upper = event.detail },
        onLower(event: glassEasel.ShadowedEvent<unknown>) { events.lower = event.detail },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const scrollHost = instance.getShadowRoot()?.getElementById('scroll')?.asGeneralComponent()!
    const nativeScroll = scrollHost.getShadowRoot()?.getElementById('native-scroll-view')!
    nativeScroll.triggerEvent('scroll', { scrollTop: 35, scrollHeight: 100, clientHeight: 50 })
    expect(events.scroll).toMatchObject({ scrollTop: 35, scrollHeight: 100 })
    expect(events.lower).toEqual({ direction: 'bottom' })
    nativeScroll.triggerEvent('scroll', { scrollTop: 5, scrollHeight: 100, clientHeight: 50 })
    expect(events.upper).toEqual({ direction: 'top' })

    await new Promise((resolve) => setTimeout(resolve, 30))
    const swiperHost = instance.getShadowRoot()?.getElementById('swiper')?.asGeneralComponent()!
    const swiperHtml = glassEasel.dumpElementToString(swiperHost, true)
    expect(swiperHtml).toContain('background-color: #445566')
  })


  test('form controls reuse wx-disabled, wx-data-component, wx-label-target and group/item behaviors', () => {
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
    expect(host('checkbox').hasBehavior('wx-disabled')).toBe(true)
    expect(host('checkbox').hasBehavior('wx-data-component')).toBe(true)
    expect(host('checkbox').hasBehavior('wx-label-target')).toBe(true)
    expect(host('checkbox').hasBehavior('wx-item')).toBe(true)
    expect(host('group').hasBehavior('wx-group')).toBe(true)
    expect(host('input').hasBehavior('wx-data-component')).toBe(true)
    expect((host('checkbox') as unknown as { getFormData: () => unknown }).getFormData()).toBe('a')
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
    expect(html).toContain('✓')
  })
})
