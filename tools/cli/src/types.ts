export * from '@tiny/manifest'
import type { CompatibilityConfig, Diagnostic, Manifest } from '@tiny/manifest'

export type CompileOptions = {
  sourceDir: string
  outputDir: string
  clean?: boolean
  /**
   * Run TypeScript semantic checks. Omitted means "check when the project has
   * a tsconfig.json"; `false` opts out entirely.
   */
  typecheck?: boolean
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
