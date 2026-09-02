import * as glassEasel from 'glass-easel'
import type { Manifest, PageArtifact } from '@tiny/compiler-next'
import type { StyleLoader, TemplateRegistry } from './types'

export type GlassEaselAdapterOptions = {
  backend: glassEasel.GeneralBackendContext
  manifest: Manifest
  templates: TemplateRegistry
}

export class GlassEaselRuntimeAdapter {
  readonly backend: glassEasel.GeneralBackendContext
  readonly componentSpace: glassEasel.ComponentSpace
  private readonly templates: TemplateRegistry
  private readonly styleScopeIds = new Map<string, number>()
  private readonly componentDefinitions = new Map<string, glassEasel.GeneralComponentDefinition>()
  private readonly pages = new Map<string, PageArtifact>()
  private readonly mountedComponents = new Map<string, glassEasel.GeneralComponent>()

  constructor(options: GlassEaselAdapterOptions) {
    this.backend = options.backend
    this.templates = options.templates
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
    const definition = this.componentSpace.defineComponent({
      is: page.path,
      template: {
        groupList: this.templates.groupList,
        content: (name = '') => this.templates.content(page.path, name),
      },
      data,
      options: {
        multipleSlots: true,
        writeIdToDOM: true,
        styleScope: style?.scope ? this.styleScopeIds.get(style.path) : undefined,
      },
    })
    this.componentDefinitions.set(page.path, definition)
    return definition
  }

  registerPageArtifact(page: PageArtifact): void {
    this.pages.set(page.path, page)
  }

  mountPage(path: string, data: Record<string, unknown> = {}): glassEasel.GeneralComponent {
    const page = this.pages.get(path)
    if (!page) throw new Error(`page is not registered: ${path}`)
    const component = glassEasel.Component.createWithContext('tiny-root', this.registerPage(page, data), this.backend)
    this.mountedComponents.set(path, component)
    return component
  }

  getMountedComponent(path: string): glassEasel.GeneralComponent | undefined {
    return this.mountedComponents.get(path)
  }
}
