export * from '@tiny/manifest'
import type { Diagnostic, Manifest } from '@tiny/manifest'

export type CompileOptions = {
  sourceDir: string
  outputDir: string
  clean?: boolean
  dev?: boolean
  rpxRatio?: number
  scopePrefix?: string
}

export type CompileResult = {
  outputDir: string
  manifest: Manifest
  manifestPath: string
  diagnostics: Diagnostic[]
  outputPath: string
}
