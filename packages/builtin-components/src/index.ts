import * as glassEasel from 'glass-easel'
import { TmplGroup } from '@tiny/template-compiler'

export const BUILTIN_COMPONENT_TAGS = [
  'view',
  'button',
  'text',
  'label',
  'input',
  'checkbox',
  'checkbox-group',
  'radio',
  'radio-group',
  'icon',
  'image',
  'scroll-view',
  'slider',
  'progress',
  'switch',
  'swiper',
  'swiper-item',
  'canvas',
] as const

/**
 * Minimal layout defaults for built-in tags. Mini-program components are
 * block-level by default, while their internal classes keep the host styling
 * predictable before any application stylesheet is applied.
 */
export const BUILTIN_BASE_STYLES = `
page,
.tiny-view,
.tiny-scroll-view,
.tiny-swiper,
.tiny-swiper-item,
.tiny-checkbox-group,
.tiny-radio-group,
.tiny-button,
.tiny-progress,
.tiny-image,
.tiny-canvas,
.tiny-slider,
.tiny-switch,
.tiny-input {
  display: block;
  box-sizing: border-box;
}
.tiny-label,
.tiny-checkbox,
.tiny-radio {
  display: inline-block;
}
.tiny-text,
.tiny-icon {
  display: inline;
}
.tiny-input {
  width: 100%;
}
.tiny-scroll-view.is-vertical {
  overflow-y: auto;
}
.tiny-scroll-view.is-horizontal {
  overflow-x: auto;
}
.tiny-image {
  max-width: 100%;
  object-fit: fill;
}
.tiny-image-mode-aspectFit {
  object-fit: contain;
}
.tiny-image-mode-aspectFill {
  object-fit: cover;
}
.tiny-image-mode-widthFix {
  object-fit: fill;
  height: auto;
}
.tiny-button {
  width: 100%;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #1e293b;
  color: #f8fafc;
  font: inherit;
  line-height: 1.4;
  cursor: pointer;
}
.tiny-button-hover {
  opacity: 0.85;
}
.tiny-progress-track {
  height: 6px;
  background: #334155;
  border-radius: 3px;
  overflow: hidden;
}
.tiny-progress-bar {
  height: 100%;
  background: #3b82f6;
}
`

export type BuiltinComponentTag = typeof BUILTIN_COMPONENT_TAGS[number]
export type BuiltinComponentDefinitions = Record<BuiltinComponentTag, glassEasel.GeneralComponentDefinition>

function compileTemplate(source: string): glassEasel.template.ComponentTemplate {
  const group = TmplGroup.newDev()
  group.addTmpl('', source)
  const generated = group.getTmplGenObjectGroups()
  group.free()
  const groupList = new Function(`return ${generated}`)() as Record<string, (name: string) => any>
  return {
    groupList,
    content: (name = '') => {
      if (!groupList[name]) throw new Error(`Built-in template not found: ${name}`)
      return groupList[name](name)
    },
  }
}

const ICON_GLYPHS: Record<string, string> = {
  success: '✓',
  success_no_circle: '✓',
  info: 'ℹ',
  warn: '!',
  waiting: '◌',
  cancel: '✕',
  download: '↓',
  search: '⌕',
  clear: '✕',
}

type BackendElementLike = {
  value?: unknown
  checked?: unknown
}

function backendElementFromEvent(event: glassEasel.ShadowedEvent<unknown>): BackendElementLike | null {
  for (const candidate of [event.currentTarget, event.target]) {
    const getElement = (candidate as unknown as {
      getBackendElement?: () => BackendElementLike | null
    } | null | undefined)?.getBackendElement
    if (typeof getElement !== 'function') continue
    const element = getElement.call(candidate)
    if (element) return element
  }
  return null
}

function numberFromEvent(event: glassEasel.ShadowedEvent<unknown>, fallback = 0): number {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return Number(detail.value)
  const element = backendElementFromEvent(event)
  if (element?.value !== undefined) return Number(element.value)
  return fallback
}

function valueFromEvent(event: glassEasel.ShadowedEvent<unknown>): unknown {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return detail.value
  const target = event.target as { value?: unknown } | undefined
  if (target?.value !== undefined) return target.value
  return backendElementFromEvent(event)?.value
}

function booleanFromEvent(event: glassEasel.ShadowedEvent<unknown>, fallback = false): boolean {
  const detail = event.detail as { value?: unknown } | undefined
  if (detail?.value !== undefined) return Boolean(detail.value)
  const element = backendElementFromEvent(event)
  if (element?.checked !== undefined) return Boolean(element.checked)
  return fallback
}

export type BuiltinComponentFactoryOptions = {
  onDiagnostic?: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void
}

