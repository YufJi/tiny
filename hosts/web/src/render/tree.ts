import * as glassEasel from '@tiny/runtime/glass-easel'
import { convertRpx } from '@tiny/css-units'
import { DEFAULT_BEHAVIOR_SCHEME, DIAGNOSTIC_CODES, TINY_ENGINE_NAMING } from '@tiny/manifest'
import {
  RENDER_LOCAL_ID_PREFIX,
  createDefaultWxsCompiler,
  createWxsRuntime,
  formatLocator,
  isLocator,
  parseLocator,
  wxsBindingKey,
} from '@tiny/runtime'
import type {
  ComponentDefinitionPayload,
  CustomEventMessage,
  RenderAnimationRequest,
  RenderClearAnimationRequest,
  RenderElement,
  RenderEventGeometry,
  RenderHostAction,
  RenderIntersectionEntry,
  RenderIntersectionRequest,
  RenderNode,
  RenderPatch,
  RenderRect,
  RenderComponentIdentity,
  RenderTemplateEvent,
  RenderText,
  PageFrameMount,
  TemplateRegistry,
  WxsBindingMessage,
  WxsModuleTable,
  WxsRenderEffect,
} from '@tiny/runtime'
import {
  BUILTIN_COMPONENT_TAGS,
  createBuiltinComponents,
  getPublicBuiltinBehaviors,
  type BuiltinComponentTag,
} from '@tiny/host-web-components'
import { attachEventCompositor } from './event-compositor'

type AnyComponent = glassEasel.GeneralComponent

export type GlassRenderEvent = {
  id: string
  /** Render identity of the innermost event target when it differs from `id`. */
  targetId?: string
  name: string
  detail?: unknown
  native?: Record<string, unknown>
  touches?: unknown[]
  changedTouches?: unknown[]
  target?: RenderEventGeometry
  currentTarget?: RenderEventGeometry
  /** Set when a local WXS handler already ran for this render event. */
  wxsHandled?: boolean
}

type WxsHandlerBinding = {
  name: string
  moduleId: string
  exportPath: string[]
  catch?: boolean
  capture?: boolean
  mutated?: boolean
}

type WxsPropBinding = {
  prop: string
  moduleId: string
  exportPath: string[]
}

type WxsDynamicEventBinding = {
  name: string
  catch?: boolean
  capture?: boolean
  mutated?: boolean
}

const parseWxsDynamicEvents = (
  props: Record<string, unknown> | undefined,
): WxsDynamicEventBinding[] => {
  const raw = props?.[WXS_DYNAMIC_PROP]
  if (typeof raw !== 'string' || raw.length === 0) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is WxsDynamicEventBinding => (
      Boolean(entry)
      && typeof entry === 'object'
      && typeof (entry as WxsDynamicEventBinding).name === 'string'
    ))
  } catch {
    return []
  }
}

const parseWxsProps = (props: Record<string, unknown> | undefined): WxsPropBinding[] => {
  const raw = props?.[WXS_PROPS_PROP]
  if (typeof raw !== 'string' || raw.length === 0) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is WxsPropBinding => (
      Boolean(entry)
      && typeof entry === 'object'
      && typeof (entry as WxsPropBinding).prop === 'string'
      && typeof (entry as WxsPropBinding).moduleId === 'string'
      && Array.isArray((entry as WxsPropBinding).exportPath)
    ))
  } catch {
    return []
  }
}

export type GlassRenderTreeOptions = {
  resolveAssetUrl?: (src: string, sourcePath?: string) => string | undefined
  /** DOM container for the root host. Omit for a detached/empty backend tree. */
  container?: HTMLElement
  /** Defaults to the current window; tests can pass EmptyBackendContext. */
  backend?: glassEasel.GeneralBackendContext
  /** Trigger attached/ready after the tree is assembled. Defaults to true. */
  attach?: boolean
  /** Forward host events from render nodes back to the logic layer. */
  onEvent?: (event: GlassRenderEvent) => void
  /** Local override for host request/response capabilities. */
  hostRequest?: (method: string, payload: unknown) => Promise<unknown>
  /**
   * Component definitions keyed by component path. Normally delivered by the
   * thread through `setComponentDefinitions` before the first mount.
   */
  componentDefinitions?: Record<string, ComponentDefinitionPayload>
  /** Compiled template groups for render-time component evaluation. */
  templates?: TemplateRegistry
}

export type GlassRenderTree = {
  root: AnyComponent
  rootElement: HTMLElement | null
  mountPage: (request: PageFrameMount) => void
  mountTabBarPage?: (request: PageFrameMount) => void
  applyStyles?: (styles: string[]) => void
  inspectTree?: () => unknown
  measure?: (ids: string[]) => Record<string, unknown>
  /** Geometry of elements addressed by component-scoped locators. */
  measureLocators?: (locators: string[]) => Record<string, unknown>
  query?: (selector: string, all: boolean, scopeId?: string) => unknown[]
  measureCanvas?: (selector: string, canvasId: string) => {
    width: number
    height: number
    canvasId: string
    hasCanvas: boolean
  }
  observeIntersection?: (
    request: RenderIntersectionRequest,
    emit: (entries: RenderIntersectionEntry[]) => void,
  ) => (() => void) | undefined
  /** `this.animate`: play normalized keyframes with the Web Animations API. */
  playAnimation?: (request: RenderAnimationRequest) => void
  /** `this.clearAnimate`: cancel the animations this tree started. */
  clearAnimation?: (request: RenderClearAnimationRequest) => void
  setEventSink?: (sink: (event: GlassRenderEvent) => void) => void
  /** Built-in components ask the host to act (`<navigator>` routing). */
  setHostActionSink?: (sink: (action: RenderHostAction) => void) => void
  setHostRequestSink?: (sink: (method: string, payload: unknown) => Promise<unknown>) => void
  setPagePath?: (pagePath: string) => void
  setWxsModules?: (table: WxsModuleTable) => void
  setWxsEffectSink?: (sink: (effect: WxsRenderEffect) => void) => void
  setWxsBinding?: (binding: WxsBindingMessage) => void
  /** Refresh the service-owned node/component identity hints after a structural page update. */
  setPageFrameHints?: (root: RenderNode) => void
  /** Replace the service-owned component identity list for the pageframe. */
  setPageFrameComponents?: (components: RenderComponentIdentity[]) => void
  /** Dispatch a service-triggered custom event so WXS handlers can run. */
  dispatchCustomEvent?: (request: CustomEventMessage) => void
  setPageData?: (data: Record<string, unknown>) => void
  applyPageDataPatches?: (patches: Array<Record<string, unknown>>) => void
  setComponentData?: (data: Record<string, Record<string, unknown>>) => void
  setDiagnosticSink?: (sink: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) => void
  mount: (node: RenderNode) => void
  clearTabBar?: () => void
  applyPatches: (patches: RenderPatch[]) => void
  /** Definitions collected from `define` flow messages, keyed by component path. */
  setComponentDefinitions?: (definitions: Record<string, ComponentDefinitionPayload>) => void
  /** Install the template groups used for render-time evaluation. */
  setTemplates?: (templates: TemplateRegistry) => void
  /** Install the page style scope before the first mount (`~class` support). */
  setPageScope?: (scopeName: string) => void
  /** Page-level `usingComponents`, installed before the first mount. */
  setPageUsing?: (using: Record<string, string>) => void
  /** Public built-in behavior scheme (`wx://` by default), from the service. */
  setBehaviorScheme?: (scheme: string) => void
  /** Forwarded template handlers, executed by the service's method table. */
  setTemplateEventSink?: (sink: (event: RenderTemplateEvent) => void) => void
  getNode: (id: string) => AnyComponent | glassEasel.TextNode | undefined
  destroy: () => void
}

const builtinTags = new Set<string>(BUILTIN_COMPONENT_TAGS)

const WXS_PROPS_PROP = TINY_ENGINE_NAMING.wxsPropsAttribute
const WXS_DYNAMIC_PROP = TINY_ENGINE_NAMING.wxsDynamicEventAttribute

const HANDLED_NATIVE_EVENT = Symbol.for(TINY_ENGINE_NAMING.handledNativeEventSymbol)
const isHandledNativeEvent = (event: unknown): boolean => Boolean(
  event
  && typeof event === 'object'
  && (event as Record<PropertyKey, unknown>)[HANDLED_NATIVE_EVENT],
)

/** Guard against pathological host objects; event details are shallow in practice. */
const EVENT_DETAIL_MAX_DEPTH = 8

const eventDetailValue = (
  value: unknown,
  depth: number,
  seen: WeakSet<object>,
): unknown => {
  if (value === null) return null
  const valueType = typeof value
  if (valueType === 'string' || valueType === 'boolean') return value
  if (valueType === 'number') return Number.isFinite(value) ? value : 0
  if (valueType !== 'object' || depth >= EVENT_DETAIL_MAX_DEPTH) return undefined
  const objectValue = value as object
  if (seen.has(objectValue)) return undefined
  if (Array.isArray(value)) {
    seen.add(objectValue)
    const list = value.map((item) => eventDetailValue(item, depth + 1, seen))
    seen.delete(objectValue)
    // Arrays may not hold `undefined`; keep the index with `null` instead.
    return list.map((item) => (item === undefined ? null : item))
  }
  const prototype = Object.getPrototypeOf(value)
  // Touch/TouchList, DOM nodes, Dates, Maps, class instances: not bridge data.
  if (prototype !== Object.prototype && prototype !== null) return undefined
  seen.add(objectValue)
  const record: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const plain = eventDetailValue(item, depth + 1, seen)
    if (plain !== undefined) record[key] = plain
  }
  seen.delete(objectValue)
  return record
}

/**
 * Copy an event detail into the JSON-safe shape the bridge accepts.
 *
 * Native events carry live platform objects (`Touch`/`TouchList`, DOM nodes)
 * in their detail; the bridge rejects those, which would suppress the whole
 * event. Keep the values a mini program can read and drop the rest.
 */
const plainEventDetail = (detail: unknown): unknown => (
  detail === undefined ? undefined : eventDetailValue(detail, 0, new WeakSet())
)

const propertyName = (name: string): string => (
  name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase())
)

export function applyClassProps(
  element: HTMLElement | null,
  props: Record<string, unknown> | undefined,
  scopes: string[] | undefined,
  scopeChain: string[] | undefined,
  externalClasses: Record<string, string[]> | undefined,
  pageScopes: string[],
): void {
  if (!element?.setAttribute) return
  const raw = String(props?.class ?? '').split(/\s+/).filter(Boolean)
  const classes: string[] = []
  const scoped: string[] = []
  for (const name of raw) {
    if (name.startsWith('^')) {
      const carets = /^\^+/.exec(name)?.[0].length ?? 1
      const className = name.slice(carets)
      const scope = scopeChain?.[carets] ?? scopeChain?.[scopeChain.length - 1]
      classes.push(className)
      if (scope) scoped.push(`${scope}--${className}`)
      continue
    }
    const escaped = name.startsWith('~')
    const className = escaped ? name.slice(1) : name
    classes.push(className)
    for (const scope of escaped ? pageScopes : (scopes ?? [])) {
      scoped.push(`${scope}--${className}`)
    }
    for (const target of externalClasses?.[name] ?? []) {
      classes.push(target)
      // External classes are authored by the parent component, so they need
      // the parent's style scope as well as the page scope. Using only the
      // page scope dropped rules like .demo-home-nav__icon from the Vant
      // parent component's WXSS.
      const targetScopes = new Set([...(scopes ?? []), ...pageScopes])
      for (const scope of targetScopes) scoped.push(`${scope}--${target}`)
    }
  }
  if (classes.length > 0 || scoped.length > 0) {
    element.setAttribute('class', [...new Set([...classes, ...scoped])].join(' '))
  }
}

function glassProps(props: Record<string, unknown> | undefined): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(props ?? {})) {
    if (name === 'class' || name === 'style' || name === 'id') continue
    result[propertyName(name)] = value
  }
  return result
}

export function applyHostProps(component: AnyComponent, props: Record<string, unknown> | undefined): void {
  const element = component.getBackendElement() as unknown as {
    setAttribute?: (name: string, value: string) => void
    removeAttribute?: (name: string) => void
  } | null
  if (!element?.setAttribute) return
  for (const [name, value] of Object.entries(props ?? {})) {
    if (value === undefined || name === WXS_PROPS_PROP || name === WXS_DYNAMIC_PROP) continue
    // Boolean props are presence-only host attributes (`disabled`, `hidden`,
    // `plain`, ...). Writing `"false"` would still match `[disabled]`-style
    // selectors and make the host look/behave disabled, so clear the attribute.
    if (typeof value === 'boolean') {
      if (value) element.setAttribute(name, 'true')
      else element.removeAttribute?.(name)
      continue
    }
    element.setAttribute(name, String(value))
  }
}

/**
 * Positional match between the component instances the render tree created and
 * the view ids the logic tree assigned to them.
 *
 * The logic tree walks the same template with the same data, so both lists are
 * in document order and are consumed one by one -- the same contract as
 * WeChat's view thread consuming `FLOW_CREATE_NODE`. A path mismatch is a hard
 * desync (WeChat throws there); matching by path name instead would silently
 * write data into the wrong instance.
 */
export type ComponentInstanceEntry = { id: string; path: string }

export type ComponentInstanceDesync =
  | { kind: 'order'; index: number; expected: string; actual: string }
  | { kind: 'count'; created: string[]; expected: string[] }

export function matchComponentInstances(
  created: string[],
  instances: ComponentInstanceEntry[],
  options: { strictCount?: boolean } = {},
): { matched: Array<{ index: number; id: string }>; desync?: ComponentInstanceDesync } {
  const matched: Array<{ index: number; id: string }> = []
  const limit = Math.min(created.length, instances.length)
  for (let index = 0; index < limit; index += 1) {
    const entry = instances[index]!
    const actual = created[index]!
    if (actual !== entry.path) {
      return { matched, desync: { kind: 'order', index, expected: entry.path, actual } }
    }
    matched.push({ index, id: entry.id })
  }
  if (created.length !== instances.length && (options.strictCount || created.length > instances.length)) {
    return {
      matched,
      desync: {
        kind: 'count',
        created,
        expected: instances.map((entry) => entry.path),
      },
    }
  }
  return { matched }
}

/**
 * R1 render-tree foundation: one glass-easel root owns a real built-in
 * component tree. It is intentionally independent of the service tree; the
 * component-flow layer will drive it later.
 */
