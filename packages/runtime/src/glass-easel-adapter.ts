import * as glassEasel from 'glass-easel'
import type { Manifest, PageArtifact } from '@tiny/cli'
import type { StyleLoader, TemplateRegistry } from './types'
import { toJsonSafe, type SerializedEventNode, type SerializedMiniProgramEvent } from './events'
import type { MiniProgramComponentSchema } from './types'
import {
  BUILTIN_BASE_STYLES,
  createP0BuiltinComponents,
  type BuiltinComponentDefinitions,
} from '@tiny/builtin-components'
import { createRuntimeDiagnostic } from './diagnostics'

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
  ) => void
  onComponentPageLifetime?: (
    componentId: string,
    path: string,
    phase: 'show' | 'hide',
    data: Record<string, unknown>,
  ) => void
  onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
  /** Attach the created root component to a host-provided backend tree. */
  mountComponent?: (component: glassEasel.GeneralComponent) => void
  /** Detach the root component from the host-provided backend tree. */
  unmountComponent?: (component: glassEasel.GeneralComponent) => void
}

export class GlassEaselRuntimeAdapter {
  readonly backend: glassEasel.GeneralBackendContext
  readonly componentSpace: glassEasel.ComponentSpace
  private readonly templates: TemplateRegistry
  private readonly styleScopeIds = new Map<string, number>()
  private readonly componentDefinitions = new Map<string, glassEasel.GeneralComponentDefinition>()
  private readonly pages = new Map<string, PageArtifact>()
  private readonly mountedComponents = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentsByPageId = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentSchemas = new Map<string, MiniProgramComponentSchema>()
  private readonly componentInstances = new Map<string, glassEasel.GeneralComponent>()
  private readonly componentIds = new WeakMap<object, string>()
  private readonly componentPaths = new WeakMap<object, string>()
  private readonly emittedLifecycles = new WeakMap<object, Set<ComponentLifecyclePhase>>()
  private readonly componentUsageCounters = new Map<string, number>()
  private activeEventPageId: string | null = null
  private readonly onMiniProgramEvent?: (pageId: string, event: SerializedMiniProgramEvent) => void
  private readonly onComponentLifecycle?: (
    componentId: string,
    path: string,
    phase: ComponentLifecyclePhase,
    data: Record<string, unknown>,
  ) => void
  private readonly onComponentPageLifetime?: (
    componentId: string,
    path: string,
    phase: 'show' | 'hide',
    data: Record<string, unknown>,
  ) => void
  private readonly builtinComponents: BuiltinComponentDefinitions
  private readonly onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
  private readonly mountComponent?: (component: glassEasel.GeneralComponent) => void
  private baseStylesRegistered = false
  private readonly unmountComponent?: (component: glassEasel.GeneralComponent) => void

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.templates = options.templates
    this.onMiniProgramEvent = options.onMiniProgramEvent
    this.onComponentLifecycle = options.onComponentLifecycle
    this.onComponentPageLifetime = options.onComponentPageLifetime
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
    this.onDiagnostic = options.onDiagnostic
    this.mountComponent = options.mountComponent
    this.unmountComponent = options.unmountComponent
    this.builtinComponents = createP0BuiltinComponents(this.componentSpace, {
      onDiagnostic: (diagnostic) => this.onDiagnostic?.(createRuntimeDiagnostic(
        diagnostic.severity,
        diagnostic.code,
        diagnostic.message,
        'render',
        this.activeEventPageId ?? undefined,
        diagnostic.details,
      )),
    })
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.componentSchemas.set(schema.path, schema)
      this.registerComponentDefinition(schema)
    }
  }

  registerStyles(manifest: Manifest, loadStyle: StyleLoader = () => ''): void {
    if (!this.baseStylesRegistered) {
      this.backend.registerStyleSheetContent('tiny-builtin-base.css', BUILTIN_BASE_STYLES)
      this.backend.appendStyleSheetPath(
        'tiny-builtin-base.css',
        glassEasel.StyleScopeManager.globalScope(),
      )
      this.baseStylesRegistered = true
    }
    for (const style of manifest.styles) {
      const css = loadStyle(style.outputPath)
      if (typeof css !== 'string') continue
      this.backend.registerStyleSheetContent(style.outputPath, css)
      const scopeId = style.scope
        ? this.componentSpace.styleScopeManager.register(style.scope)
        : glassEasel.StyleScopeManager.globalScope()
      this.styleScopeIds.set(style.path, scopeId)
      this.backend.appendStyleSheetPath(style.outputPath, scopeId)
    }
  }

  registerPage(page: PageArtifact, data: Record<string, unknown> = {}): glassEasel.GeneralComponentDefinition {
    const existing = this.componentDefinitions.get(page.path)
    if (existing) return existing
    if (!this.templates.groupList[page.path]) {
      throw new Error(`glass-easel template not found: ${page.path}`)
    }

    const style = page.style
    const using = this.resolveComponentUsing(page.path, page.configuration)
    const definition = this.componentSpace
      .defineWithMethodCaller(page.path)
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(page.path, name),
      })
      .data(() => data)
      .usingComponents(using as never)
      .options({
        multipleSlots: true,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: style?.scope ? this.styleScopeIds.get(style.path) : undefined,
      })
      .methodCallerInit(() => this.createEventMethodCaller(this.activeEventPageId ?? page.path))
      .registerComponent()
    this.componentDefinitions.set(page.path, definition)
    return definition
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
    const componentId = usage === 1 ? schema.componentId : `${schema.componentId}~${usage}`
    this.componentIds.set(key, componentId)
    this.componentPaths.set(key, schema.path)
    this.componentInstances.set(componentId, component)
    return componentId
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
    const component = glassEasel.Component.createWithContext(
      'page',
      this.registerPage(page, data),
      this.backend,
    )
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
      const domTree = serializeDomNode(backend, '0', 0, budget)
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
  ): glassEasel.GeneralComponentDefinition {
    const existing = this.componentDefinitions.get(schema.path)
    if (existing) return existing

    const using = Object.fromEntries(
      Object.entries(schema.using).map(([tag, reference]) => {
        const path = this.resolveComponentReference(schema.path, reference)
        const dependency = this.componentSchemas.get(path)
        return [tag, dependency ? this.registerComponentDefinition(dependency) : path]
      }),
    )
    const styleScopeId = this.styleScopeIds.get(`${schema.path}.wxss`)
    const adapter = this

    const definition = this.componentSpace
      .defineWithMethodCaller(schema.path)
      .definition({ properties: schema.properties as never })
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(schema.path, name),
      })
      .data(() => schema.data as never)
      .usingComponents({ ...this.builtinComponents, ...using } as never)
      .options({
        multipleSlots: true,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: styleScopeId,
      })
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        return adapter.createEventMethodCaller(
          adapter.activeEventPageId ?? schema.path,
          adapter.componentIdFor(schema, this),
          this,
          schema.path,
        )
      })
      .lifetime('created', function (this: glassEasel.GeneralComponent) {
        adapter.emitComponentLifecycle(schema, 'created', this)
      })
      .lifetime('attached', function (this: glassEasel.GeneralComponent) {
        adapter.emitComponentLifecycle(schema, 'attached', this)
      })
      .lifetime('ready', function (this: glassEasel.GeneralComponent) {
        adapter.emitComponentLifecycle(schema, 'ready', this)
      })
      .lifetime('moved', function (this: glassEasel.GeneralComponent) {
        adapter.emitComponentLifecycle(schema, 'moved', this)
      })
      .lifetime('detached', function (this: glassEasel.GeneralComponent) {
        adapter.emitComponentLifecycle(schema, 'detached', this)
      })
      .pageLifetime('show', function (this: glassEasel.GeneralComponent) {
        adapter.onComponentPageLifetime?.(
          adapter.componentIdFor(schema, this),
          schema.path,
          'show',
          (toJsonSafe(this.data ?? {}) ?? {}) as Record<string, unknown>,
        )
      })
      .pageLifetime('hide', function (this: glassEasel.GeneralComponent) {
        adapter.onComponentPageLifetime?.(
          adapter.componentIdFor(schema, this),
          schema.path,
          'hide',
          (toJsonSafe(this.data ?? {}) ?? {}) as Record<string, unknown>,
        )
      })
      .registerComponent()

    this.componentDefinitions.set(schema.path, definition)
    return definition
  }

  private resolveComponentUsing(path: string, config?: Record<string, any>): Record<string, glassEasel.GeneralComponentDefinition | string> {
    const effective = config?.effective ?? {}
    const usingComponents = effective.usingComponents
    if (!usingComponents || typeof usingComponents !== 'object') return {}
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
        return [tag, definition ? this.registerComponentDefinition(definition) : componentPath]
      }),
    )
    return { ...this.builtinComponents, ...resolved }
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
    this.onComponentLifecycle?.(componentId, path, phase, data)
  }

  private serializeEvent(
    handler: string,
    event: glassEasel.ShadowedEvent<unknown>,
  ): SerializedMiniProgramEvent {
    return {
      handler,
      type: event.type,
      timeStamp: event.timeStamp,
      detail: toJsonSafe(event.detail) ?? null,
      bubbles: event.bubbles,
      composed: event.composed,
      capture: event.isCapturePhase(),
      stopped: event.propagationStopped(),
      target: this.serializeEventNode(event.target),
      currentTarget: this.serializeEventNode(event.currentTarget),
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
    type: node.hasAttribute?.('wx-host') ? 'component' : 'element',
    tag: String(node.tagName ?? 'unknown').toLowerCase(),
    children: Array.from(node.childNodes ?? [])
      .map((child, index) => serializeDomNode(child, `${id}.${index}`, depth + 1, budget))
      .filter((child): child is InspectNode => child !== null),
  }
  if (Object.keys(attributes).length > 0) result.attributes = attributes
  if (typeof node.className === 'string' && node.className.length > 0) result.className = node.className
  const style = node.getAttribute?.('style')
  if (style) result.style = style
  return result
}
