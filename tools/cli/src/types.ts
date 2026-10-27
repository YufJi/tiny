export * from '@tiny/manifest'
import type { CompatibilityConfig, Diagnostic, Manifest } from '@tiny/manifest'

export type CompileOptions = {
  sourceDir: string
  outputDir: string
  clean?: boolean
  dev?: boolean
  rpxRatio?: number
  /**
   * Mini-program source conventions. Omitted fields use WeChat defaults.
   * Explicit values override `tiny.config.json`.
   */
  compatibility?: CompatibilityConfig
}

export type CompileResult = {
  outputDir: string
  manifest: Manifest
  manifestPath: string
  diagnostics: Diagnostic[]
  outputPath: string
}
