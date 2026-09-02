import { describe, expect, test } from 'vitest'
import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'
import { BUILTIN_COMPONENT_TAGS, createP0BuiltinComponents } from '../src'

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
  test('exposes every P0 component tag', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const definitions = createP0BuiltinComponents(space)
    expect(Object.keys(definitions)).toHaveLength(BUILTIN_COMPONENT_TAGS.length)
    expect(Object.keys(definitions)).toEqual(expect.arrayContaining([...BUILTIN_COMPONENT_TAGS]))
  })

  test('button catches native taps and emits a mini-program tap event', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createP0BuiltinComponents(space)
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

  test('input syncs value and emits normalized input events', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createP0BuiltinComponents(space)
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
    expect(changes).toEqual([{ value: 'typed' }])
    expect(inputHost?.data.value).toBe('typed')
  })

  test('checkbox, slider, and switch normalize control values', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createP0BuiltinComponents(space)
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

  test('progress, swiper, and icon render structure and state', () => {
    const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
    const builtins = createP0BuiltinComponents(space)
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