export function createP0BuiltinComponents(
  space: glassEasel.ComponentSpace,
  options: BuiltinComponentFactoryOptions = {},
): BuiltinComponentDefinitions {
  const definitions = {} as BuiltinComponentDefinitions

  definitions.view = space.defineComponent({
    is: 'tiny-builtin:view',
    template: compileTemplate('<view class="tiny-view class" style="{{style}}"><slot /></view>'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.text = space.defineComponent({
    is: 'tiny-builtin:text',
    template: compileTemplate('<text class="tiny-text class" style="{{style}}"><slot /></text>'),
    properties: {
      selectable: { type: Boolean, value: false },
      space: { type: String, value: '' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
  }).general()

  definitions.button = space.defineComponent({
    is: 'tiny-builtin:button',
    template: compileTemplate(
      '<button class="tiny-button class" style="{{style}}" hover-class="{{hoverClass}}" catchtap="handleTap"><slot /></button>',
    ),
    properties: {
      type: { type: String, value: 'default' },
      disabled: { type: Boolean, value: false },
      hoverClass: { type: String, value: 'tiny-button-hover' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleTap(event: glassEasel.ShadowedEvent<unknown>) {
        if (this.data.disabled) return
        this.triggerEvent('tap', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions.label = space.defineComponent({
    is: 'tiny-builtin:label',
    template: compileTemplate('<label class="tiny-label class" style="{{style}}"><slot /></label>'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.input = space.defineComponent({
    is: 'tiny-builtin:input',
    template: compileTemplate(
      '<input id="native-input" class="tiny-input class" style="{{style}}" value="{{value}}" placeholder="{{placeholder}}" disabled="{{disabled}}" type="{{type}}" catchinput="handleInput" catchchange="handleChange" />',
    ),
    properties: {
      value: { type: String, value: '' },
      type: { type: String, value: 'text' },
      placeholder: { type: String, value: '' },
      disabled: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
    methods: {
      handleInput(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('input', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = valueFromEvent(event)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions.checkbox = space.defineComponent({
    is: 'tiny-builtin:checkbox',
    template: compileTemplate(
      '<view class="tiny-checkbox"><input id="native-input" type="checkbox" value="{{value}}" checked="{{checked}}" disabled="{{disabled}}" catchchange="handleChange" /><slot /></view>',
    ),
    properties: {
      value: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
    },
    lifetimes: {
      attached() {
        this.triggerEvent(
          'checkboxstate',
          { value: this.data.value, checked: Boolean(this.data.checked) },
          { bubbles: true, composed: true },
        )
      },
    },
    observers: {
      checked(value: boolean) {
        this.triggerEvent(
          'checkboxstate',
          { value: this.data.value, checked: Boolean(value) },
          { bubbles: true, composed: true },
        )
      },
    },
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: this.data.value, checked }, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions['checkbox-group'] = space.defineComponent({
    is: 'tiny-builtin:checkbox-group',
    template: compileTemplate(
      '<view class="tiny-checkbox-group class" style="{{style}}" catchchange="handleChange" catchcheckboxstate="handleState"><slot /></view>',
    ),
    properties: {
      style: { type: String, value: '' },
    },
    data: {
      selected: [] as string[],
    },
    externalClasses: ['class'],
    methods: {
      applyState(detail: { value?: unknown; checked?: unknown }) {
        const value = String(detail.value ?? '')
        const selected = new Set<string>(this.data.selected as string[])
        if (detail.checked) selected.add(value)
        else selected.delete(value)
        this.setData({ selected: [...selected] })
        return [...selected]
      },
      handleState(event: glassEasel.ShadowedEvent<unknown>) {
        this.applyState(event.detail as { value?: unknown; checked?: unknown })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const selected = this.applyState(event.detail as { value?: unknown; checked?: unknown })
        this.triggerEvent('change', { value: selected }, { bubbles: true, composed: true })
      },
    },
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.radio = space.defineComponent({
    is: 'tiny-builtin:radio',
    template: compileTemplate(
      '<view class="tiny-radio"><input id="native-input" type="radio" value="{{value}}" checked="{{checked}}" disabled="{{disabled}}" catchchange="handleChange" /><slot /></view>',
    ),
    properties: {
      value: { type: String, value: '' },
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
    },
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: this.data.value, checked }, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions['radio-group'] = space.defineComponent({
    is: 'tiny-builtin:radio-group',
    template: compileTemplate('<view class="tiny-radio-group class" style="{{style}}"><slot /></view>'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.icon = space.defineComponent({
    is: 'tiny-builtin:icon',
    template: compileTemplate('<text class="tiny-icon tiny-icon-{{type}}" style="font-size: {{size}}px; color: {{color}};">{{glyph}}</text>'),
    properties: {
      type: { type: String, value: 'success' },
      size: { type: String, optionalTypes: [Number], value: 16 },
      color: { type: String, value: '' },
    },
    data: {
      glyph: ICON_GLYPHS.success,
    },
    observers: {
      type(value: string) {
        this.setData({ glyph: ICON_GLYPHS[value] ?? ICON_GLYPHS.success })
      },
    },
  }).general()

  definitions.image = space.defineComponent({
    is: 'tiny-builtin:image',
    template: compileTemplate(
      '<img class="tiny-image tiny-image-mode-{{mode}} class" style="{{style}}" src="{{src}}" alt="" binderror="handleError" bindload="handleLoad" />',
    ),
    properties: {
      src: { type: String, value: '' },
      mode: { type: String, value: 'scaleToFill' },
      lazyLoad: { type: Boolean, value: false },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    methods: {
      handleLoad(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('load', event.detail ?? {}, { bubbles: true, composed: true })
      },
      handleError(event: glassEasel.ShadowedEvent<unknown>) {
        this.triggerEvent('error', event.detail ?? {}, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions['scroll-view'] = space.defineComponent({
    is: 'tiny-builtin:scroll-view',
    template: compileTemplate(
      '<view class="tiny-scroll-view {{scrollX ? \'is-horizontal\' : \'\'}} {{scrollY ? \'is-vertical\' : \'\'}} class" style="{{style}}"><slot /></view>',
    ),
    properties: {
      scrollX: { type: Boolean, value: false },
      scrollY: { type: Boolean, value: false },
      upperThreshold: { type: Number, value: 50 },
      lowerThreshold: { type: Number, value: 50 },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.slider = space.defineComponent({
    is: 'tiny-builtin:slider',
    template: compileTemplate(
      '<input id="native-input" class="tiny-slider" type="range" min="{{min}}" max="{{max}}" step="{{step}}" value="{{value}}" disabled="{{disabled}}" catchinput="handleChanging" catchchange="handleChange" />',
    ),
    properties: {
      value: { type: Number, value: 0 },
      min: { type: Number, value: 0 },
      max: { type: Number, value: 100 },
      step: { type: Number, value: 1 },
      disabled: { type: Boolean, value: false },
      showValue: { type: Boolean, value: false },
    },
    methods: {
      handleChanging(event: glassEasel.ShadowedEvent<unknown>) {
        const value = numberFromEvent(event, this.data.value as number)
        this.setData({ value })
        this.triggerEvent('changing', { value }, { bubbles: true, composed: true })
      },
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const value = numberFromEvent(event, this.data.value as number)
        this.setData({ value })
        this.triggerEvent('change', { value }, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions.progress = space.defineComponent({
    is: 'tiny-builtin:progress',
    template: compileTemplate(
      '<view class="tiny-progress class" style="{{style}}"><view class="tiny-progress-track"><view class="tiny-progress-bar" style="width: {{percent < 0 ? 0 : (percent > 100 ? 100 : percent)}}%" /></view><text class="tiny-progress-info" hidden="{{!showInfo}}">{{percent}}%</text></view>',
    ),
    properties: {
      percent: { type: Number, value: 0 },
      showInfo: { type: Boolean, value: false },
      active: { type: Boolean, value: false },
      strokeWidth: { type: String, optionalTypes: [Number], value: 6 },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { virtualHost: true },
  }).general()

  definitions.switch = space.defineComponent({
    is: 'tiny-builtin:switch',
    template: compileTemplate(
      '<label class="tiny-switch {{checked ? \'is-checked\' : \'\'}}"><input id="native-input" type="checkbox" checked="{{checked}}" disabled="{{disabled}}" catchchange="handleChange" /><view class="tiny-switch-control" /></label>',
    ),
    properties: {
      checked: { type: Boolean, value: false },
      disabled: { type: Boolean, value: false },
      type: { type: String, value: 'switch' },
    },
    methods: {
      handleChange(event: glassEasel.ShadowedEvent<unknown>) {
        const checked = booleanFromEvent(event, this.data.checked as boolean)
        this.setData({ checked })
        this.triggerEvent('change', { value: checked }, { bubbles: true, composed: true })
      },
    },
  }).general()

  definitions.swiper = space.defineComponent({
    is: 'tiny-builtin:swiper',
    template: compileTemplate(
      '<view class="tiny-swiper" data-current="{{current}}"><view class="tiny-swiper-track"><slot /></view><view class="tiny-swiper-dots" hidden="{{!indicatorDots}}" /></view>',
    ),
    properties: {
      current: { type: Number, value: 0 },
      indicatorDots: { type: Boolean, value: false },
      autoplay: { type: Boolean, value: false },
      interval: { type: Number, value: 5000 },
      duration: { type: Number, value: 500 },
      circular: { type: Boolean, value: false },
    },
  }).general()

  definitions['swiper-item'] = space.defineComponent({
    is: 'tiny-builtin:swiper-item',
    template: compileTemplate('<view class="tiny-swiper-item class" style="{{style}}"><slot /></view>'),
    properties: {
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    options: { multipleSlots: true, virtualHost: true },
  }).general()

  definitions.canvas = space.defineComponent({
    is: 'tiny-builtin:canvas',
    template: compileTemplate(
      '<canvas id="native-canvas" class="tiny-canvas class" style="{{style}}" canvas-id="{{canvasId}}" type="{{type}}" data-placeholder="canvas" />',
    ),
    properties: {
      canvasId: { type: String, value: '' },
      type: { type: String, value: '' },
      style: { type: String, value: '' },
    },
    externalClasses: ['class'],
    lifetimes: {
      created() {
        options.onDiagnostic?.({
          severity: 'warning',
          code: 'UNSUPPORTED_CANVAS',
          message: 'Canvas rendering is a non-blocking placeholder in the P0 runtime.',
          details: { canvasId: this.data.canvasId, type: this.data.type },
        })
      },
    },
    options: { virtualHost: true },
  }).general()

  return definitions
}
