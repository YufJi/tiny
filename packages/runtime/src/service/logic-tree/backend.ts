import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import {
  RENDER_FRAGMENT_TAG,
  RENDER_PAGE_TAG,
} from '../../tree-protocol/protocol'
import { formatLocator } from '../../tree-protocol/locator'
import type { RenderElement, RenderNode } from '../../tree-protocol/protocol'

type LogicNodeType = 'element' | 'text' | 'component' | 'virtual' | 'fragment' | 'root'

const logicNodesByElement = new WeakMap<object, LogicBackendElement>()

export function findLogicNodeByElement(element: unknown): LogicBackendElement | undefined {
  if (!element || typeof element !== 'object') return undefined
  return logicNodesByElement.get(element)
}

/**
 * Resolve the definition path of a recorded component node.
 *
 * glass-easel registers each mini-program component under its artifact path
 * (`defineWithMethodCaller(schema.path)`), so the instance `is` is the path the
 * render tree resolves against `define` flow messages.
 */
function componentPathOf(node: LogicBackendElement): string {
  const element = node.__wxElement as unknown as { is?: unknown } | undefined
  return typeof element?.is === 'string' && element.is.length > 0 ? element.is : ''
}

/**
 * A host-independent backend that records the tree glass-easel produces.
 *
 * It is the service-side counterpart of `CurrentWindowBackendContext`: it has
 * no DOM, canvas or event loop of its own, and exposes the recorded tree for
 * the `view` protocol.
 */
export class LogicBackendElement {
  __wxElement?: glassEasel.Element
  readonly nodeType: LogicNodeType
  tagName = ''
  id = ''
  slot = ''
  slotName: string | null = null
  slotElement: LogicBackendElement | null = null
  inheritSlots = false
  readonly attributes = new Map<string, unknown>()
  readonly classes: string[] = []
  styleText = ''
  readonly dataset = new Map<string, unknown>()
  virtualName = ''
  scopeNames: string[] = []
  childScopeNames: string[] = []
  scopeChain: string[] = []
  hostScopeName = ''
  scopeNameResolver?: (scopeId: number) => string | undefined
  text = ''
  children: LogicBackendElement[] = []
  parentNode: LogicBackendElement | null = null
  shadowRoot: LogicBackendElement | null = null
  /** Set on shadow-root nodes: the component/page element they belong to. */
  host: LogicBackendElement | null = null
  readonly listeners: Array<{ type: string; capture: boolean; mutLevel: unknown }> = []
  released = false
  viewId: string | null = null

  constructor(nodeType: LogicNodeType) {
    this.nodeType = nodeType
    if (nodeType === 'component') {
      const shadowRoot = new LogicBackendShadowRoot()
      // Template nodes live in the page/component shadow tree, so an
      // element-to-element walk needs a way back from the shadow root to the
      // component that owns it (descriptor roots, selector scopes).
      shadowRoot.host = this
      this.shadowRoot = shadowRoot
    }
  }

  release(): void {
    this.released = true
  }

  associateValue(value: glassEasel.Element): void {
    this.__wxElement = value
    // Shadow-mode backends are associated element-to-value (composed backends
    // get the reversed `context.associateValue(node, value)` call). Register
    // the reverse lookup so `findLogicNodeByElement` can resolve a glass
    // element to the node it was recorded as; component-scoped selector
    // queries, intersection observers, `this.animate` and the WXS `ins`
    // descriptor all depend on it.
    logicNodesByElement.set(value as unknown as object, this)
  }

  getShadowRoot(): LogicBackendElement | undefined {
    return this.shadowRoot ?? undefined
  }

  appendChild(child: LogicBackendElement): void {
    if (child.parentNode) child.parentNode.removeChild(child)
    child.parentNode = this
    this.children.push(child)
  }

  removeChild(child: LogicBackendElement, index?: number): void {
    const at = index ?? this.children.indexOf(child)
    if (at < 0 || this.children[at] !== child) {
      const fallback = this.children.indexOf(child)
      if (fallback < 0) return
      this.children.splice(fallback, 1)
      child.parentNode = null
      return
    }
    this.children.splice(at, 1)
    child.parentNode = null
  }

  insertBefore(child: LogicBackendElement, before: LogicBackendElement | null, index?: number): void {
    if (child.parentNode) child.parentNode.removeChild(child)
    let at = index ?? (before ? this.children.indexOf(before) : this.children.length)
    if (!Number.isInteger(at) || at < 0) at = this.children.length
    child.parentNode = this
    this.children.splice(at, 0, child)
  }

