import type { Manifest } from '@tiny/manifest'
import type { WxsModuleTable } from '@tiny/wxs-runtime'
import type { NormalizedComponentDefinition } from '../../component/definition/types'
import type { MiniProgramComponentSchema } from '../../component/schema'
import {
  mapCssAssetUrls,
  type AssetUrlResolver,
  type ProtocolRelativeUrlResolver,
} from '../../shared/assets'
import { cloneJsonSafe } from '../../shared/data'
import type { StyleLoader } from '../../shared/template'
import { buildComponentFlow, collectComponentIdentities } from '../../tree-protocol/flow'
import {
  TREE_PROTOCOL,
  type ComponentDefinitionPayload,
  type PageFrameMount,
  type RenderNode,
} from '../../tree-protocol/protocol'
import type { LogicTreeAdapter } from '../logic-tree/adapter'
import { buildComponentSchemas } from './component-schema'
import { buildComponentDefinitions } from './definition-payload'

export type ServicePageComponent = {
  path: string
  options: NonNullable<MiniProgramComponentSchema['options']>
}

export type RenderProjectionOptions = {
  manifest: Manifest
  componentDefinitions: ReadonlyMap<string, NormalizedComponentDefinition>
  pageOptions: ReadonlyMap<string, {
    methods?: Record<string, (...args: unknown[]) => unknown>
  }>
  isComponentPage?: (path: string) => boolean
  behaviorScheme: string
  loadStyle?: StyleLoader
  resolveAssetUrl?: AssetUrlResolver
  resolveProtocolRelativeUrl?: ProtocolRelativeUrlResolver
}

