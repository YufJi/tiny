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
import {
  buildComponentFlow,
  collectComponentIdentities,
  collectComponentOwners,
} from '../../tree-protocol/flow'
import {
  TREE_PROTOCOL,
  type ComponentDefinitionPayload,
  type ComponentFlowDelta,
  type PageFrameMount,
  type RenderComponentIdentity,
  type RenderNode,
  type TreePatchPayload,
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
  /**
   * Definition paths already installed in each page's render thread. The
   * render side merges definitions by path, so an update only needs the paths
   * it has never seen (lazy package registration, first use of a component).
   */
  private readonly sentDefinitions = new Map<string, Set<string>>()

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
    for (const schema of added) {
      for (const sent of this.sentDefinitions.values()) sent.delete(schema.path)
    }
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
    options: { includeTree?: boolean } = {},
  ): Record<string, unknown> | null {
    const logicTree = this.getLogicTree()
    if (!logicTree) return null
    const root = logicTree.snapshotRenderTree(pageId)
    if (!root) return null
    const includeTree = options.includeTree !== false
    const tabRoot = logicTree.snapshotTabBarTree(pageId)
    const tabFrame = tabRoot ? this.tabBarFrame(pageId, tabRoot) : undefined
    const pagePath = logicTree.pagePathFor(pageId)
    const messages = cloneJsonSafe(this.treeFlow(root, pageId, includeTree))
    this.markDefinitionsSent(pageId)
    const componentOwners = includeTree
      ? undefined
      : [...collectComponentOwners(root)].map(([id, instances]) => ({ id, instances }))
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
      messages,
      componentFlow: cloneJsonSafe(collectComponentIdentities(root)),
      ...(componentOwners ? { componentOwners: cloneJsonSafe(componentOwners) } : {}),
      ...(tabFrame ? { tabFrame: cloneJsonSafe(tabFrame) } : {}),
      ...(wxsModules ? { wxsModules: cloneJsonSafe(wxsModules) } : {}),
      ...(pageData ? { pageData: cloneJsonSafe(pageData) } : {}),
      componentData: cloneJsonSafe(logicTree.snapshotComponentData(pageId)),
      ...this.styles(pageId),
      ...(ack ? { ack } : {}),
    }
  }

  /**
   * Build one data-only update batch.
   *
   * `delta` is the component-identity change for this batch; the element tree
   * is never part of the payload. `hints`/`componentFlow` exist only for the
   * `renderHints: 'always'` compatibility mode used by the byte benchmark and
   * as a rollback switch.
   */
  buildPatch(
    pageId: string,
    options: {
      delta?: ComponentFlowDelta
      hints?: RenderNode
      componentData?: Record<string, Record<string, unknown>>
      tabFrame?: PageFrameMount
      pageData?: Record<string, unknown>
      pageDataPatches?: Array<Record<string, unknown>>
      ack?: string[]
    },
  ): TreePatchPayload {
    const delta = this.withNewDefinitions(pageId, options.delta)
    const componentData = options.componentData ?? {}
    const pageDataPatches = options.pageDataPatches
    const pageData = options.pageData
    const hints = options.hints
    return {
      pageId,
      ...(hints
        ? {
          renderHints: cloneJsonSafe(hints),
          componentFlow: cloneJsonSafe(collectComponentIdentities(hints)),
        }
        : {}),
      ...(delta ? { componentFlowDelta: cloneJsonSafe(delta) } : {}),
      ...(!pageDataPatches?.length && pageData
        ? { pageData: cloneJsonSafe(pageData) }
        : {}),
      ...(Object.keys(componentData).length > 0
        ? { componentData: cloneJsonSafe(componentData) }
        : {}),
      ...(pageDataPatches?.length
        ? { pageDataPatches: cloneJsonSafe(pageDataPatches) }
        : {}),
      ...(options.tabFrame ? { tabFrame: cloneJsonSafe(options.tabFrame) } : {}),
      ...(options.ack ? { ack: options.ack } : {}),
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

  private treeFlow(
    root: RenderNode,
    pageId?: string,
    includeTree = true,
  ): ReturnType<typeof buildComponentFlow> {
    return buildComponentFlow(root, this.renderDefinitions(pageId), { includeTree })
  }

  /** The mount flow carries every page-visible definition. */
  private markDefinitionsSent(pageId: string): void {
    this.sentDefinitions.set(pageId, new Set(this.renderDefinitions(pageId).keys()))
  }

  /**
   * Attach definitions the render thread has not installed yet.
   *
   * A newly created component can belong to a definition the pageframe never
   * received: a lazily loaded package, or a component whose first instance is
   * created by a later `setData`. The render side merges by path, so each path
   * crosses at most once per page.
   */
  private withNewDefinitions(
    pageId: string,
    delta: ComponentFlowDelta | undefined,
  ): ComponentFlowDelta | undefined {
    if (!delta?.owners?.length) return delta
    const paths: string[] = []
    for (const owner of delta.owners) {
      for (const instance of owner.add ?? []) paths.push(instance.path)
    }
    if (paths.length === 0) return delta
    const definitions = this.renderDefinitions(pageId)
    let sent = this.sentDefinitions.get(pageId)
    if (!sent) {
      sent = new Set()
      this.sentDefinitions.set(pageId, sent)
    }
    const define: ComponentDefinitionPayload[] = []
    for (const path of new Set(paths)) {
      const definition = definitions.get(path)
      if (!definition || sent.has(path)) continue
      sent.add(path)
      define.push(definition)
    }
    return define.length > 0 ? { ...delta, define } : delta
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
