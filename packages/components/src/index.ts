import type * as glassEasel from 'glass-easel'
import { BUILTIN_COMPONENT_TAGS, type BuiltinComponentTag } from './tags'
import { builtinTemplate } from './templates'
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
}

export function createBuiltinComponents(
  space: glassEasel.ComponentSpace,
  options: BuiltinComponentFactoryOptions = {},
): BuiltinComponentDefinitions {
  const definitions = {} as BuiltinComponentDefinitions
  const context: BuiltinContext = {
    space,
    options,
    template: builtinTemplate,
  }
  for (const tag of BUILTIN_COMPONENT_TAGS) {
    definitions[tag] = DEFINITION_FACTORIES[tag](context)
  }
  return definitions
}
