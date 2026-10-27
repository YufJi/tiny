import * as glassEasel from 'glass-easel'
import {
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
  type StyleArtifact,
} from '@tiny/manifest'
import type {
  BuiltinComponentDefinitions,
  BuiltinComponents,
  MiniProgramComponentSchema,
  StyleLoader,
  TemplateRegistry,
} from './types'
import { isNativeEventHandled, toJsonSafe, type SerializedEventNode, type SerializedMiniProgramEvent } from './events'
import { createRuntimeDiagnostic } from './diagnostics'
import { readComponentGenerics } from './component-schema'
import { parsePureDataPattern } from './component-definition'
import { resolveAssetPath, rewriteCssAssetUrls, splitAssetSuffix, type AssetUrlResolver } from './assets'

const NATIVE_COMPONENT_METHODS = new Set([
  'setData',
  'triggerEvent',
  'getBackendElement',
  'selectComponent',
  'selectAllComponents',
  'getRelationNodes',
  'getShadowRoot',
])

export type ComponentLifecyclePhase = 'created' | 'attached' | 'ready' | 'moved' | 'detached'

export type InspectNode = {
  id: string
  type: 'component' | 'element' | 'text'
  tag: string
  text?: string
  attributes?: Record<string, string>
  className?: string
  style?: string
  children: InspectNode[]
}

export type ComponentLifecycleMeta = {
  pageId: string | null
  parentComponentId: string | null
  tag: string
  id: string
  class: string
}

export type ComponentSnapshot = {
  componentId: string
  path: string
  parentComponentId: string | null
  tag: string
  id: string
  class: string
  data: Record<string, unknown>
}

export type PageComponentOptions = {
  styleIsolation?: 'isolated' | 'apply-shared' | 'shared'
  addGlobalClass?: boolean
  explicitStyleIsolation?: boolean
}

export type GlassEaselAdapterOptions = {
  backend: glassEasel.GeneralBackendContext
  manifest: Manifest
  templates: TemplateRegistry
  onMiniProgramEvent?: (pageId: string, event: SerializedMiniProgramEvent) => void
  onComponentLifecycle?: (
    componentId: string,
    path: string,
    phase: ComponentLifecyclePhase,
    data: Record<string, unknown>,
    meta?: ComponentLifecycleMeta,
  ) => void
  onComponentPageLifetime?: (
    componentId: string,
    path: string,
    phase: 'show' | 'hide',
    data: Record<string, unknown>,
  ) => void
  onComponentData?: (payload: {
    componentId: string
    path: string
    pageId: string | null
    data: Record<string, unknown>
    origin: 'service' | 'render'
  }) => void
  onComponentObserved?: (payload: {
    componentId: string
    path: string
    pageId: string | null
    key: string
    data: Record<string, unknown>
    origin: 'service' | 'render'
  }) => void
  onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
  /** Host-provided implementations of the mini-program built-in tags. */
  builtinComponents?: BuiltinComponents
  /** Host hook mapping app-root asset paths to loadable URLs. */
  resolveAssetUrl?: AssetUrlResolver
  /** Attach the created root component to a host-provided backend tree. */
  mountComponent?: (component: glassEasel.GeneralComponent) => void
  /** Detach the root component from the host-provided backend tree. */
  unmountComponent?: (component: glassEasel.GeneralComponent) => void
}

export type StyleRegistrationOptions = {
  /**
   * Register only global styles and sheets reachable from this page.
   * Per-page render threads use this because one frame mounts one page only.
   */
  pagePath?: string
}

