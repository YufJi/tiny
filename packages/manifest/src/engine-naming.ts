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
  appPageScopeSign: '__TINY_APP_PAGE_SCOPE__',
} as const)
