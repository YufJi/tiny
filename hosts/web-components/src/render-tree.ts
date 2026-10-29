import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import { createDefaultWxsCompiler, createWxsRuntime } from '@tiny/runtime'
import type {
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
  RenderText,
  WxsBindingMessage,
  WxsModuleTable,
  WxsRenderEffect,
} from '@tiny/runtime'
import { createBuiltinComponents } from './index'
import { BUILTIN_COMPONENT_TAGS, type BuiltinComponentTag } from './tags'

type AnyComponent = glassEasel.GeneralComponent

export type GlassRenderEvent = {
  id: string
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
}

export type GlassRenderTree = {
  root: AnyComponent
  rootElement: HTMLElement | null
  applyStyles?: (styles: string[]) => void
  inspectTree?: () => unknown
  measure?: (ids: string[]) => Record<string, unknown>
  query?: (selector: string, all: boolean) => unknown[]
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
  setPagePath?: (pagePath: string) => void
  setWxsModules?: (table: WxsModuleTable) => void
  setWxsEffectSink?: (sink: (effect: WxsRenderEffect) => void) => void
  setWxsBinding?: (binding: WxsBindingMessage) => void
  setPageData?: (data: Record<string, unknown>) => void
  setComponentData?: (data: Record<string, Record<string, unknown>>) => void
  setDiagnosticSink?: (sink: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) => void
  mount: (node: RenderNode) => void
  applyPatches: (patches: RenderPatch[]) => void
  getNode: (id: string) => AnyComponent | glassEasel.TextNode | undefined
  destroy: () => void
}

const builtinTags = new Set<string>(BUILTIN_COMPONENT_TAGS)

const WXS_PROPS_PROP = 'wx-tiny-wxs-props'
const WXS_DYNAMIC_PROP = 'wx-tiny-wxs-dynamic'

const LOCAL_WXS_EVENTS = new Set([
  'tap',
  'click',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'change',
  'scroll',
  'confirm',
  'blur',
  'focus',
  'select',
  'columnchange',
  'linechange',
  'scrolltoupper',
  'scrolltolower',
  'regionchange',
  'submit',
  'reset',
  'load',
  'error',
  'begin',
  'end',
  'update',
  'play',
  'pause',
  'timeupdate',
  'ended',
  'waiting',
  'progress',
  'fullscreenchange',
])

