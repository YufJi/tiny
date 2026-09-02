import * as glassEasel from 'glass-easel'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import type { StyleLoader, TemplateRegistry } from './types'
import { toJsonSafe, type SerializedEventNode, type SerializedMiniProgramEvent } from './events'

export type GlassEaselAdapterOptions = {
  backend: glassEasel.GeneralBackendContext
  manifest: Manifest
  templates: TemplateRegistry
  onMiniProgramEvent?: (pageId: string, event: SerializedMiniProgramEvent) => void
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
  private activeEventPageId: string | null = null
  private readonly onMiniProgramEvent?: (pageId: string, event: SerializedMiniProgramEvent) => void

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.templates = options.templates
    this.onMiniProgramEvent = options.onMiniProgramEvent
    const styleScopeManager = new glassEasel.StyleScopeManager()
    this.componentSpace = new glassEasel.ComponentSpace(undefined, undefined, styleScopeManager, true)
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
    const definition = this.componentSpace
      .defineWithMethodCaller(page.path)
      .template({
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(page.path, name),
      })
      .data(() => data)
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
    return component
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }

  private createEventMethodCaller(pageId: string): unknown {
    const adapter = this
    return new Proxy({}, {
      has() {
        return true
      },
      get(_target, property) {
        if (typeof property !== 'string') return undefined
        return adapter.createEventDispatcher(pageId, property)
      },
      getOwnPropertyDescriptor(_target, property) {
        if (typeof property !== 'string') return undefined
        return {
          configurable: true,
          enumerable: true,
          value: adapter.createEventDispatcher(pageId, property),
        }
      },
    })
  }

  private createEventDispatcher(
    pageId: string,
    handler: string,
  ): (event: glassEasel.ShadowedEvent<unknown>) => void {
    return (event) => {
      this.onMiniProgramEvent?.(pageId, this.serializeEvent(handler, event))
    }
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
      id: element.id,
      tag: element.is,
      dataset: toJsonSafe(element.dataset) as Record<string, unknown>,
      class: element.class,
      style: element.style,
    }
  }
}
