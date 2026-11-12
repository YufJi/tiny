import * as glassEasel from 'glass-easel'
import {
  DIAGNOSTIC_CODES,
  TINY_ENGINE_NAMING,
  type Manifest,
  type PageArtifact,
} from '@tiny/manifest'
import { readComponentGenerics } from '../../../component/component-generics'
import { parsePureDataPattern } from '../../../component/definition/pure-data'
import type {
  NormalizedComponentDefinition,
  NormalizedRelation,
  NormalizedTraitImplementation,
} from '../../../component/definition/types'
import type { MiniProgramComponentSchema } from '../../../component/schema'
import {
  isTraitBehavior,
  type MiniProgramTraitBehavior,
} from '../../../component/traits'
import {
  createRuntimeDiagnostic,
  type RuntimeDiagnostic,
} from '../../../shared/diagnostics'
import { resolveComponentReference } from '../../../shared/path'
import type { TemplateRegistry } from '../../../shared/template'
import type { GlassStyleRegistry } from './styles'

/**
 * Fields glass-easel owns on every element. `writeFieldsToNode` copies component
 * properties onto the instance, so a property with one of these names (Vant's
 * `van-button` declares `dataset`) would shadow the field and break element
 * construction. Such properties are kept as data and fed from the incoming
 * attribute through `unknownPropertyHandler` instead.
 */