  replaceChild(child: LogicBackendElement, oldChild: LogicBackendElement | null, index?: number): void {
    if (child.parentNode) child.parentNode.removeChild(child)
    let at = index ?? (oldChild ? this.children.indexOf(oldChild) : this.children.length)
    if (!Number.isInteger(at) || at < 0 || at >= this.children.length) {
      this.appendChild(child)
      return
    }
    const replaced = this.children[at]!
    replaced.parentNode = null
    child.parentNode = this
    this.children.splice(at, 1, child)
  }

  spliceBefore(before: LogicBackendElement, deleteCount: number, list: LogicBackendElement): void {
    const at = Math.max(0, this.children.indexOf(before))
    this.children.splice(at, deleteCount)
    const moving = list.children.slice()
    list.children.length = 0
    for (const child of moving) {
      child.parentNode = this
      this.children.splice(at, 0, child)
    }
  }

  spliceAppend(list: LogicBackendElement): void {
    const moving = list.children.slice()
    list.children.length = 0
    for (const child of moving) {
      child.parentNode = this
      this.children.push(child)
    }
  }

  spliceRemove(before: LogicBackendElement, deleteCount: number): void {
    const at = Math.max(0, this.children.indexOf(before))
    for (const child of this.children.splice(at, deleteCount)) child.parentNode = null
  }

  setId(id: string): void {
    this.id = id
  }

  setSlot(name: string): void {
    this.slot = name
  }

  setSlotName(name: string): void {
    this.slotName = name
  }

  setSlotElement(slot: LogicBackendElement | null): void {
    this.slotElement = slot
  }

  setInheritSlots(): void {
    this.inheritSlots = true
  }

  setStyle(styleText: string): void {
    this.styleText = styleText
  }

  addClass(className: string): void {
    if (!this.classes.includes(className)) this.classes.push(className)
  }

  removeClass(className: string): void {
    const at = this.classes.indexOf(className)
    if (at >= 0) this.classes.splice(at, 1)
  }

  setClassAlias(_className: string, _target: string[]): void {
    // Style scoping aliases are not part of the view description yet.
  }

  setAttribute(name: string, value: unknown): void {
    this.attributes.set(name, value)
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name)
  }

  setDataset(name: string, value: unknown): void {
    this.dataset.set(name, value)
  }

  setText(content: string): void {
    this.text = content
  }

  setListenerStats(type: string, capture: boolean, mutLevel: unknown): void {
    this.listeners.push({ type, capture, mutLevel })
  }

  setModelBindingStat(
    _attributeName: string,
    _listener: ((newValue: unknown) => void) | null,
  ): void {
    // Model bindings are resolved by glass-easel; the view only needs events.
  }
}

export class LogicBackendShadowRoot extends LogicBackendElement {
  constructor() {
    super('root')
  }

  createElement(logicalName: string, _stylingName: string): LogicBackendElement {
    const element = new LogicBackendElement('element')
    element.tagName = logicalName
    element.scopeNames = this.scopeNames
    element.scopeChain = this.scopeChain
    element.scopeNameResolver = this.scopeNameResolver
    return element
  }

  createTextNode(content: string): LogicBackendElement {
    const node = new LogicBackendElement('text')
    node.text = content
    return node
  }

  createComponent(
    tagName: string,
    _external: boolean,
    _virtualHost: boolean,
    styleScope: number,
    extraStyleScope: number | null,
    _externalClasses: string[] | undefined,
    _slotMode: unknown,
    _writeIdToDOM: boolean,
  ): LogicBackendElement {
    const node = new LogicBackendElement('component')
    node.tagName = tagName
    // An isolated component must not inherit the page/owner class scopes.
    const childScopes = extraStyleScope ? [...this.scopeNames] : []
    for (const scopeId of [extraStyleScope, styleScope]) {
      if (!scopeId) continue
      const name = this.scopeNameResolver?.(scopeId)
      if (name && !childScopes.includes(name)) childScopes.push(name)
    }
    node.scopeNames = tagName === RENDER_PAGE_TAG ? childScopes : this.scopeNames
    node.hostScopeName = styleScope
      ? this.scopeNameResolver?.(styleScope) ?? ''
      : ''
    node.scopeChain = this.scopeChain
    node.childScopeNames = childScopes
    if (node.shadowRoot) {
      node.shadowRoot.scopeNames = childScopes
      node.shadowRoot.scopeChain = [...childScopes, ...this.scopeChain]
      node.shadowRoot.scopeNameResolver = this.scopeNameResolver
    }
    return node
  }