const HANDLED_NATIVE_EVENT = Symbol.for(TINY_ENGINE_NAMING.handledNativeEventSymbol)
const isHandledNativeEvent = (event: unknown): boolean => Boolean(
  event
  && typeof event === 'object'
  && (event as Record<PropertyKey, unknown>)[HANDLED_NATIVE_EVENT],
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

function applyHostProps(component: AnyComponent, props: Record<string, unknown> | undefined): void {
  const element = component.getBackendElement() as unknown as {
    setAttribute?: (name: string, value: string) => void
  } | null
  if (!element?.setAttribute) return
  for (const [name, value] of Object.entries(props ?? {})) {
    if (value === undefined || name === WXS_PROPS_PROP || name === WXS_DYNAMIC_PROP) continue
    element.setAttribute(name, String(value))
  }
}

/**
 * R1 render-tree foundation: one glass-easel root owns a real built-in
 * component tree. It is intentionally independent of the service tree; the
 * component-flow layer will drive it later.
 */
export function createGlassRenderTree(options: GlassRenderTreeOptions = {}): GlassRenderTree {
  const backend = options.backend ?? new glassEasel.CurrentWindowBackendContext()
  ;(backend as unknown as { onEvent: (listener: unknown) => void })
    .onEvent(glassEasel.Event.triggerBackendEvent)
  const wxsRuntime = createWxsRuntime({ compile: createDefaultWxsCompiler() })
  const space = new glassEasel.ComponentSpace(undefined, undefined, undefined, true)
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
  const definitions = createBuiltinComponents(space, {
    resolveAssetUrl: (src: string, _component: unknown) => (
      options.resolveAssetUrl?.(src, currentPagePath) ?? src
    ),
    onDiagnostic: (diagnostic) => diagnosticSink?.(diagnostic),
    hostAction: (action) => hostActionSink?.(action),
  })
  for (const [tag, definition] of Object.entries(definitions)) {
    space.registerComponent(tag, definition)
  }
  const containers = new Map<string, glassEasel.GeneralComponentDefinition>()
  const nodes = new Map<string, AnyComponent | glassEasel.TextNode>()
  const eventCleanups = new Map<string, Array<() => void>>()
  let currentRoot: RenderNode | undefined
  let eventSink: ((event: GlassRenderEvent) => void) | undefined
  let wxsEffectSink: ((effect: WxsRenderEffect) => void) | undefined
  let hostActionSink: ((action: RenderHostAction) => void) | undefined
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
  const pendingWxsProps = new Map<string, { node: RenderElement; component: AnyComponent }>()
  const wxsStates = new WeakMap<Element, Record<string, unknown>>()
  const wxsStatesById = new Map<string, Record<string, unknown>>()
  const dynamicBindingModes = new Map<string, WxsBindingMessage>()
  const wxsTimers = new Set<ReturnType<typeof setTimeout>>()
  const wxsPropSnapshots = new Map<string, Record<string, unknown>>()
  let pageData: Record<string, unknown> = {}
  let componentData: Record<string, Record<string, unknown>> = {}
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
      pendingClasses.delete(node.id)
      return
    }
    // Built-in components do not own their backend element until they are
    // attached. Keep the latest external-class map so a later flush does not
    // lose `custom-class` values while the element is still being created.
    pendingClasses.set(node.id, () => {
      const latest = currentTree.get(node.id)
      return applyElementClass(latest?.type === 'element' ? latest : node, component, external)
    })
  }

  const flushPendingClasses = (): void => {
    for (const [id, apply] of pendingClasses) {
      if (apply()) pendingClasses.delete(id)
    }
  }

  const containerDefinition = (tag: string): glassEasel.GeneralComponentDefinition => {
    const existing = containers.get(tag)
    if (existing) return existing
    const definition = space.defineComponent({
      is: `${TINY_ENGINE_NAMING.renderContainerDefinitionPrefix}${tag}`,
      options: {
        hostNodeTagName: `${TINY_ENGINE_NAMING.hostTagPrefix}${tag}`,
        reflectToAttributes: true,
      },
    }).general()
    containers.set(tag, definition)
    space.registerComponent(tag, definition)
    return definition
  }

  const rootDefinition = space.defineComponent({
    is: TINY_ENGINE_NAMING.renderRootDefinition,
    options: {
      hostNodeTagName: TINY_ENGINE_NAMING.renderRootTag,
      reflectToAttributes: true,
    },
  }).general()
  const root = glassEasel.Component.createWithContext(TINY_ENGINE_NAMING.renderRootTag, rootDefinition, backend)
  const rootElement = root.getBackendElement() as unknown as HTMLElement | null
  if (rootElement && options.container) options.container.replaceChildren(rootElement)

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
    const ownerShadow = (owner as unknown as { ownerShadowRoot?: ShadowLike }).ownerShadowRoot
    return ownerShadow ?? (root.shadowRoot as unknown as ShadowLike)
  }

  const createText = (node: RenderText, owner: AnyComponent): glassEasel.TextNode => {
    const text = lightShadow(owner).createTextNode(node.text)
    nodes.set(node.id, text)
    currentTree.set(node.id, node)
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
  const cloneTouchDetail = (detail: unknown): unknown => {
    if (!detail || typeof detail !== 'object') return detail
    const copy = { ...(detail as Record<string, unknown>) }
    for (const key of ['touches', 'changedTouches']) {
      if (Array.isArray(copy[key])) copy[key] = (copy[key] as unknown[]).map(cloneTouch)
    }
    return copy
  }

  // Events the host maps from raw DOM. Everything else is emitted by the
  // built-in components through glass-easel with a normalized detail payload.
  const NATIVE_EVENT_NAMES = new Set(['tap', 'click', 'touchstart', 'touchmove', 'touchend', 'touchcancel'])

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
      // Semantic events from host built-ins (change/input/scroll/...) carry
      // the mini-program detail; forward that instead of re-deriving it.
      const listener = (event: glassEasel.Event<unknown> & {
        touches?: unknown
        changedTouches?: unknown
      }): void => {
        const original = (event as unknown as { getOriginalEvent?: () => unknown })
          .getOriginalEvent?.()
        // A raw backend event is re-dispatched through the glass tree; it has
        // no normalized detail and is handled by the DOM bridge below.
        if (original) return
        const isTouch = binding.name.startsWith('touch')
        const currentTarget = geometryOf(element, node.id)
        emitServiceEvent({
          id: node.id,
          name: binding.name,
          ...(currentTarget ? { currentTarget } : {}),
          ...(event.detail !== undefined
            ? { detail: isTouch ? cloneTouchDetail(event.detail) : event.detail }
            : {}),
          ...(isTouch && event.touches !== undefined
            ? { touches: cloneTouchList(event.touches) }
            : {}),
          ...(isTouch && event.changedTouches !== undefined
            ? { changedTouches: cloneTouchList(event.changedTouches) }
            : {}),
        })
      }
      component.addListener(binding.name, listener as never, { capture })
      cleanups.push(() => component.removeListener(binding.name, listener as never, { capture }))
      if (!NATIVE_EVENT_NAMES.has(binding.name)) continue
      if (!element || typeof element.addEventListener !== 'function') continue
      const domName = binding.name === 'tap' ? 'click' : binding.name
      // A `<label>` around a native checkbox/radio forwards its click to the
      // input, so one user tap produces two DOM clicks with the same timestamp.
      // Keep the first one; otherwise toggle handlers run twice and end up
      // back at the original value.
      let lastPointerStamp = -1
      const domListener = (event: Event): void => {
        if (isHandledNativeEvent(event)) return
        if (binding.name === 'tap' || binding.name === 'click') {
          if (event.timeStamp === lastPointerStamp) return
          lastPointerStamp = event.timeStamp
        }
        const currentTarget = geometryOf(element, node.id)
        const target = geometryOfTarget(event.target)
        const touchEvent = event as TouchEvent
        const touches = binding.name.startsWith('touch')
          ? normalizeTouchList(touchEvent.touches)
          : undefined
        const changedTouches = binding.name.startsWith('touch')
          ? normalizeTouchList(touchEvent.changedTouches)
          : undefined
        emitServiceEvent({
          id: node.id,
          name: binding.name,
          native: nativeFields(event),
          ...(touches ? { touches } : {}),
          ...(changedTouches ? { changedTouches } : {}),
          ...(currentTarget ? { currentTarget } : {}),
          ...(target ? { target } : {}),
        })
      }
      element.addEventListener(domName, domListener, capture)
      cleanups.push(() => element.removeEventListener(domName, domListener, capture))
    }
    if (cleanups.length > 0) eventCleanups.set(node.id, cleanups)
  }

  const wxsOwnerElement = (element: HTMLElement): HTMLElement => {
    let current: HTMLElement | null = element
    while (current) {
      const host = current.getAttribute('wx-host') ?? ''
      if (host && !host.startsWith('tiny-builtin-')) return current
      if (current.tagName.toLowerCase() === TINY_ENGINE_NAMING.pageTag) return current
      current = current.parentElement
    }
    return rootElement ?? element
  }

  const wxsNodeForElement = (element: HTMLElement | null): RenderElement | undefined => {
    if (!element) return undefined
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
        const match = owner.querySelector(selector) as HTMLElement | null
        return match ? wxsDescriptorFor(match, wxsOwnerElement(match)) : null
      },
      selectAllComponents(selector: string) {
        if (!owner) return []
        return Array.from(owner.querySelectorAll(selector))
          .map((match) => wxsDescriptorFor(match as HTMLElement, wxsOwnerElement(match as HTMLElement)))
      },
      getDataset() {
        return node?.dataset ?? (element ? { ...element.dataset } : {})
      },
      getState() {
        if (owner) {
          let state = wxsStates.get(owner)
          if (!state) {
            state = {}
            wxsStates.set(owner, state)
          }
          return state
        }
        const key = ownerViewId ?? viewId ?? 'anonymous'
        let state = wxsStatesById.get(key)
        if (!state) {
          state = {}
          wxsStatesById.set(key, state)
        }
        return state
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
            if (name && value) overrides.style.set(name, value)
          }
        } else if (typeof style === 'object') {
          for (const [name, value] of Object.entries(style as Record<string, unknown>)) {
            if (value === undefined || value === null) continue
            const property = name.startsWith('--')
              ? name
              : name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)
            overrides.style.set(property, String(value))
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
      getData() {
        const data = componentData[viewId ?? ''] ?? componentData[ownerViewId ?? '']
        return { ...(data ?? pageData) }
      },
      callMethod(name: string, ...args: unknown[]) {
        if (viewId) wxsEffectSink?.({ kind: 'callMethod', viewId, method: name, args })
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
  ): void => {
    const bindings = parseWxsProps(node.props)
    if (bindings.length === 0) return
    const element = component.getBackendElement() as unknown as HTMLElement | null
    if (element) pendingWxsProps.delete(node.id)
    const owner = element ? wxsOwnerElement(element) : rootElement
    const descriptor = wxsDescriptorFor(element, owner, node.id, node)
    const ownerDescriptor = wxsDescriptorFor(owner, owner, node.id)
    for (const binding of bindings) {
      const nextValue = node.props?.[binding.prop]
      const oldValue = previous?.[binding.prop]
      if (previous && Object.is(nextValue, oldValue)) continue
      try {
        wxsRuntime.invoke(
          binding.moduleId,
          binding.exportPath,
          [nextValue, oldValue, ownerDescriptor, descriptor],
        )
      } catch {
        // A failed prop observer must not break the render tree.
      }
    }
    wxsPropSnapshots.set(node.id, { ...(node.props ?? {}) })
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
    const ownerDescriptor = wxsDescriptorFor(owner, owner, node.id)
    payload.instance = descriptor
    let result: unknown
    try {
      result = wxsRuntime.invoke(binding.moduleId, binding.exportPath, [payload, ownerDescriptor])
    } catch {
      return
    }
    if (result === false || binding.catch) {
      stop()
      return
    }
    if (hasServiceListenerInPath(element.parentElement, binding.name)) {
      const { instance: _instance, ...servicePayload } = payload
      emitServiceEvent({ ...servicePayload, wxsHandled: true } as unknown as GlassRenderEvent)
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
      pendingWxsEvents.set(node.id, () => attachDynamicWxsEvents(node, component, bindings))
      return
    }
    const cleanups = eventCleanups.get(node.id) ?? []
    const invoke = (
      binding: WxsDynamicEventBinding,
      payload: Record<string, unknown>,
      stop: () => void,
    ): void => {
      const resolved = dynamicBindingModes.get(`${node.id}\0${binding.name}`)
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
      if (NATIVE_EVENT_NAMES.has(binding.name)) {
        const domName = binding.name === 'tap' ? 'click' : binding.name
        let lastPointerStamp = -1
        const listener = (event: Event): void => {
          if (isHandledNativeEvent(event)) return
          if (binding.name === 'tap' || binding.name === 'click') {
            if (event.timeStamp === lastPointerStamp) return
            lastPointerStamp = event.timeStamp
          }
          const currentTarget = geometryOf(element, node.id)
          const target = geometryOfTarget(event.target)
          const touchEvent = event as TouchEvent
          const isTouch = binding.name.startsWith('touch')
          const touches = isTouch ? normalizeTouchList(touchEvent.touches) : undefined
          const changedTouches = isTouch ? normalizeTouchList(touchEvent.changedTouches) : undefined
          const targetNode = target?.viewId ? currentTree.get(target.viewId) : undefined
          const payload: Record<string, unknown> = {
            id: node.id,
            name: binding.name,
            native: nativeFields(event),
            ...(touches ? { touches } : {}),
            ...(changedTouches ? { changedTouches } : {}),
            ...(currentTarget ? { currentTarget } : {}),
            ...(target ? { target } : {}),
          }
          if (currentTarget && node.dataset) {
            payload.currentTarget = { ...currentTarget, dataset: node.dataset }
          }
          if (target && targetNode?.type === 'element' && targetNode.dataset) {
            payload.target = { ...target, dataset: targetNode.dataset }
          }
          invoke(binding, payload, () => {
            event.preventDefault()
            event.stopPropagation()
          })
        }
        element.addEventListener(domName, listener, binding.capture === true)
        cleanups.push(() => element.removeEventListener(domName, listener, binding.capture === true))
        continue
      }

      const listener = (event: glassEasel.Event<unknown> & {
        touches?: unknown
        changedTouches?: unknown
      }): void => {
        const currentTarget = geometryOf(element, node.id)
        const isTouch = binding.name.startsWith('touch')
        const payload: Record<string, unknown> = {
          id: node.id,
          name: binding.name,
          ...(event.detail !== undefined
            ? { detail: isTouch ? cloneTouchDetail(event.detail) : event.detail }
            : {}),
          ...(isTouch && event.touches !== undefined
            ? { touches: cloneTouchList(event.touches) }
            : {}),
          ...(isTouch && event.changedTouches !== undefined
            ? { changedTouches: cloneTouchList(event.changedTouches) }
            : {}),
          ...(currentTarget ? { currentTarget } : {}),
        }
        if (currentTarget && node.dataset) {
          payload.currentTarget = { ...currentTarget, dataset: node.dataset }
        }
        invoke(binding, payload, () => {
          const target = event as unknown as {
            preventDefault?: () => void
            stopPropagation?: () => void
          }
          target.preventDefault?.()
          target.stopPropagation?.()
        })
      }
      component.addListener(binding.name, listener as never, { capture: binding.capture === true })
      cleanups.push(() => component.removeListener(binding.name, listener as never, {
        capture: binding.capture === true,
      }))
    }
    if (cleanups.length > 0) eventCleanups.set(node.id, cleanups)
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

  const flushPendingWxsProps = (): void => {
    for (const [id, pending] of pendingWxsProps) {
      if (!pending.component.getBackendElement()) continue
      applyWxsProps(pending.node, pending.component, wxsPropSnapshots.get(id))
    }
  }

  const flushAllWxsProps = (): void => {
    for (const [id, node] of currentTree) {
      if (node.type !== 'element' || parseWxsProps(node.props).length === 0) continue
      const component = nodes.get(id)
      if (!component || glassEasel.TextNode.isTextNode(component)) continue
      applyWxsProps(node, component, wxsPropSnapshots.get(id))
    }
  }

  const createElement = (
    node: RenderElement,
    owner: AnyComponent,
    inheritedExternal?: Record<string, string[]>,
  ): AnyComponent => {
    const builtin = builtinTags.has(node.tag)
    const definition = builtin
      ? definitions[node.tag as BuiltinComponentTag]
      : containerDefinition(node.tag)
    if (!definition) throw new Error(`no render definition for tag: ${node.tag}`)
    const component = lightShadow(owner).createComponentByDef(
      builtin ? node.tag : `${TINY_ENGINE_NAMING.hostTagPrefix}${node.tag}`,
      definition,
    )
    nodes.set(node.id, component)
    idByComponent.set(component, node.id)
    currentTree.set(node.id, node)
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
    externalByNode.set(node.id, external)
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
    if (node.type === 'text') return [node.id]
    return [node.id, ...(node.children ?? []).flatMap(collectIds)]
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
      pendingWxsProps.delete(id)
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
    const component = nodes.get(node.id)
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
    const external = node.externalClasses ?? externalByNode.get(node.id)
    externalByNode.set(node.id, external)
    queueElementClass(node, component, external)
    applyWxsProps(node, component, wxsPropSnapshots.get(node.id))
  }

  const applyPatches = (patches: RenderPatch[]): void => {
    for (const patch of patches) {
      if (patch.type === 'text') {
        const node = nodes.get(patch.id)
        if (node && glassEasel.TextNode.isTextNode(node)) node.textContent = patch.text
      } else if (patch.type === 'props') {
        const node = nodes.get(patch.id)
        if (node && node instanceof glassEasel.Element) {
          const current = currentTree.get(patch.id)
          if (current?.type === 'element') {
            const next: RenderElement = {
              ...current,
              props: { ...(current.props ?? {}), ...patch.props },
            }
            for (const name of patch.removed ?? []) delete next.props?.[name]
            currentTree.set(patch.id, next)
            updateProps(next)
          }
        }
      } else if (patch.type === 'insert') {
        insertNode(patch.parentId, patch.index, patch.node)
      } else if (patch.type === 'remove') {
        removeNode(patch.parentId, patch.index, patch.count)
      } else if (patch.type === 'reorder') {
        reorderNode(patch.parentId, patch.moves)
      } else if (patch.type === 'replace') {
        replaceNode(patch.id, patch.node)
      }
    }
    flushPendingAnimations()
    flushPendingClasses()
    flushPendingWxsEvents()
    flushPendingWxsProps()
    flushAllWxsProps()
  }

  // `this.animate` runs on the render side: the service resolved the selector
  // and normalized the keyframes, the DOM owns playback. A page may animate in
  // `onLoad`, before its first snapshot is mounted, so unresolved nodes are
  // parked and retried after the next mount/patch.
  const animationsByElement = new WeakMap<Element, Animation[]>()
  const pendingAnimations = new Map<string, RenderAnimationRequest>()
  const PENDING_ANIMATION_LIMIT = 64

  const elementForViewId = (viewId: string): Element | null => (
    rootElement?.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${viewId}"]`) ?? null
  )

  const playOn = (element: Element, request: RenderAnimationRequest): void => {
    const animate = (element as Element & {
      animate?: (keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation
    }).animate
    if (typeof animate !== 'function') return
    for (const running of animationsByElement.get(element) ?? []) running.cancel()
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
      playOn(element, request)
    }
  }

  const playAnimation = (request: RenderAnimationRequest): void => {
    for (const viewId of request.viewIds) {
      const element = elementForViewId(viewId)
      if (element) {
        playOn(element, request)
        continue
      }
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
      const element = elementForViewId(viewId)
      if (!element) continue
      for (const animation of animationsByElement.get(element) ?? []) animation.cancel()
      animationsByElement.delete(element)
    }
  }

  return {
    root,
    rootElement,
    setEventSink: (sink) => {
      eventSink = sink
    },
    setHostActionSink: (sink) => {
      hostActionSink = sink
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
    setWxsBinding: (binding) => {
      dynamicBindingModes.set(`${binding.viewId}\0${binding.event}`, binding)
    },
    setPageData: (data) => {
      pageData = { ...data }
    },
    setComponentData: (data) => {
      componentData = { ...data }
    },
    observeIntersection: (request, emit) => {
      if (typeof IntersectionObserver === 'undefined' || !rootElement) return undefined
      const elementFor = (id: string): Element | null => (
        rootElement.querySelector(`[${TINY_ENGINE_NAMING.nodeIdAttribute}="${id}"]`)
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
      const toInspect = (node: RenderNode, isRoot = false): Record<string, unknown> => {
        if (node.type === 'text') {
          return {
            id: node.id,
            type: 'text',
            tag: TINY_ENGINE_NAMING.textNodeTag,
            text: node.text,
            children: [],
          }
        }
        const attributes = Object.fromEntries(
          Object.entries(node.props ?? {}).map(([key, value]) => [key, String(value ?? '')]),
        )
        for (const [key, value] of Object.entries(node.dataset ?? {})) {
          attributes[`data-${key}`] = String(value ?? '')
        }
        return {
          id: node.id,
          type: builtinTags.has(node.tag) ? 'element' : 'component',
          tag: isRoot && node.tag === TINY_ENGINE_NAMING.pageTag
            ? TINY_ENGINE_NAMING.renderRootTag
            : node.tag,
          attributes,
          className: String(node.props?.class ?? ''),
          style: String(node.props?.style ?? ''),
          children: (node.children ?? []).map((child) => toInspect(child)),
        }
      }
      return currentRoot ? toInspect(currentRoot, true) : null
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
    query: (selector, all) => {
      if (!rootElement) return []
      const elements = Array.from(rootElement.querySelectorAll(selector))
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
    mount(node) {
      currentRoot = node
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
        rootId.value = node.id
        nodes.set(node.id, root)
        currentTree.set(node.id, node)
        pageScopes = node.scopes ?? []
        rootElement?.setAttribute(TINY_ENGINE_NAMING.nodeIdAttribute, node.id)
        applyHostProps(root, node.props)
        applyClassProps(rootElement, node.props, node.scopes, node.scopeChain, undefined, pageScopes)
      }
      if (options.attach !== false) glassEasel.Element.pretendAttached(root)
      flushPendingAnimations()
      flushPendingClasses()
      flushPendingWxsEvents()
      flushPendingWxsProps()
      flushAllWxsProps()
    },
    applyPatches,
    getNode(id) {
      return nodes.get(id)
    },
    destroy() {
      for (const cleanups of eventCleanups.values()) {
        for (const cleanup of cleanups) cleanup()
      }
      eventCleanups.clear()
      nodes.clear()
      currentTree.clear()
      externalByNode.clear()
      pendingClasses.clear()
      pendingWxsEvents.clear()
      pendingWxsProps.clear()
      wxsPropSnapshots.clear()
      for (const timer of wxsTimers) clearTimeout(timer)
      wxsTimers.clear()
      wxsRuntime.dispose()
      ;(root as unknown as { destroy?: () => void }).destroy?.()
    },
  }
}
