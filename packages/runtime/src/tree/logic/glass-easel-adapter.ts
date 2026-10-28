import * as glassEasel from 'glass-easel'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
  type StyleArtifact,
} from '@tiny/manifest'
import type { LogicStyleSheetRole } from './backend'
import type {
  InspectNode,
  MiniProgramComponentSchema,
  StyleLoader,
  TemplateRegistry,
} from '../../types'
import { toJsonSafe } from '../../events'
import { createRuntimeDiagnostic } from '../../diagnostics'
import { readComponentGenerics } from '../../component'
import {
  parsePureDataPattern,
  type NormalizedComponentDefinition,
  type NormalizedRelation,
} from '../../component'



/**
 * Fields glass-easel owns on every element. `writeFieldsToNode` copies component
 * properties onto the instance, so a property with one of these names (Vant's
 * `van-button` declares `dataset`) would shadow the field and break element
 * construction. Such properties are kept as data and fed from the incoming
 * attribute through `unknownPropertyHandler` instead.
 */
const ELEMENT_RESERVED_NAMES = new Set([
  'is',
  'dataset',
  'classList',
  'parentNode',
  'parentIndex',
  'childNodes',
  'ownerShadowRoot',
  'shadowRoot',
  'tagName',
  'id',
  'slot',
  'style',
])

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
  onDiagnostic?: (diagnostic: import('../../diagnostics').RuntimeDiagnostic) => void
  /** Page/component JavaScript options for the service-side logic tree. */
  logicPageOptions?: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  logicComponentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  /** Logic-layer selector query factory used by `this.createSelectorQuery()`. */
  logicQueryFactory?: (component: glassEasel.GeneralComponent) => unknown
  /** Called after logic-tree page/component data changes. */
  onLogicDataChange?: (pageId: string) => void
  /** Touch payload currently being dispatched by the logic tree. */
  logicTouchState?: () => { touches?: unknown[]; changedTouches?: unknown[] }
  logicIntersectionFactory?: (
    component: glassEasel.GeneralComponent,
    options?: Record<string, unknown>,
  ) => unknown
  /** `this.animate` / `this.clearAnimate` for logic components. */
  logicAnimationFactory?: {
    animate: (
      component: glassEasel.GeneralComponent,
      selector: string,
      keyframes: unknown,
      duration: unknown,
      options?: unknown,
    ) => boolean
    clear: (
      component: glassEasel.GeneralComponent,
      selector: string,
      options?: unknown,
      callback?: unknown,
    ) => boolean
  }
}

