export { TINY_ENGINE_NAMING } from '@tiny/manifest'

export { DIAGNOSTIC_CODES, normalizeTransportDiagnostic } from './diagnostics'
export type {
  RuntimeDiagnostic,
  RuntimeDiagnosticSeverity,
  RuntimeDiagnosticSource,
  RuntimePageState,
  RuntimeTabBarItemState,
  RuntimeTabBarState,
} from './diagnostics'

export type { AssetUrlResolver } from './assets'
export { resolveAssetPath } from './assets'

// The `wx://` behavior contract shared by both threads. Hosts build their
// render-side registry from this list so it cannot drift from the kernel.
export { BUILTIN_BEHAVIOR_NAMES, type BuiltinBehaviorName } from './component/behaviors'

export type {
  BuiltinComponentDefinitions,
  BuiltinComponentFactory,
  BuiltinComponentFactoryContext,
  BuiltinComponents,
  BuiltinStyleSheet,
  CanvasMeasurement,
  CanvasNodeHandle,
  CanvasNodeOptions,
  CanvasNodeRequest,
  HostApiHandler,
  HostApiHandlers,
  HostApiParams,
  InspectNode,
  LegacyCanvasRequest,
  QueryNodeSnapshot,
  RenderThreadConnector,
  RuntimeHostOptions,
  RuntimeManifest,
  ServiceCanvasAdapter,
  StorageSnapshot,
  StyleLoader,
  SystemInfoSnapshot,
  TemplateGroupList,
  TemplateRegistry,
} from './types'

export * from './tree'

export { bootServiceThread } from './service'
export type {
  MiniProgramApiHost,
  MiniProgramRouter,
  ServiceApiContext,
  ServiceApiFactory,
  ServiceThreadOptions,
  TabBarApi,
} from './service'

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
