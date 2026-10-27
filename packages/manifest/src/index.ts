/**
 * Versioned contract between the compiler and the runtime/debugger.
 * Keep these types free of compiler- or runtime-specific dependencies.
 */
import type { RuntimeCompatibilityConfig } from './compatibility'
import { TINY_ENGINE_NAMING } from './engine-naming'

export * from './compatibility'
export * from './engine-naming'
export * from './builtin'

export type DiagnosticSeverity = 'error' | 'warning' | 'info'

export type SourceLocation = {
  line: number
  column: number
}

export type Diagnostic = {
  severity: DiagnosticSeverity
  code: string
  message: string
  file?: string
  location?: SourceLocation
  details?: unknown
}

export type ScriptArtifact = {
  path: string
  sourcePath: string
  sourceMapPath?: string
}

export type TemplateArtifact = {
  path: string
  outputPath: string
  sourcePath: string
}

export type StyleArtifact = {
  /** Compiler-defined source path; consumers must not infer style type from it. */
  path: string
  sourcePath: string
  outputPath: string
  sourceMapPath?: string
  lowPriorityPath?: string
  lowPrioritySourceMapPath?: string
  scope?: string
  /**
   * Present on the app stylesheet page-scope template. The compiler anchors every
   * selector compound to the placeholder scope and marks class names with
   * `/*<sign>*\/`; the render thread expands both placeholders before appending
   * a per-page copy. Such an artifact is not registered as a normal stylesheet.
   * Consumers must identify it by this field rather than by a source filename or
   * extension.
   */
  pageScopeClassSign?: string
}

/**
 * Placeholder used by app page-scope selectors: inserted before class names and
 * as the dynamic page-scope/host-attribute value. Chosen to be unlikely to
 * appear in user stylesheets.
 */
export const APP_PAGE_SCOPE_CLASS_SIGN = TINY_ENGINE_NAMING.appPageScopeSign

export type AssetArtifact = {
  path: string
  sourcePath: string
}

export type ConfigurationArtifact = {
  path: string
  sourcePath: string
  effective: Record<string, unknown>
  usingComponents?: Record<string, string>
  usingComponentsSource?: Record<string, 'global' | 'local'>
}

export type AppArtifact = {
  path: string
  script?: ScriptArtifact
  /** App-global stylesheet. Runtime consumers must use this reference, not a filename. */
  style?: StyleArtifact
  configuration?: ConfigurationArtifact
}

export type PageArtifact = {
  path: string
  bodyType?: 'page' | 'component'
  subpackage?: string
  script?: ScriptArtifact
  template?: TemplateArtifact
  style?: StyleArtifact
  configuration?: ConfigurationArtifact
}

export type ComponentArtifact = PageArtifact

export type Manifest = {
  schemaVersion: 2
  /** Runtime-facing mini-program input compatibility resolved by the compiler. */
  runtimeCompatibility: RuntimeCompatibilityConfig
  entries: {
    service: string
    templates: string
  }
  app?: AppArtifact
  pages: PageArtifact[]
  components: ComponentArtifact[]
  styles: StyleArtifact[]
  assets: AssetArtifact[]
  diagnostics?: Diagnostic[]
}
