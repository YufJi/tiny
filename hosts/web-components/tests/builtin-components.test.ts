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
  })


  test('button emits longtap and canceltap without also emitting tap', async () => {
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
    button.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    await new Promise((resolve) => setTimeout(resolve, 370))
    expect(events).toEqual(['longtap'])
    button.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    button.triggerEvent('touchmove', { touches: [{ clientX: 40, clientY: 20 }] })
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
    const native = (id: string) => host(id)?.getShadowRoot()?.getElementById('native-input')
    native('checkbox')?.triggerEvent('change', { value: 'one', checked: true })
    native('slider')?.triggerEvent('change', { value: 42 })
    native('switch')?.triggerEvent('change', { value: true })
    expect(events.checkbox).toEqual({ value: 'one', checked: true })
    expect(events.slider).toEqual({ value: 42 })
    expect(events.switch).toEqual({ value: true })
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
    expect(html).toContain('tiny-switch-checkbox is-checked')
    expect(html).not.toContain('tiny-switch-input')
    host.getShadowRoot()?.getElementById('native-input')?.triggerEvent('change', { value: false })
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
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    host('b').getShadowRoot()?.getElementById('native-input')?.triggerEvent('change', { value: 'b', checked: true })
    expect(changes).toEqual([{ value: 'b' }])
    expect(host('a').data.checked).toBe(false)
    expect(host('b').data.checked).toBe(true)
    expect(host('b').getShadowRoot()?.getElementById('native-input')).toBeDefined()
    const html = glassEasel.dumpElementToString(host('b'), true)
    expect(html).toContain('tiny-radio-input is-checked')
  })


  test('checkbox-group and radio-group apply controlled values', async () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const page = space.defineComponent({
      is: 'page',
      using: {
        'checkbox-group': builtins['checkbox-group'],
        checkbox: builtins.checkbox,
        'radio-group': builtins['radio-group'],
        radio: builtins.radio,
      },
      template: compilePage(`
        <checkbox-group id="cg" value="{{['b']}}">
          <checkbox id="ca" value="a" />
          <checkbox id="cb" value="b" />
        </checkbox-group>
        <radio-group id="rg" value="b">
          <radio id="ra" value="a" />
          <radio id="rb" value="b" />
        </radio-group>
      `),
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    await new Promise((resolve) => setTimeout(resolve, 0))
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('ca').data.checked).toBe(false)
    expect(host('cb').data.checked).toBe(true)
    expect(host('cg').data.value).toEqual(['b'])
    expect(host('ra').data.checked).toBe(false)
    expect(host('rb').data.checked).toBe(true)
    expect(host('rg').data.value).toBe('b')

    host('cg').setData({ value: ['a'] })
    host('rg').setData({ value: 'a' })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(host('ca').data.checked).toBe(true)
    expect(host('cb').data.checked).toBe(false)
    expect(host('ra').data.checked).toBe(true)
    expect(host('rb').data.checked).toBe(false)
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
      const label = host(id) as unknown as { handleTap: (event: unknown) => void }
      label.handleTap({ target: host(id), detail: {} })
    }
    tap('wrap')
    expect(host('checkbox').data.checked).toBe(true)
    expect(host('group').data.value).toEqual(['a'])
    tap('for-label')
    expect(host('radio').data.checked).toBe(true)
    tap('switch-label')
    expect(host('switch').data.checked).toBe(true)
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
    expect(textHtml).toContain('tiny-text-selectable')
    expect(textHtml).toContain('tiny-text-space-nbsp')

    const iconHtml = glassEasel.dumpElementToString(host('icon')!, true)
    expect(iconHtml).toContain('font-size: 32px')
    expect(iconHtml).toContain('color: #ff0000')

    const imageHtml = glassEasel.dumpElementToString(host('image')!, true)
    expect(imageHtml).toContain('tiny-image-mode-aspectFit')
    const image2Html = glassEasel.dumpElementToString(host('image2')!, true)
    expect(image2Html).toContain('background-size: cover')
    expect(image2Html).toContain('background-position: top left')
    expect(imageHtml).toContain('loading="lazy"')

    const checkboxHtml = glassEasel.dumpElementToString(host('checkbox')!, true)
    expect(checkboxHtml).toContain('tiny-checkbox-input')
    expect(checkboxHtml).toContain('color: #ff0000')
    const radioHtml = glassEasel.dumpElementToString(host('radio')!, true)
    expect(radioHtml).toContain('tiny-radio-input')
    expect(radioHtml).toContain('--tiny-radio-color: #00ff00')
    const switchHtml = glassEasel.dumpElementToString(host('switch')!, true)
    expect(switchHtml).toContain('tiny-switch-input')
    expect(switchHtml).toContain('--tiny-switch-color: #0000ff')

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
    expect(glassEasel.dumpElementToString(imageHost!, true)).toContain('https://cdn.example/a.png')
    imageHost!.setData({ src: '/b.png' })
    expect(glassEasel.dumpElementToString(imageHost!, true)).toContain('https://cdn.example/b.png')
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
    expect(sliderHtml).toContain('background-color: #112233')
    expect(sliderHtml).toContain('width: 32px')
    expect(sliderHtml).toContain('margin-left: -16px')
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
        <scroll-view id="scroll" scroll-y upper-threshold="10" lower-threshold="20" refresher-enabled paging-enabled show-scrollbar="{{false}}" bindscroll="onScroll" bindscrolltoupper="onUpper" bindscrolltolower="onLower" bindrefresherrefresh="onRefresh" binddragstart="onDragStart"><view>content</view></scroll-view>
        <swiper id="swiper" indicator-dots indicator-color="#112233" indicator-active-color="#445566" current-item-id="b"><swiper-item item-id="a">a</swiper-item><swiper-item item-id="b">b</swiper-item></swiper>
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
    const nativeScroll = scrollHost.getShadowRoot()?.getElementById('native-scroll-view')!
    const scrollHtml = glassEasel.dumpElementToString(nativeScroll, true)
    expect(scrollHtml).toContain('is-paging')
    expect(scrollHtml).toContain('is-hidden-scrollbar')
    nativeScroll.triggerEvent('scroll', { scrollTop: 35, scrollHeight: 100, clientHeight: 50 })
    expect(events.scroll).toMatchObject({ scrollTop: 35, scrollHeight: 100 })
    expect(events.lower).toEqual({ direction: 'bottom' })
    nativeScroll.triggerEvent('scroll', { scrollTop: 5, scrollHeight: 100, clientHeight: 50 })
    expect(events.upper).toEqual({ direction: 'top' })

    nativeScroll.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    nativeScroll.triggerEvent('touchmove', { touches: [{ clientX: 120, clientY: 20 }] })
    expect(events.dragstart).toMatchObject({ scrollTop: expect.any(Number) })
    nativeScroll.triggerEvent('touchend', { changedTouches: [{ clientX: 120, clientY: 20 }] })

    nativeScroll.triggerEvent('touchstart', { touches: [{ clientX: 10, clientY: 20 }] })
    nativeScroll.triggerEvent('touchmove', { touches: [{ clientX: 10, clientY: 120 }] })
    nativeScroll.triggerEvent('touchend', { changedTouches: [{ clientX: 10, clientY: 120 }] })
    expect(events.refresh).toMatchObject({ dy: expect.any(Number) })

    await new Promise((resolve) => setTimeout(resolve, 30))
    const swiperHost = instance.getShadowRoot()?.getElementById('swiper')?.asGeneralComponent()!
    const swiperHtml = glassEasel.dumpElementToString(swiperHost, true)
    expect(swiperHtml).toContain('background-color: #445566')
    expect(swiperHost.data.activeIndex).toBe(1)
    expect(swiperHost.data.trackStyle).toContain('translateX(-100%)')
  })


  test('swiper honors displayMultipleItems and skipHiddenItemLayout', async () => {
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
    expect(host('multi').data.trackStyle).toContain('translateX(-50%)')
    expect(host('hidden').data.dots).toHaveLength(2)
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
        <form id="form" report-submit bindsubmit="onSubmit" bindbeforereportsubmit="onBefore">
          <field id="field" name="custom" value="v" />
          <input id="input" name="title" value="hello" />
          <button id="submit" form-type="submit">Submit</button>
        </form>
      `),
      methods: {
        onSubmit(event: glassEasel.ShadowedEvent<unknown>) { events.push({ type: 'submit', detail: event.detail }) },
        onBefore(event: glassEasel.ShadowedEvent<unknown>) { events.push({ type: 'before', detail: event.detail }) },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    expect(host('field').hasBehavior('tiny-form-field')).toBe(true)
    expect(host('field').data).toMatchObject({ name: 'custom', value: 'v' })
    host('submit').triggerEvent('tap', {})
    expect(events).toEqual([
      { type: 'before', detail: { value: { custom: 'v', title: 'hello' } } },
      { type: 'submit', detail: { value: { custom: 'v', title: 'hello' }, formId: 'the formId is a mock one' } },
    ])
    expect(host('form').data.reportSubmit).toBe(true)
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
    expect(html).toContain('color: #123456')
  })

  test('canvas and input emit their native event surface', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: Record<string, unknown> = {}
    const page = space.defineComponent({
      is: 'page',
      using: { canvas: builtins.canvas, input: builtins.input },
      template: compilePage(`
        <canvas id="canvas" bindtouchstart="onTouchStart" bindtouchend="onTouchEnd" binderror="onCanvasError" />
        <input id="input" bindkeyboardcompositionend="onCompositionEnd" bindselectionchange="onSelection" />
      `),
      methods: {
        onTouchStart(event: glassEasel.ShadowedEvent<unknown>) { events.touchstart = event.detail },
        onTouchEnd(event: glassEasel.ShadowedEvent<unknown>) { events.touchend = event.detail },
        onCanvasError(event: glassEasel.ShadowedEvent<unknown>) { events.canvasError = event.detail },
        onCompositionEnd(event: glassEasel.ShadowedEvent<unknown>) { events.composition = event.detail },
        onSelection(event: glassEasel.ShadowedEvent<unknown>) { events.selection = event.detail },
      },
    })
    const instance = space.createComponentByUrl('root', 'page', null, new glassEasel.EmptyBackendContext())
    const host = (id: string) => instance.getShadowRoot()?.getElementById(id)?.asGeneralComponent()!
    const nativeCanvas = host('canvas').getShadowRoot()?.getElementById('native-canvas')!
    nativeCanvas.triggerEvent('touchstart', { touches: [{ clientX: 1, clientY: 2 }] })
    nativeCanvas.triggerEvent('touchend', { changedTouches: [{ clientX: 3, clientY: 4 }] })
    nativeCanvas.triggerEvent('error', { errMsg: 'canvas:fail' })
    expect(events.touchstart).toMatchObject({ touches: [{ clientX: 1, clientY: 2 }] })
    expect(events.touchend).toMatchObject({ changedTouches: [{ clientX: 3, clientY: 4 }] })
    expect(events.canvasError).toEqual({ errMsg: 'canvas:fail' })

    const nativeInput = host('input').getShadowRoot()?.getElementById('native-input')!
    nativeInput.triggerEvent('compositionend', { value: '汉字' })
    nativeInput.triggerEvent('select', {})
    expect(events.composition).toEqual({ value: '汉字' })
    expect(events.selection).toMatchObject({ selectionStart: expect.any(Number), selectionEnd: expect.any(Number) })
  })

  test('canvas reports a structured placeholder diagnostic', () => {
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
      message: expect.stringContaining('placeholder'),
    }))
  })


  test('textarea, form and picker expose the new built-in surfaces', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
    const events: Record<string, unknown> = {}
    const page = space.defineComponent({
      is: 'page',
      using: { textarea: builtins.textarea, form: builtins.form, input: builtins.input, picker: builtins.picker, button: builtins.button },
      template: compilePage(`
        <form id="form" bindsubmit="onSubmit"><input id="input" name="title" value="hello" /><button id="submit" form-type="submit">Submit</button></form>
        <textarea id="textarea" bindinput="onTextarea" />
        <picker id="picker" mode="selector" range="{{['a', 'b']}}" bindchange="onPicker" />
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
    expect(events.submit).toEqual({ value: { title: 'hello' }, formId: '' })

    const picker = host('picker') as unknown as {
      handleOpen: () => void
      handleOverlayChange: (event: unknown) => void
      handleConfirm: () => void
    }
    picker.handleOpen()
    picker.handleOverlayChange({ detail: { value: [1] } })
    picker.handleConfirm()
    expect(events.picker).toEqual({ value: 1 })
    expect(host('picker').data.value).toBe(1)
  })


  test('picker overlay builds date columns and confirms the formatted value', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createBuiltinComponents(space)
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
    const picker = instance.getShadowRoot()?.getElementById('picker')?.asGeneralComponent() as unknown as {
      handleOpen: () => void
      handleOverlayChange: (event: unknown) => void
      handleConfirm: () => void
    } & { data: { overlayColumns: Array<Array<{ label: string }>>; draftValue: number[] } }
    picker.handleOpen()
    expect(picker.data.overlayColumns).toHaveLength(3)
    expect(picker.data.overlayColumns[0]?.[0]?.label).toBe('2015年')
    expect(picker.data.draftValue).toEqual([1, 8, 0])
    picker.handleOverlayChange({ detail: { value: [2, 11, 30] } })
    picker.handleConfirm()
    expect(changes).toEqual([{ value: '2017-12-31' }])
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
    await new Promise((resolve) => setTimeout(resolve, 0))
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
    await new Promise((resolve) => setTimeout(resolve, 0))
    const view = instance.getShadowRoot()?.getElementById('view')?.asGeneralComponent()!
    const column = instance.getShadowRoot()?.getElementById('col')?.asGeneralComponent() as unknown as {
      handleTouchStart: (event: unknown) => void
      handleTouchMove: (event: unknown) => void
      handleTouchEnd: (event: unknown) => void
    }
    column.handleTouchStart({ touches: [{ clientY: 100 }] })
    column.handleTouchMove({ touches: [{ clientY: 10 }] })
    column.handleTouchEnd({ changedTouches: [{ clientY: 10 }] })
    await new Promise((resolve) => setTimeout(resolve, 0))
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
