/**
 * Fixed names owned by the Tiny engine.
 *
 * These names describe compiler/runtime internals and must never be derived
 * from the mini-program compatibility format used by an input project.
 */
export const TINY_ENGINE_NAMING = Object.freeze({
  namespace: 'tiny',
  prefix: 'tiny-',
  hostTagPrefix: 'tiny-',
  hostNodeTagName: 'tiny-*',
  // Temporary: mirror glass-easel 1.1.0 until it exposes configurable attributes.
  hostAttribute: 'wx-host',
  styleScopeAttribute: 'wx-style-scope',
  styleScopePrefix: 'tiny-',
  scopeMarkerClass: 'tiny-scope',
  tagClassPrefix: 'tiny-tag-',
  builtinDefinitionPrefix: 'tiny-builtin:',
  builtinStyleScopePrefix: 'tiny-builtin-',
  behaviorPrefix: 'tiny-',
  behaviorScheme: 'tiny://',
  formFieldBehaviorId: 'tiny-form-field',
  /** Symbol key marking a native event that a built-in already normalized. */
  handledNativeEventSymbol: 'tiny.handledNativeEvent',
  appPageScopeSign: '__TINY_APP_PAGE_SCOPE__',
  /** Root page tag in the logic-tree/render-tree protocol. */
  pageTag: 'page',
  /** Text node tag shared by patches and render hosts. */
  textNodeTag: '#text',
  /** Transparent grouping node tags. */
  fragmentTag: '#fragment',
  /** Glass-easel definition/host names for the web render tree. */
  renderRootDefinition: 'tiny-render-root',
  renderRootTag: 'tiny-page',
  renderContainerDefinitionPrefix: 'tiny-render-container:',
  /** DOM attributes owned by the render tree. */
  nodeIdAttribute: 'data-tiny-node-id',
  runtimeStylesAttribute: 'data-tiny-tree-styles',
  /** Runtime-generated style keys. */
  pageScopeSheetMarker: '@page:',
  sharedSheetMarker: '@shared:',
  /** Page and view identity prefixes. */
  pageIdPrefix: 'page-',
  viewIdPrefix: 'view-',
  componentIdSeparator: ':',
  componentInstanceSeparator: '~',
  /** WXS runtime/host bridge and synthetic binding metadata names. */
  wxsRuntimeGlobal: '__tinyWxsRuntime',
  wxsEventHostGlobal: '__tinyWxsEventHost',
  wxsHandledField: '__tinyWxsHandled',
  wxsPropsAttribute: 'wx-tiny-wxs-props',
  wxsDynamicEventAttribute: 'wx-tiny-wxs-dynamic',
  /** WXS bindinput is not supported on these built-ins. */
  wxsServiceOnlyInputEvent: 'input',
  wxsServiceOnlyInputTags: ['input', 'textarea'],
  /** Events the WXS render dispatcher handles locally when possible. */
  wxsLocalEventNames: [
    'tap',
    'click',
    'touchstart',
    'touchmove',
    'touchend',
    'touchcancel',
    'change',
    'scroll',
    'confirm',
    'blur',
    'focus',
    'select',
    'columnchange',
    'linechange',
    'scrolltoupper',
    'scrolltolower',
    'regionchange',
    'submit',
    'reset',
    'load',
    'error',
    'begin',
    'end',
    'update',
    'play',
    'pause',
    'timeupdate',
    'ended',
    'waiting',
    'progress',
    'fullscreenchange',
  ],
} as const)

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
  'navigator',
  'scroll-view',
  'slider',
  'progress',
  'switch',
  'swiper',
  'swiper-item',
  'canvas',
  'textarea',
  'form',
  'picker',
  'picker-view',
  'picker-view-column',
] as const

export type BuiltinComponentTag = (typeof BUILTIN_COMPONENT_TAGS)[number]

export const BUILTIN_HOST_TAG_PREFIX = TINY_ENGINE_NAMING.hostTagPrefix