  createVirtualNode(virtualName: string): LogicBackendElement {
    const node = new LogicBackendElement('virtual')
    node.tagName = virtualName
    node.virtualName = virtualName
    node.scopeNames = this.scopeNames
    node.scopeNameResolver = this.scopeNameResolver
    return node
  }
}

/** Role of a stylesheet in the mini-program cascade. */
export type LogicStyleSheetRole =
  | 'builtin'
  | 'low-priority'
  | 'app'
  | 'page'
  | 'component'
  | 'page-scope'
  | 'shared'
  | 'other'

export type LogicStyleSheetEntry = {
  path: string
  content: string
  role: LogicStyleSheetRole
  /** Page/component source path that owns this sheet, when known. */
  ownerPath?: string
}

type AppendedStyleSheet = {
  path: string
  scope?: number
  role: LogicStyleSheetRole
  ownerPath?: string
}

export class LogicBackendContext {
  mode = glassEasel.BackendMode.Shadow
  /** `id -> component-scoped locator` for the latest render snapshot. */
  private renderLocators = new Map<string, string>()
  private locatorNodes = new Map<string, LogicBackendElement>()
  /**
   * Locator entries of the last snapshot per page. Every page keeps its own
   * locators so mounting another page cannot wipe the mappings the previous
   * page needs for its events.
   */
  private pageLocatorEntries = new Map<string, { viewIds: string[]; locators: string[] }>()

  /** Component-scoped locator of a node in the latest render snapshot. */
  locatorOf(node: LogicBackendElement): string | undefined {
    return this.renderLocators.get(this.ensureViewId(node))
  }
  private readonly root: LogicBackendShadowRoot = new LogicBackendShadowRoot()
  private readonly nodesByViewId = new Map<string, LogicBackendElement>()
  private viewIdCounter = 0
  private styleSheetCounter = 0
  private readonly styleContents = new Map<string, string>()
  private readonly appendedStyles: AppendedStyleSheet[] = []

  destroy(): void {
    // No host resources.
  }

  getWindowWidth(): number {
    return 0
  }

  getWindowHeight(): number {
    return 0
  }

  getDevicePixelRatio(): number {
    return 1
  }

  getTheme(): string {
    return 'light'
  }

  registerStyleSheetContent(path: string, content: unknown): void {
    if (typeof content === 'string') this.styleContents.set(path, content)
  }

  appendStyleSheetPath(
    path: string,
    styleScope?: number,
    meta: { role?: LogicStyleSheetRole; ownerPath?: string } = {},
  ): number {
    this.styleSheetCounter += 1
    this.appendedStyles.push({
      path,
      scope: styleScope,
      role: meta.role ?? 'other',
      ...(meta.ownerPath ? { ownerPath: meta.ownerPath } : {}),
    })
    return this.styleSheetCounter
  }

  styleEntryCount(): number {
    return this.appendedStyles.length
  }

  styleEntriesSince(index: number): LogicStyleSheetEntry[] {
    return this.appendedStyles.slice(index).flatMap((entry) => {
      const content = this.styleContents.get(entry.path)
      return typeof content === 'string'
        ? [{
            path: entry.path,
            content,
            role: entry.role,
            ...(entry.ownerPath ? { ownerPath: entry.ownerPath } : {}),
          }]
        : []
    })
  }

  hasAppPageScope(): boolean {
    return this.appendedStyles.some((entry) => entry.role === 'page-scope')
  }

  getAppendedStyleTexts(): string[] {
    const seen = new Set<string>()
    const result: string[] = []
    for (const entry of this.appendedStyles) {
      if (seen.has(entry.path)) continue
      // The raw app sheet is global to the app; only its page-scoped copies
      // travel to a page render tree. Built-in styles are host-owned.
      if (entry.role === 'app' || entry.role === 'builtin') continue
      seen.add(entry.path)
      const css = this.styleContents.get(entry.path)
      if (typeof css === 'string' && css.trim().length > 0) result.push(css)
    }
    return result
  }

  disableStyleSheet(_index: number): void {
    // Styles are a view concern.
  }

  render(callback: (error: Error | null) => void): void {
    setTimeout(() => callback(null), 0)
  }

  getRootNode(): LogicBackendShadowRoot {
    return this.root
  }

