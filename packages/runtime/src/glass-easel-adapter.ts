import * as glassEasel from 'glass-easel'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import type { StyleLoader, TemplateRegistry } from './types'
import { toJsonSafe, type SerializedEventNode, type SerializedMiniProgramEvent } from './events'
import type { MiniProgramComponentSchema } from './types'

export type ComponentLifecyclePhase = 'created' | 'attached' | 'ready' | 'moved' | 'detached'

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

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.templates = options.templates
    this.onMiniProgramEvent = options.onMiniProgramEvent
    this.onComponentLifecycle = options.onComponentLifecycle
    this.onComponentPageLifetime = options.onComponentPageLifetime
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
  }

  registerComponentSchemas(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.componentSchemas.set(schema.path, schema)
      this.registerComponentDefinition(schema)
    }
  }

  registerStyles(manifest: Manifest, loadStyle: StyleLoader = () => ''): void {
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
      'tiny-root',
      this.registerPage(page, data),
      this.backend,
    )
    this.mountedComponents.set(path, component)
    if (pageId) this.componentsByPageId.set(pageId, component)
    glassEasel.Element.pretendAttached(component)
    component.triggerLifetime('ready', [])
    for (const [componentId, instance] of this.componentInstances) {
      this.onComponentLifecycle?.(
        componentId,
        instance.is,
        'ready',
        (toJsonSafe(instance.data ?? {}) ?? {}) as Record<string, unknown>,
      )
    }
    return component
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
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
      .usingComponents(using as never)
      .options({
        multipleSlots: true,
        writeIdToDOM: true,
        useMethodCallerListeners: true,
        styleScope: styleScopeId,
      })
      .methodCallerInit(function (this: glassEasel.GeneralComponent) {
        adapter.componentInstances.set(schema.componentId, this)
        return adapter.createEventMethodCaller(adapter.activeEventPageId ?? schema.path, schema.componentId, this)
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
          schema.componentId,
          schema.path,
          'show',
          (toJsonSafe(this.data ?? {}) ?? {}) as Record<string, unknown>,
        )
      })
      .pageLifetime('hide', function (this: glassEasel.GeneralComponent) {
        adapter.onComponentPageLifetime?.(
          schema.componentId,
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
    return Object.fromEntries(
      Object.entries(usingComponents as Record<string, unknown>).map(([tag, reference]) => {
        const sources = (config?.usingComponentsSource ?? {}) as Record<string, string>
        const sourcePath = sources[tag] === 'global' ? '' : path
        const componentPath = this.resolveComponentReference(sourcePath, String(reference))
        const definition = this.componentSchemas.get(componentPath)
        return [tag, definition ? this.registerComponentDefinition(definition) : componentPath]
      }),
    )
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
  ): unknown {
    const adapter = this
    return new Proxy({}, {
      has() {
        return true
      },
      get(_target, property) {
        if (typeof property !== 'string') return undefined
        return adapter.createEventDispatcher(pageId, property, componentId, component)
      },
      getOwnPropertyDescriptor(_target, property) {
        if (typeof property !== 'string') return undefined
        return {
          configurable: true,
          enumerable: true,
        value: adapter.createEventDispatcher(pageId, property, componentId, component),
        }
      },
    })
  }

  private createEventDispatcher(
    pageId: string,
    handler: string,
    componentId?: string,
    component?: glassEasel.GeneralComponent,
  ): (event: glassEasel.ShadowedEvent<unknown>) => void {
    return (event) => {
      this.onMiniProgramEvent?.(pageId, {
        ...this.serializeEvent(handler, event),
        ...(componentId ? { componentId } : {}),
        ...(component ? { componentData: toJsonSafe(component.data) as Record<string, unknown> } : {}),
      })
    }
  }

  private emitComponentLifecycle(
    schema: MiniProgramComponentSchema,
    phase: ComponentLifecyclePhase,
    component: glassEasel.GeneralComponent,
  ): void {
    const data = (toJsonSafe(component.data ?? {}) ?? {}) as Record<string, unknown>
    this.onComponentLifecycle?.(
      schema.componentId,
      schema.path,
      phase,
      data,
    )
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
