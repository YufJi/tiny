import * as glassEasel from 'glass-easel'
import { TINY_ENGINE_NAMING } from '@tiny/manifest'
import {
  RENDER_FRAGMENT_TAG,
  RENDER_PAGE_TAG,
} from '../protocol'
import type { RenderElement, RenderNode } from '../protocol'

type LogicNodeType = 'element' | 'text' | 'component' | 'virtual' | 'fragment' | 'root'

const logicNodesByElement = new WeakMap<object, LogicBackendElement>()

export function findLogicNodeByElement(element: unknown): LogicBackendElement | undefined {
  if (!element || typeof element !== 'object') return undefined
  return logicNodesByElement.get(element)
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
    return this.nodesByViewId.get(viewId)
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
  ): RenderNode | null {
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
    const convert = (
      node: LogicBackendElement,
      slotContent?: LogicBackendElement[],
    ): RenderNode | null => {
      if (node.nodeType === 'text') {
        return { type: 'text', id: nextId(node), text: node.text }
      }
      if (node.nodeType === 'fragment') {
        return {
          type: 'element',
          id: nextId(node),
          tag: RENDER_FRAGMENT_TAG,
          children: convertChildren(node.children),
        }
      }
      if (node.nodeType === 'virtual') {
        if (node.virtualName === 'slot' || node.tagName === 'slot') {
          const slotName = node.slotName ?? ''
          const matched = slotContent?.filter((child) => (child.slot || '') === slotName) ?? []
          const content = matched.length > 0 ? matched : node.children
          return {
            type: 'element',
            id: nextId(node),
            tag: RENDER_FRAGMENT_TAG,
            children: convertChildren(content),
          }
        }
        return {
          type: 'element',
          id: nextId(node),
          tag: RENDER_FRAGMENT_TAG,
          children: convertChildren(node.children, slotContent),
        }
      }
      const children = node.nodeType === 'component' && node.shadowRoot
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
      const element: RenderElement = {
        type: 'element',
        id: nextId(node),
        tag: node === rootElement ? RENDER_PAGE_TAG : node.tagName,
        props: propsFor(node),
        ...(external && Object.keys(external).length > 0 ? { externalClasses: external } : {}),
        ...(datasetFor(node) ? { dataset: datasetFor(node) } : {}),
        ...(node.scopeNames.length > 0 ? { scopes: [...new Set(node.scopeNames)] } : {}),
        ...(node.scopeChain.length > 0 ? { scopeChain: [...new Set(node.scopeChain)] } : {}),
        ...(node.listeners.length > 0
          ? {
              events: node.listeners.map((listener) => ({
                name: listener.type,
                capture: listener.capture,
              })),
            }
          : {}),
        ...(children.length > 0 ? { children } : {}),
      }
      return element
    }
    if (!rootElement) return null
    return convert(rootElement)
  }


}
