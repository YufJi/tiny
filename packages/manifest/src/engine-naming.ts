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
} as const)
