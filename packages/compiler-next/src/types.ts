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

export type CompileOptions = {
  sourceDir: string
  outputDir: string
  clean?: boolean
  dev?: boolean
  rpxRatio?: number
  scopePrefix?: string
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

export type CompileResult = {
  outputDir: string
  manifest: Manifest
  manifestPath: string
  diagnostics: Diagnostic[]
  outputPath: string
}
