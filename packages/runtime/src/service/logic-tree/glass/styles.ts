import * as glassEasel from 'glass-easel'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
  type StyleArtifact,
} from '@tiny/manifest'
import type { MiniProgramComponentSchema } from '../../../component/schema'
import {
  mapCssAssetUrls,
  type AssetUrlResolver,
  type ProtocolRelativeUrlResolver,
} from '../../../shared/assets'
import {
  createRuntimeDiagnostic,
  type RuntimeDiagnostic,
} from '../../../shared/diagnostics'
import type { StyleLoader } from '../../../shared/template'
import type { LogicStyleSheetRole } from '../backend'

export type StyleRegistrationOptions = {
  /**
   * Render only the stylesheets reachable from this page. Used by the first
   * mount so an app with many pages does not load every component stylesheet.
   */
  pagePath?: string
}

export type GlassStyleHost = {
  backend: glassEasel.GeneralBackendContext
  componentSpace: glassEasel.ComponentSpace
  resolveAssetUrl?: AssetUrlResolver
  resolveProtocolRelativeUrl?: ProtocolRelativeUrlResolver
  componentSchemas: Map<string, MiniProgramComponentSchema>
  collectUsedComponentPaths(
    path: string,
    config?: Record<string, any>,
    usingByPath?: Map<string, Record<string, string>>,
  ): Set<string>
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
}

/**
 * Owns the logic tree's style scopes, stylesheet contents and cascade roles.
 * The adapter only decides when to register; this class owns the style model.
 */
export class GlassStyleRegistry {
  private readonly styleScopeIds = new Map<string, number>()
  private readonly scopeIdsByName = new Map<string, number>()
  private readonly styleContents = new Map<string, string>()
  private readonly styleByEntryPath = new Map<string, StyleArtifact>()
  private readonly pageStyleScopes = new Map<string, number>()
  private readonly sharedStylesApplied = new Set<string>()
  private appPageScopeTemplate?: { style: StyleArtifact; css: string }

  constructor(private readonly host: GlassStyleHost) {}

  registerStyles(
    manifest: Manifest,
    loadStyle: StyleLoader = () => '',
    componentSchemas: MiniProgramComponentSchema[] = [],
    options: StyleRegistrationOptions = {},
  ): void {
    const selectedPage = options.pagePath
      ? manifest.pages.find((page) => page.path === options.pagePath)
      : undefined
    if (options.pagePath && !selectedPage) {
      throw new Error(`page is not declared: ${options.pagePath}`)
    }
    const allowedStyleOutputPaths = selectedPage
      ? this.collectPageStylePaths(manifest, selectedPage, componentSchemas)
      : undefined
    const appStyleOutputPath = manifest.app?.style?.outputPath
    const styleEntryPaths = this.collectStyleEntryPaths(manifest)
    const styleRoles = this.collectStyleRoles(manifest)
    const pending: Array<{ style: StyleArtifact; scopeId: number }> = []
    const lowPriorityPending: Array<{ style: StyleArtifact; scopeId: number }> = []
    for (const style of manifest.styles) {
      if (
        allowedStyleOutputPaths
        && style.outputPath !== appStyleOutputPath
        && !style.pageScopeClassSign
        && !allowedStyleOutputPaths.has(style.outputPath)
      ) continue
      const css = this.loadStyleText(style.outputPath, loadStyle)
      if (css === undefined) continue
      // The page-scope template is not a sheet of its own: it is expanded per
      // page scope below, before page/component sheets are appended.
      if (style.pageScopeClassSign) {
        this.appPageScopeTemplate = { style, css }
        continue
      }
      this.host.backend.registerStyleSheetContent(style.outputPath, css)
      this.styleContents.set(style.path, css)
      const scopeId = style.scope
        ? this.registerScope(style.scope)
        : glassEasel.StyleScopeManager.globalScope()
      if (style.lowPriorityPath) {
        const lowPriorityCss = this.loadStyleText(style.lowPriorityPath, loadStyle)
        if (lowPriorityCss !== undefined && lowPriorityCss.trim().length > 0) {
          this.host.backend.registerStyleSheetContent(
            `${style.outputPath}@low-priority`,
            lowPriorityCss,
          )
          lowPriorityPending.push({ style, scopeId })
        }
      }
      this.styleScopeIds.set(style.path, scopeId)
      this.styleByEntryPath.set(style.path, style)
      const entryPath = styleEntryPaths.get(style.outputPath)
      if (entryPath) {
        this.styleScopeIds.set(entryPath, scopeId)
        this.styleByEntryPath.set(entryPath, style)
      }
      pending.push({ style, scopeId })
    }

    // Append low-priority host defaults first, then the app sheet, its
    // page-scoped copies, and page/component sheets. This preserves the
    // mini-program cascade while keeping :host defaults overridable.
    for (const entry of lowPriorityPending) {
      this.appendStyleSheet(`${entry.style.outputPath}@low-priority`, entry.scopeId, {
        role: 'low-priority',
        ownerPath: entry.style.path,
      })
    }
    const appStyle = pending.find((entry) => entry.style.outputPath === appStyleOutputPath)
    if (appStyle) {
      this.appendStyleSheet(appStyle.style.outputPath, appStyle.scopeId, {
        role: 'app',
        ownerPath: appStyle.style.path,
      })
    }
    for (const scope of this.collectAppPageScopes(
      manifest,
      componentSchemas,
      options.pagePath,
    )) {
      this.appendAppPageScope(scope.scopeId, scope.pagePath)
    }
    for (const entry of pending) {
      if (entry === appStyle) continue
      this.appendStyleSheet(entry.style.outputPath, entry.scopeId, {
        role: styleRoles.get(entry.style.outputPath) ?? 'other',
        ownerPath: entry.style.path,
      })
    }
  }

