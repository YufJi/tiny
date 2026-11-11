export type WxsExports = Record<string, unknown>

export type WxsFunctionOrigin = {
  moduleId: string
  exportPath: string[]
}

export type WxsModuleTable = {
  modules: Array<{
    id: string
    code: string
    map?: string
  }>
}

export type WxsModule = {
  exports: WxsExports
}

export type WxsValues = {
  require: (moduleId: string) => WxsExports
  globals: Record<string, unknown>
  ctor: (value: unknown) => string
  getRegExp: (pattern: string, flags?: string) => RegExp
  getDate: (...args: unknown[]) => Date
}

export type WxsModuleFactory = (
  require: (moduleId: string) => WxsExports,
  module: WxsModule,
  exports: WxsExports,
  values: WxsValues,
) => void

export type WxsCompile = (source: string, moduleId: string) => WxsModuleFactory

export type WxsErrorContext = {
  moduleId?: string
  phase: 'compile' | 'load' | 'invoke'
}

export type WxsRuntimeHost = {
  compile: WxsCompile
  globals?: Record<string, unknown>
  onError?: (error: unknown, context: WxsErrorContext) => void
}

export type WxsRuntime = {
  /** Resolve a function exported by a loaded WXS module. */
  originOf: (value: unknown) => WxsFunctionOrigin | undefined
  /** Resolve an export path without throwing when it is unavailable. */
  resolve: (moduleId: string, exportPath: string[]) => ((...args: unknown[]) => unknown) | undefined
  /** Register a compiler-emitted module table. */
  load: (table: WxsModuleTable) => void
  /**
   * Register source for a module and return the `Q.S`-compatible accessor.
   * The accessor receives the module scope resolved from the generated
   * template's renderer context. Tiny scopes WXS module state to the owning
   * page tree, matching WeChat's page view runtime.
   */
  register: (moduleId: string, source: string) => (scopeKey?: string) => WxsExports
  require: (moduleId: string) => WxsExports
  invoke: (moduleId: string, exportPath: string[], args: unknown[]) => unknown
  /** Invoke an export in one page scope, without changing the active scope. */
  invokeScoped?: (
    scopeKey: string,
    moduleId: string,
    exportPath: string[],
    args: unknown[],
  ) => unknown
  /** Bind the logic tree's renderer-context -> module-scope resolver. */
  bindScopeResolver?: (
    resolver: (renderContext: unknown) => string | undefined,
  ) => void
  /** Resolve a generated template renderer context to its module scope. */
  scopeOf?: (renderContext: unknown) => string | undefined
  /** Release module state owned by one page. */
  releasePage?: (pageId: string) => void
  dispose: () => void
}
