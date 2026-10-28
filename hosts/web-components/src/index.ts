import type * as glassEasel from 'glass-easel'
import type { BuiltinComponents } from '@tiny/runtime'
import { BUILTIN_COMPONENT_TAGS, BUILTIN_HOST_TAG_PREFIX, type BuiltinComponentTag } from './tags'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { builtinTemplate } from './templates'
import { createBuiltinBehaviors } from './behaviors'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from './styles'
import type { BuiltinContext, BuiltinComponentFactoryOptions } from './types'
import { defineView } from './components/view'
import { defineButton } from './components/button'
import { defineText } from './components/text'
import { defineLabel } from './components/label'
import { defineInput } from './components/input'
import { defineCheckbox } from './components/checkbox'
import { defineCheckboxGroup } from './components/checkbox-group'
import { defineRadio } from './components/radio'
import { defineRadioGroup } from './components/radio-group'
import { defineIcon } from './components/icon'
import { defineImage } from './components/image'
import { defineNavigator } from './components/navigator'
import { defineScrollView } from './components/scroll-view'
import { defineSlider } from './components/slider'
import { defineProgress } from './components/progress'
import { defineSwitch } from './components/switch'
import { defineSwiper } from './components/swiper'
import { defineSwiperItem } from './components/swiper-item'
import { defineCanvas } from './components/canvas'
import { defineTextarea } from './components/textarea'
import { defineForm } from './components/form'
import { definePicker } from './components/picker'
import { definePickerView } from './components/picker-view'
import { definePickerViewColumn } from './components/picker-view-column'

export { BUILTIN_COMPONENT_TAGS }
export { BUILTIN_BASE_STYLES, BUILTIN_COMPONENT_STYLES, BUILTIN_HOST_STYLES }
export type { BuiltinComponentTag }
export type { BuiltinComponentFactoryOptions, BuiltinContext } from './types'

export type BuiltinComponentDefinitions = Record<
  BuiltinComponentTag,
  glassEasel.GeneralComponentDefinition
>

type DefinitionFactory = (ctx: BuiltinContext) => glassEasel.GeneralComponentDefinition

const DEFINITION_FACTORIES: Record<BuiltinComponentTag, DefinitionFactory> = {
  view: defineView,
  button: defineButton,
  text: defineText,
  label: defineLabel,
  input: defineInput,
  checkbox: defineCheckbox,
  'checkbox-group': defineCheckboxGroup,
  radio: defineRadio,
  'radio-group': defineRadioGroup,
  icon: defineIcon,
  image: defineImage,
  navigator: defineNavigator,
  'scroll-view': defineScrollView,
  slider: defineSlider,
  progress: defineProgress,
  switch: defineSwitch,
  swiper: defineSwiper,
  'swiper-item': defineSwiperItem,
  canvas: defineCanvas,
  textarea: defineTextarea,
  form: defineForm,
  picker: definePicker,
  'picker-view': definePickerView,
  'picker-view-column': definePickerViewColumn,
}

export function createBuiltinComponents(
  space: glassEasel.ComponentSpace,
  options: BuiltinComponentFactoryOptions = {},
): BuiltinComponentDefinitions {
  const definitions = {} as BuiltinComponentDefinitions
  const styleScopes = new Map<BuiltinComponentTag, number>()
  const styleScopeFor = (tag: BuiltinComponentTag): number => {
    const existing = styleScopes.get(tag)
    if (existing !== undefined) return existing
    const scope = (options.registerStyleScope
      ?? ((name: string) => space.styleScopeManager.register(name)))(`${TINY_ENGINE_NAMING.builtinStyleScopePrefix}${tag}`)
    styleScopes.set(tag, scope)
    return scope
  }
  // Built-ins own a real host node in Tiny's internal namespace instead of
  // impersonating a mini-program implementation's private elements.
  const context: BuiltinContext = {
    space,
    options,
    template: builtinTemplate,
    behaviors: createBuiltinBehaviors(space),
    getBuiltin: (tag) => definitions[tag],
    hostOptions: (tag, extra = {}) => ({
      virtualHost: false,
      hostNodeTagName: `${BUILTIN_HOST_TAG_PREFIX}*`,
      reflectToAttributes: true,
      styleScope: styleScopeFor(tag),
      ...extra,
    }),
  }
  // picker embeds picker-view/picker-view-column in its overlay, so create
  // it after the components it uses.
  const deferred = new Set<BuiltinComponentTag>(['picker'])
  for (const tag of BUILTIN_COMPONENT_TAGS) {
    if (!deferred.has(tag)) definitions[tag] = DEFINITION_FACTORIES[tag](context)
  }
  for (const tag of BUILTIN_COMPONENT_TAGS) {
    if (deferred.has(tag)) definitions[tag] = DEFINITION_FACTORIES[tag](context)
  }
  return definitions
}

/**
 * Web/DOM implementation of the built-in mini-program tags.
 *
 * Browser hosts inject this object into
 * `bootRenderThread({ builtinComponents: webBuiltinComponents })`. The runtime
 * core never imports this package, so non-DOM hosts can supply their own tags
 * (or none) without pulling in web-specific behavior or CSS.
 */
export const webBuiltinComponents: BuiltinComponents = {
  create: createBuiltinComponents,
  styles: [
    {
      path: 'tiny-builtin-host.css',
      content: BUILTIN_HOST_STYLES,
    },
    ...BUILTIN_COMPONENT_STYLES.map(({ path, content, scope }) => ({ path, content, scope })),
  ],
}

export { createGlassRenderTree } from './render-tree'
export type { GlassRenderTree, GlassRenderTreeOptions } from './render-tree'
export { bootGlassRenderEntry, installBuiltinStyles, type RenderEntryOptions } from './render-entry'