  setScopeNameResolver(resolver: (scopeId: number) => string | undefined): void {
    this.root.scopeNameResolver = resolver
  }

  createFragment(): LogicBackendElement {
    return new LogicBackendElement('fragment')
  }

  onEvent(
    _createEvent: unknown,
    _listener: unknown,
  ): void {
    // The logic tree dispatches mini-program events after projection; the
    // backend event bridge is a view-layer concern.
  }

  findByViewId(viewId: string): LogicBackendElement | undefined {
    return this.nodesByViewId.get(viewId) ?? this.locatorNodes.get(viewId)
  }

  ensureViewId(node: LogicBackendElement): string {
    if (!node.viewId) {
      this.viewIdCounter += 1
      node.viewId = `${TINY_ENGINE_NAMING.viewIdPrefix}${this.viewIdCounter}`
      this.nodesByViewId.set(node.viewId, node)
    }
    return node.viewId
  }


  /**
   * Serialize the recorded tree into the host-neutral render-tree protocol.
   * Built-in tags stay semantic; custom components keep their host tag and
   * children. Props and dataset are typed (Date/function values intact).
   */
  snapshotRenderTree(
    pageId: string,
    rootElement?: LogicBackendElement,
    options: { rootKey?: string; rootMode?: 'page' | 'component' } = {},
  ): RenderNode | null {
    const locatorKey = `${pageId}\0${options.rootKey ?? 'page'}`
    const eventBindingsFor = (
      listeners: Array<{ type: string; capture: boolean; mutLevel: unknown }>,
    ): Array<{ name: string; capture?: boolean; catch?: boolean; mutated?: boolean }> => {
      // glass reports `catch` as the `Final` mutation level and `mutated` as
      // `Mut`. Both are compile-time WXML semantics the render host needs to
      // stop propagation / mutate handlers, so carry them across the bridge.
      const bindings = new Map<
        string,
        { name: string; capture?: boolean; catch?: boolean; mutated?: boolean }
      >()
      for (const listener of listeners) {
        const key = `${listener.type}\0${listener.capture ? 'capture' : 'bubble'}`
        const binding = bindings.get(key) ?? {
          name: listener.type,
          ...(listener.capture ? { capture: true } : {}),
        }
        const level = Number(listener.mutLevel)
        if (level === 2) binding.catch = true
        else if (level === 1) binding.mutated = true
        bindings.set(key, binding)
      }
      return [...bindings.values()]
    }
    const nextId = (node: LogicBackendElement): string => this.ensureViewId(node)
    const propsFor = (node: LogicBackendElement): Record<string, unknown> => {
      const props = Object.fromEntries(node.attributes)
      if (node.id) props.id = node.id
      if (node.classes.length > 0) props.class = node.classes.join(' ')
      if (node.hostScopeName) props[TINY_ENGINE_NAMING.hostAttribute] = node.hostScopeName
      if (node.styleText) props.style = node.styleText
      return props
    }
    const datasetFor = (node: LogicBackendElement): Record<string, unknown> | undefined => {
      if (node.dataset.size === 0) return undefined
      return Object.fromEntries(node.dataset)
    }
    const convertChildren = (
      nodes: LogicBackendElement[],
      slotContent?: LogicBackendElement[],
    ): RenderNode[] => {
      const result: RenderNode[] = []
      for (const node of nodes) {
        const converted = convert(node, slotContent)
        if (!converted) continue
        if (converted.type === 'element' && converted.tag === RENDER_FRAGMENT_TAG) {
          result.push(...(converted.children ?? []))
        } else {
          result.push(converted)
        }
      }
      return result
    }
    /**
     * Every component instance inside a component's shadow tree, in document
     * order. The render thread evaluates the same template and matches these by
     * path, so both sides agree on a view id without shipping the tree.
     */
    const componentInstancesOf = (
      node: LogicBackendElement,
    ): Array<{ id: string; path: string }> => {
      const instances: Array<{ id: string; path: string }> = []
      const seenComponents = new Set<LogicBackendElement>()
      const walk = (
        children: LogicBackendElement[],
        slotContent?: LogicBackendElement[],
      ): void => {
        for (const child of children) {
          if (child.nodeType === 'component') {
            if (!seenComponents.has(child)) {
              seenComponents.add(child)
              const path = componentPathOf(child)
              if (path) instances.push({ id: nextId(child), path })
            }
            if (child.shadowRoot) walk(child.shadowRoot.children, child.children)
            else walk(child.children)
            continue
          }
          if (child.nodeType === 'virtual'
            && (child.virtualName === 'slot' || child.tagName === 'slot')) {
            const slotName = child.slotName ?? ''
            const matched = slotContent?.filter(
              (candidate) => (candidate.slot || '') === slotName,
            ) ?? []
            walk(matched.length > 0 ? matched : child.children)
            continue
          }
          if (child.shadowRoot) {
            walk(child.shadowRoot.children, child.children)
            continue
          }
          walk(child.children, slotContent)
        }
      }
      if (node.shadowRoot) walk(node.shadowRoot.children, node.children)
      else walk(node.children)
      return instances
    }
    const nodeToViewId = new WeakMap<object, string>()
    const nodeToLogic = new WeakMap<object, LogicBackendElement>()
    const convert = (
      node: LogicBackendElement,
      slotContent?: LogicBackendElement[],
    ): RenderNode | null => {
      if (node.nodeType === 'text') {
        const viewId = nextId(node)
        const text = { type: 'text' as const, text: node.text }
        nodeToViewId.set(text, viewId)
        nodeToLogic.set(text, node)
        return text
      }
      if (node.nodeType === 'fragment') {
        const fragment: RenderElement = {
          type: 'element',
          id: nextId(node),
          tag: RENDER_FRAGMENT_TAG,
          children: convertChildren(node.children),
        }
        nodeToViewId.set(fragment, nextId(node))
        nodeToLogic.set(fragment, node)
        return fragment
      }
      if (node.nodeType === 'virtual') {
        if (node.virtualName === 'slot' || node.tagName === 'slot') {
          const slotName = node.slotName ?? ''
          const matched = slotContent?.filter((child) => (child.slot || '') === slotName) ?? []
          const content = matched.length > 0 ? matched : node.children
          const slotFragment: RenderElement = {
            type: 'element',
            id: nextId(node),
            tag: RENDER_FRAGMENT_TAG,
            children: convertChildren(content),
          }
          nodeToViewId.set(slotFragment, nextId(node))
          nodeToLogic.set(slotFragment, node)
          return slotFragment
        }
        const virtualFragment: RenderElement = {
          type: 'element',
          id: nextId(node),
          tag: RENDER_FRAGMENT_TAG,
          children: convertChildren(node.children, slotContent),
        }
        nodeToViewId.set(virtualFragment, nextId(node))
        nodeToLogic.set(virtualFragment, node)
        return virtualFragment
      }
      const rootAsComponent = node === rootElement && options.rootMode === 'component'
      // Custom components keep only their light children: the render thread
      // evaluates the component template and owns the shadow tree. The page
      // root's shadow tree *is* the page template, so it is flattened here.
      const customComponent = node.nodeType === 'component'
        && (node !== rootElement || rootAsComponent)
      const children = customComponent
        ? convertChildren(node.children, slotContent)
        : node.shadowRoot
          ? convertChildren(node.shadowRoot.children, node.children)
          : convertChildren(node.children, slotContent)
      const externalClasses = (node.__wxElement as unknown as {
        getExternalClasses?: () => Record<string, string[] | undefined>
      } | undefined)?.getExternalClasses?.()
      const external = externalClasses
        ? Object.fromEntries(
            Object.entries(externalClasses)
              .filter((entry): entry is [string, string[]] => Array.isArray(entry[1]) && entry[1].length > 0),
          )
        : undefined
      // Custom components are the only nodes that carry a component boundary in
      // the render protocol. The page root is emitted as the page tag and never
      // marked, because it is not addressable via `usingComponents`.
      const componentPath = customComponent
        ? componentPathOf(node)
        : ''
      // Component instances the render side will create while evaluating this
      // template: share their view ids so per-instance data can be routed.
      const componentInstances = componentPath ? componentInstancesOf(node) : []
      const viewId = nextId(node)
      const element: RenderElement = {
        type: 'element',
        ...(node === rootElement || componentPath ? { id: viewId } : {}),
        tag: node === rootElement && !rootAsComponent ? RENDER_PAGE_TAG : node.tagName,
        ...(componentPath ? { component: true as const, componentPath } : {}),
        ...(componentInstances.length > 0 ? { componentInstances } : {}),
        ...(node.slot ? { slot: node.slot } : {}),
        props: propsFor(node),
        ...(external && Object.keys(external).length > 0 ? { externalClasses: external } : {}),
        ...(datasetFor(node) ? { dataset: datasetFor(node) } : {}),
        ...(node.scopeNames.length > 0 ? { scopes: [...new Set(node.scopeNames)] } : {}),
        ...(node.scopeChain.length > 0 ? { scopeChain: [...new Set(node.scopeChain)] } : {}),
        ...(node.listeners.length > 0
          ? { events: eventBindingsFor(node.listeners) }
          : {}),
        ...(children.length > 0 ? { children } : {}),
      }
      nodeToViewId.set(element, viewId)
      nodeToLogic.set(element, node)
      return element
    }
    if (!rootElement) return null
    const root = convert(rootElement)
    if (!root) return null
    // Component-scoped locators: elements are addressed by `owner#index.path`
    // (owner is the nearest component, or the page root) once their shared ids
    // are demoted. Components keep their own view id.
    const locators = new Map<string, string>()
    const nodesByLocator = new Map<string, LogicBackendElement>()
    const walk = (node: RenderNode, owner: string, path: number[]): void => {
      const locator = formatLocator(owner, path)
      if (path.length > 0) {
        const viewId = nodeToViewId.get(node)
        if (viewId) locators.set(viewId, locator)
        const logic = nodeToLogic.get(node)
        if (logic) nodesByLocator.set(locator, logic)
      }
      if (node.type !== 'element') return
      const boundary = node.component === true && node.componentPath && node.id ? node.id : owner
      const base = boundary === owner ? path : []
      ;(node.children ?? []).forEach((child, index) => {
        walk(child, boundary, [...base, index])
      })
    }
    const rootViewId = nodeToViewId.get(root) ?? root.id ?? ''
    walk(root, rootViewId, [])
    // Custom component shadow trees are evaluated in render and therefore are
    // not part of the page snapshot sent to the host. Their logical elements
    // still need component-scoped locators so event targets inside a component
    // template resolve to the same node as the pageframe.
    const indexedComponents = new Set<LogicBackendElement>()
    const indexComponentShadow = (component: LogicBackendElement): void => {
      if (indexedComponents.has(component) || !component.shadowRoot) return
      indexedComponents.add(component)
      const owner = this.ensureViewId(component)
      const indexChildren = (
        children: LogicBackendElement[],
        prefix: number[],
        state: { index: number },
      ): void => {
        for (const child of children) {
          if (child.nodeType === 'fragment' || child.nodeType === 'virtual') {
            indexChildren(child.children, prefix, state)
            continue
          }
          const path = [...prefix, state.index]
          state.index += 1
          if (child.nodeType === 'text') continue
          const locator = formatLocator(owner, path)
          locators.set(this.ensureViewId(child), locator)
          nodesByLocator.set(locator, child)
          if (child.nodeType === 'component') {
            indexComponentShadow(child)
          } else if (child.shadowRoot) {
            indexChildren(child.shadowRoot.children, path, { index: 0 })
          } else {
            indexChildren(child.children, path, { index: 0 })
          }
        }
      }
      indexChildren(component.shadowRoot.children, [], { index: 0 })
    }
    const indexComponents = (node: RenderNode): void => {
      if (node.type !== 'element') return
      const logic = nodeToLogic.get(node)
      if (node.component === true && logic) indexComponentShadow(logic)
      for (const child of node.children ?? []) indexComponents(child)
    }
    indexComponents(root)
    const previous = this.pageLocatorEntries.get(locatorKey)
    if (previous) {
      for (const viewId of previous.viewIds) this.renderLocators.delete(viewId)
      for (const locator of previous.locators) this.locatorNodes.delete(locator)
    }
    for (const [viewId, locator] of locators) this.renderLocators.set(viewId, locator)
    for (const [locator, node] of nodesByLocator) this.locatorNodes.set(locator, node)
    this.pageLocatorEntries.set(locatorKey, {
      viewIds: [...locators.keys()],
      locators: [...nodesByLocator.keys()],
    })
    return root
  }

  /** Drop every locator table owned by one page (page root and tab root). */
  clearPageLocators(pageId: string): void {
    const prefix = `${pageId}\0`
    for (const [key, entry] of this.pageLocatorEntries) {
      if (!key.startsWith(prefix)) continue
      for (const viewId of entry.viewIds) this.renderLocators.delete(viewId)
      for (const locator of entry.locators) this.locatorNodes.delete(locator)
      this.pageLocatorEntries.delete(key)
    }
  }


}
