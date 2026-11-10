/**
 * Versioned contract between the compiler and the runtime/debugger.
 * Keep these types free of compiler- or runtime-specific dependencies.
 */
import type { RuntimeCompatibilityConfig } from './compatibility'
import { TINY_ENGINE_NAMING } from './engine-naming'

export * from './compatibility'
export * from './engine-naming'
export * from './builtin'
export * from './builtin-capabilities'
export * from './asset-path'
export * from './diagnostic-codes'

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
   * `/*<sign>*\/`; the service logic tree expands both placeholders before
   * sending a per-page copy. Such an artifact is not registered as a normal
   * stylesheet.
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

/**
 * `theme.json` variable tables. Keys are raw variable names (used as `@name`
 * in JSON config and `var(--name)` in WXSS).
 */
export type ThemeTable = {
  light: Record<string, string>
  dark: Record<string, string>
}

export type ConfigurationArtifact = {
  path: string
  sourcePath: string
  /** Effective config with `@themeVar` references resolved for the light theme. */
  effective: Record<string, unknown>
  /** Light/dark resolutions differ; enables host theme switching. */
  darkEffective?: Record<string, unknown>
  usingComponents?: Record<string, string>
  usingComponentsSource?: Record<string, 'global' | 'local'>
  /**
   * `componentPlaceholder` resolved to `component path -> placeholder tag`.
   * The compiler owns the mapping; the runtime uses it when a component
   * definition is not available yet.
   */
  placeholders?: Record<string, string>
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
  /** Subpackage chunks that must load after mount for async components. */
  asyncSubPackages?: string[]
  script?: ScriptArtifact
  template?: TemplateArtifact
  style?: StyleArtifact
  configuration?: ConfigurationArtifact
}

export type ComponentArtifact = PageArtifact

/**
 * One `app.json.subPackages` block resolved by the compiler.
 *
 * `pages` are root-anchored page paths (already joined with `root`). A host may
 * use `service` to load the package's registration chunk on demand; the main
 * `service.js` always contains the app and main-package entries.
 */
export type SubPackageArtifact = {
  root: string
  pages: string[]
  independent?: boolean
  /** Compiler-owned service entry for this package, when split. */
  service?: string
}

/**
 * One `app.json.preloadRule` entry. `packages` are subpackage roots; the host
 * chooses whether the current network satisfies `network`.
 */
export type PreloadRuleArtifact = {
  page: string
  network: 'all' | 'wifi'
  packages: string[]
}

export type Manifest = {
  schemaVersion: 2
  /** Runtime-facing mini-program input compatibility resolved by the compiler. */
  runtimeCompatibility: RuntimeCompatibilityConfig
  entries: {
    service: string
    templates: string
    /**
     * Eager single-file service bundle for hosts without native ESM (iOS
     * JavaScriptCore). It contains the app, every page and every component so
     * shared modules keep one instance; browser hosts use `service` plus the
     * per-package chunks instead.
     */
    serviceBundle?: string
  }
  app?: AppArtifact
  pages: PageArtifact[]
  components: ComponentArtifact[]
  /** Declared subpackages, in `app.json` order. */
  subPackages?: SubPackageArtifact[]
  /** Normalized `app.json.preloadRule`, in declaration order. */
  preloadRules?: PreloadRuleArtifact[]
  /** `themeLocation` tables, when the project declares theme variables. */
  theme?: ThemeTable
  styles: StyleArtifact[]
  assets: AssetArtifact[]
  diagnostics?: Diagnostic[]
}
