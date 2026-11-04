import type * as glassEasel from 'glass-easel'
import type { BuiltinComponents } from '@tiny/runtime'
import { BUILTIN_COMPONENT_TAGS, BUILTIN_HOST_TAG_PREFIX, type BuiltinComponentTag } from './tags'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { builtinTemplate, internalTemplate } from './templates'
import { createBuiltinBehaviors } from './behaviors'
import {
  BUILTIN_BASE_STYLES,
  BUILTIN_COMPONENT_STYLES,
  BUILTIN_HOST_STYLES,
} from './styles'
import type { BuiltinContext, BuiltinComponentFactoryOptions } from './types'
import { defineView } from './components/view'
import { defineCoverView } from './components/cover-view'
import { defineCoverImage } from './components/cover-image'
import { defineRootPortal } from './components/root-portal'
import { definePageContainer } from './components/page-container'
import { defineMovableArea } from './components/movable-area'
import { defineMovableView } from './components/movable-view'
import { definePageMeta } from './components/page-meta'
import { defineNavigationBar } from './components/navigation-bar'
import { defineFunctionalPageNavigator } from './components/functional-page-navigator'
import { defineButton } from './components/button'
import { defineText } from './components/text'
import { defineRichText } from './components/rich-text'
import { defineSelection } from './components/selection'
import { defineLabel } from './components/label'
import { defineInput } from './components/input'
import { defineCheckbox } from './components/checkbox'
import { defineCheckboxGroup } from './components/checkbox-group'
import { defineRadio } from './components/radio'
import { defineRadioGroup } from './components/radio-group'
import { defineIcon } from './components/icon'
import { defineImage } from './components/image'
import { defineAudio } from './components/audio'
import { defineVideo } from './components/video'
import { defineCamera } from './components/camera'
import { defineLivePlayer } from './components/live-player'
import { defineLivePusher } from './components/live-pusher'
import { defineVoipRoom } from './components/voip-room'
import { defineChannelLive } from './components/channel-live'
import { defineChannelVideo } from './components/channel-video'
import { defineMap } from './components/map'
import { defineNavigator } from './components/navigator'
import { defineScrollView } from './components/scroll-view'
import { defineSlider } from './components/slider'
import { defineProgress } from './components/progress'
import { defineSwitch } from './components/switch'
import { defineSwiper } from './components/swiper'
import { defineSwiperItem } from './components/swiper-item'
import { defineMatchMedia } from './components/match-media'
import { defineCanvas } from './components/canvas'
import { defineTextarea } from './components/textarea'
import { defineKeyboardAccessory } from './components/keyboard-accessory'
import { defineEditor } from './components/editor'
import { defineEditorPortal } from './components/editor-portal'
import { defineForm } from './components/form'
import { definePicker } from './components/picker'
import { definePickerView } from './components/picker-view'
import { definePickerViewColumn } from './components/picker-view-column'
import { defineAd } from './components/ad'
import { defineAdCustom } from './components/ad-custom'
import { defineOfficialAccount } from './components/official-account'
import { defineOfficialAccountPublish } from './components/official-account-publish'
import { defineOpenData } from './components/open-data'
import { defineReward } from './components/reward'
import { defineStoreCoupon } from './components/store-coupon'
import { defineStoreGift } from './components/store-gift'
import { defineStoreHome } from './components/store-home'
import { defineStoreProduct } from './components/store-product'
import { defineWebView } from './components/web-view'

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
  'cover-view': defineCoverView,
  'cover-image': defineCoverImage,
  'root-portal': defineRootPortal,
  'page-container': definePageContainer,
  'movable-area': defineMovableArea,
  'movable-view': defineMovableView,
  'page-meta': definePageMeta,
  'navigation-bar': defineNavigationBar,
  button: defineButton,
  text: defineText,
  'rich-text': defineRichText,
  selection: defineSelection,
  label: defineLabel,
  input: defineInput,
  checkbox: defineCheckbox,
  'checkbox-group': defineCheckboxGroup,
  radio: defineRadio,
  'radio-group': defineRadioGroup,
  icon: defineIcon,
  image: defineImage,
  audio: defineAudio,
  video: defineVideo,
  camera: defineCamera,
  'live-player': defineLivePlayer,
  'live-pusher': defineLivePusher,
  'voip-room': defineVoipRoom,
  'channel-live': defineChannelLive,
  'channel-video': defineChannelVideo,
  map: defineMap,
  navigator: defineNavigator,
  'functional-page-navigator': defineFunctionalPageNavigator,
  'scroll-view': defineScrollView,
  slider: defineSlider,
  progress: defineProgress,
  switch: defineSwitch,
  swiper: defineSwiper,
  'swiper-item': defineSwiperItem,
  'match-media': defineMatchMedia,
  canvas: defineCanvas,
  textarea: defineTextarea,
  'keyboard-accessory': defineKeyboardAccessory,
  editor: defineEditor,
  'editor-portal': defineEditorPortal,
  form: defineForm,
  picker: definePicker,
  'picker-view': definePickerView,
  'picker-view-column': definePickerViewColumn,
  ad: defineAd,
  'ad-custom': defineAdCustom,
  'official-account': defineOfficialAccount,
  'official-account-publish': defineOfficialAccountPublish,
  'open-data': defineOpenData,
  reward: defineReward,
  'store-coupon': defineStoreCoupon,
  'store-gift': defineStoreGift,
  'store-home': defineStoreHome,
  'store-product': defineStoreProduct,
  'web-view': defineWebView,
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
    internalTemplate,
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
  for (const tag of BUILTIN_COMPONENT_TAGS) {
    definitions[tag] = DEFINITION_FACTORIES[tag](context)
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
export {
  createGlassRenderEntry,
  installBuiltinStyles,
  type GlassRenderEntry,
  type RenderEntryOptions,
} from './render-entry'
