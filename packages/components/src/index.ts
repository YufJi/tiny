import type * as glassEasel from 'glass-easel'
import { BUILTIN_COMPONENT_TAGS, BUILTIN_HOST_TAG_PREFIX, type BuiltinComponentTag } from './tags'
import { builtinTemplate } from './templates'
import { createBuiltinBehaviors } from './behaviors'
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
export { BUILTIN_BASE_STYLES } from './styles'
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
  // Built-ins own a real host node in the engine's `tiny-` namespace instead
  // of impersonating WeChat's internal `wx-*` elements.
  const context: BuiltinContext = {
    space,
    options,
    template: builtinTemplate,
    behaviors: createBuiltinBehaviors(space, { prefix: options.prefix }),
    getBuiltin: (tag) => definitions[tag],
    hostOptions: (extra = {}) => ({
      virtualHost: false,
      hostNodeTagName: `${BUILTIN_HOST_TAG_PREFIX}*`,
      reflectToAttributes: true,
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
