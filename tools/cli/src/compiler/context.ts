import path from 'node:path'
import type { Diagnostic, ResolvedCompatibilityConfig } from '@tiny/manifest'
import type {
  AssetArtifact,
  CompileOptions,
  ScriptArtifact,
  StyleArtifact,
  TemplateArtifact,
} from '../types'
import { normalizeRelativePath } from '../utils'
import { resolveCompatibilityInput } from '../compatibility'

/** File conventions resolved from `tiny.config.json` and `CompileOptions`. */
export type CompilerExtensions = {
  script: string[]
  template: string[]
  style: string[]
  templateScript: string[]
  config: string[]
}

/**
 * Mutable state shared by every compiler stage. Stages append diagnostics and
 * artifacts instead of returning them, so the orchestrator can report all
 * problems from a single run.
 */
export type CompilerContext = {
  options: Required<Omit<CompileOptions, 'compatibility'>>
  compatibility: ResolvedCompatibilityConfig
  extensions: CompilerExtensions
  /** Mini-program root; `sourceDir` until `project.config.json` narrows it. */
  root: string
  diagnostics: Diagnostic[]
  scripts: Map<string, ScriptArtifact>
  templates: Map<string, TemplateArtifact>
  styles: Map<string, StyleArtifact>
  assets: AssetArtifact[]
  /** Tags referenced through `usingComponents`, collected while resolving entries. */
  customComponentTags: Set<string>
}

export function createCompilerContext(options: CompileOptions): CompilerContext {
  const sourceDir = path.resolve(options.sourceDir)
  const diagnostics: Diagnostic[] = []
  // Resolve conventions from the options as given; `sourceDir` is only
  // normalized for reads and writes.
  const compatibility = resolveCompatibilityInput(options, diagnostics)
  return {
    options: {
      clean: options.clean ?? true,
      dev: options.dev ?? false,
      rpxRatio: options.rpxRatio ?? 750,
      sourceDir,
      outputDir: path.resolve(options.outputDir),
    },
    compatibility,
    extensions: {
      script: [...compatibility.extensions.script],
      template: [...compatibility.extensions.template],
      style: [...compatibility.extensions.style],
      templateScript: [...compatibility.extensions.templateScript],
      config: [...compatibility.extensions.config],
    },
    root: sourceDir,
    diagnostics,
    scripts: new Map(),
    templates: new Map(),
    styles: new Map(),
    assets: [],
    customComponentTags: new Set(),
  }
}

/** Mini-program-relative path used as the key for every artifact map. */
export function relativePath(context: CompilerContext, filePath: string): string {
  return normalizeRelativePath(path.relative(context.root, filePath))
}

/** Absolute path of an emitted artifact. */
export function outputPath(context: CompilerContext, relativeOutputPath: string): string {
  return path.join(context.options.outputDir, relativeOutputPath)
}