export function createGlassRenderTree(options: GlassRenderTreeOptions = {}): GlassRenderTree {
  const backend = options.backend ?? new glassEasel.CurrentWindowBackendContext()
  ;(backend as unknown as { onEvent: (listener: unknown) => void })
    .onEvent((
      element: glassEasel.Element,
      name: string,
      detail: unknown,
      eventOptions: Record<string, unknown> | undefined,
      target?: unknown,
    ) => {
      // The event compositor owns tap/canceltap. Ignore glass's own DOM
      // synthesis (which carries the raw event) so one finger produces exactly
      // one tap in the tree.
      if (
        (name === 'tap' || name === 'canceltap')
        && eventOptions?.originalEvent !== undefined
      ) return
      return glassEasel.Event.triggerBackendEvent(element, name, detail, eventOptions as never, target as never)
    })
  const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
  // The compiled template bundle registers its WXS modules through
  // `globalThis.__tinyWxsRuntime` when the module is evaluated, so the render
  // side must install it before `loadTemplates()` imports the bundle.
  ;(globalThis as unknown as Record<string, unknown>)[TINY_ENGINE_NAMING.wxsRuntimeGlobal] =
    wxsRuntime
  // A dedicated scope manager keeps the compiler-assigned scope names stable:
  // the service registered the same names, so evaluated templates produce the
  // classes the generated CSS expects.
  const styleScopeManager = new glassEasel.StyleScopeManager()
  // A generic with no resolvable target (or default) falls back to this empty
  // virtual component instead of throwing; the tree reports a diagnostic.
  const genericPlaceholder = `${TINY_ENGINE_NAMING.renderContainerDefinitionPrefix}generic-placeholder`
  const space = new glassEasel.ComponentSpace(genericPlaceholder, undefined, styleScopeManager, true)
  space.defineComponent({
    is: genericPlaceholder,
    options: { virtualHost: true },
  }).general()
  space.updateComponentOptions({
    hostNodeTagName: TINY_ENGINE_NAMING.hostNodeTagName,
    reflectToAttributes: true,
  })
  let currentPagePath = ''
  let pageScopes: string[] = []
  let diagnosticSink: ((diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) | undefined
  /** Render instance → component path, for asset and generic resolution. */
  const componentPathByComponent = new WeakMap<object, string>()

  /**
   * Nearest component artifact path for an instance. Built-in components
   * (`image`, `video`, …) have no path of their own, so walk to the owning
   * custom component or page root; the page root uses the active page path.
   */
  const componentSourcePath = (component: unknown): string => {
    let current = component as {
      ownerShadowRoot?: { getHostNode?: () => unknown } | null
      parentNode?: unknown
    } | null
    for (let depth = 0; current && depth < 32; depth += 1) {
      const mapped = componentPathByComponent.get(current as object)
      if (mapped) return mapped
      const owner = current.ownerShadowRoot?.getHostNode?.()
      if (owner && owner !== current) {
        current = owner as typeof current
        continue
      }
      const parent = current.parentNode
      if (parent) {
        current = parent as typeof current
        continue
      }
      break
    }
    return currentPagePath
  }

  const definitions = createBuiltinComponents(space, {
    resolveAssetUrl: (src: string, component: unknown) => (
      options.resolveAssetUrl?.(src, componentSourcePath(component)) ?? src
    ),
    onDiagnostic: (diagnostic) => diagnosticSink?.(diagnostic),
    lookupNodeProps: (component) => {
      const instance = component as object
      const captured = rawPropsByComponent.get(instance)
      const id = idByComponent.get(instance)
      const node = id ? currentTree.get(id) : undefined
      const snapshotProps = node?.type === 'element' ? node.props : undefined
      if (!captured && !snapshotProps) return undefined
      return { ...(snapshotProps ?? {}), ...(captured ?? {}) }
    },
    hostAction: (action) => hostActionSink?.(action),
    hostRequest: (method, payload) => {
      if (options.hostRequest) return options.hostRequest(method, payload)
      if (hostRequestSink) return hostRequestSink(method, payload)
      return Promise.reject(new Error(`host request is unavailable: ${method}`))
    },
  })
  for (const [tag, definition] of Object.entries(definitions)) {
    space.registerComponent(tag, definition)
  }
  const containers = new Map<string, glassEasel.GeneralComponentDefinition>()
  /**
   * Raw props a template passed to a component that does not declare them.
   * Glass drops undeclared props after a warning, but WeChat's view node keeps
   * them and `<form>` reads node props for `name` / `value`.
   */
  const rawPropsByComponent = new WeakMap<object, Record<string, unknown>>()
  const componentDefinitions = new Map<string, ComponentDefinitionPayload>(
    Object.entries(options.componentDefinitions ?? {}),
  )
  let templates: TemplateRegistry | undefined = options.templates
  let templateEventSink: ((event: RenderTemplateEvent) => void) | undefined

  const touchListOf = (value: unknown): unknown[] | undefined => (
    Array.isArray(value) ? value.map((touch) => (
      touch && typeof touch === 'object' ? { ...(touch as Record<string, unknown>) } : touch
    )) : normalizeTouchList(value)
  )

  /**
   * A template handler inside an evaluated component: the render thread has no
   * method table, so report the call and let the service run the real method.
   */
  const templateHandler = (handler: string) => function (
    this: unknown,
    event: unknown,
  ): void {
    if (serviceEventDepth > 0) return
    const sink = templateEventSink
    if (!sink) return
    const source = (event ?? {}) as {
      type?: string
      detail?: unknown
      touches?: unknown[]
      changedTouches?: unknown[]
      target?: unknown
      currentTarget?: unknown
    }
    const name = String(source.type ?? '')
    // A raw DOM touch projection also reaches this binding. The built-in
    // component that owned the native listener already re-emitted a
    // normalized event for the same finger, so forward only that one.
    if (
      name.startsWith('touch')
      && isHandledNativeEvent((event as { getOriginalEvent?: () => unknown }).getOriginalEvent?.())
    ) return
    const detail = plainEventDetail(source.detail)
    const self = this as {
      __tinyNodeId?: string
      getBackendElement?: () => { getAttribute?: (name: string) => string | null } | null
    }
    const componentId = self.__tinyNodeId
      ?? self.getBackendElement?.()?.getAttribute?.(TINY_ENGINE_NAMING.nodeIdAttribute)
      ?? ''
    const element = source.currentTarget as {
      id?: string
      getAttribute?: (name: string) => string | null
      dataset?: Record<string, unknown>
      offsetLeft?: number
      offsetTop?: number
      offsetWidth?: number
      offsetHeight?: number
    } | null
    const targetRender = renderTargetOf(source.target)
    const viewId = element?.getAttribute?.(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
    const geometry = element && typeof element.offsetLeft === 'number'
      ? {
          viewId,
          offsetLeft: element.offsetLeft ?? 0,
          offsetTop: element.offsetTop ?? 0,
          offsetWidth: element.offsetWidth ?? 0,
          offsetHeight: element.offsetHeight ?? 0,
        }
      : undefined
    sink({
      componentId,
      handler,
      name,
      ...(detail !== undefined ? { detail } : {}),
      // Glass/projection touches are plain arrays; clone them instead of
      // normalizing so absent fields (radiusX, force, ...) are not turned into
      // `undefined`, which the bridge serializer rejects.
      ...(touchListOf(source.touches) ? { touches: touchListOf(source.touches) } : {}),
      ...(touchListOf(source.changedTouches)
        ? { changedTouches: touchListOf(source.changedTouches) }
        : {}),
      ...(element?.id ? { id: String(element.id) } : {}),
      ...(element?.dataset && Object.keys(element.dataset).length > 0
        ? { dataset: { ...element.dataset } }
        : {}),
      ...(geometry ? { currentTarget: geometry } : {}),
      ...(targetRender.identity ? { targetId: targetRender.identity } : {}),
      ...(targetRender.geometry ? { target: targetRender.geometry } : {}),
    })
  }
  const nodes = new Map<string, AnyComponent | glassEasel.TextNode>()
  const eventCleanups = new Map<string, Array<() => void>>()
  const pageFrameTouchMoveCleanups = new Map<Element, () => void>()
  let eventSink: ((event: GlassRenderEvent) => void) | undefined
  /**
   * Depth of a service-triggered custom event being dispatched in the render
   * tree. JS listeners already ran in the logic tree; only WXS handlers run
   * here and nothing may be forwarded back to the service.
   */
  let serviceEventDepth = 0
  let wxsEffectSink: ((effect: WxsRenderEffect) => void) | undefined
  let hostActionSink: ((action: RenderHostAction) => void) | undefined
  let hostRequestSink: ((method: string, payload: unknown) => Promise<unknown>) | undefined
  const emitServiceEvent = (event: GlassRenderEvent): void => {
    if (eventSink) eventSink(event)
    else options.onEvent?.(event)
  }
  let styleElement: HTMLStyleElement | undefined
  const currentTree = new Map<string, RenderNode>()
  const externalByNode = new Map<string, Record<string, string[]> | undefined>()
  const idByComponent = new WeakMap<object, string>()
  const pendingClasses = new Map<string, () => boolean>()
  const pendingWxsEvents = new Map<string, () => void>()
  const wxsStates = new WeakMap<Element, Record<string, unknown>>()
  const wxsStatesById = new Map<string, Record<string, unknown>>()
  const dynamicBindingModes = new Map<string, WxsBindingMessage>()
  const wxsTimers = new Set<ReturnType<typeof setTimeout>>()
  const wxsPropSnapshots = new Map<string, Record<string, unknown>>()
  const pageFrameWxsPropSnapshots = new WeakMap<Element, Record<string, unknown>>()
  let pageData: Record<string, unknown> = {}
  let componentData: Record<string, Record<string, unknown>> = {}
  let pageFrameRoot: AnyComponent | undefined
  let pageFramePageId = ''
  let pageFramePagePath = ''
  let pageFrameComponents: RenderComponentIdentity[] = []
  let pagePlaceholders: Record<string, string> = {}
  let pageFrameUnresolvedUsing = new Set<string>()
  const sameDataPatch = (
    current: Record<string, unknown> | undefined,
    patch: Record<string, unknown>,
  ): boolean => {
    if (!current) return false
    for (const [name, value] of Object.entries(patch)) {
      try {
        if (JSON.stringify(current[name]) !== JSON.stringify(value)) return false
      } catch {
        return false
      }
    }
    return true
  }
  const dataPatchBetween = (
    current: Record<string, unknown>,
    next: Record<string, unknown>,
  ): Record<string, unknown> => {
    const patch: Record<string, unknown> = {}
    for (const [name, value] of Object.entries(next)) {
      try {
        if (JSON.stringify(current[name]) !== JSON.stringify(value)) patch[name] = value
      } catch {
        patch[name] = value
      }
    }
    return patch
  }
  /** Parents whose instance list already produced a desync diagnostic. */
  const desyncReported = new Set<string>()
  /**
   * Match the component instances the render thread created while evaluating a
   * template to the view ids the logic tree assigned to them, so per-instance
   * data (lifetimes, observers, parents) reaches the right instance.
   */
  const bindNestedComponentInstances = (
    strictHints = false,
    applyData = true,
  ): void => {
    const reportDesync = (parentId: string, message: string, details: unknown): void => {
      if (desyncReported.has(parentId)) return
      desyncReported.add(parentId)
      diagnosticSink?.({
        severity: 'error',
        code: DIAGNOSTIC_CODES.TREE_COMPONENT_DESYNC,
        message,
        details,
      })
    }
    const bindFor = (
      parentId: string,
      instances: Array<{ id: string; path: string }>,
    ): void => {
      const parent = nodes.get(parentId) as unknown as {
        getBackendElement?: () => unknown
      } | undefined
      const ownerComponent = nodes.get(parentId)
      const host = parent?.getBackendElement?.() as HTMLElement | null
      if (!host || typeof host.querySelectorAll !== 'function') return
      const tabBinding = parentId === tabFrameRootId
      const frameRoot = tabBinding ? tabBarRoot : pageFrameRoot
      const frameRootId = tabBinding ? tabFrameRootId : rootId.value
      const rootBinding = parentId === frameRootId
      // Components the render tree actually created while evaluating the
      // template, in document order. The logic tree walks the same template in
      // the same order, so the two lists are consumed positionally (this is how
      // WeChat's view thread consumes `FLOW_CREATE_NODE`); a path mismatch is a
      // hard desync, not something to paper over by matching on path names.
      const found: Array<{ component: AnyComponent; path: string }> = []
      const walk = (element: Element): void => {
        const children = element.children
        for (let index = 0; index < children.length; index += 1) {
          const child = children[index]!
          const glass = (child as unknown as { __wxElement?: unknown }).__wxElement as {
            is?: unknown
            getBackendElement?: () => unknown
            ownerShadowRoot?: { getHostNode?: () => unknown } | null
          } | undefined
          const path = typeof glass?.is === 'string' ? glass.is : ''
          const owner = glass?.ownerShadowRoot?.getHostNode?.()
          const ownerElement = (owner as { getBackendElement?: () => unknown } | undefined)
            ?.getBackendElement?.()
          const ownerMatches = !frameRoot
            || (rootBinding
              ? owner === ownerComponent
              : owner === ownerComponent
                || Boolean(ownerElement && host.contains(ownerElement as Node)))
          if (
            path
            && componentDefinitions.has(path)
            && glass
            && ownerMatches
          ) {
            found.push({ component: glass as unknown as AnyComponent, path })
          }
          walk(child)
        }
      }
      walk(host)

      const result = matchComponentInstances(
        found.map((item) => item.path),
        instances,
        { strictCount: strictHints },
      )
      for (const item of result.matched) {
        const component = found[item.index]!.component
        ;(component as unknown as { __tinyNodeId?: string }).__tinyNodeId = item.id
        component.getBackendElement()?.setAttribute?.(TINY_ENGINE_NAMING.nodeIdAttribute, item.id)
        componentPathByComponent.set(component, found[item.index]!.path)
        nodes.set(item.id, component)
        idByComponent.set(component, item.id)
        const data = componentData[item.id]
        if (applyData && data && !sameDataPatch(
          (component as unknown as { data?: Record<string, unknown> }).data,
          data,
        )) {
          ;(component as unknown as { setData?: (next: Record<string, unknown>) => void })
            .setData?.(data)
        }
      }
      if (result.desync) {
        const desync = result.desync
        reportDesync(
          parentId,
          desync.kind === 'order'
            ? `component instance #${desync.index} is ${desync.actual} in the render tree but ${desync.expected} in the logic tree`
            : `render tree created ${desync.created.length} component(s) but the logic tree has ${desync.expected.length}`,
          { parentId, ...desync },
        )
      }
    }
    if (pageFrameRoot) {
      if (pageFrameComponents.length > 0) {
        bindFor(rootId.value, pageFrameComponents)
      } else {
        const pageRoot = currentTree.get(rootId.value)
        if (pageRoot?.type !== 'element') return
        const instances: Array<{ id: string; path: string }> = []
        const visit = (node: RenderNode): void => {
          if (node.type !== 'element') return
          if (node.component === true && node.componentPath && node.id) {
            instances.push({ id: node.id, path: node.componentPath })
          }
          for (const child of node.children ?? []) visit(child)
        }
        for (const child of pageRoot.children ?? []) visit(child)
        if (instances.length > 0) bindFor(rootId.value, instances)
      }
    }
    if (tabFrameRootId && tabFrameComponents.length > 0) {
      bindFor(tabFrameRootId, tabFrameComponents)
    }
    for (const [id, node] of currentTree) {
      if (node.type !== 'element' || !node.componentInstances) continue
      bindFor(id, node.componentInstances)
    }
  }
  /** Push service-side component data into the render instances (templates). */
  const applyComponentDataToNodes = (data: Record<string, Record<string, unknown>>): void => {
    for (const [id, patch] of Object.entries(data)) {
      const component = nodes.get(id) as unknown as {
        setData?: (next: Record<string, unknown>) => void
        data?: Record<string, unknown>
      } | undefined
      component?.setData?.(patch)
      // A custom component's WXS prop observers read the component's data, not
      // the node attributes: drive them from the same patch the template sees.
      const node = currentTree.get(id)
      if (node?.type === 'element' && node.component === true && component) {
        applyWxsProps(node, component as never, wxsPropSnapshots.get(id), component.data)
      }
    }
  }
  const wxsOverrides = new WeakMap<HTMLElement, {
    style: Map<string, string>
    classes: Set<string>
  }>()

  const wxsOverridesFor = (element: HTMLElement) => {
    let overrides = wxsOverrides.get(element)
    if (!overrides) {
      overrides = { style: new Map(), classes: new Set() }
      wxsOverrides.set(element, overrides)
    }
    return overrides
  }

  const applyWxsOverrides = (element: HTMLElement): void => {
    const overrides = wxsOverrides.get(element)
    if (!overrides) return
    for (const [name, value] of overrides.style) element.style.setProperty(name, value)
    for (const name of overrides.classes) element.classList.add(name)
  }

  const applyElementClass = (
    node: RenderElement,
    component: AnyComponent,
    external: Record<string, string[]> | undefined,
  ): boolean => {
    const element = component.getBackendElement() as unknown as HTMLElement | null
    if (!element?.setAttribute) return false
    applyClassProps(element, node.props, node.scopes, node.scopeChain, external, pageScopes)
    applyWxsOverrides(element)
    return true
  }

  const queueElementClass = (
    node: RenderElement,
    component: AnyComponent,
    external: Record<string, string[]> | undefined,
  ): void => {
    if (applyElementClass(node, component, external)) {
      pendingClasses.delete(node.id!)
      return
    }
    // Built-in components do not own their backend element until they are
    // attached. Keep the latest external-class map so a later flush does not
    // lose `custom-class` values while the element is still being created.
    pendingClasses.set(node.id!, () => {
      const latest = currentTree.get(node.id!)
      return applyElementClass(latest?.type === 'element' ? latest : node, component, external)
    })
  }

  const flushPendingClasses = (): void => {
    for (const [id, apply] of pendingClasses) {
      if (apply()) pendingClasses.delete(id)
    }
  }

  /**
   * Definition for a custom-component node.
   *
   * A node that carries a `componentPath` becomes a real component registered
   * under its artifact path (the same `is` the service uses), with the public
   * property table from the `define` payload. Nodes without a definition stay
   * generic containers keyed by tag, so unknown tags keep rendering.
   */
  const resolvingComponents = new Set<string>()
  /**
   * Resolve a `usingComponents` entry to a render definition. Built-in tags are
   * always available, so an evaluated template (`<canvas>` inside a component)
   * binds to the real built-in component instead of a native node.
   */
  const usingDefinitions = (
    componentPath: string | undefined,
  ): Record<string, glassEasel.GeneralComponentDefinition> => {
    const using: Record<string, glassEasel.GeneralComponentDefinition> = {}
    for (const tag of BUILTIN_COMPONENT_TAGS) {
      const definition = definitions[tag]
      if (definition) using[tag] = definition
    }
    const payload = componentPath ? componentDefinitions.get(componentPath) : undefined
    for (const [tag, path] of Object.entries(payload?.using ?? {})) {
      if (using[tag] || resolvingComponents.has(path)) continue
      const definition = componentDefinition(tag, path)
      if (definition) using[tag] = definition
    }
    return using
  }

  /** Resolve `./x`, `../x` or `/x` against the component path (compiler rules). */
  const resolveComponentPath = (sourcePath: string, reference: string): string => {
    if (reference.startsWith('/')) return reference.slice(1)
    const posix = (value: string) => value.split('\\').join('/')
    const segments = [...posix(sourcePath).split('/').slice(0, -1), ...posix(reference).split('/')]
    const output: string[] = []
    for (const segment of segments) {
      if (!segment || segment === '.') continue
      if (segment === '..') output.pop()
      else output.push(segment)
    }
    return output.join('/')
  }

  const componentDefinition = (
    tag: string,
    componentPath?: string,
  ): glassEasel.GeneralComponentDefinition => {
    const key = componentPath ? `path:${componentPath}` : `tag:${tag}`
    const existing = containers.get(key)
    if (existing) return existing
    const payload = componentPath ? componentDefinitions.get(componentPath) : undefined
    if (componentPath) resolvingComponents.add(componentPath)
    const using = usingDefinitions(componentPath)
    // `apply-shared` / `shared` components also answer to the page scope, so
    // their elements get the page-scoped classes as well.
    const componentOptions = payload?.options as {
      styleIsolation?: string
      multipleSlots?: boolean
      virtualHost?: boolean
    } | undefined
    const isolation = componentOptions?.styleIsolation
    const extraStyleScope = (isolation === 'apply-shared' || isolation === 'shared') && pageScopeName
      ? styleScopeManager.register(pageScopeName)
      : undefined
    // glass-easel resolves behavior strings by URL, which cannot match a `wx://`
    // id from a component whose `is` is an artifact path; resolve to objects.
    const publicBehaviors = getPublicBuiltinBehaviors(space, behaviorScheme)
    const behaviors = (payload?.behaviors ?? [])
      .map((id) => publicBehaviors?.[id])
      .filter((behavior): behavior is glassEasel.GeneralBehavior => Boolean(behavior))
    // `componentGenerics` defaults: resolve the declared default component to a
    // render definition so the component's `<alias>` tags resolve on this side.
    const generics: Record<string, { default: glassEasel.GeneralComponentDefinition } | true> = {}
    for (const [alias, value] of Object.entries(payload?.generics ?? {})) {
      if (value === true || !value.default) {
        generics[alias] = true
        continue
      }
      const defaultPath = resolveComponentPath(componentPath ?? '', value.default)
      if (!defaultPath || resolvingComponents.has(defaultPath)) continue
      generics[alias] = { default: componentDefinition(alias, defaultPath) }
    }
    const definition = space.defineComponent({
      is: componentPath ?? `${TINY_ENGINE_NAMING.renderContainerDefinitionPrefix}${tag}`,
      options: {
        // The trailing `*` is glass's "prefix the template tag" form: in
        // domlike mode the backend element is `tagNamePrefix + tagName`, so
        // template-created components also get the `tiny-` host prefix.
        hostNodeTagName: `${TINY_ENGINE_NAMING.hostTagPrefix}*`,
        reflectToAttributes: true,
        // Templates inside an evaluated component address nodes by `#id`
        // (`createSelectorQuery`, WXS `selectComponent`), so ids must reach
        // the backend element like the service-side adapter does.
        writeIdToDOM: true,
        unknownPropertyHandler(name: string, value: unknown) {
          if (name !== 'name' && name !== 'value') return false
          const instance = this as unknown as object
          const current = rawPropsByComponent.get(instance) ?? {}
          current[name] = value
          rawPropsByComponent.set(instance, current)
          return true
        },
        ...(payload?.styleScope
          ? { styleScope: styleScopeManager.register(payload.styleScope) }
          : {}),
        ...(extraStyleScope !== undefined ? { extraStyleScope } : {}),
        // WeChat's component options: multi-slot distribution and virtual
        // hosts (`virtualHost: true` removes the component's own host element).
        ...(componentOptions?.multipleSlots ? { multipleSlots: true } : {}),
        ...(componentOptions?.virtualHost ? { virtualHost: true } : {}),
      },
      ...(payload?.properties ? { properties: payload.properties as never } : {}),
      // Declaration-time data (including behavior data) seeds the render
      // instance so its template renders the same initial tree as the service.
      ...(payload?.data && Object.keys(payload.data).length > 0
        ? { data: payload.data }
        : {}),
      ...(payload?.externalClasses && payload.externalClasses.length > 0
        ? { externalClasses: payload.externalClasses }
        : {}),
      ...(behaviors.length > 0 ? { behaviors } : {}),
      ...(generics && Object.keys(generics).length > 0 ? { generics } : {}),
      ...(payload?.methods && payload.methods.length > 0
        ? {
            methods: Object.fromEntries(
              payload.methods.map((name) => [name, templateHandler(name)]),
            ) as never,
          }
        : {}),
      ...(using && Object.keys(using).length > 0 ? { using } : {}),
      ...(templates && componentPath
        ? {
            template: {
              groupList: templates.groupList,
              content: (name = '') => templates!.content(componentPath, name),
              // WeChat's pageframe diffs the evaluated WXML instead of using
              // glass's per-field binding-map fast path. WXS module state is
              // outside component data, so only a full template pass can
              // refresh calls such as `{{state.peek()}}`.
              updateMode: 'virtualTree',
            } as never,
          }
        : {}),
    }).general()
    if (componentPath) resolvingComponents.delete(componentPath)
    containers.set(key, definition)
    space.registerComponent(componentPath ?? tag, definition)
    return definition
  }

  // The render root carries the page style scope: glass resolves `~name`
  // classes against the root scope, which is how a component opts into the
  // page scope under render-side evaluation.
  let rootSequence = 0
  const createRoot = (scopeName?: string, using?: Record<string, glassEasel.GeneralComponentDefinition>) => {
    rootSequence += 1
    const definition = space.defineComponent({
      is: `${TINY_ENGINE_NAMING.renderRootDefinition}-${rootSequence}`,
      ...(using && Object.keys(using).length > 0 ? { using } : {}),
      options: {
        hostNodeTagName: TINY_ENGINE_NAMING.renderRootTag,
        reflectToAttributes: true,
        ...(scopeName ? { styleScope: styleScopeManager.register(scopeName) } : {}),
      },
    }).general()
    return glassEasel.Component.createWithContext(
      TINY_ENGINE_NAMING.renderRootTag,
      definition,
      backend,
    )
  }
  let root = createRoot()
  let rootElement = root.getBackendElement() as unknown as HTMLElement | null
  if (rootElement && options.container) options.container.replaceChildren(rootElement)
  let tabBarRoot: AnyComponent | undefined
  let tabBarRootElement: HTMLElement | null = null
  let tabBarContainer: HTMLElement | null = null
  let tabBarRootId = ''
  const tabBarNodeIds = new Set<string>()
  let tabFrameRootId = ''
  let tabFramePageId = ''
  let tabFramePagePath = ''
  let tabFrameComponents: RenderComponentIdentity[] = []
  let mounted = false
  let pageScopeName = ''
  let pageUsing: Record<string, string> = {}
  let behaviorScheme = DEFAULT_BEHAVIOR_SCHEME
  let rootDirty = false

  const pageUsingDefinitions = (): Record<string, glassEasel.GeneralComponentDefinition> => {
    const using = usingDefinitions(undefined)
    for (const [tag, path] of Object.entries(pageUsing)) {
      if (!tag || !path || resolvingComponents.has(path)) continue
      const placeholder = pagePlaceholders[path] ?? pagePlaceholders[`/${path}`]
      if (!componentDefinitions.has(path) && placeholder) {
        const definition = definitions[placeholder as BuiltinComponentTag]
        if (definition) {
          using[tag] = definition
          continue
        }
      }
      using[tag] = componentDefinition(tag, path)
    }
    return using
  }

  /**
   * Rebuild the root with the page facts known before mount: the style scope
   * (`~class`) and the page's `usingComponents` (needed to resolve
   * `generic:alias` targets declared on page-level components). Deferred to the
   * start of `mount` so both facts apply in a single rebuild.
   */
  const rebuildRoot = (): void => {
    if (mounted || !rootDirty) return
    rootDirty = false
    const using = pageUsingDefinitions()
    const previous = root
    root = createRoot(pageScopeName || undefined, using)
    rootElement = root.getBackendElement() as unknown as HTMLElement | null
    if (rootElement && options.container) options.container.replaceChildren(rootElement)
    ;(previous as unknown as { destroy?: () => void }).destroy?.()
  }

  /** Later calls are ignored: rebuilding a root that owns a tree orphans nodes. */
  const setPageScope = (name: string): void => {
    if (!name || mounted || name === pageScopeName) return
    pageScopeName = name
    rootDirty = true
  }

  /** Page-level `usingComponents`, installed before the first mount. */
  const setPageUsing = (using: Record<string, string>): void => {
    if (!using || mounted) return
    pageUsing = using
    rootDirty = true
  }

  /** Public behavior scheme from the service's compatibility config. */
  const setBehaviorScheme = (scheme: string): void => {
    if (scheme) behaviorScheme = scheme
  }

  // One compositor per render tree: raw touch (or mouse in the devtool) is
  // recognized as a gesture here and injected into glass, so page bindings and
  // built-in components share a single tap/longpress source.
  //
  // Listen at the document element: root-portal content is appended to
  // `document.documentElement` (matching WeChat 2.33.0), so a container-scoped
  // listener would never see it. Ownership is checked against the glass tree,
  // which keeps two trees in one document from injecting each other's events.
  const compositorRoot = options.container
    ? options.container.ownerDocument?.documentElement ?? options.container
    : rootElement
  const composedParentOf = (element: glassEasel.Element): glassEasel.Element | null => {
    const candidate = element as unknown as {
      getComposedParent?: () => glassEasel.Element | null
      parentNode?: glassEasel.Element | null
    }
    return candidate.getComposedParent?.() ?? candidate.parentNode ?? null
  }
  const isOwnedTarget = (element: glassEasel.Element): boolean => {
    let current: glassEasel.Element | null = element
    while (current) {
      if (current === root || current === tabBarRoot) return true
      current = composedParentOf(current)
    }
    return false
  }
  /**
   * `~name` in WXML asks for the *page* scope instead of the owning component's
   * scope. The service resolves it while flattening; with render-side
   * evaluation the DOM is produced by glass, so rewrite the class tokens after
   * they appear (and keep watching, because a re-render can re-add them).
   */
  const detachCompositor = compositorRoot
    ? attachEventCompositor({
        root: compositorRoot,
        isOwnedTarget,
        onTouch: (touch, target) => {
          // Mouse input is projected into the same touch sequence a phone
          // produces, so hover/touchtrack/template `bindtouch*` stay single-path.
          glassEasel.Event.triggerEvent(target, touch.name, {}, {
            bubbles: true,
            composed: true,
            capturePhase: true,
            originalEvent: touch.originalEvent,
            extraFields: {
              touches: touch.touches,
              changedTouches: touch.changedTouches,
            },
          })
        },
        onGesture: (gesture, target) => {
          glassEasel.Event.triggerEvent(target, gesture.name, gesture.detail, {
            bubbles: true,
            composed: true,
            // Match glass's own synthesis: a tap runs the capture phase
            // before the bubble phase so `capture-bind:tap` sees it.
            capturePhase: true,
            originalEvent: gesture.originalEvent,
            extraFields: {
              native: {
                clientX: gesture.detail.x,
                clientY: gesture.detail.y,
                x: gesture.detail.x,
                y: gesture.detail.y,
              },
            },
          })
        },
      })
    : () => {}

  const appendChild = (parent: AnyComponent, child: AnyComponent | glassEasel.TextNode): void => {
    parent.appendChild(child as never)
  }

  type ShadowLike = {
    createTextNode: (text: string) => glassEasel.TextNode
    createComponentByDef: (
      tagName: string,
      definition: glassEasel.GeneralComponentDefinition,
    ) => AnyComponent
  }

  const lightShadow = (owner: AnyComponent): ShadowLike => {
    const element = owner as unknown as {
      ownerShadowRoot?: ShadowLike
      shadowRoot?: ShadowLike
    }
    return element.ownerShadowRoot ?? element.shadowRoot
      ?? (root.shadowRoot as unknown as ShadowLike)
  }

  let localIdCounter = 0
  /** Elements carry no service id; the render tree owns their identity. */
  const ensureNodeId = (node: RenderNode): string => {
    if (!node.id) {
      localIdCounter += 1
      node.id = `${RENDER_LOCAL_ID_PREFIX}${localIdCounter}`
    }
    return node.id ?? null
  }

  const createText = (node: RenderText, owner: AnyComponent): glassEasel.TextNode => {
    ensureNodeId(node)
    const text = lightShadow(owner).createTextNode(node.text)
    nodes.set(node.id!, text)
    currentTree.set(node.id!, node)
    return text
  }

  const nativeFields = (event: Event): Record<string, unknown> => {
    const source = event as unknown as Record<string, unknown>
    const native: Record<string, unknown> = {}
    for (const key of [
      'clientX', 'clientY', 'pageX', 'pageY', 'x', 'y', 'key', 'code', 'value',
      'checked', 'selectedIndex', 'scrollTop', 'scrollLeft', 'deltaX', 'deltaY',
    ]) {
      if (source[key] !== undefined) native[key] = source[key]
    }
    const target = event.target as HTMLInputElement | null
    if (target && typeof target.value === 'string') native.value = target.value
    if (target && typeof target.checked === 'boolean') native.checked = target.checked
    return native
  }

  const geometryOf = (
    element: HTMLElement | null,
    viewId: string,
  ): RenderEventGeometry | undefined => (
    element
      ? {
          viewId,
          offsetLeft: element.offsetLeft,
          offsetTop: element.offsetTop,
          offsetWidth: element.offsetWidth,
          offsetHeight: element.offsetHeight,
        }
      : undefined
  )

  /** Nearest render node above a DOM event target (the tapped child, not the binding). */
  const geometryOfTarget = (target: EventTarget | null): RenderEventGeometry | undefined => {
    let current = target instanceof Element ? target : null
    while (current) {
      const viewId = current.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute)
      if (viewId) return geometryOf(current as HTMLElement, viewId)
      current = current.parentElement
    }
    return undefined
  }

  // Touch coordinates are prototype getters, so `{ ...touch }` drops them.
  // Materialise the fields mini programs read into plain objects.
  const normalizeTouchList = (list: unknown): Array<Record<string, unknown>> | undefined => {
    if (!list || typeof list !== 'object') return undefined
    const entries = Array.from(list as ArrayLike<Record<string, unknown>>)
    if (entries.length === 0) return undefined
    return entries.map((touch) => ({
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY,
      clientX: touch.clientX,
      clientY: touch.clientY,
      screenX: touch.screenX,
      screenY: touch.screenY,
      force: touch.force,
      radiusX: touch.radiusX,
      radiusY: touch.radiusY,
    }))
  }

  // A touch object is often shared by `touches`, `changedTouches` and the
  // detail copy; clone each occurrence so the bridge serializer sees a tree,
  // not a repeated reference it reports as circular.
  const cloneTouch = (value: unknown): unknown => (
    value && typeof value === 'object' ? { ...(value as Record<string, unknown>) } : value
  )
  const cloneTouchList = (value: unknown): unknown[] | undefined => (
    Array.isArray(value) ? value.map(cloneTouch) : undefined
  )

  const backendElementOf = (target: unknown): HTMLElement | null => {
    const element = (target as { getBackendElement?: () => unknown })?.getBackendElement?.()
    // Duck-typed so detached test backends (no DOM/HTMLElement global) work too.
    if (!element || typeof (element as HTMLElement).getAttribute !== 'function') return null
    return element as HTMLElement
  }

  type GlassEventNode = {
    ownerShadowRoot?: { getHostNode?: () => unknown } | null
    parentNode?: unknown
    forEachNonVirtualComposedChild?: (callback: (node: unknown) => boolean | void) => boolean
    getBackendElement?: () => unknown
  }

  /**
   * Resolve the WXML node behind a glass event target.
   *
   * Built-in components open their own shadow tree for internal DOM, so the
   * raw target may be an implementation node. Walk back to the host whose owner
   * is a page or custom component: that host is the node the mini program wrote.
   */
  const semanticGlassTarget = (target: unknown): {
    node: GlassEventNode
    ownerShadow: NonNullable<GlassEventNode['ownerShadowRoot']>
    ownerId: string
  } | undefined => {
    let current = target as GlassEventNode | undefined
    while (current) {
      const ownerShadow = current.ownerShadowRoot
      if (!ownerShadow) return undefined
      const owner = ownerShadow?.getHostNode?.() as GlassEventNode | undefined
      if (!owner) return undefined
      const backend = backendElementOf(owner)
      const hostScope = backend?.getAttribute(TINY_ENGINE_NAMING.hostAttribute) ?? ''
      const ownerId = backend?.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
      if (ownerId && hostScope && !hostScope.startsWith(TINY_ENGINE_NAMING.builtinStyleScopePrefix)) {
        return { node: current, ownerShadow, ownerId }
      }
      current = owner
    }
    return undefined
  }

  const directGlassChildren = (parent: unknown): unknown[] => {
    const children: unknown[] = []
    const target = parent as GlassEventNode | undefined
    if (typeof target?.forEachNonVirtualComposedChild === 'function') {
      target.forEachNonVirtualComposedChild((child) => {
        children.push(child)
        return true
      })
      return children
    }
    const childNodes = (parent as { childNodes?: ArrayLike<unknown> } | undefined)?.childNodes
    if (childNodes) {
      for (let index = 0; index < childNodes.length; index += 1) {
        children.push(childNodes[index])
      }
    }
    return children
  }

  /**
   * The service indexes pageframe WXML nodes as `owner#index.path`. Reconstruct
   * that path over the non-virtual glass child list; no per-element DOM
   * attribute is needed.
   */
  const glassTargetLocator = (
    target: ReturnType<typeof semanticGlassTarget>,
  ): string | undefined => {
    if (!target) return undefined
    const path: number[] = []
    let current: unknown = target.node
    while (current && current !== target.ownerShadow) {
      const parent = (current as GlassEventNode).parentNode
      if (!parent) return undefined
      const index = directGlassChildren(parent).indexOf(current)
      if (index < 0) return undefined
      path.unshift(index)
      current = parent
    }
    return current === target.ownerShadow && path.length > 0
      ? `${target.ownerId}${'#'}${path.join('.')}`
      : undefined
  }

  const renderTargetOf = (
    target: unknown,
  ): { identity?: string; geometry?: RenderEventGeometry } => {
    const semantic = semanticGlassTarget(target)
    if (semantic) {
      const backend = backendElementOf(semantic.node)
      const componentId = backend?.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
      const identity = componentId || glassTargetLocator(semantic)
      return {
        ...(identity ? { identity } : {}),
        ...(backend && identity ? { geometry: geometryOf(backend, identity) } : {}),
      }
    }
    const backend = backendElementOf(target)
    const targetGeometry = backend ? geometryOfTarget(backend) : undefined
    return {
      ...(targetGeometry?.viewId
        ? { identity: renderIdentityOfViewId(targetGeometry.viewId) }
        : {}),
      ...(targetGeometry ? { geometry: targetGeometry } : {}),
    }
  }

  /**
   * Gestures are injected by the compositor; a raw DOM event on any other name
   * is glass's native projection and is already covered by a built-in
   * component's `triggerEvent`. Forward only the projections whose payload the
   * render host owns (click/touch*), so e.g. `input`/`change` do not fire twice.
   */
  const isGestureEvent = (name: string): boolean => (
    name === 'tap' || name === 'longpress' || name === 'canceltap'
  )
  const isNativeProjection = (name: string): boolean => (
    name === 'click' || name.startsWith('touch')
  )
  // DOM events no built-in component re-emits with a normalized detail. Pages
  // can bind them directly; forwarding the raw projection is the only source.
  const RAW_PASSTHROUGH_EVENTS = new Set([
    'transitionend',
    'animationstart',
    'animationend',
    'animationiteration',
    'wheel',
    'touchforcechange',
  ])
  const shouldForwardGlassEvent = (name: string, original: unknown): boolean => (
    original === undefined
    || isGestureEvent(name)
    || isNativeProjection(name)
    || RAW_PASSTHROUGH_EVENTS.has(name)
  )

  /**
   * Build the service-facing payload from one glass event.
   *
   * A touched node is the source of truth for `touches`; synthesized events
   * (tap/longpress from the compositor) carry their own detail and native
   * coordinates instead.
   */
  /**
   * Service-facing identity of a snapshot node: components keep their shared
   * id; elements are addressed by a component-scoped locator.
   */
  const locatorOfNodeId = (id: string | undefined): string | undefined => {
    if (!id) return undefined
    const search = (node: RenderNode, owner: string, path: number[]): string | null => {
      if (node.id === id) return path.length > 0 ? formatLocator(owner, path) : owner
      if (node.type !== 'element') return null
      const boundary = node.component === true && node.id ? node.id : owner
      const base = boundary === owner ? path : []
      for (const [index, child] of (node.children ?? []).entries()) {
        const found = search(child, boundary, [...base, index])
        if (found) return found
      }
      return null
    }
    const roots = [currentTree.get(rootId.value), tabBarRootId ? currentTree.get(tabBarRootId) : undefined]
    for (const rootNode of roots) {
      if (!rootNode) continue
      const found = search(rootNode, rootNode.id ?? '', [])
      if (found) return found
    }
    return undefined
  }

  const renderIdentityOfViewId = (id: string | undefined): string | undefined => {
    if (!id) return undefined
    const node = currentTree.get(id)
    if (node?.type === 'element' && node.component === true) return id
    return locatorOfNodeId(id)
  }

  const buildRenderEventPayload = (
    node: RenderElement,
    element: HTMLElement | null,
    name: string,
    event: glassEasel.Event<unknown> & {
      target?: unknown
      touches?: unknown
      changedTouches?: unknown
      native?: Record<string, unknown>
    },
    original: unknown,
  ): GlassRenderEvent => {
    const isTouch = name.startsWith('touch')
    const currentTarget = geometryOf(element, node.id!)
    const renderTarget = renderTargetOf(event.target)
    const targetGeometry = renderTarget.geometry
    const targetId = renderTarget.identity
    const payload: GlassRenderEvent = {
      id: node.component === true ? node.id! : locatorOfNodeId(node.id!) ?? node.id!,
      name,
      ...(currentTarget ? { currentTarget } : {}),
      ...(targetId ? { targetId } : {}),
    }
    if (isTouch) {
      const touchEvent = original as TouchEvent | null
      const touches = touchEvent?.touches
        ? normalizeTouchList(touchEvent.touches)
        : cloneTouchList(event.touches)
      const changedTouches = touchEvent?.changedTouches
        ? normalizeTouchList(touchEvent.changedTouches)
        : cloneTouchList(event.changedTouches)
      if (touches) payload.touches = touches
      if (changedTouches) payload.changedTouches = changedTouches
    } else if (event.detail !== undefined) {
      const detail = plainEventDetail(event.detail)
      if (detail !== undefined) payload.detail = detail
    }
    if (original) payload.native = nativeFields(original as Event)
    else if (event.native) payload.native = event.native
    if (targetGeometry) payload.target = targetGeometry
    return payload
  }

  /**
   * `catchtouchmove` must stop the page from scrolling underneath a mask.
   *
   * The delegated touchmove listener is passive (scroll performance), so it
   * cannot preventDefault. Only nodes that actually carry `catchtouchmove`
   * get a non-passive native listener here; it lets an inner scroll container
   * keep scrolling until it reaches its edge, then blocks the page.
   */
  const attachTouchMoveGuard = (
    element: HTMLElement | null,
    cleanups: Array<() => void>,
  ): void => {
    if (!element || typeof element.addEventListener !== 'function') return
    let startX = 0
    let startY = 0
    let scrollables: Array<{ element: HTMLElement; vertical: boolean; horizontal: boolean }> = []
    const collect = (event: TouchEvent): void => {
      const touch = event.touches[0]
      startX = touch?.clientX ?? 0
      startY = touch?.clientY ?? 0
      scrollables = []
      const view = element.ownerDocument?.defaultView
      if (!view || typeof view.getComputedStyle !== 'function') return
      let node = event.target as Node | null
      while (node && node !== element) {
        const candidate = node as HTMLElement
        if (candidate.nodeType === 1 && typeof candidate.scrollHeight === 'number') {
          const style = view.getComputedStyle(candidate)
          const vertical = /(auto|scroll|overlay)/.test(style.overflowY)
            && candidate.scrollHeight > candidate.clientHeight + 1
          const horizontal = /(auto|scroll|overlay)/.test(style.overflowX)
            && candidate.scrollWidth > candidate.clientWidth + 1
          if (vertical || horizontal) {
            scrollables.push({ element: candidate, vertical, horizontal })
          }
        }
        node = node.parentNode
      }
    }
    const guard = (event: TouchEvent): void => {
      event.stopPropagation()
      if (event.cancelable === false) return
      const touch = event.touches[0]
      if (!touch) return
      const dx = touch.clientX - startX
      const dy = touch.clientY - startY
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      for (const entry of scrollables) {
        if (entry.vertical && Math.abs(dy) >= Math.abs(dx)) {
          const max = entry.element.scrollHeight - entry.element.clientHeight
          if (dy < 0 ? entry.element.scrollTop < max : entry.element.scrollTop > 0) return
        }
        if (entry.horizontal && Math.abs(dx) > Math.abs(dy)) {
          const max = entry.element.scrollWidth - entry.element.clientWidth
          if (dx < 0 ? entry.element.scrollLeft < max : entry.element.scrollLeft > 0) return
        }
      }
      event.preventDefault()
    }
    element.addEventListener('touchstart', collect, { capture: true, passive: true })
    element.addEventListener('touchmove', guard, { capture: false, passive: false })
    cleanups.push(() => {
      element.removeEventListener('touchstart', collect, { capture: true })
      element.removeEventListener('touchmove', guard, { capture: false })
    })
  }

  const clearPageFrameTouchMoveGuards = (): void => {
    for (const cleanup of pageFrameTouchMoveCleanups.values()) cleanup()
    pageFrameTouchMoveCleanups.clear()
  }

  const queuePageFrameTouchMoveGuards = (): void => {
    if (!pageFrameRoot) return
    queueMicrotask(() => {
      if (
        !pageFrameRoot
        || !rootElement
        || typeof (rootElement as { querySelectorAll?: unknown }).querySelectorAll !== 'function'
      ) return
      const marked = new Set(
        Array.from(rootElement.querySelectorAll(`[${TINY_ENGINE_NAMING.catchTouchMoveAttribute}]`)),
      )
      for (const [element, cleanup] of pageFrameTouchMoveCleanups) {
        if (marked.has(element) && element.isConnected) continue
        cleanup()
        pageFrameTouchMoveCleanups.delete(element)
      }
      for (const element of marked) {
        if (pageFrameTouchMoveCleanups.has(element)) continue
        const cleanups: Array<() => void> = []
        attachTouchMoveGuard(element as HTMLElement, cleanups)
        pageFrameTouchMoveCleanups.set(element, () => {
          for (const cleanup of cleanups) cleanup()
        })
      }
    })
  }

  const attachEvents = (
    node: RenderElement,
    component: AnyComponent,
    skipDynamic?: Set<string>,
  ): void => {
    const events = node.events ?? []
    if (events.length === 0) return
    const element = component.getBackendElement() as unknown as HTMLElement | null
    const cleanups: Array<() => void> = []
    for (const binding of events) {
      if (skipDynamic?.has(binding.name)) continue
      const capture = binding.capture === true
      const listener = (event: glassEasel.Event<unknown> & {
        touches?: unknown
        changedTouches?: unknown
        native?: Record<string, unknown>
      }): void => {
        // A service-triggered custom event already ran its JS listeners; the
        // render tree only dispatches WXS handlers for it.
        if (serviceEventDepth > 0) return
        const original = (event as unknown as { getOriginalEvent?: () => unknown })
          .getOriginalEvent?.()
        // A built-in component (canvas) re-dispatches a normalized event and
        // marks the raw one; only forward the normalized copy.
        // Only raw touch projections are de-duplicated by built-ins (canvas).
        // Synthesized tap/longpress legitimately carry the same native event.
        if (original && binding.name.startsWith('touch') && isHandledNativeEvent(original)) return
        if (!shouldForwardGlassEvent(binding.name, original)) return
        // `catch` is a compile-time binding; glass owns the bubble path, so
        // stopping here is what makes `catchtap` block parent handlers.
        if (binding.catch === true) event.stopPropagation()
        emitServiceEvent(buildRenderEventPayload(node, element, binding.name, event, original))
      }
      component.addListener(binding.name, listener as never, { capture })
      cleanups.push(() => component.removeListener(binding.name, listener as never, { capture }))
      if (binding.catch === true && binding.name === 'touchmove') {
        attachTouchMoveGuard(element, cleanups)
      }
    }
    if (cleanups.length > 0) eventCleanups.set(node.id!, cleanups)
  }

  const wxsOwnerElement = (element: HTMLElement): HTMLElement => {
    let current: HTMLElement | null = element
    while (current) {
      const host = typeof current.getAttribute === 'function'
        ? current.getAttribute(TINY_ENGINE_NAMING.hostAttribute) ?? ''
        : ''
      if (host && !host.startsWith(TINY_ENGINE_NAMING.builtinStyleScopePrefix)) return current
      if (typeof current.tagName === 'string'
        && current.tagName.toLowerCase() === TINY_ENGINE_NAMING.pageTag) return current
      current = current.parentElement
    }
    return rootElement ?? element
  }

  const wxsNodeForElement = (element: HTMLElement | null): RenderElement | undefined => {
    if (!element || typeof element.getAttribute !== 'function') return undefined
    const id = element.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
    const node = currentTree.get(id)
    return node?.type === 'element' ? node : undefined
  }

  const wxsDescriptorFor = (
    element: HTMLElement | null,
    owner: HTMLElement | null,
    fallbackViewId?: string,
    explicitNode?: RenderElement,
  ) => {
    const node = explicitNode ?? wxsNodeForElement(element)
    const viewId = node?.id ?? fallbackViewId
    const ownerViewId = wxsNodeForElement(owner)?.id ?? fallbackViewId
    const descriptor = {
      selectComponent(selector: string) {
        if (!owner) return null
        const [match] = queryScopedElements(owner, selector, false)
        return match
          ? wxsDescriptorFor(match as HTMLElement, wxsOwnerElement(match as HTMLElement))
          : null
      },
      selectAllComponents(selector: string) {
        if (!owner) return []
        return queryScopedElements(owner, selector, true)
          .map((match) => wxsDescriptorFor(match as HTMLElement, wxsOwnerElement(match as HTMLElement)))
      },
      getDataset() {
        return node?.dataset ?? (element ? { ...element.dataset } : {})
      },
      getState() {
        // WeChat stores `__wxsState` on the descriptor element itself.
        if (element) {
          let state = wxsStates.get(element)
          if (!state) {
            state = {}
            wxsStates.set(element, state)
          }
          return state
        }
        const key = ownerViewId ?? viewId
        if (key) {
          let state = wxsStatesById.get(key)
          if (!state) {
            state = {}
            wxsStatesById.set(key, state)
          }
          return state
        }
        return {}
      },
      setStyle(style: unknown) {
        if (!style || !element) return descriptor
        const overrides = wxsOverridesFor(element)
        if (typeof style === 'string') {
          for (const part of style.split(';')) {
            const separator = part.indexOf(':')
            if (separator <= 0) continue
            const name = part.slice(0, separator).trim()
            const value = part.slice(separator + 1).trim()
            if (name && value) overrides.style.set(name, convertRpx(value))
          }
        } else if (typeof style === 'object') {
          for (const [name, value] of Object.entries(style as Record<string, unknown>)) {
            if (value === undefined || value === null) continue
            const property = name.startsWith('--')
              ? name
              : name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
            overrides.style.set(property, convertRpx(String(value)))
          }
        }
        applyWxsOverrides(element)
        return descriptor
      },
      addClass(name: string) {
        if (!element) return descriptor
        wxsOverridesFor(element).classes.add(name)
        applyWxsOverrides(element)
        return descriptor
      },
      removeClass(name: string) {
        if (!element) return descriptor
        wxsOverridesFor(element).classes.delete(name)
        element.classList.remove(name)
        return descriptor
      },
      hasClass(name: string) {
        return element ? element.classList.contains(name) : false
      },
      callMethod(name: string, ...args: unknown[]) {
        // WeChat resolves `callMethod` to the descriptor element's component
        // (or the element's ownerShadowRoot host), not to the bound element id.
        const effectViewId = node?.component === true
          ? viewId
          : (ownerViewId ?? viewId)
        if (effectViewId) {
          const safeArgs = args.map((arg) => plainEventDetail(arg) ?? null)
          wxsEffectSink?.({
            kind: 'callMethod',
            viewId: effectViewId,
            method: name,
            args: safeArgs,
          })
        }
        return undefined
      },
      requestAnimationFrame(callback: () => void) {
        return requestAnimationFrame(callback)
      },
      setTimeout(callback: (...args: unknown[]) => void, delay?: number, ...args: unknown[]) {
        const timer = setTimeout(() => {
          wxsTimers.delete(timer)
          callback(...args)
        }, Number(delay) || 0)
        wxsTimers.add(timer)
        return timer
      },
      clearTimeout(timer: ReturnType<typeof setTimeout>) {
        clearTimeout(timer)
        wxsTimers.delete(timer)
      },
      getBoundingClientRect() {
        return element?.getBoundingClientRect() ?? {
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON() { return this },
        }
      },
      getComputedStyle(names?: string[]) {
        if (!element) return {}
        const computed = getComputedStyle(element)
        if (Array.isArray(names)) {
          return Object.fromEntries(names.map((name) => [name, computed.getPropertyValue(name)]))
        }
        return computed
      },
      triggerEvent(name: string, detail?: unknown, options?: Record<string, unknown>) {
        if (viewId) wxsEffectSink?.({ kind: 'triggerEvent', viewId, name, detail, options })
        return undefined
      },
    }
    return descriptor
  }

  /**
   * The compiled template bundle asks this global for the `ins` descriptor of
   * a WXS event handler. Render-evaluated component trees need it too: the
   * template's WXS listener runs here, and every descriptor method either
   * touches the local DOM or forwards to the service through `wxsEffect`.
   */
  const installWxsEventHost = (): (() => void) => {
    const globalObject = globalThis as unknown as Record<string, unknown>
    const key = TINY_ENGINE_NAMING.wxsEventHostGlobal
    const previous = globalObject[key]
    // The owner is captured at binding time: the template evaluates the node
    // while it is still detached from the mounted tree, so resolving later from
    // the event's element can walk the wrong ancestor chain.
    /**
     * Resolve the owning page/component through the *glass* element chain.
     *
     * A template listener is created while its node is still detached from the
     * mounted DOM, so `parentElement` cannot reach the component host. Glass
     * already knows the owner shadow root, and that chain is valid from the
     * moment the node is created.
     */
    const ownerFromGlass = (element: HTMLElement): { node: HTMLElement; viewId?: string } => {
      let current = (element as unknown as { __wxElement?: unknown }).__wxElement as {
        ownerShadowRoot?: { getHostNode?: () => unknown } | null
        parentNode?: unknown
      } | undefined
      for (let depth = 0; current && depth < 64; depth += 1) {
        const host = current.ownerShadowRoot?.getHostNode?.() as {
          getBackendElement?: () => unknown
          ownerShadowRoot?: { getHostNode?: () => unknown } | null
          parentNode?: unknown
        } | undefined
        if (host) {
          const backend = host.getBackendElement?.() as HTMLElement | null
          const hostScope = backend?.getAttribute?.(TINY_ENGINE_NAMING.hostAttribute) ?? ''
          const viewId = backend?.getAttribute?.(TINY_ENGINE_NAMING.nodeIdAttribute) ?? undefined
          if (
            backend
            && viewId
            && hostScope
            && !hostScope.startsWith(TINY_ENGINE_NAMING.builtinStyleScopePrefix)
          ) {
            return { node: backend, viewId }
          }
          current = host
          continue
        }
        current = current.parentNode as typeof current
      }
      return { node: wxsOwnerElement(element) }
    }

    const host = {
      descriptorFor(element: unknown) {
        // The template wrapper passes the glass node, not its backend element.
        const raw = element as { getBackendElement?: () => unknown } | null
        const target = (raw && typeof raw.getBackendElement === 'function'
          ? raw.getBackendElement()
          : raw) as HTMLElement | null
        if (!target) return null
        const resolved = ownerFromGlass(target)
        const targetNode = wxsNodeForElement(target)
        const owner = targetNode?.component === true ? target : resolved.node
        return wxsDescriptorFor(target, owner, resolved.viewId)
      },
    }
    globalObject[key] = host
    return () => {
      if (previous === undefined) delete globalObject[key]
      else globalObject[key] = previous
    }
  }

  const detachWxsEventHost = installWxsEventHost()

  const hasServiceListenerInPath = (start: HTMLElement | null, name: string): boolean => {
    let current = start
    while (current) {
      const id = current.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
      const candidate = id ? currentTree.get(id) : undefined
      if (candidate?.type === 'element' && candidate.events?.some((event) => event.name === name)) {
        return true
      }
      current = current.parentElement
    }
    return false
  }

  const applyWxsProps = (
    node: RenderElement,
    component: AnyComponent,
    previous: Record<string, unknown> | undefined,
    values?: Record<string, unknown>,
  ): void => {
    const bindings = parseWxsProps(node.props)
    if (bindings.length === 0) return
    const element = component.getBackendElement() as unknown as HTMLElement | null
    const owner = element ? wxsOwnerElement(element) : rootElement
    const descriptor = wxsDescriptorFor(element, owner, node.id, node)
    const nextValues = values ?? node.props ?? {}
    for (const binding of bindings) {
      const nextValue = nextValues[binding.prop]
      const oldValue = previous?.[binding.prop]
      if (previous && Object.is(nextValue, oldValue)) continue
      try {
        wxsRuntime.invoke(
          binding.moduleId,
          binding.exportPath,
          [nextValue, oldValue, descriptor],
        )
      } catch {
        // A failed prop observer must not break the render tree.
      }
    }
    wxsPropSnapshots.set(node.id!, { ...nextValues })
  }

  const dispatchWxs = (
    binding: WxsHandlerBinding,
    node: RenderElement,
    element: HTMLElement,
    payload: Record<string, unknown>,
    stop: () => void,
  ): void => {
    const owner = wxsOwnerElement(element)
    const descriptor = wxsDescriptorFor(element, owner)
    payload.instance = descriptor
    let result: unknown
    try {
      result = wxsRuntime.invoke(binding.moduleId, binding.exportPath, [payload, descriptor])
    } catch {
      return
    }
    if (result === false || binding.catch) {
      stop()
      return
    }
    if (serviceEventDepth === 0 && hasServiceListenerInPath(element.parentElement, binding.name)) {
      const { instance: _instance, ...servicePayload } = payload
      emitServiceEvent({
        ...servicePayload,
        wxsHandled: true,
      } as unknown as GlassRenderEvent)
    }
  }

  const attachDynamicWxsEvents = (
    node: RenderElement,
    component: AnyComponent,
    bindings: WxsDynamicEventBinding[],
  ): void => {
    if (bindings.length === 0) return
    const element = component.getBackendElement() as unknown as HTMLElement | null
    if (!element) {
      pendingWxsEvents.set(node.id!, () => attachDynamicWxsEvents(node, component, bindings))
      return
    }
    const cleanups = eventCleanups.get(node.id!) ?? []
    const invoke = (
      binding: WxsDynamicEventBinding,
      payload: Record<string, unknown>,
      stop: () => void,
    ): void => {
      const bindingTarget = node.type === 'element' && node.component === true
        ? node.id!
        : locatorOfNodeId(node.id!) ?? node.id!
      const resolved = dynamicBindingModes.get(wxsBindingKey(bindingTarget, binding.name))
      const handler = resolved?.moduleId && resolved.exportPath
        ? wxsRuntime.resolve(resolved.moduleId, resolved.exportPath)
        : undefined
      if (resolved?.moduleId && resolved.exportPath && handler) {
        dispatchWxs({
          name: binding.name,
          moduleId: resolved.moduleId,
          exportPath: resolved.exportPath,
          ...(binding.catch ? { catch: true } : {}),
          ...(binding.capture ? { capture: true } : {}),
          ...(binding.mutated ? { mutated: true } : {}),
        }, node, element, payload, stop)
        return
      }
      if (serviceEventDepth > 0) return
      const servicePayload = { ...payload }
      if (servicePayload.target && typeof servicePayload.target === 'object') {
        const { dataset: _targetDataset, ...target } = servicePayload.target as Record<string, unknown>
        servicePayload.target = target
      }
      if (servicePayload.currentTarget && typeof servicePayload.currentTarget === 'object') {
        const { dataset: _currentDataset, ...currentTarget } = servicePayload.currentTarget as Record<string, unknown>
        servicePayload.currentTarget = currentTarget
      }
      emitServiceEvent(servicePayload as GlassRenderEvent)
    }

    for (const binding of bindings) {
      const listener = (event: glassEasel.Event<unknown> & {
        touches?: unknown
        changedTouches?: unknown
        native?: Record<string, unknown>
      }): void => {
        const original = (event as unknown as { getOriginalEvent?: () => unknown })
          .getOriginalEvent?.()
        // A service-triggered custom event already ran its JS listeners; only
        // the WXS handler may run here.
        if (serviceEventDepth === 0) {
          // Only raw touch projections are de-duplicated by built-ins (canvas).
          // Synthesized tap/longpress legitimately carry the same native event.
          if (original && binding.name.startsWith('touch') && isHandledNativeEvent(original)) return
          if (!shouldForwardGlassEvent(binding.name, original)) return
        }
        const payload = buildRenderEventPayload(
          node,
          element,
          binding.name,
          event,
          original,
        ) as unknown as Record<string, unknown>
        if (payload.currentTarget && node.dataset) {
          payload.currentTarget = {
            ...(payload.currentTarget as Record<string, unknown>),
            dataset: node.dataset,
          }
        }
        const targetNode = payload.target && (payload.target as { viewId?: string }).viewId
          ? currentTree.get((payload.target as { viewId: string }).viewId)
          : undefined
        if (payload.target && targetNode?.type === 'element' && targetNode.dataset) {
          payload.target = {
            ...(payload.target as Record<string, unknown>),
            dataset: targetNode.dataset,
          }
        }
        invoke(binding, payload, () => {
          event.preventDefault()
          event.stopPropagation()
          // `catchtouchmove` scroll locking is handled by the node-level
          // non-passive guard; the delegated listener is passive.
          if (binding.name !== 'touchmove') {
            ;(original as { preventDefault?: () => void } | undefined)?.preventDefault?.()
          }
        })
      }
      component.addListener(binding.name, listener as never, {
        capture: binding.capture === true,
        final: binding.catch === true,
        mutated: binding.mutated === true,
      })
      cleanups.push(() => component.removeListener(binding.name, listener as never, {
        capture: binding.capture === true,
      }))
      if (binding.catch === true && binding.name === 'touchmove') {
        attachTouchMoveGuard(element, cleanups)
      }
    }
    if (cleanups.length > 0) eventCleanups.set(node.id!, cleanups)
  }

  const flushPendingWxsEvents = (): void => {
    for (const [id, attach] of pendingWxsEvents) {
      const component = nodes.get(id)
      if (!component || glassEasel.TextNode.isTextNode(component)) continue
      if (!component.getBackendElement()) continue
      pendingWxsEvents.delete(id)
      attach()
    }
  }

  const flushAllWxsProps = (): void => {
    for (const [id, node] of currentTree) {
      if (node.type !== 'element' || node.component === true || parseWxsProps(node.props).length === 0) continue
      const component = nodes.get(id)
      if (!component || glassEasel.TextNode.isTextNode(component)) continue
      applyWxsProps(node, component, wxsPropSnapshots.get(id))
    }
  }

  const queuePageFrameWxsProps = (): void => {
    if (!pageFrameRoot) return
    queueMicrotask(() => {
      const rootNode = rootElement
      if (!rootNode || typeof rootNode.querySelectorAll !== 'function') return
      const nodes: HTMLElement[] = Array.from(
        rootNode.querySelectorAll(`[${WXS_PROPS_PROP}]`),
      )
      if (rootNode.hasAttribute(WXS_PROPS_PROP)) nodes.unshift(rootNode)
      for (const element of nodes) {
        const raw = element.getAttribute(WXS_PROPS_PROP) ?? ''
        const bindings = parseWxsProps({ [WXS_PROPS_PROP]: raw })
        if (bindings.length === 0) continue
        const component = (element as unknown as { __wxElement?: unknown }).__wxElement
        const values = (component as { data?: Record<string, unknown> } | undefined)?.data
        if (!values) continue
        const currentValues = { ...values }
        const owner = element.hasAttribute(TINY_ENGINE_NAMING.nodeIdAttribute)
          ? element
          : wxsOwnerElement(element)
        const descriptor = wxsDescriptorFor(element, owner)
        const previous = pageFrameWxsPropSnapshots.get(element) ?? {}
        const next: Record<string, unknown> = {}
        for (const binding of bindings) {
          const nextValue = Object.hasOwn(currentValues, binding.prop)
            ? currentValues[binding.prop]
            : element.getAttribute(binding.prop)
          const oldValue = previous[binding.prop]
          next[binding.prop] = nextValue
          if (!Object.hasOwn(previous, binding.prop)) {
            try {
              wxsRuntime.invoke(
                binding.moduleId,
                binding.exportPath,
                [nextValue, undefined, descriptor],
              )
            } catch {
              // A failing change:prop observer must not break the page.
            }
            continue
          }
          if (Object.is(nextValue, oldValue)) continue
          try {
            wxsRuntime.invoke(
              binding.moduleId,
              binding.exportPath,
              [nextValue, oldValue, descriptor],
            )
          } catch {
            // A failing change:prop observer must not break the page.
          }
        }
        pageFrameWxsPropSnapshots.set(element, next)
      }
    })
  }

  const createElement = (
    node: RenderElement,
    owner: AnyComponent,
    inheritedExternal?: Record<string, string[]>,
  ): AnyComponent => {
    ensureNodeId(node)
    const builtin = builtinTags.has(node.tag)
    const definition = builtin
      ? definitions[node.tag as BuiltinComponentTag]
      : componentDefinition(node.tag, node.componentPath)
    if (!definition) throw new Error(`no render definition for tag: ${node.tag}`)
    // `generic:alias="tag"` overrides a generic declaration. Glass resolves the
    // tag against the *owner's* `using` map: the payload map for components,
    // and the page's `usingComponents` (`pageUsing`) for page-level nodes.
    const genericTargets: Record<string, string> = {}
    const genericProps = Object.entries(node.props ?? {})
      .filter(([key]) => key.startsWith('generic:'))
    if (genericProps.length > 0) {
      const ownerPath = componentPathByComponent.get(owner)
      // The page root has no definition payload; its `usingComponents` table
      // arrives with the flow (`setPageUsing`).
      const ownerUsing = ownerPath
        ? componentDefinitions.get(ownerPath)?.using ?? {}
        : (owner === root ? pageUsing : {})
      for (const [key, value] of genericProps) {
        const alias = key.slice('generic:'.length)
        const tagName = String(value ?? '')
        if (alias && ownerUsing[tagName]) {
          genericTargets[alias] = tagName
          continue
        }
        diagnosticSink?.({
          severity: 'warning',
          code: DIAGNOSTIC_CODES.UNSUPPORTED_COMPONENT_GENERIC,
          message: `generic "${alias}" of ${node.tag} cannot resolve "${tagName}" in the parent render definition`,
          details: { componentPath: node.componentPath, alias, target: tagName },
        })
      }
    }
    // The definition carries the `tiny-` host prefix (`hostNodeTagName` ends
    // with `*`), so both built-in and user components are created from their
    // WXML tag and glass derives the backend element name.
    const shadowRoot = lightShadow(owner) as unknown as {
      createComponentByDef: (
        tagName: string,
        componentDef: glassEasel.GeneralComponentDefinition,
        genericTargets?: Record<string, string>,
      ) => AnyComponent
    }
    const component = shadowRoot.createComponentByDef(
      node.tag,
      definition,
      Object.keys(genericTargets).length > 0 ? genericTargets : undefined,
    )
    if (node.componentPath) componentPathByComponent.set(component, node.componentPath)
    if (node.slot) {
      ;(component as unknown as { slot: string }).slot = node.slot
    }
    if (!builtin && node.componentPath) {
      // Project only the declared properties: a custom component's props are
      // attributes on the wire, but form/label consumers read `this.data`.
      const declared = componentDefinitions.get(node.componentPath)?.properties
      if (declared) {
        const projected: Record<string, unknown> = {}
        for (const [name, value] of Object.entries(glassProps(node.props))) {
          if (Object.hasOwn(declared, name)) projected[name] = value
        }
        if (Object.keys(projected).length > 0) component.setData(projected as never)
      }
    }
    // External class values come from the parent; glass resolves them inside
    // the component's own template, so hand them to the instance.
    if (node.externalClasses) {
      const target = component as unknown as {
        setExternalClass?: (name: string, value: string) => void
      }
      for (const [name, values] of Object.entries(node.externalClasses)) {
        if (values && values.length > 0) target.setExternalClass?.(name, values.join(' '))
      }
    }
    ;(component as unknown as { __tinyNodeId?: string }).__tinyNodeId = node.id!
    nodes.set(node.id!, component)
    idByComponent.set(component, node.id!)
    currentTree.set(node.id!, node)
    // A structural patch can recreate a component after the initial flow; the
    // stored patch is the only source of its service-side data.
    const storedData = componentData[node.id!]
    if (storedData) {
      ;(component as unknown as { setData?: (next: Record<string, unknown>) => void })
        .setData?.(storedData)
    }
    const dynamicBindings = parseWxsDynamicEvents(node.props)
    attachEvents(node, component, new Set(dynamicBindings.map((binding) => binding.name)))
    attachDynamicWxsEvents(node, component, dynamicBindings)
    if (builtin) {
      const props = node.props ?? {}
      for (const name of ['placeholder-class', 'hover-class']) {
        const value = props[name]
        if (value !== undefined && typeof (component as unknown as { setExternalClass?: unknown }).setExternalClass === 'function') {
          const classes = String(value).split(/\s+/).filter(Boolean)
          const scoped = classes.flatMap((className) => [
            className,
            ...(node.scopes ?? []).map((scope) => `${scope}--${className}`),
          ])
          ;(component as unknown as { setExternalClass: (name: string, value: string) => void })
            .setExternalClass(name, [...new Set(scoped)].join(' '))
        }
      }
      component.setData(glassProps(props) as never)
    }
    const external = node.externalClasses ?? inheritedExternal
    externalByNode.set(node.id!, external)
    applyHostProps(component, node.props)
    component.getBackendElement()?.setAttribute?.(TINY_ENGINE_NAMING.nodeIdAttribute, node.id)
    queueElementClass(node, component, external)
    const childOwner = component
    for (const child of node.children ?? []) {
      appendChild(component, child.type === 'text'
        ? createText(child, childOwner)
        : createElement(child, childOwner, external))
    }
    return component
  }

  const rootId = { value: '' }

  const ownerFor = (parentId: string): { owner: AnyComponent; shadow: any } | null => {
    if (parentId === rootId.value) {
      return {
        owner: root,
        shadow: root.shadowRoot as unknown as { insertBefore: (child: unknown, ref: unknown) => void },
      }
    }
    const parent = nodes.get(parentId)
    if (!parent || glassEasel.TextNode.isTextNode(parent)) return null
    return { owner: parent, shadow: null }
  }

  const collectIds = (node: RenderNode): string[] => {
    const id = node.id ?? ''
    if (node.type === 'text') return [id]
    return [id, ...(node.children ?? []).flatMap(collectIds)]
  }

  const dropNode = (node: RenderNode): void => {
    for (const id of collectIds(node)) {
      for (const cleanup of eventCleanups.get(id) ?? []) cleanup()
      eventCleanups.delete(id)
      nodes.delete(id)
      currentTree.delete(id)
      externalByNode.delete(id)
      pendingClasses.delete(id)
      pendingWxsEvents.delete(id)
      wxsPropSnapshots.delete(id)
    }
  }

  const destroyComponent = (node: unknown): void => {
    if (!node) return
    ;(node as { destroy?: () => void }).destroy?.()
  }

  const insertNode = (parentId: string, index: number, node: RenderNode): void => {
    const target = ownerFor(parentId)
    if (!target) return
    const parentSnapshot = currentTree.get(parentId)
    if (parentSnapshot?.type === 'element') {
      parentSnapshot.children ??= []
      parentSnapshot.children.splice(index, 0, node)
    }
    const inheritedExternal = externalByNode.get(parentId)
    const child = node.type === 'text'
      ? createText(node, target.owner)
      : createElement(node, target.owner, inheritedExternal)
    if (target.shadow) {
      const ref = (root.shadowRoot as unknown as { childNodes: ArrayLike<unknown> }).childNodes[index] ?? null
      target.shadow.insertBefore(child, ref)
    } else {
      const parent = target.owner
      parent.insertBefore(child as never, parent.childNodes[index] ?? null)
    }
  }

  // Root children live in the page component's shadow root; component nodes
  // keep their children on the light tree.
  const parentChildren = (parentId: string): {
    childNodes: ArrayLike<unknown>
    removeChild: (child: unknown) => void
    insertBefore: (child: unknown, ref: unknown) => void
  } | null => {
    if (parentId === rootId.value) {
      return root.shadowRoot as unknown as {
        childNodes: ArrayLike<unknown>
        removeChild: (child: unknown) => void
        insertBefore: (child: unknown, ref: unknown) => void
      }
    }
    const parent = nodes.get(parentId)
    if (!parent || glassEasel.TextNode.isTextNode(parent)) return null
    return parent as unknown as {
      childNodes: ArrayLike<unknown>
      removeChild: (child: unknown) => void
      insertBefore: (child: unknown, ref: unknown) => void
    }
  }

  const removeNode = (parentId: string, index: number, count: number): void => {
    const parent = parentChildren(parentId)
    if (!parent) return
    const parentSnapshot = currentTree.get(parentId)
    if (parentSnapshot?.type === 'element') parentSnapshot.children?.splice(index, count)
    for (let offset = 0; offset < count; offset += 1) {
      const child = parent.childNodes[index]
      if (!child) break
      parent.removeChild(child)
      for (const [id, value] of nodes) {
        if (value === child) {
          const snapshot = currentTree.get(id)
          if (snapshot) dropNode(snapshot)
          destroyComponent(child)
        }
      }
    }
  }

  const reorderNode = (parentId: string, moves: Array<{ from: number; to: number }>): void => {
    const parent = parentChildren(parentId)
    if (!parent) return
    const parentSnapshot = currentTree.get(parentId)
    for (const move of moves) {
      const children = parentSnapshot?.type === 'element' ? parentSnapshot.children : undefined
      if (!children || move.from < 0 || move.from >= children.length) continue
      const [child] = children.splice(move.from, 1)
      if (child) children.splice(move.to, 0, child)
    }
    for (const move of moves) {
      const child = parent.childNodes[move.from]
      if (!child) continue
      parent.removeChild(child)
      parent.insertBefore(child, parent.childNodes[move.to] ?? null)
    }
  }

  const replaceNode = (id: string, node: RenderNode): void => {
    const previous = nodes.get(id)
    const snapshot = currentTree.get(id)
    if (!previous || !snapshot) return
    for (const [parentId, parentNode] of currentTree) {
      if (parentNode.type !== 'element') continue
      const index = parentNode.children?.indexOf(snapshot) ?? -1
      if (index >= 0) {
        parentNode.children![index] = node
        void parentId
        break
      }
    }
    if (snapshot.type === 'element' && node.type === 'element' && id === rootId.value) {
      nodes.set(id, root)
      currentTree.set(id, node)
      return
    }
    const parent = (previous as unknown as { parentNode?: AnyComponent }).parentNode
    if (!parent) return
    const owner = parent
    const parentId = idByComponent.get(parent as unknown as object)
    const child = node.type === 'text'
      ? createText(node, owner)
      : createElement(node, owner, parentId ? externalByNode.get(parentId) : undefined)
    parent.replaceChild(child as never, previous as never)
    dropNode(snapshot)
    nodes.set(id, node.type === 'text' ? child as never : child)
    currentTree.set(id, node)
    if (snapshot.type === 'element' && node.type !== 'element') destroyComponent(previous)
  }

  const updateProps = (node: RenderElement): void => {
    const component = nodes.get(node.id ?? '')
    if (!component) return
    if (glassEasel.TextNode.isTextNode(component)) return
    const props = { ...(node.props ?? {}) }
    delete props.class
    delete props.style
    delete props.id
    if (builtinTags.has(node.tag)) component.setData(glassProps(node.props) as never)
    else {
      const element = component.getBackendElement() as unknown as {
        setAttribute?: (name: string, value: string) => void
      } | null
      for (const [name, value] of Object.entries(props)) {
        element?.setAttribute?.(name, String(value ?? ''))
      }
    }
    applyHostProps(component, node.props)
    const external = node.externalClasses ?? externalByNode.get(node.id!)
    externalByNode.set(node.id!, external)
    queueElementClass(node, component, external)
    applyWxsProps(node, component, wxsPropSnapshots.get(node.id!))
  }

  const emitPageReRender = (): void => {
    // WeChat dispatches `pageReRender` after a page re-render; root-portal and
    // built-in views listen to it to re-evaluate relocated content.
    if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') return
    document.dispatchEvent(new CustomEvent('pageReRender'))
  }

  const applyPatches = (patches: RenderPatch[]): void => {
    for (const patch of patches) {
      if (patch.type === 'text') {
        const id = resolveTargetId(patch.target)
        const node = id ? nodes.get(id) : undefined
        if (id && node && glassEasel.TextNode.isTextNode(node)) node.textContent = patch.text
      } else if (patch.type === 'props') {
        const id = resolveTargetId(patch.target)
        const node = id ? nodes.get(id) : undefined
        if (id && node && node instanceof glassEasel.Element) {
          const current = currentTree.get(id)
          if (current?.type === 'element') {
            const next: RenderElement = {
              ...current,
              props: { ...(current.props ?? {}), ...patch.props },
            }
            for (const name of patch.removed ?? []) delete next.props?.[name]
            currentTree.set(id, next)
            updateProps(next)
          }
        }
      } else if (patch.type === 'insert') {
        const parentId = resolveTargetId(patch.parent)
        if (parentId) insertNode(parentId, patch.index, patch.node)
      } else if (patch.type === 'remove') {
        const parentId = resolveTargetId(patch.parent)
        if (parentId) removeNode(parentId, patch.index, patch.count)
      } else if (patch.type === 'reorder') {
        const parentId = resolveTargetId(patch.parent)
        if (parentId) reorderNode(parentId, patch.moves)
      } else if (patch.type === 'replace') {
        const id = resolveTargetId(patch.target)
        if (id) replaceNode(id, patch.node)
      } else if (patch.type === 'component-instances') {
        const id = resolveTargetId(patch.target)
        const current = id ? currentTree.get(id) : undefined
        if (id && current?.type === 'element') {
          currentTree.set(id, {
            ...current,
            componentInstances: [...patch.instances],
          })
        }
      }
    }
    flushPendingAnimations()
    replayReplacedAnimations()
    flushPendingClasses()
    flushPendingWxsEvents()
    flushAllWxsProps()
    // The flow carries the initial component data before any node exists, so
    // push it into the freshly created instances now, and again after glass has
    // finished the first render pass (a component initializes its data during
    // attach, which would otherwise overwrite an earlier patch).
    bindNestedComponentInstances()
    applyComponentDataToNodes(componentData)
    queueMicrotask(() => {
      bindNestedComponentInstances(true)
      applyComponentDataToNodes(componentData)
    })
    emitPageReRender()
  }

  // `this.animate` runs on the render side: the service resolved the selector
  // and normalized the keyframes, the DOM owns playback. A page may animate in
  // `onLoad`, before its first snapshot is mounted, so unresolved nodes are
  // parked and retried after the next mount/patch.
  const animationsByElement = new WeakMap<Element, Animation[]>()
  const scrollAnimationCleanups = new Map<Element, () => void>()
  const pendingAnimations = new Map<string, RenderAnimationRequest>()
  const activeAnimationRequests = new Map<string, RenderAnimationRequest>()
  const animatedElementById = new Map<string, Element>()
  const PENDING_ANIMATION_LIMIT = 64

  const matchesQueryToken = (element: Element, token: string): boolean => {
    const match = /^([A-Za-z_][\w-]*)?(#[\w-]+)?((?:\.[\w-]+)*)$/.exec(token)
    if (!match) return false
    const [, tag, id, classes] = match
    const elementTag = element.tagName.toLowerCase()
    if (tag && elementTag !== tag && elementTag !== `${TINY_ENGINE_NAMING.hostTagPrefix}${tag}`) return false
    if (id && element.id !== id.slice(1)) return false
    if (classes) {
      const own = new Set((element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean))
      for (const className of classes.split('.').filter(Boolean)) {
        const hit = [...own].some((name) => name === className || name.endsWith(`--${className}`))
        if (!hit) return false
      }
    }
    return Boolean(tag || id || classes)
  }

  const matchesQuerySelector = (element: Element, selector: string): boolean => {
    const parts = selector.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return false
    if (!matchesQueryToken(element, parts[parts.length - 1]!)) return false
    let ancestor = element.parentElement
    for (let index = parts.length - 2; index >= 0; index -= 1) {
      while (ancestor && !matchesQueryToken(ancestor, parts[index]!)) ancestor = ancestor.parentElement
      if (!ancestor) return false
      ancestor = ancestor.parentElement
    }
    return true
  }

  /** Depth-first, pre-order traversal (the same order the logic tree uses). */
  const queryScopedElements = (scope: Element, selector: string, all: boolean): Element[] => {
    const results: Element[] = []
    const walk = (element: Element): boolean => {
      const children = element.children
      for (let index = 0; index < children.length; index += 1) {
        const child = children[index]!
        if (matchesQuerySelector(child, selector)) {
          results.push(child)
          if (!all) return true
        }
        if (walk(child)) return true
      }
      return false
    }
    walk(scope)
    return results
  }

  const elementForViewId = (viewId: string): Element | null => {
    if (typeof rootElement?.querySelector !== 'function') return null
    return rootElement.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${viewId}"]`)
  }

  /** Resolve a component-scoped locator to its snapshot node. */
  const findLocatorNode = (target: string): RenderNode | undefined => {
    const locator = parseLocator(target)
    if (!locator) return undefined
    let node: RenderNode | undefined = currentTree.get(locator.owner)
    for (const index of locator.path) {
      if (!node || node.type !== 'element') return undefined
      node = (node.children ?? [])[index]
      if (!node) return undefined
    }
    return node
  }

  /**
   * Resolve a patch target: a shared id (components / page root) or a
   * component-scoped locator (`owner#index.path`) for elements and text.
   */
  const resolveTargetId = (target: string): string | null => {
    if (!isLocator(target)) return nodes.has(target) ? target : null
    return findLocatorNode(target)?.id ?? null
  }

  /** Resolve a component-scoped locator to its backend element. */
  const elementForLocator = (locator: string): Element | null => {
    const node = findLocatorNode(locator)
    const component = node?.id ? nodes.get(node.id) : undefined
    return (component?.getBackendElement?.() as Element | null) ?? null
  }

  /** Resolve an id-or-locator to the element the render tree owns. */
  const elementForTarget = (target: string): Element | null => (
    isLocator(target) ? elementForLocator(target) : elementForViewId(target)
  )

  const findScrollContainer = (host: Element): HTMLElement | null => {
    const isScrollable = (candidate: Element): boolean => {
      const view = candidate.ownerDocument.defaultView
      if (!view) return false
      const style = view.getComputedStyle(candidate)
      return /(auto|scroll)/.test(`${style.overflowX} ${style.overflowY}`)
    }
    if (isScrollable(host)) return host as HTMLElement
    for (const candidate of Array.from(host.querySelectorAll('*'))) {
      if (isScrollable(candidate)) return candidate as HTMLElement
    }
    return host as HTMLElement
  }

  const stopScrollAnimation = (element: Element): void => {
    scrollAnimationCleanups.get(element)?.()
    scrollAnimationCleanups.delete(element)
  }

  const playOn = (element: Element, request: RenderAnimationRequest): void => {
    const animate = (element as Element & {
      animate?: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation
    }).animate
    if (typeof animate !== 'function') return
    for (const running of animationsByElement.get(element) ?? []) running.cancel()
    stopScrollAnimation(element)
    if (request.scroll) {
      const sourceHost = elementForTarget(request.scroll.sourceViewId)
      const source = sourceHost ? findScrollContainer(sourceHost) : null
      if (source) {
        const timeRange = request.scroll.timeRange ?? request.duration
        const animation = animate.call(element, request.keyframes as Keyframe[], {
          duration: timeRange,
          ...(request.easing !== undefined ? { easing: request.easing } : {}),
          iterations: 1,
          fill: request.fill ?? 'both',
        })
        animation.pause()
        const update = () => {
          const horizontal = source.scrollWidth > source.clientWidth + 1
          const offset = horizontal ? source.scrollLeft : source.scrollTop
          const span = request.scroll!.endOffset - request.scroll!.startOffset
          const progress = span > 0
            ? Math.min(1, Math.max(0, (offset - request.scroll!.startOffset) / span))
            : 1
          animation.currentTime = progress * timeRange
        }
        update()
        source.addEventListener('scroll', update, { passive: true })
        scrollAnimationCleanups.set(element, () => {
          source.removeEventListener('scroll', update)
          animation.cancel()
        })
        animationsByElement.set(element, [animation])
        return
      }
    }
    const animation = animate.call(element, request.keyframes as Keyframe[], {
      duration: request.duration,
      ...(request.delay !== undefined ? { delay: request.delay } : {}),
      ...(request.easing !== undefined ? { easing: request.easing } : {}),
      ...(request.iterations !== undefined ? { iterations: request.iterations } : {}),
      fill: request.fill ?? 'both',
    })
    animationsByElement.set(element, [animation])
  }

  const flushPendingAnimations = (): void => {
    if (pendingAnimations.size === 0) return
    for (const [viewId, request] of [...pendingAnimations]) {
      const element = elementForViewId(viewId)
      if (!element) continue
      pendingAnimations.delete(viewId)
      animatedElementById.set(viewId, element)
      playOn(element, request)
    }
  }

  const replayReplacedAnimations = (): void => {
    for (const [viewId, request] of activeAnimationRequests) {
      const element = elementForViewId(viewId)
      if (!element) continue
      const previous = animatedElementById.get(viewId)
      if (previous === element) continue
      if (previous) {
        stopScrollAnimation(previous)
        for (const animation of animationsByElement.get(previous) ?? []) animation.cancel()
      }
      animatedElementById.set(viewId, element)
      playOn(element, request)
    }
  }

  const scopedElement = (scopeId: string | undefined, selector: string | undefined): Element | null => {
    if (!selector || !rootElement) return null
    const scope = scopeId ? elementForTarget(scopeId) ?? rootElement : rootElement
    return scope.querySelector(selector)
  }

  const playAnimation = (request: RenderAnimationRequest): void => {
    for (const viewId of request.viewIds) {
      activeAnimationRequests.set(viewId, request)
      const element = elementForTarget(viewId)
        ?? scopedElement(request.scopeId, request.selector)
      if (element) {
        animatedElementById.set(viewId, element)
        playOn(element, request)
        continue
      }
      animatedElementById.delete(viewId)
      if (!pendingAnimations.has(viewId) && pendingAnimations.size >= PENDING_ANIMATION_LIMIT) {
        const oldest = pendingAnimations.keys().next().value
        if (oldest !== undefined) pendingAnimations.delete(oldest)
      }
      pendingAnimations.set(viewId, request)
    }
  }

  const clearAnimation = (request: RenderClearAnimationRequest): void => {
    for (const viewId of request.viewIds) {
      pendingAnimations.delete(viewId)
      activeAnimationRequests.delete(viewId)
      animatedElementById.delete(viewId)
      const element = elementForTarget(viewId)
        ?? scopedElement(request.scopeId, request.selector)
      if (!element) continue
      for (const animation of animationsByElement.get(element) ?? []) animation.cancel()
      animationsByElement.delete(element)
      stopScrollAnimation(element)
    }
  }

  const clearTabBar = (): void => {
    for (const id of tabBarNodeIds) {
      for (const cleanup of eventCleanups.get(id) ?? []) cleanup()
      eventCleanups.delete(id)
      nodes.delete(id)
      currentTree.delete(id)
    }
    tabBarNodeIds.clear()
    ;(tabBarRoot as unknown as { destroy?: () => void } | undefined)?.destroy?.()
    tabBarRoot = undefined
    tabBarRootElement = null
    tabBarRootId = ''
    tabFrameRootId = ''
    tabFramePageId = ''
    tabFramePagePath = ''
    tabFrameComponents = []
    tabBarContainer?.remove()
    tabBarContainer = null
  }

  const indexPageFrameHints = (
    hints: RenderNode | undefined,
    rootViewId: string,
    pagePath: string,
  ): void => {
    if (hints?.type !== 'element') return
    const tabBarEntries = [...currentTree].filter(([id]) => tabBarNodeIds.has(id))
    currentTree.clear()
    const visit = (node: RenderNode): void => {
      if (node.id) currentTree.set(node.id, node)
      if (node.type !== 'element') return
      for (const child of node.children ?? []) visit(child)
    }
    visit(hints)
    if (!currentTree.has(rootViewId)) {
      currentTree.set(rootViewId, {
        type: 'element',
        id: rootViewId,
        tag: pagePath,
      })
    }
    for (const [id, node] of tabBarEntries) currentTree.set(id, node)
  }

  const indexTabFrameHints = (
    hints: RenderNode | undefined,
    rootViewId: string,
    pagePath: string,
  ): void => {
    for (const id of tabBarNodeIds) {
      if (id === tabFrameRootId) continue
      for (const cleanup of eventCleanups.get(id) ?? []) cleanup()
      eventCleanups.delete(id)
      nodes.delete(id)
      currentTree.delete(id)
    }
    tabBarNodeIds.clear()
    if (hints?.type === 'element') {
      const visit = (node: RenderNode): void => {
        if (node.id) {
          currentTree.set(node.id, node)
          tabBarNodeIds.add(node.id)
        }
        if (node.type !== 'element') return
        for (const child of node.children ?? []) visit(child)
      }
      visit(hints)
    }
    if (!currentTree.has(rootViewId)) {
      currentTree.set(rootViewId, {
        type: 'element',
        id: rootViewId,
        tag: pagePath,
      })
    }
    tabBarNodeIds.add(rootViewId)
  }

  const mountPage = (request: PageFrameMount): void => {
    if (!templates) throw new Error('pageframe mount requires compiled templates')
    const rootViewId = request.rootViewId ?? request.pageId
    const indexHints = (hints: RenderNode | undefined): void => {
      indexPageFrameHints(hints, rootViewId, request.pagePath)
    }
    if (
      pageFrameRoot
      && pageFramePageId === request.pageId
      && pageFramePagePath === request.pagePath
    ) {
      const unresolved = new Set(Object.values(request.using ?? {}).filter(
        (path) => path && !componentDefinitions.has(path),
      ))
      const hasPlaceholderState = (
        Object.keys(pagePlaceholders).length > 0
        || Object.keys(request.placeholders ?? {}).length > 0
      )
      const placeholderStateChanged = hasPlaceholderState && (
        unresolved.size !== pageFrameUnresolvedUsing.size
        || [...unresolved].some((path) => !pageFrameUnresolvedUsing.has(path))
      )
      if (placeholderStateChanged) {
        pageFrameRoot = undefined
        pageFramePageId = ''
        pageFramePagePath = ''
        pageFrameComponents = []
      } else {
        if (request.using) pageUsing = request.using
        if (request.scope) pageScopeName = request.scope
        pageFrameComponents = [...(request.componentFlow ?? pageFrameComponents)]
        if (request.placeholders) pagePlaceholders = request.placeholders
        indexHints(request.renderHints)
        const next = { ...request.data }
        if (!sameDataPatch(pageData, next)) {
          pageData = next
          ;(pageFrameRoot as unknown as {
            setData?: (value: Record<string, unknown>) => void
          }).setData?.(next)
        }
        bindNestedComponentInstances(true, false)
        queuePageFrameWxsProps()
        queuePageFrameTouchMoveGuards()
        emitPageReRender()
        return
      }
    }
    if (request.using) pageUsing = request.using
    if (request.scope) pageScopeName = request.scope
    pagePlaceholders = request.placeholders ?? {}
    pageFrameComponents = [...(request.componentFlow ?? [])]
    pageFrameUnresolvedUsing = new Set(Object.values(pageUsing).filter(
      (path) => path && !componentDefinitions.has(path),
    ))
    pageData = { ...request.data }
    clearPageFrameTouchMoveGuards()
    clearTabBar()
    for (const cleanups of eventCleanups.values()) {
      for (const cleanup of cleanups) cleanup()
    }
    eventCleanups.clear()
    nodes.clear()
    currentTree.clear()
    indexHints(request.renderHints)
    const definition = space.defineComponent({
      is: request.pagePath,
      options: {
        hostNodeTagName: TINY_ENGINE_NAMING.renderRootTag,
        reflectToAttributes: true,
        writeIdToDOM: true,
        ...(pageScopeName ? { styleScope: styleScopeManager.register(pageScopeName) } : {}),
        extraStyleScope: glassEasel.StyleScopeManager.globalScope(),
      },
      data: request.data,
      using: pageUsingDefinitions(),
      ...(request.methods && request.methods.length > 0
        ? {
            methods: Object.fromEntries(
              request.methods.map((name) => [name, templateHandler(name)]),
            ) as never,
          }
        : {}),
      template: {
        groupList: templates.groupList,
        content: (name = '') => templates!.content(request.pagePath, name),
        updateMode: 'virtualTree',
      } as never,
    }).general()
    const page = glassEasel.Component.createWithContext(
      TINY_ENGINE_NAMING.renderRootTag,
      definition,
      backend,
    )
    const previous = root
    root = page
    rootElement = page.getBackendElement() as unknown as HTMLElement | null
    if (rootElement && options.container) options.container.replaceChildren(rootElement)
    ;(previous as unknown as { destroy?: () => void }).destroy?.()
    componentPathByComponent.set(page, request.pagePath)
    ;(page as unknown as { __tinyNodeId?: string }).__tinyNodeId = rootViewId
    pageFrameRoot = page
    pageFramePageId = request.pageId
    pageFramePagePath = request.pagePath
    rootId.value = rootViewId
    nodes.set(rootViewId, page)
    rootElement?.setAttribute(TINY_ENGINE_NAMING.nodeIdAttribute, rootViewId)
    rootElement?.classList?.add(TINY_ENGINE_NAMING.scopeMarkerClass)
    if (options.attach !== false) glassEasel.Element.pretendAttached(page)
    mounted = true
    bindNestedComponentInstances(false, false)
    queueMicrotask(() => {
      bindNestedComponentInstances(true, false)
      queuePageFrameWxsProps()
      queuePageFrameTouchMoveGuards()
    })
    emitPageReRender()
  }

  return {
    get root() {
      return root
    },
    get rootElement() {
      return rootElement
    },
    mountPage,
    setPageScope,
    setPageUsing,
    setBehaviorScheme,
    setEventSink: (sink) => {
      eventSink = sink
    },
    setHostActionSink: (sink) => {
      hostActionSink = sink
    },
    setHostRequestSink: (sink) => {
      hostRequestSink = sink
    },
    playAnimation,
    clearAnimation,
    setPagePath: (pagePath) => {
      currentPagePath = pagePath
    },
    setWxsModules: (table) => {
      wxsRuntime.load(table)
    },
    setWxsEffectSink: (sink) => {
      wxsEffectSink = sink
    },
    dispatchCustomEvent: (request) => {
      const component = nodes.get(request.componentId)
      if (!component || glassEasel.TextNode.isTextNode(component)) return
      serviceEventDepth += 1
      try {
        glassEasel.Event.triggerEvent(component as never, request.name, request.detail ?? {}, {
          bubbles: request.options?.bubbles === true,
          composed: request.options?.composed === true,
        })
      } finally {
        serviceEventDepth -= 1
      }
    },
    setWxsBinding: (binding) => {
      dynamicBindingModes.set(wxsBindingKey(binding.viewId, binding.event), binding)
    },
    setPageFrameHints: (root) => {
      if (!pageFrameRoot || !rootId.value) return
      indexPageFrameHints(root, rootId.value, pageFramePagePath)
    },
    setPageFrameComponents: (components) => {
      pageFrameComponents = [...components]
    },
    setPageData: (data) => {
      const next = { ...data }
      const changed = !sameDataPatch(pageData, next)
      const patch = changed ? dataPatchBetween(pageData, next) : {}
      pageData = next
      if (pageFrameRoot && changed) {
        ;(pageFrameRoot as unknown as {
          setData?: (next: Record<string, unknown>) => void
        }).setData?.(patch)
        queuePageFrameWxsProps()
        queuePageFrameTouchMoveGuards()
      }
    },
    applyPageDataPatches: (patches) => {
      if (!pageFrameRoot || patches.length === 0) return
      for (const patch of patches) {
        ;(pageFrameRoot as unknown as {
          setData?: (next: Record<string, unknown>) => void
        }).setData?.(patch)
      }
      pageData = {
        ...((pageFrameRoot as unknown as { data?: Record<string, unknown> }).data ?? pageData),
      }
      queuePageFrameWxsProps()
      queuePageFrameTouchMoveGuards()
    },
    setComponentData: (data) => {
      // The service sends a component-scoped patch after the initial snapshot,
      // so merge instead of replacing before applying it to render instances.
      componentData = { ...componentData, ...data }
      if (pageFrameRoot) {
        // The pageframe template already applied the props that created each
        // component. Re-pushing unchanged data makes glass re-run WXS-only
        // expression slots (for example `PEEK: {{state.peek()}}`) against a
        // later module state, while WeChat keeps the value from the render that
        // produced the component. Only write data that actually changed.
        bindNestedComponentInstances(true)
        queuePageFrameWxsProps()
        queuePageFrameTouchMoveGuards()
      } else {
        bindNestedComponentInstances()
        applyComponentDataToNodes(data)
      }
    },
    observeIntersection: (request, emit) => {
      const rootNode = rootElement
      if (typeof IntersectionObserver === 'undefined' || !rootNode) return undefined
      const elementFor = (id: string): Element | null => (
        elementForTarget(id) ?? rootNode.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${id}"]`)
      )
      const targets = request.viewIds
        .map((id) => elementFor(id))
        .filter((element): element is Element => element !== null)
      if (targets.length === 0) return undefined
      const root = request.rootViewId ? elementFor(request.rootViewId) : null
      const margin = request.rootMargin
      const rootMargin = margin
        ? [margin.top ?? 0, margin.right ?? 0, margin.bottom ?? 0, margin.left ?? 0]
          .map((value) => `${value}px`)
          .join(' ')
        : undefined
      const toRect = (rect: {
        left: number
        top: number
        right: number
        bottom: number
        width: number
        height: number
      } | null): RenderRect => ({
        left: rect?.left ?? 0,
        top: rect?.top ?? 0,
        right: rect?.right ?? 0,
        bottom: rect?.bottom ?? 0,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
      })
      const observer = new IntersectionObserver((entries) => {
        const payload: RenderIntersectionEntry[] = []
        for (const entry of entries) {
          const element = entry.target as Element
          const viewId = element.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? ''
          if (!viewId) continue
          const viewport = entry.rootBounds ?? {
            left: 0,
            top: 0,
            right: typeof window === 'undefined' ? 0 : window.innerWidth,
            bottom: typeof window === 'undefined' ? 0 : window.innerHeight,
            width: typeof window === 'undefined' ? 0 : window.innerWidth,
            height: typeof window === 'undefined' ? 0 : window.innerHeight,
          }
          payload.push({
            viewId,
            boundingClientRect: toRect(entry.boundingClientRect),
            intersectionRect: toRect(entry.intersectionRect),
            relativeRect: toRect(viewport),
            intersectionRatio: entry.intersectionRatio,
            time: entry.time,
          })
        }
        if (payload.length > 0) emit(payload)
      }, {
        root,
        ...(rootMargin ? { rootMargin } : {}),
        threshold: request.thresholds?.length ? request.thresholds : [0],
      })
      for (const target of targets) observer.observe(target)
      return () => observer.disconnect()
    },
    setDiagnosticSink: (sink) => {
      diagnosticSink = sink
    },
    inspectTree: () => {
      // Read the live DOM: render-evaluated component shadow trees have no
      // service node record, so walking `currentTree` would show components as
      // empty shells in the debugger's Elements panel.
      const childNodesOf = (element: Element): ArrayLike<Node> => {
        const slot = element as unknown as {
          assignedNodes?: (options?: { flatten?: boolean }) => ArrayLike<Node>
        }
        const assigned = slot.assignedNodes?.({ flatten: true })
        if (assigned && assigned.length > 0) return assigned
        const shadow = (element as unknown as {
          shadowRoot?: { childNodes?: ArrayLike<Node> } | null
        }).shadowRoot
        if (shadow?.childNodes?.length) return shadow.childNodes
        return element.childNodes
      }
      const toInspectElement = (element: Element, path = '0'): Record<string, unknown> => {
        const attributes: Record<string, string> = {}
        const names = element.attributes
        for (let index = 0; index < names.length; index += 1) {
          const attribute = names[index]!
          attributes[attribute.name] = attribute.value
        }
        // Render-evaluated nodes have no service id; give them a stable
        // synthesized one so the debugger's list keys stay unique.
        const id = element.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute)
          || `render:${path}`
        const tag = element.tagName.toLowerCase()
        const children: Record<string, unknown>[] = []
        const nodeList = childNodesOf(element)
        for (let index = 0; index < nodeList.length; index += 1) {
          const child = nodeList[index]!
          if (child.nodeType === 3) {
            const text = child.textContent ?? ''
            if (text.trim().length === 0) continue
            children.push({
              id: '',
              type: 'text',
              tag: TINY_ENGINE_NAMING.textNodeTag,
              text,
              children: [],
            })
            continue
          }
          if (child.nodeType === 1) {
            children.push(toInspectElement(child as Element, `${path}/${children.length}`))
          }
        }
        return {
          id,
          type: tag.startsWith('tiny-') ? 'element' : 'component',
          tag,
          attributes,
          className: element.getAttribute('class') ?? '',
          style: element.getAttribute('style') ?? '',
          children,
        }
      }
      return rootElement ? toInspectElement(rootElement) : null
    },
    measureLocators: (locators) => {
      const result: Record<string, unknown> = {}
      for (const locator of locators) {
        const element = elementForLocator(locator)
        if (!element) continue
        const rect = element.getBoundingClientRect?.() ?? { left: 0, top: 0, width: 0, height: 0 }
        result[locator] = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }
      }
      return result
    },
    measure: (ids) => {
      const result: Record<string, unknown> = {}
      for (const id of ids) {
        const element = rootElement?.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${id}"]`)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        result[id] = {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }
      }
      return result
    },
    query: (selector, all, scopeId) => {
      if (!rootElement) return []
      // Scoped queries address render-local elements (the ones inside an
      // evaluated component shadow tree) through their owning component id.
      const scope = scopeId
        ? (rootElement.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) === scopeId
            ? rootElement
            : rootElement.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${scopeId}"]`))
        : rootElement
      if (!scope) return []
      // Mini-program selectors are not DOM selectors: a tag matches the
      // `tiny-` host element and a class matches its scoped variant too. Mirror
      // the logic tree's matcher so both sides pick the same elements.
      const elements = queryScopedElements(scope, selector, all)
      if (!all) elements.splice(1)
      return elements.map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          viewId: element.getAttribute(TINY_ENGINE_NAMING.nodeIdAttribute) ?? '',
          id: element.id,
          dataset: { ...(element as HTMLElement).dataset },
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          scrollLeft: element.scrollLeft,
          scrollTop: element.scrollTop,
        }
      })
    },
    measureCanvas: (selector, canvasId) => {
      if (typeof document === 'undefined') {
        return { width: 0, height: 0, canvasId, hasCanvas: false }
      }
      const host = (canvasId
        ? rootElement?.querySelector(
            `${TINY_ENGINE_NAMING.hostTagPrefix}canvas[canvas-id="${canvasId}"]`,
          )
        : null)
        ?? (selector ? rootElement?.querySelector(selector) : null)
        ?? (selector
          ? rootElement?.querySelector(`${TINY_ENGINE_NAMING.hostTagPrefix}canvas ${selector}`)
          : null)
      const canvas = host?.tagName === 'CANVAS'
        ? host
        : host?.querySelector('canvas')
      if (!canvas) return { width: 0, height: 0, canvasId, hasCanvas: false }
      const rect = canvas.getBoundingClientRect()
      return {
        width: rect.width,
        height: rect.height,
        canvasId,
        hasCanvas: true,
      }
    },
    applyStyles: (styles) => {
      if (typeof document === 'undefined') return
      if (!styleElement) {
        styleElement = document.createElement('style')
        styleElement.setAttribute(TINY_ENGINE_NAMING.runtimeStylesAttribute, '')
        styleElement.setAttribute(TINY_ENGINE_NAMING.styleScopeAttribute, '')
        document.head.appendChild(styleElement)
      }
      styleElement.textContent = styles.join('\n')
    },
    clearTabBar,
    mountTabBarPage(request) {
      const rootViewId = request.rootViewId ?? request.pageId
      if (
        tabBarRoot
        && tabFramePageId === request.pageId
        && tabFramePagePath === request.pagePath
      ) {
        if (request.renderHints) {
          indexTabFrameHints(request.renderHints, rootViewId, request.pagePath)
        }
        tabFrameComponents = [...(request.componentFlow ?? tabFrameComponents)]
        const current = nodes.get(tabFrameRootId)
        if (current && !glassEasel.TextNode.isTextNode(current)) {
          current.setData(request.data)
        }
        bindNestedComponentInstances()
        applyComponentDataToNodes(componentData)
        queuePageFrameWxsProps()
        queueMicrotask(() => {
          bindNestedComponentInstances(true)
          applyComponentDataToNodes(componentData)
        })
        emitPageReRender()
        return
      }
      clearTabBar()
      const ownerDocument = options.container?.ownerDocument
        ?? (typeof document === 'undefined' ? undefined : document)
      if (ownerDocument?.body) {
        tabBarContainer = ownerDocument.createElement('div')
        tabBarContainer.setAttribute('data-tiny-tabbar-root', '')
        tabBarContainer.style.cssText = [
          'position:fixed',
          'left:0',
          'right:0',
          'bottom:0',
          'z-index:1000',
          'pointer-events:none',
        ].join(';')
        ;(options.container ?? ownerDocument.body).appendChild(tabBarContainer)
      }
      tabBarRoot = createRoot(
        request.scope || pageScopeName || undefined,
        pageUsingDefinitions(),
      )
      tabBarRootElement = tabBarRoot.getBackendElement() as unknown as HTMLElement | null
      if (tabBarRootElement) {
        const style = (tabBarRootElement as unknown as {
          style?: { pointerEvents?: string }
        }).style
        if (style) style.pointerEvents = 'auto'
        tabBarContainer?.replaceChildren(tabBarRootElement)
      }
      const shadow = tabBarRoot.shadowRoot as unknown as {
        appendChild: (child: unknown) => void
        childNodes: ArrayLike<unknown>
        removeChild: (child: unknown) => void
      }
      while (shadow.childNodes.length > 0) shadow.removeChild(shadow.childNodes[0])
      const tabBarNode: RenderElement = {
        type: 'element',
        id: rootViewId,
        tag: 'custom-tab-bar',
        component: true,
        componentPath: request.pagePath,
        props: {},
        children: [],
      }
      const component = createElement(tabBarNode, tabBarRoot)
      shadow.appendChild(component)
      if (request.data && Object.keys(request.data).length > 0) {
        component.setData(request.data)
      }
      tabBarRootId = `tab-bar-root:${rootViewId}`
      tabFrameRootId = rootViewId
      tabFramePageId = request.pageId
      tabFramePagePath = request.pagePath
      tabFrameComponents = [...(request.componentFlow ?? [])]
      nodes.set(tabBarRootId, tabBarRoot)
      indexTabFrameHints(request.renderHints, rootViewId, request.pagePath)
      if (tabBarRootElement) {
        if (typeof tabBarRootElement?.setAttribute === 'function') {
          tabBarRootElement.setAttribute(TINY_ENGINE_NAMING.nodeIdAttribute, tabBarRootId)
        }
        applyHostProps(tabBarRoot, tabBarNode.props)
        applyClassProps(
          tabBarRootElement,
          tabBarNode.props,
          tabBarNode.scopes,
          tabBarNode.scopeChain,
          undefined,
          tabBarNode.scopes ?? [],
        )
      }
      if (options.attach !== false) glassEasel.Element.pretendAttached(tabBarRoot)
      bindNestedComponentInstances()
      applyComponentDataToNodes(componentData)
      flushPendingWxsEvents()
      flushAllWxsProps()
      queueMicrotask(() => {
        bindNestedComponentInstances(true)
        applyComponentDataToNodes(componentData)
      })
      emitPageReRender()
    },
    mount(node) {
      clearTabBar()
      rebuildRoot()
      pageFrameRoot = undefined
      pageFramePageId = ''
      pageFramePagePath = ''
      pageFrameComponents = []
      clearPageFrameTouchMoveGuards()
      for (const cleanups of eventCleanups.values()) {
        for (const cleanup of cleanups) cleanup()
      }
      eventCleanups.clear()
      nodes.clear()
      currentTree.clear()
      styleElement?.remove()
      styleElement = undefined
      const shadow = root.shadowRoot as unknown as {
        appendChild: (child: unknown) => void
        childNodes: ArrayLike<unknown>
        removeChild: (child: unknown) => void
      }
      while (shadow.childNodes.length > 0) {
        shadow.removeChild(shadow.childNodes[0])
      }
      const children = node.type === 'element' ? node.children ?? [] : []
      for (const child of children) {
        shadow.appendChild(child.type === 'text'
          ? createText(child, root)
          : createElement(child, root))
      }
      if (node.type === 'element') {
        const rootNodeId = node.id!
        rootId.value = rootNodeId
        nodes.set(rootNodeId, root)
        currentTree.set(rootNodeId, node)
        pageScopes = node.scopes ?? []
        rootElement?.setAttribute(TINY_ENGINE_NAMING.nodeIdAttribute, node.id!)
        applyHostProps(root, node.props)
        applyClassProps(rootElement, node.props, node.scopes, node.scopeChain, undefined, pageScopes)
      }
      if (options.attach !== false) glassEasel.Element.pretendAttached(root)
      flushPendingAnimations()
      replayReplacedAnimations()
      flushPendingClasses()
      flushPendingWxsEvents()
      flushAllWxsProps()
      // The flow carries the initial component data before any node exists, so
      // push it into the freshly created instances now, and again after glass
      // has finished the first render pass.
      bindNestedComponentInstances()
      applyComponentDataToNodes(componentData)
      queueMicrotask(() => {
        bindNestedComponentInstances(true)
        applyComponentDataToNodes(componentData)
      })
      mounted = true
      emitPageReRender()
    },
    applyPatches,
    setComponentDefinitions(next) {
      for (const [path, payload] of Object.entries(next)) {
        componentDefinitions.set(path, payload)
      }
    },
    setTemplates(next) {
      templates = next
    },
    setTemplateEventSink(next) {
      templateEventSink = next
    },
    getNode(id) {
      return nodes.get(id)
    },
    destroy() {
      clearTabBar()
      pageFrameRoot = undefined
      pageFramePageId = ''
      pageFramePagePath = ''
      pageFrameComponents = []
      clearPageFrameTouchMoveGuards()
      detachWxsEventHost()
      detachCompositor()
      for (const cleanups of eventCleanups.values()) {
        for (const cleanup of cleanups) cleanup()
      }
      eventCleanups.clear()
      nodes.clear()
      currentTree.clear()
      externalByNode.clear()
      pendingClasses.clear()
      pendingWxsEvents.clear()
      wxsPropSnapshots.clear()
      for (const timer of wxsTimers) clearTimeout(timer)
      wxsTimers.clear()
      wxsRuntime.dispose()
      ;(root as unknown as { destroy?: () => void }).destroy?.()
    },
  }
}