export const ELEMENT_RESERVED_NAMES = new Set([
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

export function directObserverPath(path: string): string | null {
  return /^[A-Za-z_$][\w$]*$/.test(path) ? path : null
}

export type PageComponentOptions = {
  styleIsolation?: 'isolated' | 'apply-shared' | 'shared'
  addGlobalClass?: boolean
  explicitStyleIsolation?: boolean
}

export function resolvePageIsolation(
  page: PageArtifact,
  options: PageComponentOptions | undefined,
  isComponentPage?: (path: string) => boolean,
): 'isolated' | 'apply-shared' | 'shared' {
  if (!isComponentPage?.(page.path)) return 'shared'
  if (options?.explicitStyleIsolation && options.styleIsolation) return options.styleIsolation
  if (options?.addGlobalClass) return 'apply-shared'
  return 'shared'
}

export function readComponentPlaceholders(
  config: Record<string, unknown>,
): Record<string, string> {
  const raw = config.componentPlaceholder
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'string' && value.length > 0),
  ) as Record<string, string>
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

export type GlassDefinitionHost = {
  componentSpace: glassEasel.ComponentSpace
  templates: TemplateRegistry
  manifest: Manifest
  styles: GlassStyleRegistry
  componentSchemas: Map<string, MiniProgramComponentSchema>
  pageComponentOptions: Map<string, PageComponentOptions>
  isComponentPage?: (path: string) => boolean
  logicPageOptions?: ReadonlyMap<string, {
    methods?: Record<string, (...args: unknown[]) => unknown>
  }>
  logicComponentDefinitions?: ReadonlyMap<string, NormalizedComponentDefinition>
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
  logicTouchState?: () => { touches?: unknown[]; changedTouches?: unknown[] }
  logicQueryFactory?: (component: glassEasel.GeneralComponent) => unknown
  logicIntersectionFactory?: (
    component: glassEasel.GeneralComponent,
    options?: Record<string, unknown>,
  ) => unknown
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
  componentIdFor(
    schema: MiniProgramComponentSchema,
    component: glassEasel.GeneralComponent,
  ): string
  createEventMethodCaller(
    component?: glassEasel.GeneralComponent,
    initialFields?: Record<string, unknown>,
    framework?: { path: string; pageRoot: boolean },
  ): unknown
  methodCallerComponents: WeakMap<object, glassEasel.GeneralComponent>
  notifyLogicDataChange(component: glassEasel.GeneralComponent): void
  resolveMethodCaller(caller: unknown): glassEasel.GeneralComponent | undefined
  cleanupComponent(component: glassEasel.GeneralComponent): void
  logicPropertyValues: WeakMap<object, Record<string, unknown>>
  observerPreviousValues: WeakMap<
    object,
    Record<string, Record<string, unknown>>
  >
}

/**
 * Owns component/page definition construction, usingComponents resolution and
 * trait mapping. The adapter provides only instance identity, method-caller
 * installation and cleanup callbacks.
 */
export class GlassDefinitionRegistry {
  private readonly componentDefinitions =
    new Map<string, glassEasel.GeneralComponentDefinition>()
  private readonly glassTraits = new Map<
    string,
    glassEasel.TraitBehavior<Record<string, unknown>, Record<string, unknown>>
  >()
  private readonly traitComponents = new WeakSet<object>()
  private readonly registeringComponents = new Set<string>()
  private readonly pages = new Map<string, PageArtifact>()
  private readonly pageInitialData = new Map<string, Record<string, unknown>>()
  private readonly formFieldBehavior: glassEasel.GeneralBehavior
  private readonly formFieldGroupBehavior: glassEasel.GeneralBehavior
  private readonly labelTargetBehavior: glassEasel.GeneralBehavior

  constructor(private readonly host: GlassDefinitionHost) {
    this.formFieldBehavior = host.componentSpace.defineBehavior({
      is: TINY_ENGINE_NAMING.formFieldBehaviorId,
    })
    this.formFieldGroupBehavior = host.componentSpace.defineBehavior({
      is: `${TINY_ENGINE_NAMING.behaviorPrefix}form-field-group`,
    })
    // Marker only: label activation is dispatched render-side (`labelTap` ->
    // `handleLabelTap` in `hosts/web-components/src/behaviors/labelTarget.ts`).
    this.labelTargetBehavior = host.componentSpace.defineBehavior({
      is: `${TINY_ENGINE_NAMING.behaviorPrefix}label-target`,
    })
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.host.componentSchemas.set(schema.path, schema)
      this.registerComponentDefinition(schema)
    }
  }

  registerPageArtifact(page: PageArtifact): void {
    this.pages.set(page.path, page)
  }

  hasPage(path: string): boolean {
    return this.pages.has(path)
  }

  getPage(path: string): PageArtifact | undefined {
    return this.pages.get(path)
  }

  schemaFor(path: string): MiniProgramComponentSchema | undefined {
    return this.host.componentSchemas.get(path)
  }

  registerPage(
    page: PageArtifact,
    data: Record<string, unknown> = {},
  ): glassEasel.GeneralComponentDefinition {
    const adapter = this
    this.pageInitialData.set(page.path, data)
    const existing = this.componentDefinitions.get(page.path)
    if (existing) return existing
    if (!this.host.templates.groupList[page.path]) {
      throw new Error(`glass-easel template not found: ${page.path}`)
    }

    const pageScope = this.host.styles.ensurePageScope(page)
    const pageIsolation = resolvePageIsolation(
      page,
      this.host.pageComponentOptions.get(page.path),
      this.host.isComponentPage,
    )
    const childStyleScope = pageIsolation === 'isolated' ? undefined : pageScope
    const using = this.resolveComponentUsing(page.path, page.configuration, childStyleScope)
    const effective = (page.configuration?.effective ?? {}) as Record<string, unknown>
    const pagePlaceholders = readComponentPlaceholders(effective)
    for (const tag of Object.values(pagePlaceholders)) {
      if (!using[tag]) using[tag] = tag
    }
    const generics = this.resolveGenerics(page.path, readComponentGenerics(effective))
    const pureDataPattern = parsePureDataPattern(effective.pureDataPattern)
    if (pageIsolation !== 'isolated') {
      this.host.styles.applySharedComponentStyles(page, pageScope)
    }
    const methods = this.logicPageMethods(page.path)
    let builder: any = this.host.componentSpace
      .defineWithMethodCaller(page.path)
      .template({
        groupList: this.host.templates.groupList,
        content: (name = '') => this.host.templates.content(page.path, name),
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
        extraStyleScope: glassEasel.StyleScopeManager.globalScope(),
      })
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        // WeChat copies the page's non-lifecycle instance fields (`extraLine`,
        // custom counters, ...) onto the page instance; methods close over
        // `this.<field>` and would otherwise hit `undefined`.
        return adapter.host.createEventMethodCaller(
          this,
          adapter.logicPageFields(page.path),
          { path: page.path, pageRoot: true },
        )
      })
      .observer('**', function (this: glassEasel.GeneralComponent) {
        adapter.host.notifyLogicDataChange(
          adapter.host.resolveMethodCaller(this) ?? this,
        )
      })
      .methods(methods as never)
    // A component-as-page owns relations like any other component; without
    // them glass cannot link its children and `this.getRelationNodes` is empty.
    const pageComponent = this.host.logicComponentDefinitions?.get(page.path)
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

  registerComponentDefinition(
    schema: MiniProgramComponentSchema,
    pageScope?: number,
  ): glassEasel.GeneralComponentDefinition {
    const cacheKey = `${schema.path}@${pageScope ?? 'base'}`
    const existing = this.componentDefinitions.get(cacheKey)
    if (existing) return existing

    this.registeringComponents.add(schema.path)
    const using = Object.fromEntries(
      Object.entries(schema.using).map(([tag, reference]) => {
        const path = resolveComponentReference(schema.path, reference)
        const dependency = this.host.componentSchemas.get(path)
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
    const styleScopeId = this.host.styles.scopeForStyle(schema.path)
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
    const logicDefinition = this.host.logicComponentDefinitions?.get(schema.path)
    const builtinBehaviors: glassEasel.GeneralBehavior[] = []
    if (schema.formField) builtinBehaviors.push(this.formFieldBehavior)
    if (schema.formFieldGroup) builtinBehaviors.push(this.formFieldGroupBehavior)
    if (schema.labelTarget) builtinBehaviors.push(this.labelTargetBehavior)
    let builder: any = this.host.componentSpace
      .defineWithMethodCaller(schema.path)
      .definition({
        properties: declaredProperties as never,
        externalClasses: schema.externalClasses,
        behaviors: builtinBehaviors.length > 0 ? builtinBehaviors : undefined,
        listeners: logicDefinition?.listeners as never,
      })
      .template({
        groupList: this.host.templates.groupList,
        content: (name = '') => this.host.templates.content(schema.path, name),
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
        adapter.host.componentIdFor(schema, this)
        const methodCaller = adapter.host.createEventMethodCaller(this, undefined, {
          path: schema.path,
          pageRoot: false,
        })
        adapter.host.methodCallerComponents.set(methodCaller as object, this)
        return methodCaller
      })
    if (logicDefinition) {
      const methods = Object.fromEntries(
        [...logicDefinition.methods].map(([name, method]) => [
          name,
          function (this: unknown, ...args: unknown[]) {
            const event = args[0]
            const touch = adapter.host.logicTouchState?.()
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
      if (this.host.logicQueryFactory) {
        methods.createSelectorQuery = function (this: glassEasel.GeneralComponent) {
          return adapter.host.logicQueryFactory?.(this)
        }
      }
      methods.groupSetData = function (...args: unknown[]) {
        const callback = args[0]
        if (typeof callback === 'function') (callback as () => void)()
      }
      if (this.host.logicIntersectionFactory) {
        methods.createIntersectionObserver = function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          return adapter.host.logicIntersectionFactory?.(
            this,
            args[0] as Record<string, unknown> | undefined,
          )
        }
      }
      if (this.host.logicAnimationFactory) {
        methods.animate = function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          return adapter.host.logicAnimationFactory?.animate(
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
          return adapter.host.logicAnimationFactory?.clear(
            this,
            String(args[0] ?? ''),
            args[1],
            args[2],
          )
        }
        methods.clearAnimate = clearAnimation
        // WeChat exposes both names; the official demo uses `clearAnimation`.
        methods.clearAnimation = clearAnimation
      }
      if (Object.keys(methods).length > 0) builder = builder.methods(methods)
      builder = builder.observer('**', function (this: glassEasel.GeneralComponent) {
        adapter.host.notifyLogicDataChange(
          adapter.host.resolveMethodCaller(this) ?? this,
        )
      })
      for (const [name, handlers] of Object.entries(logicDefinition.lifetimeHandlers)) {
        for (const handler of handlers) {
          builder = builder.lifetime(name, function (
            this: glassEasel.GeneralComponent,
            ...args: unknown[]
          ) {
            const target = adapter.host.resolveMethodCaller(this) ?? this
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
            const target = adapter.host.resolveMethodCaller(this) ?? this
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
            const target = adapter.host.resolveMethodCaller(this) ?? this
            const values = adapter.host.logicPropertyValues.get(
              target as unknown as object,
            ) ?? {}
            const previous = values[property]
            values[property] = args[0]
            adapter.host.logicPropertyValues.set(
              target as unknown as object,
              values,
            )
            return handler.apply(target, [args[0], previous])
          })
          continue
        }
        // WeChat exposes properties as instance getters backed by the old
        // property snapshot while observers run, then advances the snapshot.
        // Vant's Field relies on this (`value !== this.value`) to mirror a
        // parent-owned value into its local `innerValue`.
        builder = builder.observer(observer.paths, function (
          this: glassEasel.GeneralComponent,
          ...args: unknown[]
        ) {
          const component = (adapter.host.resolveMethodCaller(this) ?? this) as unknown as {
            data?: Record<string, unknown>
          }
          const allPrevious = adapter.host.observerPreviousValues.get(component) ?? {}
          const previous = allPrevious[observer.key] ?? {}
          const data = component.data ?? {}
          for (const path of observer.paths) {
            const name = directObserverPath(path)
            if (!name || Object.hasOwn(previous, name)) continue
            previous[name] = data[name] ?? (component as unknown as Record<string, unknown>)[name]
          }
          allPrevious[observer.key] = previous
          adapter.host.observerPreviousValues.set(component, allPrevious)
          const observerThis = new Proxy(this as object, {
            get(source, property, receiver) {
              if (typeof property === 'string' && Object.hasOwn(previous, property)) {
                return previous[property]
              }
              return Reflect.get(source, property, receiver)
            },
          })
          try {
            return handler.apply(observerThis, args)
          } finally {
            observer.paths.forEach((path, index) => {
              const name = directObserverPath(path)
              if (!name) return
              previous[name] = args.length > index
                ? args[index]
                : data[name] ?? (component as unknown as Record<string, unknown>)[name]
            })
          }
        })
      }
      builder = this.applyRelations(builder, logicDefinition.relations, methods)
      builder = this.applyTraitImplementations(builder, logicDefinition.traits)
    }
    const definition = builder
      .lifetime('detached', function (this: glassEasel.GeneralComponent) {
        const component = adapter.host.resolveMethodCaller(this)
        if (component) adapter.host.cleanupComponent(component)
      })
      .registerComponent()

    this.registeringComponents.delete(schema.path)
    this.componentDefinitions.set(cacheKey, definition)
    return definition
  }

  installTraitAPI(component: glassEasel.GeneralComponent): void {
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

  pageUsingComponents(pagePath: string): Record<string, string> {
    const page = this.host.manifest.pages.find(
      (candidate: PageArtifact) => candidate.path === pagePath,
    )
    const config = page?.configuration as Record<string, any> | undefined
    const usingComponents = config?.effective?.usingComponents
    if (!usingComponents || typeof usingComponents !== 'object') return {}
    const sources = (config?.usingComponentsSource ?? {}) as Record<string, string>
    const result: Record<string, string> = {}
    for (const [tag, reference] of Object.entries(usingComponents as Record<string, unknown>)) {
      if (typeof reference !== 'string' || reference.length === 0) continue
      const sourcePath = sources[tag] === 'global' ? '' : pagePath
      result[tag] = resolveComponentReference(sourcePath, reference)
    }
    return result
  }

  usedComponentPaths(pagePath: string): Set<string> {
    const page = this.host.manifest.pages.find(
      (candidate: PageArtifact) => candidate.path === pagePath,
    )
    return page ? this.collectUsedComponentPaths(page.path, page.configuration) : new Set()
  }

  pageTemplateMethod(
    path: string,
    name: string,
  ): ((this: unknown, event: unknown) => unknown) | undefined {
    if (!this.pages.has(path)) return undefined
    return this.logicPageMethods(path)[name] as
      | ((this: unknown, event: unknown) => unknown)
      | undefined
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
      ? this.host.componentSpace.defineTraitBehavior(
          trait.transform as (impl: Record<string, unknown>) => Record<string, unknown>,
        )
      : this.host.componentSpace.defineTraitBehavior<Record<string, unknown>>()
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
      result[alias] = { default: `/${resolveComponentReference(path, value.default)}` }
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
    if (!usingComponents || typeof usingComponents !== 'object') return {}
    return Object.fromEntries(
      Object.entries(usingComponents as Record<string, unknown>).map(([tag, reference]) => {
        const sources = (config?.usingComponentsSource ?? {}) as Record<string, string>
        const sourcePath = sources[tag] === 'global' ? '' : path
        const componentPath = resolveComponentReference(sourcePath, String(reference))
        const definition = this.host.componentSchemas.get(componentPath)
        if (!definition) {
          this.host.onDiagnostic?.(createRuntimeDiagnostic(
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
  }

  collectUsedComponentPaths(
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
        const componentPath = resolveComponentReference(source, String(reference))
        if (result.has(componentPath)) continue
        result.add(componentPath)
        const schema = this.host.componentSchemas.get(componentPath)
        const using = usingByPath?.get(componentPath) ?? schema?.using
        for (const generic of Object.values(schema?.generics ?? {})) {
          if (!generic || typeof generic !== 'object' || typeof generic.default !== 'string') continue
          const defaultPath = resolveComponentReference(componentPath, generic.default)
          if (!result.has(defaultPath)) {
            result.add(defaultPath)
            visit(defaultPath, {
              effective: { usingComponents: this.host.componentSchemas.get(defaultPath)?.using },
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

  private logicPageFields(path: string): Record<string, unknown> {
    const options = this.host.logicPageOptions?.get(path) as
      | Record<string, unknown>
      | undefined
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

  private logicPageMethods(
    path: string,
  ): Record<string, (...args: unknown[]) => unknown> {
    const methods: Record<string, (...args: unknown[]) => unknown> = {}
    const options = this.host.logicPageOptions?.get(path)
    if (options) {
      const explicit = (options as { methods?: Record<string, unknown> }).methods
      if (explicit && typeof explicit === 'object') {
        for (const [name, value] of Object.entries(explicit)) {
          if (typeof value === 'function') {
            methods[name] = value as (...args: unknown[]) => unknown
          }
        }
      }
      for (const [name, value] of Object.entries(options)) {
        if (typeof value !== 'function') continue
        if (name === 'data' || name === 'methods' || name === 'options' || name === 'behaviors') continue
        if (PAGE_LIFECYCLE_KEYS.has(name)) continue
        methods[name] = value as (...args: unknown[]) => unknown
      }
    }
    const component = this.host.logicComponentDefinitions?.get(path)
    if (component) {
      for (const [name, value] of component.methods) {
        if (!(name in methods)) methods[name] = value as (...args: unknown[]) => unknown
      }
    }
    return methods
  }
}