  /** Compiler-assigned style scope of a mounted page, if it has one. */
  pageScopeName(pagePath: string): string | undefined {
    const scopeId = this.pageStyleScopes.get(pagePath)
    if (scopeId === undefined) return undefined
    return this.host.componentSpace.styleScopeManager.queryName(scopeId)
  }

  scopeForStyle(path: string): number | undefined {
    return this.styleScopeIds.get(path)
  }

  ensurePageScope(page: PageArtifact): number {
    const existing = this.pageStyleScopes.get(page.path)
    if (existing !== undefined) return existing
    const style = page.style
    if (style?.scope) {
      const scopeId = this.styleScopeIds.get(style.path) ?? this.registerScope(style.scope)
      this.pageStyleScopes.set(page.path, scopeId)
      return scopeId
    }
    const scopeId = this.registerScope(`page-${page.path.replace(/[^a-zA-Z0-9_-]/g, '-')}`)
    this.pageStyleScopes.set(page.path, scopeId)
    return scopeId
  }

  applySharedComponentStyles(page: PageArtifact, pageScope: number): void {
    const pageScopeName = this.host.componentSpace.styleScopeManager.queryName(pageScope)
    if (!pageScopeName) return
    const used = this.host.collectUsedComponentPaths(page.path, page.configuration)
    for (const componentPath of used) {
      const schema = this.host.componentSchemas.get(componentPath)
      if (!schema || schema.options?.styleIsolation !== 'shared') continue
      const cacheKey = `${page.path}:${componentPath}`
      if (this.sharedStylesApplied.has(cacheKey)) continue
      this.sharedStylesApplied.add(cacheKey)
      const style = this.styleByEntryPath.get(componentPath)
      if (!style) continue
      const componentScopeId = this.styleScopeIds.get(componentPath)
      const componentScopeName = componentScopeId !== undefined
        ? this.host.componentSpace.styleScopeManager.queryName(componentScopeId)
        : undefined
      const css = this.styleContents.get(style.path)
      if (!componentScopeName || !css) {
        this.host.onDiagnostic?.(createRuntimeDiagnostic(
          'warning',
          DIAGNOSTIC_CODES.STYLE_ISOLATION_FALLBACK,
          `Unable to re-scope shared styles for "${componentPath}"; falling back to apply-shared behavior.`,
          'render',
          undefined,
          { componentPath, page: page.path },
        ))
        continue
      }
      const rescoped = css.split(componentScopeName).join(pageScopeName)
      const sharedPath = `${style.outputPath}${TINY_ENGINE_NAMING.sharedSheetMarker}${pageScope}`
      this.host.backend.registerStyleSheetContent(sharedPath, rescoped)
      this.appendStyleSheet(sharedPath, pageScope, {
        role: 'shared',
        ownerPath: page.path,
      })
    }
  }

  /**
   * Load one stylesheet and map its compiler-normalized app-root `url(...)`
   * values to host URLs. Relative values are left untouched; the compiler
   * resolves them against the WXSS file that authored them.
   */
  private loadStyleText(outputPath: string, loadStyle: StyleLoader): string | undefined {
    const css = loadStyle(outputPath)
    if (typeof css !== 'string') return undefined
    if (
      (!this.host.resolveAssetUrl && !this.host.resolveProtocolRelativeUrl)
      || css.length === 0
    ) return css
    try {
      return mapCssAssetUrls(
        css,
        this.host.resolveAssetUrl ?? (() => undefined),
        this.host.resolveProtocolRelativeUrl,
      )
    } catch {
      return css
    }
  }

