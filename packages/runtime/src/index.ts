export { TINY_ENGINE_NAMING } from '@tiny/manifest'

export { DIAGNOSTIC_CODES, normalizeTransportDiagnostic } from './shared/diagnostics'
export type {
  RuntimeDiagnostic,
  RuntimeDiagnosticSeverity,
  RuntimeDiagnosticSource,
  RuntimePageState,
  RuntimeTabBarItemState,
  RuntimeTabBarState,
} from './shared/diagnostics'

export type { AssetUrlResolver } from './shared/assets'
export { resolveAssetReference } from './shared/assets'

// The `wx://` behavior contract shared by both threads. Hosts build their
// render-side registry from this list so it cannot drift from the kernel.
export { BUILTIN_BEHAVIOR_NAMES, type BuiltinBehaviorName } from './component/behaviors'

export type {
  BuiltinComponentDefinitions,
  BuiltinComponentFactory,
  BuiltinComponentFactoryContext,
  BuiltinComponents,
  BuiltinStyleSheet,
} from './render/builtin'

export type { InspectNode } from './service/logic-tree/inspect'
export type { QueryNodeSnapshot } from './service/logic-tree/query'
export type { RuntimeManifest } from './shared/manifest'
export type {
  StyleLoader,
  TemplateGroupList,
  TemplateRegistry,
} from './shared/template'

export * from './tree-protocol/locator'
export * from './tree-protocol/protocol'
export * from './render/thread'

export { bootServiceThread } from './service/boot'
export type {
  ServiceThreadOptions,
  ServiceThreadRuntime,
} from './service/boot'
export type { MiniProgramApiHost, TabBarApi } from './service/api/types'
export type { MiniProgramRouter } from './service/page/router'

export {
  createDefaultWxsCompiler,
  createWxsRuntime,
} from '@tiny/wxs-runtime'
export type {
  WxsCompile,
  WxsErrorContext,
  WxsExports,
  WxsModuleFactory,
  WxsModuleTable,
  WxsRuntime,
  WxsRuntimeHost,
  WxsValues,
} from '@tiny/wxs-runtime'