const PAGE_LIFECYCLE_KEYS = new Set([
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onShareTimeline',
  'onPageScroll',
  'onResize',
  'onTabItemTap',
  'onAddToFavorites',
  'onSaveExitState',
])

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
  private readonly componentUsageCounters = new Map<string, number>()
  private readonly methodCallerComponents = new WeakMap<object, glassEasel.GeneralComponent>()
  private readonly onDiagnostic?: (diagnostic: import('../../diagnostics').RuntimeDiagnostic) => void
  private readonly logicPageOptions?: GlassEaselAdapterOptions['logicPageOptions']
  private readonly logicComponentDefinitions?: GlassEaselAdapterOptions['logicComponentDefinitions']
  private readonly logicQueryFactory?: GlassEaselAdapterOptions['logicQueryFactory']
  private readonly onLogicDataChange?: GlassEaselAdapterOptions['onLogicDataChange']
  private readonly logicTouchState?: GlassEaselAdapterOptions['logicTouchState']
  private readonly pageIdsByComponent = new WeakMap<object, string>()
  /**
   * Page-root relations. glass-easel links relations through the light tree;
   * a page template is a shadow tree, so page relations are resolved here.
   */
  private readonly pageRelationNodes = new Map<string, Map<string, glassEasel.GeneralComponent[]>>()
  private readonly pageLinkedTargets = new Map<string, Map<string, Set<glassEasel.GeneralComponent>>>()
  /**
   * Page being constructed right now. glass-easel renders a page's template
   * during `Component.createWithContext`, before `mountPage` receives the page
   * root, so components created in that window cannot resolve their page from
   * the tree yet. The scope is only set for the duration of that call.
   */
  private constructingPageId: string | null = null
  private readonly logicPropertyValues = new WeakMap<object, Record<string, unknown>>()
  private readonly logicIntersectionFactory?: GlassEaselAdapterOptions['logicIntersectionFactory']
  private readonly logicAnimationFactory?: GlassEaselAdapterOptions['logicAnimationFactory']

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.templates = options.templates
    this.logicPageOptions = options.logicPageOptions
    this.logicComponentDefinitions = options.logicComponentDefinitions
    this.logicQueryFactory = options.logicQueryFactory
    this.onLogicDataChange = options.onLogicDataChange
    this.logicTouchState = options.logicTouchState
    this.logicIntersectionFactory = options.logicIntersectionFactory
    this.logicAnimationFactory = options.logicAnimationFactory
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
      const css = loadStyle(style.outputPath)
      if (typeof css !== 'string') continue
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
        const lowPriorityCss = loadStyle(style.lowPriorityPath)
        if (typeof lowPriorityCss === 'string' && lowPriorityCss.trim().length > 0) {
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

  registerPage(page: PageArtifact, data: Record<string, unknown> = {}): glassEasel.GeneralComponentDefinition {
    const adapter = this
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
    const methods = this.logicPageMethods(page.path)
    let builder: any = this.componentSpace
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
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        return adapter.createEventMethodCaller(this)
      })
      .observer('**', function (this: glassEasel.GeneralComponent) {
        adapter.notifyLogicDataChange(adapter.resolveMethodCaller(this) ?? this)
      })
      .methods(methods as never)
    // A component-as-page owns relations like any other component; without
    // them glass cannot link its children and `this.getRelationNodes` is empty.
    const pageComponent = this.logicComponentDefinitions?.get(page.path)
    if (pageComponent && pageComponent.relations.length > 0) {
      builder = this.applyRelations(builder, pageComponent.relations, methods)
    }
    const definition = builder.registerComponent()
    this.componentDefinitions.set(page.path, definition)
    return definition
  }

  private applyRelations(
    builder: any,
    relations: NormalizedRelation[],
    methods: Record<string, (...args: unknown[]) => unknown>,
  ): any {
    for (const relation of relations) {
      const params: Record<string, unknown> = {
        type: relation.type,
        // Glass resolves string targets relative to the owner's `is`; relation
        // targets are already normalized to the root, so keep them absolute.
        target: `/${relation.targetPath}`,
      }
      for (const name of ['linked', 'unlinked', 'linkChanged', 'linkFailed'] as const) {
        const handler = relation[name]
        if (!handler) continue
        params[name] = typeof handler === 'string' ? methods[handler] : handler
      }
      builder = builder.relation(relation.key, params)
    }
    return builder
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
      this.backend.registerStyleSheetContent(sharedPath, rescoped)
      this.appendStyleSheet(sharedPath, pageScope, {
        role: 'shared',
        ownerPath: page.path,
      })
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
  ): Array<{ scopeId: number; pagePath: string }> {
    if (!this.appPageScopeTemplate || schemas.length === 0) return []
    const isolation = new Map(
      schemas.map((schema) => [schema.path, schema.options?.styleIsolation ?? 'isolated']),
    )
    const using = new Map(schemas.map((schema) => [schema.path, schema.using]))
    const scopes: Array<{ scopeId: number; pagePath: string }> = []
    for (const page of manifest.pages) {
      if (pagePath && page.path !== pagePath) continue
      const used = this.collectUsedComponentPaths(page.path, page.configuration, using)
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

  /**
   * Append a stylesheet together with its cascade role. Only the logic backend
   * records the metadata; a DOM backend simply ignores the extra argument.
   */
  private appendStyleSheet(
    path: string,
    scope: number | undefined,
    meta: { role: LogicStyleSheetRole; ownerPath?: string },
  ): void {
    ;(this.backend as unknown as {
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
    const scopeName = this.componentSpace.styleScopeManager.queryName(pageScope)
    if (!scopeName) return
    const scoped = template.css
      .split(`.${sign}`).join(`.${scopeName}--${TINY_ENGINE_NAMING.scopeMarkerClass}`)
      .split(`="${sign}"`).join(`="${scopeName}"`)
      .split(`/*${sign}*/`).join(`${scopeName}--`)
    const path = `${template.style.outputPath}${TINY_ENGINE_NAMING.pageScopeSheetMarker}${pageScope}`
    this.backend.registerStyleSheetContent(path, scoped)
    this.appendStyleSheet(path, pageScope, {
      role: 'page-scope',
      ownerPath: pagePath,
    })
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

  private componentIdFor(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): string {
    const key = component as unknown as object
    const existing = this.componentIds.get(key)
    if (existing) return existing
    const usage = (this.componentUsageCounters.get(schema.path) ?? 0) + 1
    this.componentUsageCounters.set(schema.path, usage)
    const baseId = usage === 1
      ? schema.componentId
      : `${schema.componentId}${TINY_ENGINE_NAMING.componentInstanceSeparator}${usage}`
    // Component IDs are scoped per page in the service instance registry. Two
    // pages using the same global component would otherwise resolve to the
    // first page's component instance (and its event method callers).
    const pageId = this.pageIdOf(component)
    const componentId = pageId
      ? `${pageId}${TINY_ENGINE_NAMING.componentIdSeparator}${baseId}`
      : baseId
    this.componentIds.set(key, componentId)
    this.componentPaths.set(key, schema.path)
    this.componentInstances.set(componentId, component)
    return componentId
  }

  /** Tear down the logic page root and its page-scoped relation index. */
  unmountPage(pageId: string): void {
    const component = this.componentsByPageId.get(pageId)
    this.componentsByPageId.delete(pageId)
    this.pageRelationNodes.delete(pageId)
    this.pageLinkedTargets.delete(pageId)
    if (!component) return
    this.pageIdsByComponent.delete(component as unknown as object)
    const methodCaller = (component as unknown as { _$methodCaller?: unknown })._$methodCaller
    if (methodCaller && typeof methodCaller === 'object') {
      this.methodCallerComponents.delete(methodCaller as object)
      this.pageIdsByComponent.delete(methodCaller as object)
    }
    this.mountedComponents.delete(component.is)
    const componentId = this.componentIds.get(component as unknown as object)
    if (componentId) this.componentInstances.delete(componentId)
    this.componentIds.delete(component as unknown as object)
    this.componentPaths.delete(component as unknown as object)
    ;(component as unknown as { destroy?: () => void }).destroy?.()
  }

  /** Resolve page-root relations over the rendered shadow tree. */
  resolvePageRelations(pageId: string): void {
    const page = this.componentsByPageId.get(pageId)
    const definition = page ? this.logicComponentDefinitions?.get(page.is) : undefined
    if (!page || !definition || definition.relations.length === 0) return
    const candidates = this.collectPageComponents(page)
    const nodes = this.pageRelationNodes.get(pageId) ?? new Map()
    const linked = this.pageLinkedTargets.get(pageId) ?? new Map()
    for (const relation of definition.relations) {
      const targets = candidates.filter((component) => {
        if (component.is !== relation.targetPath) return false
        return relation.type === 'descendant' || relation.type === 'child'
      })
      nodes.set(relation.key, targets)
      const previous = linked.get(relation.key) ?? new Set<glassEasel.GeneralComponent>()
      const next = new Set(targets)
      for (const target of next) {
        if (previous.has(target)) continue
        this.invokeRelation(relation.linked, page, target)
        this.invokeReciprocal(relation, page, target, 'linked')
      }
      for (const target of previous) {
        if (next.has(target)) continue
        this.invokeRelation(relation.unlinked, page, target)
        this.invokeReciprocal(relation, page, target, 'unlinked')
      }
      linked.set(relation.key, next)
    }
    this.pageRelationNodes.set(pageId, nodes)
    this.pageLinkedTargets.set(pageId, linked)
  }

  /** Relation nodes of the page root, resolved over the render shadow tree. */
  relationNodes(pageId: string, relationKey: string): glassEasel.GeneralComponent[] {
    const resolved = this.pageRelationNodes.get(pageId)?.get(relationKey)
    if (resolved) return resolved
    const page = this.componentsByPageId.get(pageId)
    return page ? page.getRelationNodes(relationKey) : []
  }

  private collectPageComponents(page: glassEasel.GeneralComponent): glassEasel.GeneralComponent[] {
    const result: glassEasel.GeneralComponent[] = []
    const visited = new Set<unknown>()
    const walk = (node: unknown): void => {
      if (!node || visited.has(node)) return
      visited.add(node)
      const element = node as {
        childNodes?: unknown[]
        shadowRoot?: { childNodes?: unknown[] }
        asGeneralComponent?: () => glassEasel.GeneralComponent | undefined
      }
      const component = element.asGeneralComponent?.()
      if (component) {
        result.push(component)
        walk(component.shadowRoot)
      }
      for (const child of element.childNodes ?? []) walk(child)
    }
    walk(page.shadowRoot)
    return result
  }

  private invokeRelation(
    handler: NormalizedRelation['linked'],
    owner: glassEasel.GeneralComponent,
    target: glassEasel.GeneralComponent,
  ): void {
    if (!handler) return
    const caller = (component: glassEasel.GeneralComponent): unknown => (
      (component as unknown as { getMethodCaller?: () => unknown }).getMethodCaller?.() ?? component
    )
    const targetCaller = caller(target)
    if (typeof handler === 'function') {
      handler.call(caller(owner), targetCaller)
      return
    }
    const definition = this.logicComponentDefinitions?.get(owner.is)
    const method = definition?.methods.get(handler)
    if (method) method.call(caller(owner), targetCaller)
  }

  private invokeReciprocal(
    relation: NormalizedRelation,
    page: glassEasel.GeneralComponent,
    target: glassEasel.GeneralComponent,
    phase: 'linked' | 'unlinked',
  ): void {
    const definition = this.logicComponentDefinitions?.get(target.is)
    const reciprocal = definition?.relations.find((candidate) => (
      candidate.targetPath === page.is
      && ((relation.type === 'child' && candidate.type === 'parent')
        || (relation.type === 'descendant' && candidate.type === 'ancestor'))
    ))
    if (reciprocal) this.invokeRelation(reciprocal[phase], target, page)
  }

  getMountedComponentByPageId(pageId: string): glassEasel.GeneralComponent | undefined {
    return this.componentsByPageId.get(pageId)
  }

  /** Deliver a page lifetime to every logic component mounted on the page. */
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide'): void {
    for (const component of this.componentInstances.values()) {
      if (this.pageIdOf(component) !== pageId) continue
      component.triggerPageLifetime(phase, [])
    }
  }

  /** Resolve the page that owns a component, for host diagnostics. */
  pageIdFor(component: unknown): string | undefined {
    return component ? this.pageIdOf(component) : undefined
  }

  componentIdOf(component: unknown): string | undefined {
    return this.componentIds.get(component as object)
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
    const previousPageId = this.constructingPageId
    this.constructingPageId = pageId ?? null
    let component: glassEasel.GeneralComponent
    try {
      component = glassEasel.Component.createWithContext(
        'page',
        this.registerPage(page, data),
        this.backend,
      )
    } finally {
      this.constructingPageId = previousPageId
    }
    // App-global selectors are anchored to this unprefixed marker so the page
    // root participates without exposing built-in component internals.
    component.classList?.toggle(TINY_ENGINE_NAMING.scopeMarkerClass, true)
    this.mountedComponents.set(path, component)
    if (pageId) {
      this.componentsByPageId.set(pageId, component)
      // Multiple pages stay mounted in the service logic tree. Data changes
      // raised from an event handler on a non-active page must resolve back to
      // that page, not the most recently mounted one. glass-easel invokes
      // listeners with the method caller as `this`, so both identities map to
      // the page.
      this.pageIdsByComponent.set(component as unknown as object, pageId)
      const methodCaller = (component as unknown as { _$methodCaller?: unknown })._$methodCaller
      if (methodCaller && typeof methodCaller === 'object') {
        this.methodCallerComponents.set(methodCaller as object, component)
        this.pageIdsByComponent.set(methodCaller as object, pageId)
      }
    }
    component.setData(data)
    glassEasel.Element.pretendAttached(component)
    component.triggerLifetime('ready', [])
    if (this.logicComponentDefinitions) {
      // glass-easel only fires `attached` automatically; the mini-program
      // `ready` lifetime is triggered by the runtime after the tree is stable.
      // Children first, so parent ready handlers observe settled children.
      for (const instance of [...this.componentInstances.values()].reverse()) {
        const path = this.componentPaths.get(instance as unknown as object)
        if (path && this.logicComponentDefinitions.has(path)) instance.triggerLifetime('ready', [])
      }
    }
    return component
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }

  inspectTree(pageId?: string): InspectNode | null {
    const component = pageId
      ? this.componentsByPageId.get(pageId)
      : [...this.componentsByPageId.entries()].at(-1)?.[1]
        ?? [...this.mountedComponents.values()].at(-1)
    if (!component) return null
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

    const generics = this.resolveGenerics(schema.path, schema.generics)
    const pureDataPattern = parsePureDataPattern(schema.pureDataPattern)
    const reservedNames = new Set(
      Object.keys(schema.properties).filter((name) => ELEMENT_RESERVED_NAMES.has(name)),
    )
    const declaredProperties = Object.fromEntries(
      Object.entries(schema.properties).filter(([name]) => !reservedNames.has(name)),
    )
    const reservedData = Object.fromEntries(
      [...reservedNames].map((name) => [name, schema.properties[name]?.value]),
    )
    let builder: any = this.componentSpace
      .defineWithMethodCaller(schema.path)
      .definition({
        properties: declaredProperties as never,
        externalClasses: schema.externalClasses,
        behaviors: schema.formField ? [this.formFieldBehavior] : undefined,
      })
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(schema.path, name),
      })
      .data(() => ({ ...(schema.data as Record<string, unknown>), ...reservedData } as never))
      .usingComponents(using as never)
      .generics(generics as never)
      .options({
        multipleSlots: schema.options?.multipleSlots ?? false,
        virtualHost: schema.options?.virtualHost ?? false,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: styleScopeId,
        extraStyleScope,
        ...(pureDataPattern ? { pureDataPattern } : {}),
        ...(reservedNames.size > 0
          ? {
              unknownPropertyHandler(
                this: glassEasel.GeneralComponent,
                name: string,
                value: unknown,
              ) {
                if (!reservedNames.has(name)) return false
                this.setData({ [name]: value } as never)
                return true
              },
            }
          : {}),
      })
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        // Assigning the id registers the instance in the component tree even
        // though render-mode event dispatch no longer needs it.
        adapter.componentIdFor(schema, this)
        const methodCaller = adapter.createEventMethodCaller(this)
        adapter.methodCallerComponents.set(methodCaller as object, this)
        return methodCaller
      })
    const logicDefinition = this.logicComponentDefinitions?.get(schema.path)
    if (logicDefinition) {
      const methods = Object.fromEntries(
        [...logicDefinition.methods].map(([name, method]) => [
          name,
          function (this: unknown, ...args: unknown[]) {
            const event = args[0]
            const touch = adapter.logicTouchState?.()
            if (
              event && typeof event === 'object'
              && (touch?.touches || touch?.changedTouches)
            ) {
              const target = event as Record<string, unknown>
              if (target.touches === undefined && touch.touches) target.touches = touch.touches
              if (target.changedTouches === undefined && touch.changedTouches) {
                target.changedTouches = touch.changedTouches
              }
            }
            return (method as (...inner: unknown[]) => unknown).apply(this, args)
          },
        ]),
      ) as Record<string, (...args: unknown[]) => unknown>
      if (this.logicQueryFactory) {
        methods.createSelectorQuery = function (this: glassEasel.GeneralComponent) {
          return adapter.logicQueryFactory?.(this)
        }
      }
      methods.groupSetData = function (...args: unknown[]) {
        const callback = args[0]
        if (typeof callback === 'function') (callback as () => void)()
      }
      if (this.logicIntersectionFactory) {
        methods.createIntersectionObserver = function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          return adapter.logicIntersectionFactory?.(
            this,
            args[0] as Record<string, unknown> | undefined,
          )
        }
      }
      if (this.logicAnimationFactory) {
        methods.animate = function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          return adapter.logicAnimationFactory?.animate(
            this,
            String(args[0] ?? ''),
            args[1],
            args[2],
            args[3],
          )
        }
        const clearAnimation = function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          return adapter.logicAnimationFactory?.clear(this, String(args[0] ?? ''), args[1], args[2])
        }
        methods.clearAnimate = clearAnimation
        // WeChat exposes both names; the official demo uses `clearAnimation`.
        methods.clearAnimation = clearAnimation
      }
      if (Object.keys(methods).length > 0) builder = builder.methods(methods)
      builder = builder.observer('**', function (this: glassEasel.GeneralComponent) {
        adapter.notifyLogicDataChange(adapter.resolveMethodCaller(this) ?? this)
      })
      for (const [name, handlers] of Object.entries(logicDefinition.lifetimeHandlers)) {
        for (const handler of handlers) {
          builder = builder.lifetime(name, function (
            this: glassEasel.GeneralComponent,
            ...args: unknown[]
          ) {
            const target = adapter.resolveMethodCaller(this) ?? this
            return handler.apply(target, args)
          })
        }
      }
      for (const [name, handlers] of Object.entries(logicDefinition.pageLifetimeHandlers)) {
        for (const handler of handlers) {
          builder = builder.pageLifetime(name, function (
            this: glassEasel.GeneralComponent,
            ...args: unknown[]
          ) {
            const target = adapter.resolveMethodCaller(this) ?? this
            return handler.apply(target, args)
          })
        }
      }
      for (const observer of logicDefinition.observers) {
        const handler = typeof observer.handler === 'string'
          ? methods[observer.handler]
          : observer.handler
        if (typeof handler !== 'function') continue
        if (observer.kind === 'property' && observer.propertyName) {
          const property = observer.propertyName
          builder = builder.observer(observer.paths, function (
            this: glassEasel.GeneralComponent,
            ...args: unknown[]
          ) {
            const target = adapter.resolveMethodCaller(this) ?? this
            const values = adapter.logicPropertyValues.get(target as unknown as object) ?? {}
            const previous = values[property]
            values[property] = args[0]
            adapter.logicPropertyValues.set(target as unknown as object, values)
            return handler.apply(target, [args[0], previous])
          })
          continue
        }
        builder = builder.observer(observer.paths, handler)
      }
      builder = this.applyRelations(builder, logicDefinition.relations, methods)
    }
    const definition = builder
      .lifetime('detached', function (this: glassEasel.GeneralComponent) {
        const component = adapter.resolveMethodCaller(this)
        if (component) adapter.cleanupComponent(component)
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
      const builtin = undefined
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
      return {}
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
            DIAGNOSTIC_CODES.UNSUPPORTED_COMPONENT,
            `Component "${tag}" is not registered; using a native fallback.`,
            'render',
            undefined,
            { tag, reference, componentPath },
          ))
        }
        return [tag, definition ? this.registerComponentDefinition(definition, pageScope) : componentPath]
      }),
    )
    return resolved
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

  private logicPageMethods(path: string): Record<string, (...args: unknown[]) => unknown> {
    const methods: Record<string, (...args: unknown[]) => unknown> = {}
    const options = this.logicPageOptions?.get(path)
    if (options) {
      const explicit = (options as { methods?: Record<string, unknown> }).methods
      if (explicit && typeof explicit === 'object') {
        for (const [name, value] of Object.entries(explicit)) {
          if (typeof value === 'function') methods[name] = value as (...args: unknown[]) => unknown
        }
      }
      for (const [name, value] of Object.entries(options)) {
        if (typeof value !== 'function') continue
        if (name === 'data' || name === 'methods' || name === 'options' || name === 'behaviors') continue
        if (PAGE_LIFECYCLE_KEYS.has(name)) continue
        methods[name] = value as (...args: unknown[]) => unknown
      }
    }
    const component = this.logicComponentDefinitions?.get(path)
    if (component) {
      for (const [name, value] of component.methods) {
        if (!(name in methods)) methods[name] = value as (...args: unknown[]) => unknown
      }
    }
    return methods
  }

  private notifyLogicDataChange(component: glassEasel.GeneralComponent): void {
    const resolved = this.resolveMethodCaller(component) ?? component
    const pageId = this.pageIdOf(resolved)
    if (pageId) {
      this.onLogicDataChange?.(pageId)
      return
    }
    // No owning page could be resolved: the component is detached from every
    // mounted page, so there is no page to patch.
    return
  }

  /** Resolve the owning page structurally, falling back to the construction scope. */
  private pageIdOf(component?: unknown): string | undefined {
    const pageId = component === undefined ? undefined : this.pageIdOfComponent(component)
    return pageId ?? this.constructingPageId ?? undefined
  }

  /** Resolve the page that owns a logic component by walking its tree ancestry. */
  private pageIdOfComponent(component: unknown): string | undefined {
    let current = component as {
      parentNode?: unknown
      ownerShadowRoot?: { _$host?: unknown; owner?: unknown }
    } | undefined
    for (let depth = 0; depth < 64 && current; depth += 1) {
      const pageId = this.pageIdsByComponent.get(current as unknown as object)
      if (pageId) return pageId
      const shadowHost = current.ownerShadowRoot?._$host ?? current.ownerShadowRoot?.owner
      if (shadowHost && typeof shadowHost === 'object' && shadowHost !== current) {
        current = shadowHost as typeof current
        continue
      }
      const parent = current.parentNode
      if (parent && typeof parent === 'object') {
        current = parent as typeof current
        continue
      }
      current = undefined
    }
    return undefined
  }

  private createEventMethodCaller(component?: glassEasel.GeneralComponent): unknown {
    const logicMode = Boolean(this.logicComponentDefinitions)
    const instanceFields: Record<string, unknown> = {}
    return new Proxy(instanceFields, {
      has() {
        return true
      },
      get(target, property) {
        if (typeof property !== 'string') return undefined
        if (Object.prototype.hasOwnProperty.call(target, property)) return target[property]
        if (logicMode && component && !property.startsWith('_$')) {
          const value = (component as unknown as Record<string, unknown>)[property]
          if (value !== undefined) {
            return typeof value === 'function' ? value.bind(component) : value
          }
        }
        return undefined
      },
      set(target, property, value) {
        if (typeof property === 'string') target[property] = value
        return true
      },
    })
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

  private cleanupComponent(component: glassEasel.GeneralComponent): void {
    const componentId = this.componentIds.get(component as unknown as object)
    if (componentId) this.componentInstances.delete(componentId)
    this.componentIds.delete(component as unknown as object)
    this.componentPaths.delete(component as unknown as object)
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