  private registerScope(name: string): number {
    const existing = this.scopeIdsByName.get(name)
    if (existing !== undefined) return existing
    const scopeId = this.host.componentSpace.styleScopeManager.register(name)
    this.scopeIdsByName.set(name, scopeId)
    return scopeId
  }

  /**
   * Page scopes that need a page-scoped copy of the app stylesheet.
   *
   * Page elements get unscoped class names, so the global app sheet already
   * styles them. Components only receive page classes when their isolation is
   * `apply-shared`/`shared` (page scope as extra scope), so only pages using
   * such components need the expanded copy. Isolated components never get the
   * page scope.
   */
  private collectAppPageScopes(
    manifest: Manifest,
    schemas: MiniProgramComponentSchema[],
    pagePath?: string,
  ): Array<{ scopeId: number; pagePath: string }> {
    if (!this.appPageScopeTemplate || schemas.length === 0) return []
    const isolation = new Map(
      schemas.map((schema) => [schema.path, schema.options?.styleIsolation ?? 'isolated']),
    )
    const using = new Map(schemas.map((schema) => [schema.path, schema.using]))
    const scopes: Array<{ scopeId: number; pagePath: string }> = []
    for (const page of manifest.pages) {
      if (pagePath && page.path !== pagePath) continue
      const used = this.host.collectUsedComponentPaths(page.path, page.configuration, using)
      const needsAppScope = [...used].some((path) =>
        isolation.get(path) === 'apply-shared' || isolation.get(path) === 'shared')
      if (needsAppScope) scopes.push({ scopeId: this.ensurePageScope(page), pagePath: page.path })
    }
    return scopes
  }

  private collectPageStylePaths(
    manifest: Manifest,
    page: PageArtifact,
    schemas: MiniProgramComponentSchema[],
  ): Set<string> {
    const paths = new Set<string>()
    if (page.style) paths.add(page.style.outputPath)
    const using = new Map(schemas.map((schema) => [schema.path, schema.using]))
    const components = new Map(manifest.components.map((component) => [component.path, component]))
    for (const componentPath of this.host.collectUsedComponentPaths(
      page.path,
      page.configuration,
      using,
    )) {
      const style = components.get(componentPath)?.style
      if (style) paths.add(style.outputPath)
    }
    return paths
  }

  /**
   * Append a stylesheet together with its cascade role. Only the logic backend
   * records the metadata; a DOM backend simply ignores the extra argument.
   */
  private appendStyleSheet(
    path: string,
    scope: number | undefined,
    meta: { role: LogicStyleSheetRole; ownerPath?: string },
  ): void {
    ;(this.host.backend as unknown as {
      appendStyleSheetPath: (
        target: string,
        targetScope?: number,
        targetMeta?: { role: LogicStyleSheetRole; ownerPath?: string },
      ) => number
    }).appendStyleSheetPath(path, scope, meta)
  }

  private collectStyleRoles(manifest: Manifest): Map<string, LogicStyleSheetRole> {
    const roles = new Map<string, LogicStyleSheetRole>()
    for (const page of manifest.pages) {
      if (page.style) roles.set(page.style.outputPath, 'page')
    }
    for (const component of manifest.components) {
      if (component.style) roles.set(component.style.outputPath, 'component')
    }
    return roles
  }

  private collectStyleEntryPaths(manifest: Manifest): Map<string, string> {
    const entries = new Map<string, string>()
    if (manifest.app?.style) {
      entries.set(manifest.app.style.outputPath, manifest.app.path)
    }
    for (const page of manifest.pages) {
      if (page.style) entries.set(page.style.outputPath, page.path)
    }
    for (const component of manifest.components) {
      if (component.style) entries.set(component.style.outputPath, component.path)
    }
    return entries
  }

  private appendAppPageScope(pageScope: number, pagePath: string): void {
    const template = this.appPageScopeTemplate
    const sign = template?.style.pageScopeClassSign
    if (!template || !sign) return
    const scopeName = this.host.componentSpace.styleScopeManager.queryName(pageScope)
    if (!scopeName) return
    const scoped = template.css
      .split(`.${sign}`).join(`.${scopeName}--${TINY_ENGINE_NAMING.scopeMarkerClass}`)
      .split(`="${sign}"`).join(`="${scopeName}"`)
      .split(`/*${sign}*/`).join(`${scopeName}--`)
    const path = `${template.style.outputPath}${TINY_ENGINE_NAMING.pageScopeSheetMarker}${pageScope}`
    this.host.backend.registerStyleSheetContent(path, scoped)
    this.appendStyleSheet(path, pageScope, {
      role: 'page-scope',
      ownerPath: pagePath,
    })
  }
}
