import * as glassEasel from 'glass-easel'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
  type StyleArtifact,
} from '@tiny/manifest'
import type { LogicBackendElement, LogicStyleSheetRole } from './backend'
import { queryLogicNodes } from './query'
import type {
  InspectNode,
  MiniProgramComponentSchema,
  StyleLoader,
  TemplateRegistry,
} from '../../types'
import { toJsonSafe } from '../../events'
import { createRuntimeDiagnostic } from '../../diagnostics'
import { mapCssAssetUrls, type AssetUrlResolver } from '../../assets'
import { readComponentGenerics } from '../../component'
import {
  isTraitBehavior,
  parsePureDataPattern,
  type NormalizedComponentDefinition,
  type NormalizedRelation,
  type NormalizedTraitImplementation,
  type MiniProgramTraitBehavior,
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

/**
 * Page-scoped framework objects the runtime injects into the logic tree.
 *
 * The logic layer never imports the service runtime: it only forwards these
 * opaque values to `this.router`, `this.pageRouter` and
 * `this.getOpenerEventChannel()`.
 */
export type LogicFrameworkContext = {
  /** Build a router whose relative routes resolve against `basePath`. */
  createRouter: (basePath: string) => unknown
  /**
   * Facts owned by the page instance for one page id: its router, route query
   * and opener `EventChannel`.
   */
  pageMeta?: (pageId: string) => {
    route?: string
    query?: Record<string, string>
    router?: unknown
    eventChannel?: unknown
  } | undefined
}

export type GlassEaselAdapterOptions = {
  backend: glassEasel.GeneralBackendContext
  manifest: Manifest
  templates: TemplateRegistry
  /** Host hook mapping compiler-normalized app-root `url(...)` values to loadable URLs. */
  resolveAssetUrl?: AssetUrlResolver
  /** Runtime page kind, derived from the actual `Page()` / `Component()` registration. */
  isComponentPage?: (path: string) => boolean
  onDiagnostic?: (diagnostic: import('../../diagnostics').RuntimeDiagnostic) => void
  /** Page/component JavaScript options for the service-side logic tree. */
  logicPageOptions?: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  logicComponentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  /** Logic-layer selector query factory used by `this.createSelectorQuery()`. */
  logicQueryFactory?: (component: glassEasel.GeneralComponent) => unknown
  /** Wrap a selected component with the service page/component handle. */
  componentHandleFactory?: (component: glassEasel.GeneralComponent) => unknown
  /** Called after logic-tree page/component data changes. */
  onLogicDataChange?: (pageId: string) => void
  /** Touch payload currently being dispatched by the logic tree. */
  logicTouchState?: () => { touches?: unknown[]; changedTouches?: unknown[] }
  logicIntersectionFactory?: (
    component: glassEasel.GeneralComponent,
    options?: Record<string, unknown>,
  ) => unknown
  /** A component `triggerEvent` reached the logic tree; forward it to render. */
  onCustomEvent?: (
    pageId: string,
    component: glassEasel.GeneralComponent,
    name: string,
    detail: unknown,
    options?: { bubbles?: boolean; composed?: boolean },
  ) => void
  /**
   * Run a component `setData` completion after the owning page's render update.
   * The render bridge owns the acknowledgement; a standalone logic tree falls
   * back to glass-easel's own render pass.
   */
  afterRender?: (pageId: string, callback: () => void) => void
  /** Router / opener-channel hooks for page and component instances. */
  frameworkContext?: LogicFrameworkContext
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

class GlassPageTreeManager {
  readonly pageId: string
  readonly path: string
  readonly instances = new Map<string, glassEasel.GeneralComponent>()
  readonly componentUsage = new Map<string, number>()
  readonly relationNodes = new Map<string, glassEasel.GeneralComponent[]>()
  readonly linkedTargets = new Map<string, Set<glassEasel.GeneralComponent>>()
  component?: glassEasel.GeneralComponent
  tabBarComponent?: glassEasel.GeneralComponent
  tabBarRoot?: LogicBackendElement
  router?: unknown

  constructor(pageId: string, path: string) {
    this.pageId = pageId
    this.path = path
  }

  attachComponent(component: glassEasel.GeneralComponent): void {
    this.component = component
  }

  attachTabBar(component: glassEasel.GeneralComponent, root: LogicBackendElement): void {
    this.tabBarComponent = component
    this.tabBarRoot = root
  }

  clear(): void {
    this.component = undefined
    this.tabBarComponent = undefined
    this.tabBarRoot = undefined
    this.router = undefined
    this.instances.clear()
    this.componentUsage.clear()
    this.relationNodes.clear()
    this.linkedTargets.clear()
  }
}

export class GlassEaselRuntimeAdapter {
  private readonly manifest: Manifest
  readonly backend: glassEasel.GeneralBackendContext
  readonly componentSpace: glassEasel.ComponentSpace
  /** Internal marker behavior for custom form-field components. */
  private readonly formFieldBehavior: glassEasel.GeneralBehavior
  /** Marker for wrapper components whose shadow tree contains form fields. */
  private readonly formFieldGroupBehavior: glassEasel.GeneralBehavior
  /** `wx://label-target`: receives `labelTap` from the built-in `<label>`. */
  private readonly labelTargetBehavior: glassEasel.GeneralBehavior
  private readonly templates: TemplateRegistry
  private readonly resolveAssetUrl?: AssetUrlResolver
  private readonly isComponentPage?: (path: string) => boolean
  private readonly styleScopeIds = new Map<string, number>()
  private readonly scopeIdsByName = new Map<string, number>()
  private readonly styleContents = new Map<string, string>()
  private readonly styleByEntryPath = new Map<string, StyleArtifact>()
  private readonly pageStyleScopes = new Map<string, number>()
  private readonly pageComponentOptions = new Map<string, PageComponentOptions>()
  private readonly sharedStylesApplied = new Set<string>()
  private appPageScopeTemplate?: { style: StyleArtifact; css: string }
  private readonly componentDefinitions = new Map<string, glassEasel.GeneralComponentDefinition>()
  private readonly glassTraits = new Map<string, glassEasel.TraitBehavior<Record<string, unknown>, Record<string, unknown>>>()
  private readonly traitComponents = new WeakSet<object>()
  private readonly registeringComponents = new Set<string>()
  private readonly pages = new Map<string, PageArtifact>()
  private readonly pageInitialData = new Map<string, Record<string, unknown>>()
  private readonly mountedComponents = new Map<string, glassEasel.GeneralComponent>()
  private readonly pageTrees = new Map<string, GlassPageTreeManager>()
  private readonly componentSchemas = new Map<string, MiniProgramComponentSchema>()
  private readonly unscopedInstances = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentIds = new WeakMap<object, string>()
  private readonly componentPaths = new WeakMap<object, string>()
  /** Component-relative routers (`this.router` inside a component). */
  private readonly componentRouters = new WeakMap<object, unknown>()
  private readonly frameworkProperties = new WeakSet<object>()
  private readonly unscopedComponentUsage = new Map<string, number>()
  private readonly methodCallerComponents = new WeakMap<object, glassEasel.GeneralComponent>()
  private readonly setDataCallbackComponents = new WeakSet<object>()
  private readonly onDiagnostic?: (diagnostic: import('../../diagnostics').RuntimeDiagnostic) => void
  private readonly logicPageOptions?: GlassEaselAdapterOptions['logicPageOptions']
  private readonly logicComponentDefinitions?: GlassEaselAdapterOptions['logicComponentDefinitions']
  private readonly logicQueryFactory?: GlassEaselAdapterOptions['logicQueryFactory']
  private readonly componentHandleFactory?: GlassEaselAdapterOptions['componentHandleFactory']
  private readonly onLogicDataChange?: GlassEaselAdapterOptions['onLogicDataChange']
  private readonly logicTouchState?: GlassEaselAdapterOptions['logicTouchState']
  private readonly pageIdsByComponent = new WeakMap<object, string>()
  /**
   * Page-root relations. glass-easel links relations through the light tree;
   * a page template is a shadow tree, so page relations are resolved here.
   */
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
  private readonly onCustomEvent?: GlassEaselAdapterOptions['onCustomEvent']
  private readonly afterRender?: GlassEaselAdapterOptions['afterRender']
  private readonly frameworkContext?: LogicFrameworkContext
  private readonly customEventComponents = new WeakSet<object>()
  private readonly readyComponents = new WeakSet<object>()
  private readonly pendingReadyPages = new Set<string>()

  constructor(options: GlassEaselAdapterOptions) {
    this.manifest = options.manifest
    this.backend = options.backend
    this.templates = options.templates
    this.resolveAssetUrl = options.resolveAssetUrl
    this.isComponentPage = options.isComponentPage
    this.logicPageOptions = options.logicPageOptions
    this.logicComponentDefinitions = options.logicComponentDefinitions
    this.logicQueryFactory = options.logicQueryFactory
    this.componentHandleFactory = options.componentHandleFactory
    this.onLogicDataChange = options.onLogicDataChange
    this.logicTouchState = options.logicTouchState
    this.logicIntersectionFactory = options.logicIntersectionFactory
    this.logicAnimationFactory = options.logicAnimationFactory
    this.onCustomEvent = options.onCustomEvent
    this.afterRender = options.afterRender
    this.frameworkContext = options.frameworkContext
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
    this.componentSpace.updateComponentOptions({
      hostNodeTagName: TINY_ENGINE_NAMING.hostNodeTagName,
      reflectToAttributes: true,
    })
    this.formFieldBehavior = this.componentSpace.defineBehavior({
      is: TINY_ENGINE_NAMING.formFieldBehaviorId,
    })
    this.formFieldGroupBehavior = this.componentSpace.defineBehavior({
      is: `${TINY_ENGINE_NAMING.behaviorPrefix}form-field-group`,
    })
    // Marker only: label activation is dispatched render-side (`labelTap` ->
    // `handleLabelTap` in `hosts/web-components/src/behaviors/labelTarget.ts`).
    this.labelTargetBehavior = this.componentSpace.defineBehavior({
      is: `${TINY_ENGINE_NAMING.behaviorPrefix}label-target`,
    })
    this.onDiagnostic = options.onDiagnostic
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.componentSchemas.set(schema.path, schema)
      this.registerComponentDefinition(schema)
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
    if (!this.resolveAssetUrl || css.length === 0) return css
    try {
      return mapCssAssetUrls(css, this.resolveAssetUrl)
    } catch {
      return css
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
      const css = this.loadStyleText(style.outputPath, loadStyle)
      if (css === undefined) continue
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
        const lowPriorityCss = this.loadStyleText(style.lowPriorityPath, loadStyle)
        if (lowPriorityCss !== undefined && lowPriorityCss.trim().length > 0) {
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
    this.pageInitialData.set(page.path, data)
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
    const pagePlaceholders = readComponentPlaceholders(effective)
    for (const tag of Object.values(pagePlaceholders)) {
      if (!using[tag]) using[tag] = tag
    }
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
      .data(() => adapter.pageInitialData.get(page.path) ?? {})
      .usingComponents(using as never)
      .placeholders(pagePlaceholders as never)
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
        // WeChat copies the page's non-lifecycle instance fields (`extraLine`,
        // custom counters, ...) onto the page instance; methods close over
        // `this.<field>` and would otherwise hit `undefined`.
        return adapter.createEventMethodCaller(
          this,
          adapter.logicPageFields(page.path),
          { path: page.path, pageRoot: true },
        )
      })
      .observer('**', function (this: glassEasel.GeneralComponent) {
        adapter.notifyLogicDataChange(adapter.resolveMethodCaller(this) ?? this)
      })
      .methods(methods as never)
    // A component-as-page owns relations like any other component; without
    // them glass cannot link its children and `this.getRelationNodes` is empty.
    const pageComponent = this.logicComponentDefinitions?.get(page.path)
    if (pageComponent) {
      builder = this.applyTraitImplementations(builder, pageComponent.traits)
    }
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
        target: relation.trait
          ? this.glassTraitFor(relation.trait)
          // Glass resolves string targets relative to the owner's `is`; relation
          // targets are already normalized to the root, so keep them absolute.
          : `/${relation.targetPath}`,
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

  private glassTraitFor(
    trait: MiniProgramTraitBehavior,
  ): glassEasel.TraitBehavior<Record<string, unknown>, Record<string, unknown>> {
    const existing = this.glassTraits.get(trait.id)
    if (existing) return existing
    const created = trait.transform
      ? this.componentSpace.defineTraitBehavior(
          trait.transform as (impl: Record<string, unknown>) => Record<string, unknown>,
        )
      : this.componentSpace.defineTraitBehavior<Record<string, unknown>>()
    this.glassTraits.set(trait.id, created)
    return created
  }

  private applyTraitImplementations(
    builder: any,
    traits: NormalizedTraitImplementation[],
  ): any {
    for (const { trait, impl } of traits) {
      builder = builder.implement(this.glassTraitFor(trait), impl)
    }
    return builder
  }

  private installTraitAPI(component: glassEasel.GeneralComponent): void {
    const key = component as unknown as object
    if (this.traitComponents.has(key)) return
    this.traitComponents.add(key)
    const hasBehavior = component.hasBehavior.bind(component)
    const traitBehavior = component.traitBehavior.bind(component)
    Object.defineProperty(component, 'hasBehavior', {
      configurable: true,
      enumerable: false,
      get: () => (behavior: unknown) => (
        isTraitBehavior(behavior)
          ? hasBehavior(this.glassTraitFor(behavior))
          : hasBehavior(behavior as never)
      ),
    })
    Object.defineProperty(component, 'traitBehavior', {
      configurable: true,
      enumerable: false,
      get: () => (behavior: unknown) => (
        isTraitBehavior(behavior)
          ? traitBehavior(this.glassTraitFor(behavior))
          : traitBehavior(behavior as never)
      ),
    })
  }

  private resolvePageIsolation(page: PageArtifact): 'isolated' | 'apply-shared' | 'shared' {
    if (!this.isComponentPage?.(page.path)) return 'shared'
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

  /** Compiler-assigned style scope of a mounted page, if it has one. */
  pageScopeName(pagePath: string): string | undefined {
    const scopeId = this.pageStyleScopes.get(pagePath)
    if (scopeId === undefined) return undefined
    return this.componentSpace.styleScopeManager.queryName(scopeId)
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
    let count = this.unscopedInstances.size
    for (const pageTree of this.pageTrees.values()) count += pageTree.instances.size
    return count
  }

  getComponentSnapshot(): ComponentSnapshot[] {
    const items: ComponentSnapshot[] = []
    for (const [componentId, component] of this.allComponentInstances()) {
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
    // Component instance counters are page-local, like WeChat's per-tree
    // compManager. The page id still namespaces the public instance id.
    const pageId = this.pageIdOf(component)
    const counters = pageId
      ? this.pageTrees.get(pageId)?.componentUsage ?? this.unscopedComponentUsage
      : this.unscopedComponentUsage
    const usage = (counters.get(schema.path) ?? 0) + 1
    counters.set(schema.path, usage)
    const baseId = usage === 1
      ? schema.componentId
      : `${schema.componentId}${TINY_ENGINE_NAMING.componentInstanceSeparator}${usage}`
    // Component IDs are scoped per page in the service instance registry. Two
    // pages using the same global component would otherwise resolve to the
    // first page's component instance (and its event method callers).
    const componentId = pageId
      ? `${pageId}${TINY_ENGINE_NAMING.componentIdSeparator}${baseId}`
      : baseId
    this.componentIds.set(key, componentId)
    this.componentPaths.set(key, schema.path)
    this.componentInstancesFor(pageId).set(componentId, component)
    return componentId
  }

  private componentInstancesFor(pageId?: string): Map<string, glassEasel.GeneralComponent> {
    return pageId ? this.pageTrees.get(pageId)?.instances ?? this.unscopedInstances
      : this.unscopedInstances
  }

  private *allComponentInstances(): IterableIterator<[string, glassEasel.GeneralComponent]> {
    yield* this.unscopedInstances
    for (const pageTree of this.pageTrees.values()) yield* pageTree.instances
  }

  /** Tear down the logic page root and its page-scoped relation index. */
  unmountPage(pageId: string): void {
    const pageTree = this.pageTrees.get(pageId)
    this.pageTrees.delete(pageId)
    const component = pageTree?.component
    const tabBarComponent = pageTree?.tabBarComponent
    pageTree?.clear()
    for (const mounted of [component, tabBarComponent]) {
      if (!mounted) continue
      this.pageIdsByComponent.delete(mounted as unknown as object)
      const methodCaller = (mounted as unknown as { _$methodCaller?: unknown })._$methodCaller
      if (methodCaller && typeof methodCaller === 'object') {
        this.methodCallerComponents.delete(methodCaller as object)
        this.pageIdsByComponent.delete(methodCaller as object)
      }
      this.componentIds.delete(mounted as unknown as object)
      this.componentPaths.delete(mounted as unknown as object)
      ;(mounted as unknown as { destroy?: () => void }).destroy?.()
    }
    if (!component) return
    this.mountedComponents.delete(component.is)
  }

  /** Resolve page-root relations over the rendered shadow tree. */
  resolvePageRelations(pageId: string): void {
    const pageTree = this.pageTrees.get(pageId)
    const page = pageTree?.component
    const definition = page ? this.logicComponentDefinitions?.get(page.is) : undefined
    if (!page || !definition || definition.relations.length === 0) return
    const candidates = this.collectPageComponents(page)
    const nodes = pageTree.relationNodes
    const linked = pageTree.linkedTargets
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
  }

  /** Relation nodes of the page root, resolved over the render shadow tree. */
  relationNodes(pageId: string, relationKey: string): glassEasel.GeneralComponent[] {
    const pageTree = this.pageTrees.get(pageId)
    const resolved = pageTree?.relationNodes.get(relationKey)
    if (resolved) return resolved
    const page = pageTree?.component
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
    return this.pageTrees.get(pageId)?.component
  }

  /**
   * Resolve `selectComponent` / `selectAllComponents` against one page or
   * component scope. Both Page and Component call sites use this primitive so
   * selector depth and component boundaries stay identical.
   */
  selectComponents(
    root: LogicBackendElement,
    selector: string,
    all: boolean,
  ): glassEasel.GeneralComponent[] {
    const componentsOf = (nodes: LogicBackendElement[]): glassEasel.GeneralComponent[] => (
      nodes.flatMap((node) => (
        node.nodeType === 'component' && node.__wxElement
          ? [node.__wxElement as glassEasel.GeneralComponent]
          : []
      ))
    )
    const deep = selector.split('>>>')
    if (deep.length === 2) {
      const ownerSelector = deep[0]!.trim()
      const innerSelector = deep[1]!.trim()
      const owner = queryLogicNodes(root, ownerSelector, false, true)
        .find((node) => node.nodeType === 'component' && node.__wxElement)
      if (!owner) return []
      return componentsOf(queryLogicNodes(owner, innerSelector, all))
    }
    return componentsOf(queryLogicNodes(root, selector, all, true))
  }

  /** The owning custom component, or null when the parent is a page root. */
  ownerComponentFor(
    component: glassEasel.GeneralComponent,
  ): glassEasel.GeneralComponent | undefined {
    const ownerId = this.findParentComponentId(component)
    return ownerId ? this.getMountedComponentByComponentId(ownerId) : undefined
  }

  /** Deliver a page lifetime to every logic component mounted on the page. */
  triggerPageLifetime(pageId: string, phase: 'show' | 'hide' | 'resize', event?: unknown): void {
    const pageTree = this.pageTrees.get(pageId)
    if (!pageTree) return
    for (const component of pageTree.instances.values()) {
      component.triggerPageLifetime(phase, event === undefined ? [] : [event])
    }
  }

  /** Resolve the page that owns a component, for host diagnostics. */
  pageIdFor(component: unknown): string | undefined {
    return component ? this.pageIdOf(component) : undefined
  }

  componentIdOf(component: unknown): string | undefined {
    return this.componentIds.get(component as object)
  }

  /** Resolve a page method a render-evaluated page template bound. */
  pageTemplateMethod(
    path: string,
    name: string,
  ): ((this: unknown, event: unknown) => unknown) | undefined {
    if (!this.pages.has(path)) return undefined
    return this.logicPageMethods(path)[name] as
      | ((this: unknown, event: unknown) => unknown)
      | undefined
  }

  getMountedComponentByComponentId(componentId: string): glassEasel.GeneralComponent | undefined {
    for (const pageTree of this.pageTrees.values()) {
      const component = pageTree.instances.get(componentId)
      if (component) return component
    }
    return this.unscopedInstances.get(componentId)
  }

  private triggerReady(component: glassEasel.GeneralComponent): void {
    if (this.readyComponents.has(component as unknown as object)) return
    this.readyComponents.add(component as unknown as object)
    component.triggerLifetime('ready', [])
  }

  /**
   * WeChat's operation flow fires one `ready` callback for each component
   * created by the update. Component creation walks the shadow tree before the
   * host is attached, then its light/slot children follow the host:
   *
   *   shadow descendants -> component -> light descendants
   *
   * This is observable when a slot child and a host-template child are both
   * present (`child(inner)`, host, `child(slot)`).
   */
  private componentReadyOrder(pageId: string): glassEasel.GeneralComponent[] {
    const root = this.pageTrees.get(pageId)?.component
    if (!root) return []
    const order: glassEasel.GeneralComponent[] = []
    const visited = new Set<object>()
    const visitNodes = (nodes: ArrayLike<unknown>): void => {
      for (let index = 0; index < nodes.length; index += 1) {
        const node = nodes[index]
        if (!node || glassEasel.TextNode.isTextNode(node)) continue
        if (glassEasel.Component.isComponent(node)) {
          visitComponent(node)
          continue
        }
        const element = node as { childNodes?: ArrayLike<unknown> }
        if (element.childNodes) visitNodes(element.childNodes)
      }
    }
    const visitComponent = (component: glassEasel.GeneralComponent): void => {
      const key = component as unknown as object
      if (visited.has(key)) return
      visited.add(key)
      const shadowRoot = component.shadowRoot as
        | { childNodes: ArrayLike<unknown> }
        | null
        | undefined
      if (shadowRoot) visitNodes(shadowRoot.childNodes)
      order.push(component)
      visitNodes(component.childNodes)
    }
    visitComponent(root)
    return order
  }

  /** Run `ready` for components that have not observed their first render. */
  triggerPendingReady(pageId: string): void {
    const root = this.pageTrees.get(pageId)?.component
    if (!root) return
    for (const component of this.componentReadyOrder(pageId)) {
      if (component !== root) {
        const path = this.componentPaths.get(component as unknown as object)
        if (!path || !this.logicComponentDefinitions?.has(path)) continue
      }
      this.triggerReady(component)
    }
  }

  /**
   * A component created by `setData` becomes ready after the pageframe applies
   * that update. Multiple service updates in one tick share one ready pass.
   */
  schedulePendingReady(pageId: string): void {
    if (!this.logicComponentDefinitions || this.pendingReadyPages.has(pageId)) return
    this.pendingReadyPages.add(pageId)
    const flush = (): void => {
      this.pendingReadyPages.delete(pageId)
      this.triggerPendingReady(pageId)
    }
    if (this.afterRender) this.afterRender(pageId, flush)
    else queueMicrotask(flush)
  }

  mountPage(
    path: string,
    data: Record<string, unknown> = {},
    pageId?: string,
  ): glassEasel.GeneralComponent {
    const page = this.pages.get(path)
    if (!page) throw new Error(`page is not registered: ${path}`)
    if (pageId && this.pageTrees.has(pageId)) {
      throw new Error(`logic page is already mounted: ${pageId}`)
    }
    const pageTree = pageId ? new GlassPageTreeManager(pageId, path) : undefined
    if (pageId && pageTree) this.pageTrees.set(pageId, pageTree)
    const previousPageId = this.constructingPageId
    this.constructingPageId = pageId ?? null
    let component: glassEasel.GeneralComponent
    try {
      component = glassEasel.Component.createWithContext(
        'page',
        this.registerPage(page, data),
        this.backend,
      )
    } catch (error) {
      if (pageId) this.pageTrees.delete(pageId)
      throw error
    } finally {
      this.constructingPageId = previousPageId
    }
    // App-global selectors are anchored to this unprefixed marker so the page
    // root participates without exposing built-in component internals.
    component.classList?.toggle(TINY_ENGINE_NAMING.scopeMarkerClass, true)
    this.mountedComponents.set(path, component)
    if (pageId) {
      pageTree!.attachComponent(component)
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
    if (pageId) this.triggerPendingReady(pageId)
    else this.triggerReady(component)
    return component
  }

  /**
   * Mount the custom tabBar as a second root in the page's logic tree.
   *
   * The root is intentionally not appended to the page component, matching
   * WeChat's `tabRoot`. The page tree still owns the instance and releases it
   * with the page.
   */
  mountTabBar(pageId: string, path: string): LogicBackendElement | undefined {
    const pageTree = this.pageTrees.get(pageId)
    const schema = this.componentSchemas.get(path)
    if (!pageTree || !schema) return undefined
    if (pageTree.tabBarRoot) return pageTree.tabBarRoot
    const definition = this.registerComponentDefinition(schema)
    const previousPageId = this.constructingPageId
    this.constructingPageId = pageId
    let component: glassEasel.GeneralComponent
    try {
      component = glassEasel.Component.createWithContext('custom-tab-bar', definition, this.backend)
    } catch (error) {
      this.constructingPageId = previousPageId
      throw error
    }
    this.constructingPageId = previousPageId
    const root = (component as unknown as {
      getBackendElement?: () => LogicBackendElement
    }).getBackendElement?.()
    if (!root) {
      ;(component as unknown as { destroy?: () => void }).destroy?.()
      return undefined
    }
    pageTree.attachTabBar(component, root)
    this.pageIdsByComponent.set(component as unknown as object, pageId)
    const methodCaller = (component as unknown as { _$methodCaller?: unknown })._$methodCaller
    if (methodCaller && typeof methodCaller === 'object') {
      this.methodCallerComponents.set(methodCaller as object, component)
      this.pageIdsByComponent.set(methodCaller as object, pageId)
    }
    glassEasel.Element.pretendAttached(component)
    this.triggerReady(component)
    return root
  }

  getTabBarComponent(pageId: string): glassEasel.GeneralComponent | undefined {
    return this.pageTrees.get(pageId)?.tabBarComponent
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }

  inspectTree(pageId?: string): InspectNode | null {
    const component = pageId
      ? this.pageTrees.get(pageId)?.component
      : [...this.pageTrees.values()].at(-1)?.component
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
        // Glass resolves a string using-target relative to the owner path; keep
        // an absolute path so a lazy component can be registered under the same
        // root-anchored name later.
        if (!dependency) return [tag, `/${path}`]
        // Taro emits mutually recursive component metadata; break the cycle by
        // referencing the path while the definition is still being built.
        if (this.registeringComponents.has(path)) return [tag, path]
        return [tag, this.registerComponentDefinition(dependency, pageScope)]
      }),
    )
    // Glass-easel owns the async-component lifecycle: a placeholder definition
    // is rendered until `defineComponent(path)` happens, then the placeholder
    // is replaced automatically. Built-in placeholder tags become native nodes.
    const placeholders = schema.placeholders ?? {}
    for (const tag of Object.values(placeholders)) {
      if (!using[tag]) using[tag] = tag
    }
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
    const logicDefinition = this.logicComponentDefinitions?.get(schema.path)
    const builtinBehaviors: glassEasel.GeneralBehavior[] = []
    if (schema.formField) builtinBehaviors.push(this.formFieldBehavior)
    if (schema.formFieldGroup) builtinBehaviors.push(this.formFieldGroupBehavior)
    if (schema.labelTarget) builtinBehaviors.push(this.labelTargetBehavior)
    let builder: any = this.componentSpace
      .defineWithMethodCaller(schema.path)
      .definition({
        properties: declaredProperties as never,
        externalClasses: schema.externalClasses,
        behaviors: builtinBehaviors.length > 0 ? builtinBehaviors : undefined,
        listeners: logicDefinition?.listeners as never,
      })
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(schema.path, name),
      })
      .data(() => ({ ...(schema.data as Record<string, unknown>), ...reservedData } as never))
      .usingComponents(using as never)
      .placeholders(placeholders as never)
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
        const methodCaller = adapter.createEventMethodCaller(this, undefined, {
          path: schema.path,
          pageRoot: false,
        })
        adapter.methodCallerComponents.set(methodCaller as object, this)
        return methodCaller
      })
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
      builder = this.applyTraitImplementations(builder, logicDefinition.traits)
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

  /**
   * Absolute paths of the page's `usingComponents` table.
   *
   * The render side needs the *tag -> path* map to resolve `generic:alias`
   * targets declared on page-level components (their owner is the page root).
   */
  pageUsingComponents(pagePath: string): Record<string, string> {
    const page = this.manifest.pages.find((candidate: PageArtifact) => candidate.path === pagePath)
    const config = page?.configuration as Record<string, any> | undefined
    const usingComponents = config?.effective?.usingComponents
    if (!usingComponents || typeof usingComponents !== 'object') return {}
    const sources = (config?.usingComponentsSource ?? {}) as Record<string, string>
    const result: Record<string, string> = {}
    for (const [tag, reference] of Object.entries(usingComponents as Record<string, unknown>)) {
      if (typeof reference !== 'string' || reference.length === 0) continue
      const sourcePath = sources[tag] === 'global' ? '' : pagePath
      result[tag] = this.resolveComponentReference(sourcePath, reference)
    }
    return result
  }

  /** Transitive component paths declared by a page and its used components. */
  usedComponentPaths(pagePath: string): Set<string> {
    const page = this.manifest.pages.find((candidate: PageArtifact) => candidate.path === pagePath)
    return page ? this.collectUsedComponentPaths(page.path, page.configuration) : new Set()
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
        return [tag, definition
          ? this.registerComponentDefinition(definition, pageScope)
          : `/${componentPath}`]
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
        for (const generic of Object.values(schema?.generics ?? {})) {
          if (!generic || typeof generic !== 'object' || typeof generic.default !== 'string') continue
          const defaultPath = this.resolveComponentReference(componentPath, generic.default)
          if (!result.has(defaultPath)) {
            result.add(defaultPath)
            visit(defaultPath, {
              effective: { usingComponents: this.componentSchemas.get(defaultPath)?.using },
              usingComponentsSource: {},
            })
          }
        }
        if (using) {
          visit(componentPath, {
            effective: { usingComponents: using },
            usingComponentsSource: {},
          })
        }
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

  /** Page options minus lifecycle/data/methods: WeChat copies them to the instance. */
  private logicPageFields(path: string): Record<string, unknown> {
    const options = this.logicPageOptions?.get(path) as Record<string, unknown> | undefined
    if (!options) return {}
    const fields: Record<string, unknown> = {}
    for (const [name, value] of Object.entries(options)) {
      if (typeof value === 'function') continue
      if (name === 'data' || name === 'methods' || name === 'options' || name === 'behaviors') continue
      if (PAGE_LIFECYCLE_KEYS.has(name)) continue
      fields[name] = value
    }
    return fields
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

  /**
   * Mini-program event handlers run with a glass method caller as `this`.
   * glass's `setData` only accepts the patch, while pages commonly pass a
   * completion callback (`setData(patch, cb)`); preserve the callback on the
   * component instance so nested page methods also see it.
   *
   * The callback is not a data-completion hook: WeChat runs it after the view
   * layer applied the update, so it goes through the render bridge (or glass's
   * own render pass when there is no render tree).
   */
  private ensureSetDataCallback(component: glassEasel.GeneralComponent): void {
    if (this.setDataCallbackComponents.has(component)) return
    this.setDataCallbackComponents.add(component)
    const target = component as unknown as {
      setData: (data: never, callback?: () => void) => void
    }
    const original = target.setData.bind(component)
    target.setData = (data: never, callback?: () => void): void => {
      original(data)
      if (typeof callback !== 'function') return
      const pageId = this.pageIdOf(component)
      if (this.afterRender && pageId) {
        this.afterRender(pageId, callback)
        return
      }
      // No render bridge can acknowledge this update (standalone logic tree or
      // a component detached from every page). Defer to glass's render pass so
      // the callback still never runs before the data update settled.
      glassEasel.triggerRender(component, () => callback())
    }
  }

  /**
   * `this.triggerEvent` dispatches in the logic tree. JS listeners run here
   * (as before); the render tree additionally receives the event so WXS
   * handlers execute where WeChat runs them.
   */
  private ensureCustomEventForwarding(component: glassEasel.GeneralComponent): void {
    const forward = this.onCustomEvent
    if (!forward || this.customEventComponents.has(component)) return
    this.customEventComponents.add(component)
    const target = component as unknown as {
      triggerEvent: (name: string, detail?: unknown, options?: Record<string, unknown>) => void
    }
    const original = target.triggerEvent.bind(component)
    target.triggerEvent = (name: string, detail?: unknown, options?: Record<string, unknown>): void => {
      original(name, detail, options)
      const pageId = this.pageIdFor(component)
      if (!pageId) return
      forward(pageId, component, String(name), detail, options as
        | { bubbles?: boolean; composed?: boolean }
        | undefined)
    }
  }

  private createEventMethodCaller(
    component?: glassEasel.GeneralComponent,
    initialFields?: Record<string, unknown>,
    framework?: { path: string; pageRoot: boolean },
  ): unknown {
    const logicMode = Boolean(this.logicComponentDefinitions)
    const instanceFields: Record<string, unknown> = { ...(initialFields ?? {}) }
    if (logicMode && component) {
      this.ensureSetDataCallback(component)
      this.ensureCustomEventForwarding(component)
    }
    if (component && framework) this.installFrameworkProperties(component, framework)
    if (component) this.installTraitAPI(component)
    const adapter = this
    const selectComponents = (selector: string, all: boolean): unknown[] => {
      if (!component) return []
      const element = (component as unknown as {
        getBackendElement?: () => LogicBackendElement | null
      }).getBackendElement?.()
      if (!element) return []
      return this.selectComponents(element, selector, all)
        .map((selected) => this.componentHandleOf(selected))
    }
    return new Proxy(instanceFields, {
      has() {
        return true
      },
      get(target, property) {
        if (typeof property !== 'string') return undefined
        if (Object.prototype.hasOwnProperty.call(target, property)) return target[property]
        if (property === 'selectComponent') {
          return (selector: string) => selectComponents(selector, false)[0] ?? null
        }
        if (property === 'selectAllComponents') {
          return (selector: string) => selectComponents(selector, true)
        }
        if (property === 'selectOwnerComponent') {
          return () => {
            const owner = component ? adapter.ownerComponentFor(component) : undefined
            return owner ? adapter.componentHandleOf(owner) : null
          }
        }
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

  private componentHandleOf(component: glassEasel.GeneralComponent): unknown {
    return this.componentHandleFactory?.(component)
      ?? (component as unknown as { getMethodCaller?: () => unknown }).getMethodCaller?.()
      ?? component
  }

  /**
   * Install the framework-owned instance properties WeChat exposes on pages and
   * components (`router`, `pageRouter`, `getOpenerEventChannel`, and the page's
   * `route` / `__route__` / `options`).
   *
   * They live on the glass component, not on the event method caller, because
   * glass-easel delivers lifetimes, observers, page lifetimes and relation
   * handlers with the component as `this` while template events run on the
   * caller proxy. Defining lazy getters on the component instance covers both.
   * A page's `this.router` and `this.pageRouter` are the page instance's own
   * router object, so the two identities match.
   */
  private installFrameworkProperties(
    component: glassEasel.GeneralComponent,
    framework: { path: string; pageRoot: boolean },
  ): void {
    const context = this.frameworkContext
    if (!context) return
    const key = component as unknown as object
    if (this.frameworkProperties.has(key)) return
    this.frameworkProperties.add(key)
    const define = (name: string, get: () => unknown): void => {
      Object.defineProperty(component, name, {
        configurable: true,
        enumerable: false,
        get,
        // glass writes component fields onto the instance; a declared property
        // with a framework name must not throw on assignment.
        set: () => undefined,
      })
    }
    define('router', () => (
      framework.pageRoot
        ? this.pageRouterFor(component, framework.path)
        : this.componentRouterFor(component, framework.path)
    ))
    define('pageRouter', () => this.pageRouterFor(
      component,
      framework.pageRoot ? framework.path : undefined,
    ))
    define('getOpenerEventChannel', () => () => (
      // WeChat stores `__eventChannel` on the page root only; a custom
      // component's `getOpenerEventChannel()` returns `undefined`.
      framework.pageRoot ? this.pageEventChannelFor(component) : undefined
    ))
    if (!framework.pageRoot) return
    define('route', () => framework.path)
    define('__route__', () => framework.path)
    define('options', () => {
      const pageId = this.pageIdOf(component)
      return pageId ? context.pageMeta?.(pageId)?.query : undefined
    })
  }

  /** Router bound to the component's own path (`this.router`). */
  private componentRouterFor(component: glassEasel.GeneralComponent, path: string): unknown {
    const cached = this.componentRouters.get(component as unknown as object)
    if (cached !== undefined) return cached
    const router = this.frameworkContext?.createRouter(path)
    if (router !== undefined) this.componentRouters.set(component as unknown as object, router)
    return router
  }

  /** Router bound to the owning page's path (`this.pageRouter`). */
  private pageRouterFor(
    component: glassEasel.GeneralComponent,
    pageRootPath?: string,
  ): unknown {
    const context = this.frameworkContext
    if (!context) return undefined
    const pageId = this.pageIdOf(component)
    const ownerRouter = pageId ? context.pageMeta?.(pageId)?.router : undefined
    // A page's `this.router` and `this.pageRouter` are the same object; reuse
    // the page instance's router so both identities match.
    if (ownerRouter !== undefined) return ownerRouter
    // Only a page root knows its path this early; for a component the owning
    // page's path is the only valid base.
    const pageTree = pageId ? this.pageTrees.get(pageId) : undefined
    const path = pageRootPath ?? pageTree?.path
    if (!path) return undefined
    if (pageTree?.router !== undefined) return pageTree.router
    const router = context.createRouter(path)
    if (router !== undefined && pageTree) pageTree.router = router
    return router
  }

  /** `this.getOpenerEventChannel()` of a page root. */
  private pageEventChannelFor(component: glassEasel.GeneralComponent): unknown {
    const pageId = this.pageIdOf(component)
    return pageId ? this.frameworkContext?.pageMeta?.(pageId)?.eventChannel : undefined
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
    if (componentId) this.componentInstancesFor(this.pageIdOf(component)).delete(componentId)
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

function readComponentPlaceholders(config: Record<string, unknown>): Record<string, string> {
  const raw = config.componentPlaceholder
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'string' && value.length > 0),
  ) as Record<string, string>
}
