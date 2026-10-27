import * as glassEasel from 'glass-easel'
import type { RenderElement, RenderNode, RenderText } from '../tree/protocol'
import type { ViewEventBinding, ViewNode, ViewSnapshot } from './protocol'

type LogicNodeType = 'element' | 'text' | 'component' | 'virtual' | 'fragment' | 'root'

const logicNodesByElement = new WeakMap<object, LogicBackendElement>()

export function findLogicNodeByElement(element: unknown): LogicBackendElement | undefined {
  if (!element || typeof element !== 'object') return undefined
  return logicNodesByElement.get(element)
}

function toAttributeString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
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
  scopeNameResolver?: (scopeId: number) => string | undefined
  text = ''
  children: LogicBackendElement[] = []
  parentNode: LogicBackendElement | null = null
  shadowRoot: LogicBackendElement | null = null
  readonly listeners: Array<{ type: string; capture: boolean; mutLevel: unknown }> = []
  released = false
  viewId: string | null = null

  constructor(nodeType: LogicNodeType) {
    this.nodeType = nodeType
    if (nodeType === 'component') this.shadowRoot = new LogicBackendShadowRoot()
  }

  release(): void {
    this.released = true
  }

  associateValue(value: glassEasel.Element): void {
    this.__wxElement = value
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
    const childScopes = [...this.scopeNames]
    for (const scopeId of [extraStyleScope, styleScope]) {
      if (!scopeId) continue
      const name = this.scopeNameResolver?.(scopeId)
      if (name && !childScopes.includes(name)) childScopes.push(name)
    }
    node.scopeNames = tagName === 'page' ? childScopes : this.scopeNames
    node.childScopeNames = childScopes
    if (node.shadowRoot) {
      node.shadowRoot.scopeNames = childScopes
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

export class LogicBackendContext {
  mode = glassEasel.BackendMode.Shadow
  private readonly root: LogicBackendShadowRoot = new LogicBackendShadowRoot()
  private readonly nodesByViewId = new Map<string, LogicBackendElement>()
  private viewIdCounter = 0
  private styleSheetCounter = 0

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

  registerStyleSheetContent(_path: string, _content: unknown): void {
    // Styles are a view concern.
  }

  appendStyleSheetPath(_path: string, _styleScope?: number): number {
    this.styleSheetCounter += 1
    return this.styleSheetCounter
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
      node.viewId = `view-${this.viewIdCounter}`
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
      if (node.tagName === 'page' && node.scopeNames[0]) props['wx-host'] = node.scopeNames[0]
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
        if (converted.type === 'element' && converted.tag === '#fragment') {
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
          tag: '#fragment',
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
            tag: '#fragment',
            children: convertChildren(content),
          }
        }
        return {
          type: 'element',
          id: nextId(node),
          tag: '#fragment',
          children: convertChildren(node.children, slotContent),
        }
      }
      const children = node.nodeType === 'component' && node.shadowRoot
        ? convertChildren(node.shadowRoot.children, node.children)
        : convertChildren(node.children, slotContent)
      const element: RenderElement = {
        type: 'element',
        id: nextId(node),
        tag: node === rootElement ? 'page' : node.tagName,
        props: propsFor(node),
        ...(datasetFor(node) ? { dataset: datasetFor(node) } : {}),
        ...(node.scopeNames.length > 0 ? { scopes: [...new Set(node.scopeNames)] } : {}),
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

  /** Serialize the recorded tree and keep typed datasets keyed by viewId. */
  snapshot(
    pageId: string,
    rootElement?: LogicBackendElement,
  ): { snapshot: ViewSnapshot; datasets: Map<string, Record<string, unknown>> } {
    const datasets = new Map<string, Record<string, unknown>>()
    const nextId = (node: LogicBackendElement): string => this.ensureViewId(node)
    const convertChildren = (
      nodes: LogicBackendElement[],
      slotContent?: LogicBackendElement[],
    ): ViewNode[] => {
      const result: ViewNode[] = []
      for (const node of nodes) {
        const converted = convert(node, slotContent)
        if (!converted) continue
        if (converted.tag === '#fragment' || converted.tag === '#virtual') {
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
    ): ViewNode | null => {
      if (node.nodeType === 'text') {
        return { viewId: nextId(node), tag: '#text', text: node.text }
      }
      if (node.nodeType === 'fragment') {
        return { viewId: nextId(node), tag: '#fragment', children: convertChildren(node.children) }
      }
      if (node.nodeType === 'virtual') {
        if (node.virtualName === 'slot' || node.tagName === 'slot') {
          const slotName = node.slotName ?? ''
          const matched = slotContent?.filter((child) => (child.slot || '') === slotName) ?? []
          const content = matched.length > 0 ? matched : node.children
          return {
            viewId: nextId(node),
            tag: '#fragment',
            children: convertChildren(content),
          }
        }
        return {
          viewId: nextId(node),
          tag: '#virtual',
          children: convertChildren(node.children, slotContent),
        }
      }
      const viewId = nextId(node)
      const dataset: Record<string, string> = {}
      const typedDataset: Record<string, unknown> = {}
      for (const [key, value] of node.dataset) {
        dataset[key] = toAttributeString(value)
        typedDataset[key] = value
      }
      if (Object.keys(typedDataset).length > 0) datasets.set(viewId, typedDataset)
      const attributes: Record<string, string> = {}
      for (const [key, value] of node.attributes) {
        if (key === 'class' || key === 'style' || key === 'id') continue
        attributes[key] = toAttributeString(value)
      }
      if (node.tagName === 'page' && node.scopeNames[0]) {
        attributes['wx-host'] = node.scopeNames[0]
      }
      const rawChildren = node.nodeType === 'component' && node.shadowRoot
        ? convertChildren(node.shadowRoot.children, node.children)
        : convertChildren(node.children, slotContent)
      const children = rawChildren
      const events = new Map<string, ViewEventBinding>()
      for (const listener of node.listeners) {
        const key = `${listener.type}:${listener.capture}`
        if (events.has(key)) continue
        events.set(key, {
          name: listener.type,
          capture: listener.capture,
        })
      }
      return {
        viewId,
        tag: node.tagName,
        ...(node.id ? { attributes: { ...attributes, id: node.id } } : (Object.keys(attributes).length > 0 ? { attributes } : {})),
        ...(node.classes.length > 0 ? { className: node.classes.join(' ') } : {}),
        ...(node.scopeNames.length > 0
          ? { styleScopes: [...new Set(node.scopeNames)] }
          : {}),
        ...(node.styleText ? { style: node.styleText } : {}),
        ...(Object.keys(dataset).length > 0 ? { dataset } : {}),
        ...(events.size > 0 ? { events: [...events.values()] } : {}),
        ...(children.length > 0 ? { children } : {}),
      }
    }
    let root: ViewNode
    if (rootElement) {
      root = convert(rootElement) ?? {
        viewId: nextId(rootElement),
        tag: '#root',
        children: [],
      }
    } else {
      root = {
        viewId: nextId(this.root),
        tag: '#root',
        children: convertChildren(this.root.children),
      }
    }
    return {
      snapshot: { pageId, revision: 1, root },
      datasets,
    }
  }
}