const PAGE_LIFECYCLE_METHODS = new Set([
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

export class RenderProjection {
  private componentSchemas: MiniProgramComponentSchema[] = []
  /** Compiler-resolved `component path -> built-in placeholder tag`. */
  private readonly placeholders: Record<string, string> = {}
  private readonly hasPlaceholders: boolean
  private definitionPayloads: Map<string, ComponentDefinitionPayload> | null = null
  private readonly pageDefinitionPayloads = new Map<
    string,
    Map<string, ComponentDefinitionPayload>
  >()

  constructor(
    private readonly options: RenderProjectionOptions,
    private readonly getLogicTree: () => LogicTreeAdapter | null,
  ) {
    for (const artifact of [...options.manifest.pages, ...options.manifest.components]) {
      const declared = artifact.configuration?.placeholders
      if (!declared) continue
      Object.assign(this.placeholders, declared)
    }
    this.hasPlaceholders = Object.keys(this.placeholders).length > 0
  }

  initialize(): MiniProgramComponentSchema[] {
    this.definitionPayloads = null
    this.componentSchemas = buildComponentSchemas(
      this.options.manifest.components,
      this.options.componentDefinitions,
    ).filter((schema) => this.options.componentDefinitions.has(schema.path))
    return this.componentSchemas
  }

  refresh(): MiniProgramComponentSchema[] {
    const logicTree = this.getLogicTree()
    if (!logicTree) return []
    const schemas = buildComponentSchemas(
      this.options.manifest.components,
      this.options.componentDefinitions,
    )
    const known = new Set(this.componentSchemas.map((schema) => schema.path))
    const added = schemas.filter((schema) => (
      !known.has(schema.path) && this.options.componentDefinitions.has(schema.path)
    ))
    if (added.length === 0) return []
    this.componentSchemas.push(...added)
    logicTree.registerComponentSchemas(added)
    this.definitionPayloads = null
    this.pageDefinitionPayloads.clear()
    return added
  }

  pageComponents(): ServicePageComponent[] {
    const result: ServicePageComponent[] = []
    for (const page of this.options.manifest.pages) {
      if (!this.options.isComponentPage?.(page.path)) continue
      if (!this.options.componentDefinitions.has(page.path)) continue
      const [schema] = buildComponentSchemas([page], this.options.componentDefinitions)
      if (schema) result.push({ path: page.path, options: schema.options ?? {} })
    }
    return result
  }

  buildFlow(
    pageId: string,
    ack: string[] | undefined,
    wxsModules: WxsModuleTable | undefined,
    pageData: Record<string, unknown> | undefined,
  ): Record<string, unknown> | null {
    const logicTree = this.getLogicTree()
    if (!logicTree) return null
    const root = logicTree.snapshotRenderTree(pageId)
    if (!root) return null
    const tabRoot = logicTree.snapshotTabBarTree(pageId)
    const tabFrame = tabRoot ? this.tabBarFrame(pageId, tabRoot) : undefined
    const pagePath = logicTree.pagePathFor(pageId)
    return {
      pageId,
      pagePath,
      pageFrame: {
        methods: this.pageMethodNames(pagePath),
        ...(root.id ? { rootViewId: root.id } : {}),
      },
      ...(logicTree.pageScopeName(pageId)
        ? { pageScope: logicTree.pageScopeName(pageId) }
        : {}),
      ...(Object.keys(logicTree.pageUsingComponents(pageId)).length > 0
        ? { pageUsing: logicTree.pageUsingComponents(pageId) }
        : {}),
      behaviorScheme: this.options.behaviorScheme,
      ...(this.hasPlaceholders
        ? { placeholders: cloneJsonSafe(this.placeholders) }
        : {}),
      messages: cloneJsonSafe(this.treeFlow(root, pageId)),
      componentFlow: cloneJsonSafe(collectComponentIdentities(root)),
      ...(tabFrame ? { tabFrame: cloneJsonSafe(tabFrame) } : {}),
      ...(wxsModules ? { wxsModules: cloneJsonSafe(wxsModules) } : {}),
      ...(pageData ? { pageData: cloneJsonSafe(pageData) } : {}),
      componentData: cloneJsonSafe(logicTree.snapshotComponentData(pageId)),
      ...this.styles(pageId),
      ...(ack ? { ack } : {}),
    }
  }

  buildPatch(
    pageId: string,
    snapshot: RenderNode,
    structural: boolean,
    componentData: Record<string, Record<string, unknown>>,
    tabFrame: PageFrameMount | undefined,
    pageData: Record<string, unknown> | undefined,
    pageDataPatches: Array<Record<string, unknown>> | undefined,
    ack: string[] | undefined,
  ): Record<string, unknown> {
    return {
      pageId,
      ...(structural
        ? {
          renderHints: cloneJsonSafe(snapshot),
          componentFlow: cloneJsonSafe(collectComponentIdentities(snapshot)),
        }
        : {}),
      ...(!pageDataPatches?.length && pageData
        ? { pageData: cloneJsonSafe(pageData) }
        : {}),
      ...(Object.keys(componentData).length > 0
        ? { componentData: cloneJsonSafe(componentData) }
        : {}),
      ...(pageDataPatches?.length
        ? { pageDataPatches: cloneJsonSafe(pageDataPatches) }
        : {}),
      ...(tabFrame ? { tabFrame: cloneJsonSafe(tabFrame) } : {}),
      ...(ack ? { ack } : {}),
    }
  }

  tabBarFrame(pageId: string, root: RenderNode): PageFrameMount | null {
    const logicTree = this.getLogicTree()
    if (!logicTree) return null
    const pagePath = logicTree.tabBarPagePath(pageId)
    if (!pagePath) return null
    const componentData = logicTree.snapshotComponentData(pageId)
    const definition = this.renderDefinitions(pageId).get(pagePath)
    const methods = new Set(definition?.methods ?? [])
    const component = this.options.componentDefinitions.get(pagePath)
    for (const name of component?.methods.keys() ?? []) methods.add(name)
    const scope = definition?.styleScope ?? logicTree.pageScopeName(pageId)
    return {
      pageId,
      ...(root.id ? { rootViewId: root.id } : {}),
      pagePath,
      data: root.id ? componentData[root.id] ?? {} : {},
      ...(definition?.using ? { using: definition.using } : {}),
      ...(scope ? { scope } : {}),
      ...(this.hasPlaceholders
        ? { placeholders: cloneJsonSafe(this.placeholders) }
        : {}),
      ...(methods.size > 0 ? { methods: [...methods] } : {}),
      renderHints: root,
      componentFlow: collectComponentIdentities(root)
        .filter((identity) => identity.id !== root.id),
    }
  }

  styles(pageId: string): { styles: string[]; fallbackAppStyles?: string[] } {
    const logicTree = this.getLogicTree()
    const styles = logicTree?.styleTexts(pageId) ?? []
    // Independent packages do not inherit the main package `app.wxss`.
    if (this.isIndependentPage(pageId)) return { styles }
    if (logicTree?.hasAppPageScope(pageId)) return { styles }
    const appStyle = this.options.manifest.app?.style
    const appStylePath = appStyle?.outputPath
    const appCssRaw = appStylePath ? this.options.loadStyle?.(appStylePath) : undefined
    const appCss = appCssRaw
      && (this.options.resolveAssetUrl || this.options.resolveProtocolRelativeUrl)
      ? mapCssAssetUrls(
          appCssRaw,
          this.options.resolveAssetUrl ?? (() => undefined),
          this.options.resolveProtocolRelativeUrl,
        )
      : appCssRaw
    return {
      styles,
      ...(appCss && appCss.trim().length > 0 ? { fallbackAppStyles: [appCss] } : {}),
    }
  }

  private renderDefinitions(pageId?: string): Map<string, ComponentDefinitionPayload> {
    this.definitionPayloads ??= buildComponentDefinitions(
      this.componentSchemas,
      this.options.componentDefinitions,
      this.options.manifest.styles,
    )
    if (!pageId) return this.definitionPayloads
    let pageDefinitions = this.pageDefinitionPayloads.get(pageId)
    if (!pageDefinitions) {
      const visible = new Set(
        this.getLogicTree()?.componentPathsForPage(pageId) ?? [],
      )
      pageDefinitions = new Map(
        [...this.definitionPayloads].filter(([path]) => visible.has(path)),
      )
      this.pageDefinitionPayloads.set(pageId, pageDefinitions)
    }
    return pageDefinitions
  }

  private treeFlow(root: RenderNode, pageId?: string): ReturnType<typeof buildComponentFlow> {
    return buildComponentFlow(root, this.renderDefinitions(pageId))
  }

  private pageMethodNames(pagePath: string): string[] {
    const names = new Set<string>()
    const options = this.options.pageOptions.get(pagePath) as Record<string, unknown> | undefined
    const explicit = options?.methods as Record<string, unknown> | undefined
    if (explicit && typeof explicit === 'object') {
      for (const [name, value] of Object.entries(explicit)) {
        if (typeof value === 'function') names.add(name)
      }
    }
    if (options) {
      for (const [name, value] of Object.entries(options)) {
        if (name === 'data' || name === 'methods' || name === 'options' || name === 'behaviors') {
          continue
        }
        if (PAGE_LIFECYCLE_METHODS.has(name)) continue
        if (typeof value === 'function') names.add(name)
      }
    }
    const component = this.options.componentDefinitions.get(pagePath)
    if (component) {
      for (const name of component.methods.keys()) names.add(name)
    }
    return [...names]
  }

  private isIndependentPage(pageId: string): boolean {
    const path = this.getLogicTree()?.pagePathFor(pageId)
    if (!path) return false
    const page = this.options.manifest.pages.find((item) => item.path === path)
    if (!page?.subpackage) return false
    return (this.options.manifest.subPackages ?? []).some(
      (pkg) => pkg.root === page.subpackage && pkg.independent === true,
    )
  }
}
