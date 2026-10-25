/**
 * Versioned contract between the compiler and the runtime/debugger.
 * Keep these types free of compiler- or runtime-specific dependencies.
 */
import type { NamingConfig } from './naming'

export * from './naming'
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
  path: string
  sourcePath: string
  outputPath: string
  sourceMapPath?: string
  lowPriorityPath?: string
  lowPrioritySourceMapPath?: string
  scope?: string
}

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
  schemaVersion: 1
  /** Engine naming configuration resolved by the compiler. */
  naming?: NamingConfig
  entries: {
    service: string
    render: string
    templates: string
  }
  app?: AppArtifact
  pages: PageArtifact[]
  components: ComponentArtifact[]
  styles: StyleArtifact[]
  assets: AssetArtifact[]
  diagnostics?: Diagnostic[]
}