export class GlassEaselRuntimeAdapter {
  readonly backend: glassEasel.GeneralBackendContext
  readonly componentSpace: glassEasel.ComponentSpace
  /** Internal marker behavior for custom form-field components. */
  private readonly formFieldBehavior: glassEasel.GeneralBehavior
  private readonly manifest: Manifest
  private readonly templates: TemplateRegistry
  private readonly styleScopeIds = new Map<string, number>()
  private readonly scopeIdsByName = new Map<string, number>()
  private readonly styleContents = new Map<string, string>()
  private readonly styleByEntryPath = new Map<string, StyleArtifact>()
  private readonly pageStyleScopes = new Map<string, number>()
  private readonly pageComponentOptions = new Map<string, PageComponentOptions>()
  private readonly sharedStylesApplied = new Set<string>()
  private appPageScopeTemplate?: { style: StyleArtifact; css: string }
  private readonly componentDefinitions = new Map<string, glassEasel.GeneralComponentDefinition>()
  private readonly registeringComponents = new Set<string>()
  private readonly pages = new Map<string, PageArtifact>()
  private readonly mountedComponents = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentsByPageId = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentSchemas = new Map<string, MiniProgramComponentSchema>()
  private readonly componentInstances = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentIds = new WeakMap<object, string>()
  private readonly componentPaths = new WeakMap<object, string>()
  /** Page/component source entry paths used for asset resolution. */
  private readonly componentSourcePaths = new WeakMap<object, string>()
  private readonly emittedLifecycles = new WeakMap<object, Set<ComponentLifecyclePhase>>()
  private readonly componentUsageCounters = new Map<string, number>()
  private readonly applyingServicePatches = new Set<glassEasel.GeneralComponent>()
  private readonly methodCallerComponents = new WeakMap<object, glassEasel.GeneralComponent>()
  private activeEventPageId: string | null = null
  private activeComponentIdPrefix = ''
  private readonly onMiniProgramEvent?: (pageId: string, event: SerializedMiniProgramEvent) => void
  private readonly onComponentLifecycle?: (
    componentId: string,
    path: string,
    phase: ComponentLifecyclePhase,
    data: Record<string, unknown>,
    meta?: ComponentLifecycleMeta,
  ) => void
  private readonly onComponentPageLifetime?: (
    componentId: string,
    path: string,
    phase: 'show' | 'hide',
    data: Record<string, unknown>,
  ) => void
  private readonly onComponentData?: GlassEaselAdapterOptions['onComponentData']
  private readonly onComponentObserved?: GlassEaselAdapterOptions['onComponentObserved']
  private readonly builtinComponents: BuiltinComponentDefinitions
  private readonly builtinStyles: NonNullable<BuiltinComponents['styles']>
  private readonly onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
  private readonly mountComponent?: (component: glassEasel.GeneralComponent) => void
  private readonly resolveAssetUrl?: AssetUrlResolver
  private builtinStylesRegistered = false
  private readonly unmountComponent?: (component: glassEasel.GeneralComponent) => void

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.manifest = options.manifest
    this.templates = options.templates
    this.onMiniProgramEvent = options.onMiniProgramEvent
    this.onComponentLifecycle = options.onComponentLifecycle
    this.onComponentPageLifetime = options.onComponentPageLifetime
    this.onComponentData = options.onComponentData
    this.onComponentObserved = options.onComponentObserved
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
    this.componentSpace.updateComponentOptions({
      hostNodeTagName: TINY_ENGINE_NAMING.hostNodeTagName,
      reflectToAttributes: true,
    })
    this.formFieldBehavior = this.componentSpace.defineBehavior({
      is: TINY_ENGINE_NAMING.formFieldBehaviorId,
    })
    this.onDiagnostic = options.onDiagnostic
    this.mountComponent = options.mountComponent
    this.unmountComponent = options.unmountComponent
    this.resolveAssetUrl = options.resolveAssetUrl
    this.builtinStyles = options.builtinComponents?.styles ?? []
    this.builtinComponents = options.builtinComponents
      ? options.builtinComponents.create(this.componentSpace, {
          registerStyleScope: (name) => this.registerScope(name),
          onDiagnostic: (diagnostic) => this.onDiagnostic?.(createRuntimeDiagnostic(
            diagnostic.severity,
            diagnostic.code,
            diagnostic.message,
            'render',
            this.activeEventPageId ?? undefined,
            diagnostic.details,
          )),
          resolveAssetUrl: options.resolveAssetUrl
            ? (src, component) => this.resolveComponentAssetUrl(src, component)
            : undefined,
        })
      : {}
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.componentSchemas.set(schema.path, schema)
      this.registerComponentDefinition(schema)
    }
  }

  registerStyles(
    manifest: Manifest,
    loadStyle: StyleLoader = () => '',
    componentSchemas: MiniProgramComponentSchema[] = [],
    options: StyleRegistrationOptions = {},
  ): void {
    if (!this.builtinStylesRegistered && this.builtinStyles.length > 0) {
      for (const style of this.builtinStyles) {
        const scopeId = style.scope
          ? this.registerScope(style.scope)
          : glassEasel.StyleScopeManager.globalScope()
        this.backend.registerStyleSheetContent(style.path, style.content)
        this.backend.appendStyleSheetPath(style.path, scopeId)
      }
      this.builtinStylesRegistered = true
    }
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
    const pending: Array<{ style: StyleArtifact; scopeId: number }> = []
    const lowPriorityPending: Array<{ style: StyleArtifact; scopeId: number }> = []
    for (const style of manifest.styles) {
      if (
        allowedStyleOutputPaths
        && style.outputPath !== appStyleOutputPath
        && !style.pageScopeClassSign
        && !allowedStyleOutputPaths.has(style.outputPath)
      ) continue
      let css = loadStyle(style.outputPath)
      if (typeof css !== 'string') continue
      if (this.resolveAssetUrl) {
        css = rewriteCssAssetUrls(css, style.sourcePath, this.resolveAssetUrl)
      }
      // The page-scope template is not a sheet of its own: it is expanded per
      // page scope below, before page/component sheets are appended.
      if (style.pageScopeClassSign) {
        this.appPageScopeTemplate = { style, css }
        continue
      }
      this.backend.registerStyleSheetContent(style.outputPath, css)
      this.styleContents.set(style.path, css)
      const scopeId = style.scope
        ? this.registerScope(style.scope)
        : glassEasel.StyleScopeManager.globalScope()
      if (style.lowPriorityPath) {
        let lowPriorityCss = loadStyle(style.lowPriorityPath)
        if (typeof lowPriorityCss === 'string' && lowPriorityCss.trim().length > 0) {
          if (this.resolveAssetUrl) {
            lowPriorityCss = rewriteCssAssetUrls(
              lowPriorityCss,
              style.sourcePath,
              this.resolveAssetUrl,
            )
          }
          this.backend.registerStyleSheetContent(`${style.outputPath}@low-priority`, lowPriorityCss)
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
      this.backend.appendStyleSheetPath(`${entry.style.outputPath}@low-priority`, entry.scopeId)
    }
    const appStyle = pending.find((entry) => entry.style.outputPath === appStyleOutputPath)
    if (appStyle) {
      this.backend.appendStyleSheetPath(appStyle.style.outputPath, appStyle.scopeId)
    }
    for (const scopeId of this.collectAppPageScopes(
      manifest,
      componentSchemas,
      options.pagePath,
    )) {
      this.appendAppPageScope(scopeId)
    }
    for (const entry of pending) {
      if (entry === appStyle) continue
      this.backend.appendStyleSheetPath(entry.style.outputPath, entry.scopeId)
    }
  }

  setPageComponentOptions(items: Array<{ path: string; options?: PageComponentOptions }>): void {
    for (const item of items) {
      if (item.options) this.pageComponentOptions.set(item.path, item.options)
    }
  }

  registerPage(page: PageArtifact, data: Record<string, unknown> = {}): glassEasel.GeneralComponentDefinition {
    const existing = this.componentDefinitions.get(page.path)
    if (existing) return existing
    if (!this.templates.groupList[page.path]) {
      throw new Error(`glass-easel template not found: ${page.path}`)
    }

    const pageScope = this.ensurePageScope(page)
    const pageIsolation = this.resolvePageIsolation(page)
    const childStyleScope = pageIsolation === 'isolated' ? undefined : pageScope
    const using = this.resolveComponentUsing(page.path, page.configuration, childStyleScope)
    const effective = (page.configuration?.effective ?? {}) as Record<string, unknown>
    const generics = this.resolveGenerics(page.path, readComponentGenerics(effective))
    const pureDataPattern = parsePureDataPattern(effective.pureDataPattern)
    if (pageIsolation !== 'isolated') this.applySharedComponentStyles(page, pageScope)
    const definition = this.componentSpace
      .defineWithMethodCaller(page.path)
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(page.path, name),
      })
      .data(() => data)
      .usingComponents(using as never)
      .generics(generics as never)
      .options({
        multipleSlots: true,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: pageScope,
        ...(pureDataPattern ? { pureDataPattern } : {}),
        // Keep page/component classes scoped, but also expose the unscoped
        // class names so global app stylesheet class selectors can match.
        // Without this, glass-easel only writes `<pageScope>--<class>` to the
        // DOM and every app class rule is dead.
        extraStyleScope: glassEasel.StyleScopeManager.globalScope(),
      })
      .methodCallerInit(() => this.createEventMethodCaller(this.activeEventPageId ?? page.path))
      .registerComponent()
    this.componentDefinitions.set(page.path, definition)
    return definition
  }

  private resolvePageIsolation(page: PageArtifact): 'isolated' | 'apply-shared' | 'shared' {
    if (page.bodyType !== 'component') return 'shared'
    const options = this.pageComponentOptions.get(page.path)
    if (options?.explicitStyleIsolation && options.styleIsolation) return options.styleIsolation
    if (options?.addGlobalClass) return 'apply-shared'
    return 'shared'
  }

  private registerScope(name: string): number {
    const existing = this.scopeIdsByName.get(name)
    if (existing !== undefined) return existing
    const scopeId = this.componentSpace.styleScopeManager.register(name)
    this.scopeIdsByName.set(name, scopeId)
    return scopeId
  }

  private ensurePageScope(page: PageArtifact): number {
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

  private applySharedComponentStyles(page: PageArtifact, pageScope: number): void {
    const pageScopeName = this.componentSpace.styleScopeManager.queryName(pageScope)
    if (!pageScopeName) return
    const used = this.collectUsedComponentPaths(page.path, page.configuration)
    for (const componentPath of used) {
      const schema = this.componentSchemas.get(componentPath)
      if (!schema || schema.options?.styleIsolation !== 'shared') continue
      const cacheKey = `${page.path}:${componentPath}`
      if (this.sharedStylesApplied.has(cacheKey)) continue
      this.sharedStylesApplied.add(cacheKey)
      const style = this.styleByEntryPath.get(componentPath)
      if (!style) continue
      const componentScopeId = this.styleScopeIds.get(componentPath)
      const componentScopeName = componentScopeId !== undefined
        ? this.componentSpace.styleScopeManager.queryName(componentScopeId)
        : undefined
      const css = this.styleContents.get(style.path)
      if (!componentScopeName || !css) {
        this.onDiagnostic?.(createRuntimeDiagnostic(
          'warning',
          'STYLE_ISOLATION_FALLBACK',
          `Unable to re-scope shared styles for "${componentPath}"; falling back to apply-shared behavior.`,
          'render',
          this.activeEventPageId ?? undefined,
          { componentPath, page: page.path },
        ))
        continue
      }
      const rescoped = css.split(componentScopeName).join(pageScopeName)
      const sharedPath = `${style.outputPath}@shared:${pageScope}`
      this.backend.registerStyleSheetContent(sharedPath, rescoped)
      this.backend.appendStyleSheetPath(sharedPath, pageScope)
    }
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
  ): number[] {
    if (!this.appPageScopeTemplate || schemas.length === 0) return []
    const isolation = new Map(
      schemas.map((schema) => [schema.path, schema.options?.styleIsolation ?? 'isolated']),
    )
    const using = new Map(schemas.map((schema) => [schema.path, schema.using]))
    const scopes: number[] = []
    for (const page of manifest.pages) {
      if (pagePath && page.path !== pagePath) continue
      const used = this.collectUsedComponentPaths(page.path, page.configuration, using)
      const needsAppScope = [...used].some((path) =>
        isolation.get(path) === 'apply-shared' || isolation.get(path) === 'shared')
      if (needsAppScope) scopes.push(this.ensurePageScope(page))
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
    for (const componentPath of this.collectUsedComponentPaths(
      page.path,
      page.configuration,
      using,
    )) {
      const style = components.get(componentPath)?.style
      if (style) paths.add(style.outputPath)
    }
    return paths
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

  private appendAppPageScope(pageScope: number): void {
    const template = this.appPageScopeTemplate
    const sign = template?.style.pageScopeClassSign
    if (!template || !sign) return
    const scopeName = this.componentSpace.styleScopeManager.queryName(pageScope)
    if (!scopeName) return
    const scoped = template.css
      .split(`.${sign}`).join(`.${scopeName}--${TINY_ENGINE_NAMING.scopeMarkerClass}`)
      .split(`="${sign}"`).join(`="${scopeName}"`)
      .split(`/*${sign}*/`).join(`${scopeName}--`)
    const path = `${template.style.outputPath}@page:${pageScope}`
    this.backend.registerStyleSheetContent(path, scoped)
    this.backend.appendStyleSheetPath(path, pageScope)
  }

  whenRendered(): Promise<void> {
    return new Promise((resolve) => {
      const backend = this.backend as unknown as {
        render?: (callback: (error: Error | null) => void) => void
      }
      if (typeof backend.render === 'function') backend.render(() => resolve())
      else resolve()
    })
  }

  getComponentCount(): number {
    return this.componentInstances.size
  }

  getComponentSnapshot(): ComponentSnapshot[] {
    const items: ComponentSnapshot[] = []
    for (const [componentId, component] of this.componentInstances) {
      const path = this.componentPaths.get(component as unknown as object)
      if (!path) continue
      const element = component as unknown as {
        tagName?: unknown
        is?: unknown
        id?: unknown
        class?: unknown
      }
      const parentComponentId = this.findParentComponentId(component)
      items.push({
        componentId,
        path,
        parentComponentId,
        tag: typeof element.tagName === 'string'
          ? element.tagName
          : (typeof element.is === 'string' ? element.is : path),
        id: typeof element.id === 'string' ? element.id : '',
        class: typeof element.class === 'string' ? element.class : '',
        data: (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
      })
    }
    const byId = new Map(items.map((item) => [item.componentId, item]))
    const depth = (item: ComponentSnapshot): number => {
      let value = 0
      let parent = item.parentComponentId
      while (parent) {
        value += 1
        parent = byId.get(parent)?.parentComponentId ?? null
      }
      return value
    }
    items.sort((a, b) => depth(a) - depth(b))
    return items
  }

  registerPageArtifact(page: PageArtifact): void {
    this.pages.set(page.path, page)
  }

  registerPageComponent(pageId: string, component: glassEasel.GeneralComponent): void {
    this.componentsByPageId.set(pageId, component)
  }

  private componentIdFor(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): string {
    const key = component as unknown as object
    const existing = this.componentIds.get(key)
    if (existing) return existing
    const usage = (this.componentUsageCounters.get(schema.path) ?? 0) + 1
    this.componentUsageCounters.set(schema.path, usage)
    const baseId = usage === 1 ? schema.componentId : `${schema.componentId}~${usage}`
    const componentId = `${this.activeComponentIdPrefix}${baseId}`
    this.componentIds.set(key, componentId)
    this.componentPaths.set(key, schema.path)
    this.componentSourcePaths.set(key, schema.path)
    this.componentInstances.set(componentId, component)
    return componentId
  }

  private resolveComponentAssetUrl(src: string, component: unknown): string {
    if (!this.resolveAssetUrl || !src) return src
    const sourcePath = this.componentSourcePath(component)
    if (!sourcePath) return src
    const assetPath = resolveAssetPath(sourcePath, src)
    if (!assetPath) return src
    const { suffix } = splitAssetSuffix(src)
    try {
      const resolved = this.resolveAssetUrl(assetPath, { sourcePath })
      return resolved ? `${resolved}${suffix}` : src
    } catch {
      return src
    }
  }

  private componentSourcePath(component: unknown): string | undefined {
    let current: unknown = component
    for (let depth = 0; current && depth < 32; depth += 1) {
      const mapped = this.componentSourcePaths.get(current as object)
      if (mapped) return mapped
      const owner = (current as {
        ownerShadowRoot?: { getHostNode?: () => unknown } | null
      }).ownerShadowRoot?.getHostNode?.()
      if (owner && owner !== current) {
        current = owner
        continue
      }
      const parent = (current as { parentNode?: unknown }).parentNode
      if (parent) {
        current = parent
        continue
      }
      break
    }
    return undefined
  }

  getMountedComponentByPageId(pageId: string): glassEasel.GeneralComponent | undefined {
    return this.componentsByPageId.get(pageId)
  }

  getMountedComponentByComponentId(componentId: string): glassEasel.GeneralComponent | undefined {
    return this.componentInstances.get(componentId)
  }

  mountPage(
    path: string,
    data: Record<string, unknown> = {},
    pageId?: string,
  ): glassEasel.GeneralComponent {
    const page = this.pages.get(path)
    if (!page) throw new Error(`page is not registered: ${path}`)
    this.activeEventPageId = pageId ?? path
    // Component IDs are scoped per page in the service instance registry. Two
    // pages using the same global component would otherwise resolve to the
    // first page's component instance (and its event method callers).
    this.activeComponentIdPrefix = pageId ? `${pageId}:` : ''
    const component = glassEasel.Component.createWithContext(
      'page',
      this.registerPage(page, data),
      this.backend,
    )
    // App-global selectors are anchored to this unprefixed marker so the page
    // root participates without exposing built-in component internals.
    component.classList?.toggle(TINY_ENGINE_NAMING.scopeMarkerClass, true)
    this.componentSourcePaths.set(component as unknown as object, path)
    this.mountedComponents.set(path, component)
    if (pageId) this.componentsByPageId.set(pageId, component)
    component.setData(data)
    if (this.mountComponent) this.mountComponent(component)
    else glassEasel.Element.pretendAttached(component)
    component.triggerLifetime('ready', [])
    for (const [componentId, instance] of this.componentInstances) {
      if (this.emittedLifecycles.get(instance as unknown as object)?.has('ready')) continue
      const path = this.componentPaths.get(instance as unknown as object) ?? instance.is
      this.emitLifecycle(componentId, path, 'ready', instance)
    }
    return component
  }

  unmountPage(pageId: string): void {
    const component = this.componentsByPageId.get(pageId)
    if (!component) return
    this.componentSourcePaths.delete(component as unknown as object)
    this.unmountComponent?.(component)
    if (typeof (component as unknown as { destroy?: () => void }).destroy === 'function') {
      (component as unknown as { destroy: () => void }).destroy()
    } else {
      component.destroyBackendElement()
    }
    this.componentsByPageId.delete(pageId)
    this.mountedComponents.delete(component.is)
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }

  inspectTree(pageId?: string): InspectNode | null {
    const component = pageId
      ? this.componentsByPageId.get(pageId)
      : this.mountedComponents.get(this.activeEventPageId ?? '')
        ?? [...this.mountedComponents.values()].at(-1)
    if (!component) return null
    const backend = (component as unknown as { getBackendElement?: () => unknown }).getBackendElement?.()
    if (isDomInspectNode(backend)) {
      const budget = { count: 0 }
      const domTree = serializeDomNode(backend, '0', 0, budget, TINY_ENGINE_NAMING.hostAttribute)
      if (domTree) return { ...domTree, type: 'component' }
    }
    return this.inspectLogicalTree(component)
  }

  private inspectLogicalTree(component: glassEasel.GeneralComponent): InspectNode | null {
    const shadow = (component as unknown as { shadowRoot?: { childNodes?: unknown[] } }).shadowRoot
    const nodes = shadow?.childNodes
      ?? (component as unknown as { childNodes?: unknown[] }).childNodes
      ?? []
    const budget = { count: 0 }
    const root: InspectNode = {
      id: '0',
      type: 'component',
      tag: component.is,
      children: nodes
        .map((node, index) => serializeInspectNode(node, `0.${index}`, 1, budget))
        .filter((node): node is InspectNode => node !== null),
    }
    const attributes = serializeAttributes(component as unknown as InspectElementLike)
    if (Object.keys(attributes).length > 0) root.attributes = attributes
    const className = readClassName(component as unknown as InspectElementLike)
    if (className) root.className = className
    const style = readStyle(component as unknown as InspectElementLike)
    if (style) root.style = style
    return root
  }

  triggerComponentEvent(
    componentId: string,
    name: string,
    detail: unknown,
    options?: Record<string, unknown>,
  ): void {
    const component = this.componentInstances.get(componentId)
    component?.triggerEvent(name, detail, options as never)
  }

  private registerComponentDefinition(
    schema: MiniProgramComponentSchema,
    pageScope?: number,
  ): glassEasel.GeneralComponentDefinition {
    const cacheKey = `${schema.path}@${pageScope ?? 'base'}`
    const existing = this.componentDefinitions.get(cacheKey)
    if (existing) return existing

    this.registeringComponents.add(schema.path)
    const using = Object.fromEntries(
      Object.entries(schema.using).map(([tag, reference]) => {
        const path = this.resolveComponentReference(schema.path, reference)
        const dependency = this.componentSchemas.get(path)
        if (!dependency) return [tag, path]
        // Taro emits mutually recursive component metadata; break the cycle by
        // referencing the path while the definition is still being built.
        if (this.registeringComponents.has(path)) return [tag, path]
        return [tag, this.registerComponentDefinition(dependency, pageScope)]
      }),
    )
    const styleScopeId = this.styleScopeIds.get(schema.path)
    const isolation = schema.options?.styleIsolation ?? 'isolated'
    const extraStyleScope = (isolation === 'apply-shared' || isolation === 'shared')
      ? pageScope
      : undefined
    const adapter = this
    const observers: Array<{ fields: string; observer: (this: glassEasel.GeneralComponent) => void }> = []
    observers.push({
      fields: '**',
      observer: function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.emitComponentData(schema, component)
      },
    })
    for (const observer of schema.observers ?? []) {
      observers.push({
        fields: observer.paths.join(','),
        observer: function (this: glassEasel.GeneralComponent) {
          const component = adapter.resolveMethodCaller(this)
          if (component) adapter.emitComponentObserved(schema, observer.key, component)
        },
      })
    }

    const generics = this.resolveGenerics(schema.path, schema.generics)
    const pureDataPattern = parsePureDataPattern(schema.pureDataPattern)
    const definition = this.componentSpace
      .defineWithMethodCaller(schema.path)
      .definition({
        properties: schema.properties as never,
        externalClasses: schema.externalClasses,
        behaviors: schema.formField ? [this.formFieldBehavior] : undefined,
        observers: observers as never,
      })
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(schema.path, name),
      })
      .data(() => schema.data as never)
      .usingComponents({ ...this.builtinComponents, ...using } as never)
      .generics(generics as never)
      .options({
        multipleSlots: schema.options?.multipleSlots ?? false,
        virtualHost: schema.options?.virtualHost ?? false,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: styleScopeId,
        extraStyleScope,
        ...(pureDataPattern ? { pureDataPattern } : {}),
      })
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        const methodCaller = adapter.createEventMethodCaller(
          adapter.activeEventPageId ?? schema.path,
          adapter.componentIdFor(schema, this),
          this,
          schema.path,
        )
        adapter.methodCallerComponents.set(methodCaller as object, this)
        return methodCaller
      })
      .lifetime('created', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.emitComponentLifecycle(schema, 'created', component)
      })
      .lifetime('attached', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.emitComponentLifecycle(schema, 'attached', component)
      })
      .lifetime('ready', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.emitComponentLifecycle(schema, 'ready', component)
      })
      .lifetime('moved', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.emitComponentLifecycle(schema, 'moved', component)
      })
      .lifetime('detached', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (!component) return
        adapter.emitComponentLifecycle(schema, 'detached', component)
        adapter.cleanupComponent(schema, component)
      })
      .pageLifetime('show', function (this: unknown) {
        const component = adapter.resolveMethodCaller(this)
        if (!component) return
        adapter.onComponentPageLifetime?.(
          adapter.componentIdFor(schema, component),
          schema.path,
          'show',
          (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
        )
      })
      .pageLifetime('hide', function (this: unknown) {
        const component = adapter.resolveMethodCaller(this)
        if (!component) return
        adapter.onComponentPageLifetime?.(
          adapter.componentIdFor(schema, component),
          schema.path,
          'hide',
          (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
        )
      })
      .registerComponent()

    this.registeringComponents.delete(schema.path)
    this.componentDefinitions.set(cacheKey, definition)
    return definition
  }

  /**
   * Translate `componentGenerics` JSON into glass-easel generic declarations.
   * Default implementations are resolved as app-root paths (prefixed with `/`
   * so glass-easel does not resolve them relative to the declaring component).
   */
  private resolveGenerics(
    path: string,
    raw: Record<string, { default?: string } | true> | undefined,
  ): Record<string, { default?: string | glassEasel.GeneralComponentDefinition } | true> {
    const result: Record<
      string,
      { default?: string | glassEasel.GeneralComponentDefinition } | true
    > = {}
    for (const [alias, value] of Object.entries(raw ?? {})) {
      if (value === true || !value.default) {
        result[alias] = true
        continue
      }
      const builtin = this.builtinComponents[value.default]
      if (builtin) {
        result[alias] = { default: builtin }
        continue
      }
      result[alias] = { default: `/${this.resolveComponentReference(path, value.default)}` }
    }
    return result
  }

  private resolveComponentUsing(
    path: string,
    config?: Record<string, any>,
    pageScope?: number,
  ): Record<string, glassEasel.GeneralComponentDefinition | string> {
    const effective = config?.effective ?? {}
    const usingComponents = effective.usingComponents
    if (!usingComponents || typeof usingComponents !== 'object') {
      // Built-ins are available to every mini-program page even when it
      // declares no custom components.
      return { ...this.builtinComponents }
    }
    const resolved = Object.fromEntries(
      Object.entries(usingComponents as Record<string, unknown>).map(([tag, reference]) => {
        const sources = (config?.usingComponentsSource ?? {}) as Record<string, string>
        const sourcePath = sources[tag] === 'global' ? '' : path
        const componentPath = this.resolveComponentReference(sourcePath, String(reference))
        const definition = this.componentSchemas.get(componentPath)
        if (!definition) {
          this.onDiagnostic?.(createRuntimeDiagnostic(
            'warning',
            'UNSUPPORTED_COMPONENT',
            `Component "${tag}" is not registered; using a native fallback.`,
            'render',
            this.activeEventPageId ?? undefined,
            { tag, reference, componentPath },
          ))
        }
        return [tag, definition ? this.registerComponentDefinition(definition, pageScope) : componentPath]
      }),
    )
    return { ...this.builtinComponents, ...resolved }
  }

  private collectUsedComponentPaths(
    path: string,
    config?: Record<string, any>,
    usingByPath?: Map<string, Record<string, string>>,
  ): Set<string> {
    const result = new Set<string>()
    const visit = (sourcePath: string, current?: Record<string, any>) => {
      const effective = current?.effective ?? {}
      const usingComponents = effective.usingComponents
      if (!usingComponents || typeof usingComponents !== 'object') return
      const sources = (current?.usingComponentsSource ?? {}) as Record<string, string>
      for (const [tag, reference] of Object.entries(usingComponents as Record<string, unknown>)) {
        const source = sources[tag] === 'global' ? '' : sourcePath
        const componentPath = this.resolveComponentReference(source, String(reference))
        if (result.has(componentPath)) continue
        result.add(componentPath)
        const schema = this.componentSchemas.get(componentPath)
        const using = usingByPath?.get(componentPath) ?? schema?.using
        if (!using) continue
        visit(componentPath, {
          effective: { usingComponents: using },
          usingComponentsSource: {},
        })
      }
    }
    visit(path, config)
    return result
  }

  private resolveComponentReference(sourcePath: string, reference: string): string {
    if (reference.startsWith('/')) return reference.slice(1)
    const posix = (value: string) => value.split('\\').join('/')
    const directory = posix(sourcePath).split('/').slice(0, -1)
    const segments = [...directory, ...posix(reference).split('/')]
    const output: string[] = []
    for (const segment of segments) {
      if (!segment || segment === '.') continue
      if (segment === '..') output.pop()
      else output.push(segment)
    }
    return output.join('/')
  }

  private createEventMethodCaller(
    pageId: string,
    componentId?: string,
    component?: glassEasel.GeneralComponent,
    componentPath?: string,
  ): unknown {
    const adapter = this
    return new Proxy({}, {
      has() {
        return true
      },
      get(_target, property) {
        if (typeof property !== 'string') return undefined
        // glass-easel routes core instance methods through the method caller
        // when `useMethodCallerListeners` is enabled; forward those to the
        // component instead of treating them as mini-program event handlers.
        if (component && NATIVE_COMPONENT_METHODS.has(property)) {
          const method = (component as unknown as Record<string, unknown>)[property]
          if (typeof method === 'function') return method.bind(component)
        }
        return adapter.createEventDispatcher(pageId, property, componentId, component, componentPath)
      },
      getOwnPropertyDescriptor(_target, property) {
        if (typeof property !== 'string') return undefined
        return {
          configurable: true,
          enumerable: true,
        value: adapter.createEventDispatcher(pageId, property, componentId, component, componentPath),
        }
      },
    })
  }

  private createEventDispatcher(
    pageId: string,
    handler: string,
    componentId?: string,
    component?: glassEasel.GeneralComponent,
    componentPath?: string,
  ): (event: glassEasel.ShadowedEvent<unknown>) => void {
    return (event) => {
      // A built-in component may translate the native event into a normalized
      // mini-program event (canvas touches are the current case). Do not also
      // forward the raw native event to the same page handler.
      const original = (event as unknown as { getOriginalEvent?: () => unknown }).getOriginalEvent?.()
      if (String(event.type).startsWith('touch') && isNativeEventHandled(original)) return
      this.onMiniProgramEvent?.(pageId, {
        ...this.serializeEvent(handler, event),
        ...(componentId ? { componentId } : {}),
        ...(componentPath ? { componentPath } : {}),
        ...(component ? { componentData: toJsonSafe(component.data) as Record<string, unknown> } : {}),
      })
    }
  }

  private emitComponentLifecycle(
    schema: MiniProgramComponentSchema,
    phase: ComponentLifecyclePhase,
    component: glassEasel.GeneralComponent,
  ): void {
    this.emitLifecycle(this.componentIdFor(schema, component), schema.path, phase, component)
  }

  private emitLifecycle(
    componentId: string,
    path: string,
    phase: ComponentLifecyclePhase,
    component: glassEasel.GeneralComponent,
  ): void {
    const key = component as unknown as object
    let phases = this.emittedLifecycles.get(key)
    if (!phases) {
      phases = new Set()
      this.emittedLifecycles.set(key, phases)
    }
    phases.add(phase)
    let data: Record<string, unknown> = {}
    try {
      data = (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>
    } catch {
      // Component data may not be initialized yet during `created`.
    }
    this.onComponentLifecycle?.(componentId, path, phase, data, this.lifecycleMeta(component))
  }

  private lifecycleMeta(component: glassEasel.GeneralComponent): ComponentLifecycleMeta {
    const element = component as unknown as {
      tagName?: unknown
      id?: unknown
      class?: unknown
      ownerShadowRoot?: { getHostNode?: () => unknown }
    }
    return {
      pageId: this.activeEventPageId,
      parentComponentId: this.findParentComponentId(component),
      tag: typeof element.tagName === 'string'
        ? element.tagName
        : (typeof (component as unknown as { is?: unknown }).is === 'string'
            ? (component as unknown as { is: string }).is
            : ''),
      id: typeof element.id === 'string' ? element.id : '',
      class: typeof element.class === 'string' ? element.class : '',
    }
  }

  private findParentComponentId(component: glassEasel.GeneralComponent): string | null {
    let node = (component as unknown as { parentNode?: unknown }).parentNode
    while (node) {
      const path = this.componentPaths.get(node as object)
      if (path) {
        const schema = this.componentSchemas.get(path)
        if (schema) return this.componentIdFor(schema, node as glassEasel.GeneralComponent)
      }
      const host = (node as { getHostNode?: () => unknown }).getHostNode?.()
      if (host && host !== node) {
        node = host
        continue
      }
      node = (node as { parentNode?: unknown }).parentNode
    }
    return null
  }

  private resolveMethodCaller(caller: unknown): glassEasel.GeneralComponent | undefined {
    if (!caller || typeof caller !== 'object') return undefined
    const mapped = this.methodCallerComponents.get(caller as object)
    if (mapped) return mapped
    const candidate = caller as { is?: unknown; data?: unknown }
    if (typeof candidate.is === 'string' && candidate.data && typeof candidate.data === 'object') {
      return caller as glassEasel.GeneralComponent
    }
    return undefined
  }

  beginServicePatch(component: glassEasel.GeneralComponent): void {
    this.applyingServicePatches.add(component)
  }

  endServicePatch(component: glassEasel.GeneralComponent): void {
    this.applyingServicePatches.delete(component)
  }

  private emitComponentData(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): void {
    if (!this.onComponentData) return
    this.onComponentData({
      componentId: this.componentIdFor(schema, component),
      path: schema.path,
      pageId: this.activeEventPageId,
      data: (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
      origin: this.applyingServicePatches.has(component) ? 'service' : 'render',
    })
  }

  private emitComponentObserved(
    schema: MiniProgramComponentSchema,
    key: string,
    component: glassEasel.GeneralComponent,
  ): void {
    if (!this.onComponentObserved) return
    this.onComponentObserved({
      componentId: this.componentIdFor(schema, component),
      path: schema.path,
      pageId: this.activeEventPageId,
      key,
      data: (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>,
      origin: this.applyingServicePatches.has(component) ? 'service' : 'render',
    })
  }

  private cleanupComponent(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): void {
    const componentId = this.componentIds.get(component as unknown as object)
    if (componentId) this.componentInstances.delete(componentId)
    this.componentIds.delete(component as unknown as object)
    this.componentPaths.delete(component as unknown as object)
    this.componentSourcePaths.delete(component as unknown as object)
  }

  private serializeEvent(
    handler: string,
    event: glassEasel.ShadowedEvent<unknown>,
  ): SerializedMiniProgramEvent {
    const touches = toJsonSafe((event as unknown as Record<string, unknown>).touches)
    const changedTouches = toJsonSafe((event as unknown as Record<string, unknown>).changedTouches)
    return {
      handler,
      type: event.type,
      timeStamp: event.timeStamp,
      detail: toJsonSafe(event.detail) ?? null,
      bubbles: event.bubbles,
      composed: event.composed,
      capture: typeof event.isCapturePhase === 'function' ? event.isCapturePhase() : false,
      stopped: typeof event.propagationStopped === 'function' ? event.propagationStopped() : false,
      target: this.serializeEventNode(event.target),
      currentTarget: this.serializeEventNode(event.currentTarget),
      ...(touches !== undefined ? { touches } : {}),
      ...(changedTouches !== undefined ? { changedTouches } : {}),
    }
  }

  private serializeEventNode(element: glassEasel.Element): SerializedEventNode {
    return {
      id: typeof element.id === 'string' ? element.id : '',
      tag: typeof element.is === 'string' ? element.is : '',
      dataset: (toJsonSafe(element.dataset ?? {}) ?? {}) as Record<string, unknown>,
      class: typeof element.class === 'string' ? element.class : '',
      style: typeof element.style === 'string' ? element.style : '',
    }
  }
}

type InspectElementLike = {
  is?: string
  attributes?: { name: string; value: unknown }[]
  class?: string
  style?: string
  childNodes?: unknown[]
  asGeneralComponent?: () => unknown
  shadowRoot?: { childNodes?: unknown[] }
}

const INSPECT_NODE_LIMIT = 2000
const INSPECT_DEPTH_LIMIT = 60
const INSPECT_TEXT_LIMIT = 200

function serializeInspectNode(
  node: unknown,
  id: string,
  depth: number,
  budget: { count: number },
): InspectNode | null {
  if (!node || budget.count >= INSPECT_NODE_LIMIT || depth > INSPECT_DEPTH_LIMIT) return null
  budget.count += 1
  const cast = node as {
    asTextNode?: () => { textContent?: string } | null
    asElement?: () => InspectElementLike | null
  }
  const textNode = cast.asTextNode?.()
  if (textNode) {
    const text = String(textNode.textContent ?? '').trim()
    if (text.length === 0) return null
    return {
      id,
      type: 'text',
      tag: '#text',
      text: text.length > INSPECT_TEXT_LIMIT ? `${text.slice(0, INSPECT_TEXT_LIMIT)}…` : text,
      children: [],
    }
  }
  const element = cast.asElement?.()
  if (!element) return null
  const component = element.asGeneralComponent?.()
  const isComponent = Boolean(component)
  const childNodes = isComponent
    ? (component as { shadowRoot?: { childNodes?: unknown[] } }).shadowRoot?.childNodes
      ?? element.childNodes
      ?? []
    : element.childNodes ?? []
  const attributes = serializeAttributes(element)
  const result: InspectNode = {
    id,
    type: isComponent ? 'component' : 'element',
    tag: String(element.is ?? 'unknown'),
    children: childNodes
      .map((child, index) => serializeInspectNode(child, `${id}.${index}`, depth + 1, budget))
      .filter((child): child is InspectNode => child !== null),
  }
  if (Object.keys(attributes).length > 0) result.attributes = attributes
  const className = readClassName(element)
  if (className) result.className = className
  const style = readStyle(element)
  if (style) result.style = style
  return result
}

function serializeAttributes(element: InspectElementLike): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const attribute of element.attributes ?? []) {
    if (attribute.name === 'class' || attribute.name === 'style') continue
    const value = toJsonSafe(attribute.value)
    if (value === undefined) continue
    attributes[attribute.name] = typeof value === 'string' ? value : JSON.stringify(value)
  }
  return attributes
}

function readClassName(element: InspectElementLike): string | undefined {
  const name = element.class
  return typeof name === 'string' && name.length > 0 ? name : undefined
}

function readStyle(element: InspectElementLike): string | undefined {
  const style = element.style
  return typeof style === 'string' && style.length > 0 ? style : undefined
}

type DomInspectNode = {
  nodeType?: number
  tagName?: string
  textContent?: string | null
  className?: string
  childNodes?: ArrayLike<DomInspectNode>
  getAttributeNames?: () => string[]
  getAttribute?: (name: string) => string | null
  hasAttribute?: (name: string) => boolean
}

function isDomInspectNode(node: unknown): node is DomInspectNode {
  if (!node || typeof node !== 'object') return false
  const candidate = node as DomInspectNode
  return typeof candidate.nodeType === 'number' && typeof candidate.tagName === 'string'
}

function serializeDomNode(
  node: DomInspectNode,
  id: string,
  depth: number,
  budget: { count: number },
  hostAttribute: string,
): InspectNode | null {
  if (budget.count >= INSPECT_NODE_LIMIT || depth > INSPECT_DEPTH_LIMIT) return null
  budget.count += 1
  if (node.nodeType === 3) {
    const text = String(node.textContent ?? '').trim()
    if (text.length === 0) return null
    return {
      id,
      type: 'text',
      tag: '#text',
      text: text.length > INSPECT_TEXT_LIMIT ? `${text.slice(0, INSPECT_TEXT_LIMIT)}…` : text,
      children: [],
    }
  }
  if (node.nodeType !== 1) return null
  const attributes: Record<string, string> = {}
  for (const name of node.getAttributeNames?.() ?? []) {
    if (name === 'class' || name === 'style') continue
    const value = node.getAttribute?.(name)
    if (value !== null && value !== undefined) attributes[name] = String(value)
  }
  const result: InspectNode = {
    id,
    type: node.hasAttribute?.(hostAttribute) ? 'component' : 'element',
    tag: String(node.tagName ?? 'unknown').toLowerCase(),
    children: Array.from(node.childNodes ?? [])
      .map((child, index) => serializeDomNode(child, `${id}.${index}`, depth + 1, budget, hostAttribute))
      .filter((child): child is InspectNode => child !== null),
  }
  if (Object.keys(attributes).length > 0) result.attributes = attributes
  if (typeof node.className === 'string' && node.className.length > 0) result.className = node.className
  const style = node.getAttribute?.('style')
  if (style) result.style = style
  return result
}
