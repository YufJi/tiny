export * from '@tiny/manifest'
import type { Diagnostic, Manifest, NamingConfig } from '@tiny/manifest'

export type CompileOptions = {
  sourceDir: string
  outputDir: string
  clean?: boolean
  dev?: boolean
  rpxRatio?: number
  scopePrefix?: string
  /**
   * Engine naming config (directive namespace, API global, tag markers…).
   * Overrides `tiny.config.json`; defaults to the `wx-` namespace.
   */
  naming?: NamingConfig
  /** Shorthand for `naming.prefix`. */
  prefix?: string
  /** Shorthand for `naming.apiAliases`. */
  apiAliases?: string[]
}

export type CompileResult = {
  outputDir: string
  manifest: Manifest
  manifestPath: string
  diagnostics: Diagnostic[]
  outputPath: string
}
