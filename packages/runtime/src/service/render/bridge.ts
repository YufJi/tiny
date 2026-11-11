import type { BridgeConnection } from '@tiny/bridge'
import { DIAGNOSTIC_CODES, TINY_ENGINE_NAMING } from '@tiny/manifest'
import type { Manifest } from '@tiny/manifest'
import type { WxsModuleTable, WxsRuntime } from '@tiny/wxs-runtime'
import type { NormalizedComponentDefinition } from '../../component'
import { buildComponentSchemas } from './component-schema'
import type {
  MiniProgramComponentSchema,
  StyleLoader,
  TemplateRegistry,
} from '../../types'
import { cloneJsonSafe } from '../../data'
import { mapCssAssetUrls, type AssetUrlResolver } from '../../assets'
import { LogicTreeAdapter, type LogicFrameworkContext } from '../../tree/logic'
import { buildComponentFlow, collectComponentIdentities } from '../../tree/flow'
import {
  TREE_PROTOCOL,
  wxsBindingKey,
  type ComponentDefinitionPayload,
  type RenderNode,
} from '../../tree/protocol'
import {
  dispatchWxsEffect,
  installWxsEventHost,
  replayWxsHandler,
  type WxsEventHostOptions,
} from './wxs-host'
import { buildComponentDefinitions } from './definition-payload'
import { WxsBindingStore } from './wxs-bindings'
import { attachRenderInbound, type RenderWxsEffect } from './inbound'
import { createRenderRpc } from './rpc'
import type { ServiceRenderPage, ServiceRenderPort } from './port'

export type { ServiceRenderPage, ServiceRenderPort } from './port'

/** Page-scoped framework hooks forwarded to the logic tree. */
export type ServiceLogicFrameworkContext = LogicFrameworkContext

export type ServicePageComponent = {
  path: string
  options: NonNullable<MiniProgramComponentSchema['options']>
}

export type ServiceRenderBridgeOptions = {
  connection: BridgeConnection
  manifest: Manifest
  /** Normalized service definitions, keyed by artifact path. */
  componentDefinitions: ReadonlyMap<string, NormalizedComponentDefinition>
  /** Page options used by the logic tree for legacy page methods. */
  pageOptions: ReadonlyMap<string, { methods?: Record<string, (...args: unknown[]) => unknown> }>
  /** Runtime page kind, derived from the actual `Page()` / `Component()` registration. */
  isComponentPage?: (path: string) => boolean
  /** Compatibility behavior scheme carried by every initial flow. */
  behaviorScheme: string
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  loadStyle?: StyleLoader
  /** Host hook used for stylesheet `url(...)` assets; kept service-side so the render document base is irrelevant. */
  resolveAssetUrl?: AssetUrlResolver
  getPage: (pageId: string) => ServiceRenderPage | undefined
  /** `this.router` / `this.pageRouter` / opener-channel hooks for the logic tree. */
  frameworkContext?: ServiceLogicFrameworkContext
  onLogicTreeCreated?: (tree: unknown) => void
  /** Report an error raised by page/component logic (the app `onError` hook). */
  onError: (message: string) => void
  /** Page-scoped WXS runtime shared with generated service templates. */
  wxsRuntime?: WxsRuntime
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

/**
 * Service-render bridge, the façade of the `service/render` layer.
 *
 * The layer is the only service code allowed to know the logic tree and the
 * tree protocol. This class owns:
 *
 * 1. the service-side glass-easel logic tree and its component definition table;
 * 2. outbound projection: initial `tree.flow`, incremental `tree.patch`,
 *    component ids and WXS bindings;
 * 3. WXS host installation and the dispatcher used by inbound effects.
 *
 * Render-thread event parsing lives in `inbound.ts`; geometry, selector query,
 * intersection and animation RPCs live in `rpc.ts`. The page stack and API
 * modules must not import `tree/*`; they talk to this bridge through
 * {@link ServiceRenderPort}.
 */
export class ServiceRenderBridge implements ServiceRenderPort {
  private readonly options: ServiceRenderBridgeOptions
  private readonly connection: BridgeConnection
  private readonly bindings = new WxsBindingStore()
  private readonly mountedPages = new Set<string>()
  private readonly pendingPages = new Set<string>()
  private readonly pendingPageDataPatches = new Map<string, Array<Record<string, unknown>>>()
  private logicTree: LogicTreeAdapter | null = null
  private componentSchemas: MiniProgramComponentSchema[] = []
  /** Compiler-resolved `component path -> built-in placeholder tag`. */
  private readonly placeholders: Record<string, string> = {}
  private readonly hasPlaceholders: boolean
  private definitionPayloads: Map<string, ComponentDefinitionPayload> | null = null
  private readonly pageDefinitionPayloads = new Map<string, Map<string, ComponentDefinitionPayload>>()
  private wxsModules?: WxsModuleTable
  private wxsHostOptions?: WxsEventHostOptions
  private updateScheduled = false
  /**
   * `setData` completions waiting for the render thread.
   *
   * The first queue holds callbacks that have not been assigned to a batch yet;
   * the second holds the callbacks of batches already sent, keyed by the opaque
   * token the render thread echoes back on `tree.ack`. Completion order is the
   * call order within one batch and the ack order across batches.
   */
  private readonly pendingCompletions = new Map<string, Array<() => void>>()
  private readonly ackedBatches = new Map<string, { pageId: string; callbacks: Array<() => void> }>()
  private readonly pendingTabBarReady = new Map<string, Array<(tabBar: unknown) => void>>()
  private completionCounter = 0

  constructor(options: ServiceRenderBridgeOptions) {
    this.options = options
    this.connection = options.connection
    for (const artifact of [...options.manifest.pages, ...options.manifest.components]) {
      const declared = artifact.configuration?.placeholders
      if (!declared) continue
      Object.assign(this.placeholders, declared)
    }
    this.hasPlaceholders = Object.keys(this.placeholders).length > 0
    attachRenderInbound(this.connection, {
      getLogicTree: () => this.logicTree,
      isMounted: (pageId) => this.mountedPages.has(pageId),
      sendSnapshot: (pageId) => this.sendTreeSnapshot(pageId),
      reportError: (message) => this.options.onError(message),
      dispatchWxsEffect: (pageId, effect) => this.dispatchWxsEffect(pageId, effect),
      replayWxsHandler: (pageId, origin, event) => {
        if (this.logicTree && this.wxsHostOptions) {
          replayWxsHandler(this.logicTree, pageId, origin, event, this.wxsHostOptions)
        }
      },
      acknowledgeRenders: (tokens) => this.acknowledgeRenders(tokens),
    })
  }

  /**
   * Build the definition table and logic tree after artifacts and host state
   * are available. Returns the component schemas the bootstrap reply carries.
   */
  async start(): Promise<MiniProgramComponentSchema[]> {
    this.definitionPayloads = null
    this.componentSchemas = buildComponentSchemas(
      this.options.manifest.components,
      this.options.componentDefinitions,
    ).filter((schema) => this.options.componentDefinitions.has(schema.path))
    const templates = await this.options.loadTemplates()
    this.wxsModules = templates.wxsModules
    this.logicTree = new LogicTreeAdapter({
      manifest: this.options.manifest,
      templates,
      ...(this.options.loadStyle ? { loadStyle: this.options.loadStyle } : {}),
      ...(this.options.resolveAssetUrl ? { resolveAssetUrl: this.options.resolveAssetUrl } : {}),
      ...(this.options.isComponentPage ? { isComponentPage: this.options.isComponentPage } : {}),
      pageOptions: this.options.pageOptions,
      componentDefinitions: this.options.componentDefinitions,
      ...(this.options.frameworkContext
        ? { frameworkContext: this.options.frameworkContext }
        : {}),
      onDataChange: (pageId) => this.scheduleTreeUpdate(pageId),
      onCustomEvent: (pageId, componentId, name, detail, eventOptions) => {
        // JS listeners already ran in the logic tree. Only forward events that
        // actually have a WXS binding on this page: forwarding every
        // `triggerEvent` would replay unrelated custom events in the render
        // tree (and cost a bridge message per event).
        if (!this.bindings.hasEvent(pageId, name)) return
        this.connection.sendEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.customEvent, {
          pageId,
          componentId,
          name,
          detail: cloneJsonSafe(detail),
          ...(eventOptions ? { options: cloneJsonSafe(eventOptions) } : {}),
        }, { pageId })
      },
      dispatchPageMethod: (pageId, handler, event) => {
        const page = this.options.getPage(pageId)
        if (!page?.hasMethod(handler)) return false
        page.invokeMethod(handler, [event])
        return true
      },
      onDiagnostic: (diagnostic) => this.connection.sendDiagnostic('warn', diagnostic),
      onError: (pageId, message, details) => {
        this.options.onError(message)
        this.connection.sendDiagnostic('error', {
          code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
          message,
          details,
        }, pageId)
      },
      afterRender: (pageId, callback) => this.completeAfterRender(pageId, callback),
      ...(this.options.wxsRuntime ? { wxsRuntime: this.options.wxsRuntime } : {}),
      ...createRenderRpc(this.connection),
    })
    this.logicTree.registerComponentSchemas(this.componentSchemas)
    this.installWxsHost()
    this.options.onLogicTreeCreated?.(this.logicTree)
    return this.componentSchemas
  }

  /**
   * Rebuild the render-facing schema/definition table after a lazy package
   * registered new components. Returns the newly added schemas.
   */
  refreshComponentDefinitions(): MiniProgramComponentSchema[] {
    if (!this.logicTree) return []
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
    this.logicTree.registerComponentSchemas(added)
    this.definitionPayloads = null
    this.pageDefinitionPayloads.clear()
    return added
  }

  /** Serializable schemas for component-as-page artifacts, for bootstrap. */
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

  mountPage(page: ServiceRenderPage): void {
    if (!this.logicTree || this.mountedPages.has(page.pageId)) return
    this.logicTree.mountPage(page.path, page.data, page.pageId)
    this.mountedPages.add(page.pageId)
    this.sendTreeSnapshot(page.pageId)
    // The first snapshot carries the full map; later updates only send changes.
    this.logicTree.seedComponentData(page.pageId)
    this.flushTabBarReady(page.pageId)
  }

  unmountPage(pageId: string): void {
    this.mountedPages.delete(pageId)
    this.pendingPages.delete(pageId)
    this.pendingPageDataPatches.delete(pageId)
    this.bindings.clear(pageId)
    this.pendingTabBarReady.delete(pageId)
    // The view is going away, so a completion it was waiting for can never be
    // "after render" any more. Drop the callbacks instead of running them
    // against a destroyed page.
    this.pendingCompletions.delete(pageId)
    for (const [token, batch] of this.ackedBatches) {
      if (batch.pageId === pageId) this.ackedBatches.delete(token)
    }
    this.logicTree?.unmountPage(pageId)
  }

  /**
   * Run a `setData` completion once the render thread applied the update that
   * carries the data. The token rides on the next `tree.patch`/`tree.flow` for
   * the page; a batch that produces no bridge message (nothing observable
   * changed) completes right after the service-side flush.
   */
  completeAfterRender(pageId: string, callback: () => void): void {
    if (typeof callback !== 'function') return
    if (!this.logicTree) {
      // No render tree exists (standalone kernel harness): keep the callback
      // asynchronous, like WeChat, instead of falling back to sync delivery.
      queueMicrotask(() => this.runCompletion(pageId, callback))
      return
    }
    const queue = this.pendingCompletions.get(pageId)
    if (queue) queue.push(callback)
    else this.pendingCompletions.set(pageId, [callback])
    this.scheduleTreeUpdate(pageId)
  }

  /**
   * `this.getTabBar(callback)` compatibility: the custom tab bar is a service
   * component, so it can be resolved before its render view exists. If the
   * page has not created it yet, wait for the next service-side mount/update.
   */
  onTabBarReady(pageId: string, callback: (tabBar: unknown) => void): void {
    if (typeof callback !== 'function') return
    const tabBar = this.logicTree?.selectComponents(pageId, 'custom-tab-bar', false)[0]
    if (tabBar) {
      callback(tabBar)
      return
    }
    if (!this.mountedPages.has(pageId)) return
    const queue = this.pendingTabBarReady.get(pageId)
    if (queue) queue.push(callback)
    else this.pendingTabBarReady.set(pageId, [callback])
  }

  syncPageData(pageId: string, patch: Record<string, unknown>): void {
    if (!this.logicTree || !this.mountedPages.has(pageId)) return
    try {
      const cloned = cloneJsonSafe(patch)
      const pending = this.pendingPageDataPatches.get(pageId)
      if (pending) pending.push(cloned)
      else this.pendingPageDataPatches.set(pageId, [cloned])
      this.logicTree.applyPageData(pageId, patch)
      this.scheduleTreeUpdate(pageId)
    } catch (error) {
      const pending = this.pendingPageDataPatches.get(pageId)
      pending?.pop()
      if (pending?.length === 0) this.pendingPageDataPatches.delete(pageId)
      this.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
        message: error instanceof Error ? error.message : String(error),
      }, pageId)
    }
  }

  triggerPageLifetime(
    pageId: string,
    phase: 'show' | 'hide' | 'resize',
    event?: unknown,
  ): void {
    this.logicTree?.triggerPageLifetime(pageId, phase, event)
  }

  selectComponents(pageId: string, selector: string, all: boolean): unknown[] {
    return this.logicTree?.selectComponents(pageId, selector, all) ?? []
  }

  relationNodes(pageId: string, relationKey: string): unknown[] {
    return this.logicTree?.relationNodes(pageId, relationKey) ?? []
  }

  pageSelectorQuery(pageId: string): Record<string, unknown> {
    return this.logicTree?.pageSelectorQuery(pageId) ?? {}
  }

  pageIntersectionObserver(
    pageId: string,
    options: Record<string, unknown> = {},
  ): Record<string, unknown> {
    return this.logicTree?.pageIntersectionObserver(pageId, options) ?? {}
  }

  pageAnimate(
    pageId: string,
    selector: string,
    keyframes: unknown,
    duration: unknown,
    options?: unknown,
  ): boolean {
    return this.logicTree?.pageAnimate(pageId, selector, keyframes, duration, options) ?? false
  }

  pageClearAnimate(
    pageId: string,
    selector: string,
    options?: unknown,
    callback?: unknown,
  ): boolean {
    return this.logicTree?.pageClearAnimate(pageId, selector, options, callback) ?? false
  }

  private dispatchWxsEffect(pageId: string, effect: RenderWxsEffect): void {
    if (!this.logicTree || !this.wxsHostOptions) return
    dispatchWxsEffect(this.logicTree, pageId, effect, this.wxsHostOptions)
  }

  private installWxsHost(): void {
    this.wxsHostOptions = {
      getLogicTree: () => this.logicTree ?? undefined,
      getPage: (pageId) => this.options.getPage(pageId),
      requestRenderUpdate: (pageId) => this.scheduleTreeUpdate(pageId),
      ...(this.options.wxsRuntime ? { wxsRuntime: this.options.wxsRuntime } : {}),
      onBinding: (pageId, binding) => {
        // Registered with the logic view id; the flush below swaps in the
        // node's current render identity (locator for elements).
        this.bindings.register(pageId, wxsBindingKey(binding.viewId, binding.event), binding)
        this.flushWxsBindings(pageId)
      },
      onDiagnostic: (pageId, code, message, details) => {
        this.connection.sendDiagnostic('warn', { code, message, details }, pageId)
      },
    }
    // WXS event handlers resolve their `ins` descriptor through this global
    // hook. Install before the first page mounts so the first event already
    // has one; a new service thread simply replaces the previous hook.
    installWxsEventHost(this.wxsHostOptions)
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
      const visible = new Set(this.logicTree?.componentPathsForPage(pageId) ?? [])
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

  private sendTreeSnapshot(pageId: string): void {
    if (!this.logicTree) return
    const root = this.logicTree.snapshotRenderTree(pageId)
    if (!root) return
    const tabRoot = this.logicTree.snapshotTabBarTree(pageId)
    const page = this.options.getPage(pageId)
    const pagePath = this.logicTree.pagePathFor(pageId)
    const ack = this.takeCompletionBatch(pageId)
    this.connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.flow,
      {
        pageId,
        pagePath,
        pageFrame: {
          methods: this.pageMethodNames(pagePath),
          ...(root.id ? { rootViewId: root.id } : {}),
        },
        ...(this.logicTree.pageScopeName(pageId)
          ? { pageScope: this.logicTree.pageScopeName(pageId) }
          : {}),
        ...(Object.keys(this.logicTree.pageUsingComponents(pageId)).length > 0
          ? { pageUsing: this.logicTree.pageUsingComponents(pageId) }
          : {}),
        behaviorScheme: this.options.behaviorScheme,
        ...(this.hasPlaceholders
          ? { placeholders: cloneJsonSafe(this.placeholders) }
          : {}),
        messages: cloneJsonSafe(this.treeFlow(root, pageId)),
        componentFlow: cloneJsonSafe(collectComponentIdentities(root)),
        ...(tabRoot ? { tabRoot: cloneJsonSafe(tabRoot) } : {}),
        ...(this.wxsModules ? { wxsModules: cloneJsonSafe(this.wxsModules) } : {}),
        ...(page?.data ? { pageData: cloneJsonSafe(page.data) } : {}),
        componentData: cloneJsonSafe(this.logicTree.snapshotComponentData(pageId)),
        ...this.treeStyles(pageId),
        ...(ack ? { ack } : {}),
      },
      { pageId },
    )
    this.pendingPageDataPatches.delete(pageId)
    this.flushWxsBindings(pageId)
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

  private scheduleTreeUpdate(pageId: string): void {
    if (!this.logicTree || !this.mountedPages.has(pageId)) return
    this.pendingPages.add(pageId)
    if (this.updateScheduled) return
    this.updateScheduled = true
    queueMicrotask(() => {
      this.updateScheduled = false
      const pages = [...this.pendingPages]
      this.pendingPages.clear()
      for (const id of pages) {
        if (!this.logicTree || !this.mountedPages.has(id)) continue
        try {
          const { patches, snapshot } = this.logicTree.updateRenderTree(id)
          const tabBar = this.logicTree.updateTabBarTree(id)
          // Component data is a per-instance patch; a data-only update must
          // still cross the bridge even when the structure did not change.
          const componentData = this.logicTree.updateComponentData(id)
          const hasComponentData = Object.keys(componentData).length > 0
          const pageDataPatches = this.pendingPageDataPatches.get(id)
          const hasPageDataPatches = Boolean(pageDataPatches && pageDataPatches.length > 0)
          if (
            patches.length > 0
            || hasComponentData
            || tabBar.patches.length > 0
            || hasPageDataPatches
          ) {
            const page = this.options.getPage(id)
            const ack = this.takeCompletionBatch(id)
            this.connection.sendEvent(
              TREE_PROTOCOL.domain, TREE_PROTOCOL.patch,
              {
                pageId: id,
                patches: cloneJsonSafe(patches),
                ...(patches.some((patch) => (
                  patch.type === 'insert'
                  || patch.type === 'remove'
                  || patch.type === 'replace'
                  || patch.type === 'reorder'
                  || patch.type === 'component-instances'
                ))
                  ? {
                    renderHints: cloneJsonSafe(snapshot),
                    componentFlow: cloneJsonSafe(collectComponentIdentities(snapshot)),
                  }
                  : {}),
                ...(page?.data ? { pageData: cloneJsonSafe(page.data) } : {}),
                ...(hasComponentData ? { componentData: cloneJsonSafe(componentData) } : {}),
                ...(hasPageDataPatches
                  ? { pageDataPatches: cloneJsonSafe(pageDataPatches!) }
                  : {}),
                ...(tabBar.patches.length > 0
                  ? { tabPatches: cloneJsonSafe(tabBar.patches) }
                  : {}),
                ...(ack ? { ack } : {}),
              },
              { pageId: id },
            )
            this.pendingPageDataPatches.delete(id)
          } else {
            // Nothing observable changed, so there is no batch to acknowledge.
            this.flushCompletions(id)
          }
          this.flushWxsBindings(id)
          this.flushTabBarReady(id)
        } catch (error) {
          this.connection.sendDiagnostic('warn', {
            code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
            message: error instanceof Error ? error.message : String(error),
          }, id)
          // The update failed before it crossed the bridge; still run the
          // completions once instead of leaving them pending forever.
          this.flushCompletions(id)
        }
      }
    })
  }

  /**
   * Move the page's unsent completions into an acknowledged batch.
   *
   * Batch tokens are opaque and page-scoped by construction: a token is only
   * consumed by the ack for the message that carried it.
   */
  private takeCompletionBatch(pageId: string): string[] | undefined {
    const callbacks = this.pendingCompletions.get(pageId)
    if (!callbacks || callbacks.length === 0) return undefined
    this.pendingCompletions.delete(pageId)
    this.completionCounter += 1
    const token = `${pageId}${TINY_ENGINE_NAMING.componentIdSeparator}ack-${this.completionCounter}`
    this.ackedBatches.set(token, { pageId, callbacks })
    return [token]
  }

  /** The render thread reflected one or more batches. */
  private acknowledgeRenders(tokens: string[]): void {
    for (const token of tokens) {
      const batch = this.ackedBatches.get(token)
      if (!batch) continue
      this.ackedBatches.delete(token)
      for (const callback of batch.callbacks) this.runCompletion(batch.pageId, callback)
    }
  }

  /** Run completions that have no render batch to wait for. */
  private flushCompletions(pageId: string): void {
    const callbacks = this.pendingCompletions.get(pageId)
    if (!callbacks || callbacks.length === 0) return
    this.pendingCompletions.delete(pageId)
    for (const callback of callbacks) this.runCompletion(pageId, callback)
  }

  private runCompletion(pageId: string, callback: () => void): void {
    try {
      callback()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.options.onError(message)
      this.connection.sendDiagnostic('error', {
        code: DIAGNOSTIC_CODES.SET_DATA_CALLBACK_ERROR,
        message,
        details: error instanceof Error && error.stack ? { stack: error.stack } : {},
      }, pageId || undefined)
    }
  }

  private flushWxsBindings(pageId: string): void {
    if (!this.logicTree) return
    this.bindings.flush(
      pageId,
      (logicViewId) => {
        const node = this.logicTree?.findNodeByViewId(logicViewId)
        return node ? this.logicTree?.renderIdentity(node) : undefined
      },
      (binding) => {
        this.connection.sendEvent(
          TREE_PROTOCOL.domain,
          TREE_PROTOCOL.wxsBinding,
          binding,
          { pageId },
        )
      },
    )
  }

  private flushTabBarReady(pageId: string): void {
    const callbacks = this.pendingTabBarReady.get(pageId)
    if (!callbacks || callbacks.length === 0) return
    const tabBar = this.logicTree?.selectComponents(pageId, 'custom-tab-bar', false)[0]
    if (!tabBar) return
    this.pendingTabBarReady.delete(pageId)
    for (const callback of callbacks) callback(tabBar)
  }

  private isIndependentPage(pageId: string): boolean {
    const path = this.logicTree?.pagePathFor(pageId)
    if (!path) return false
    const page = this.options.manifest.pages.find((item) => item.path === path)
    if (!page?.subpackage) return false
    return (this.options.manifest.subPackages ?? []).some(
      (pkg) => pkg.root === page.subpackage && pkg.independent === true,
    )
  }

  private treeStyles(pageId: string): { styles: string[]; fallbackAppStyles?: string[] } {
    const styles = this.logicTree?.styleTexts(pageId) ?? []
    // Independent packages do not inherit the main package `app.wxss`.
    if (this.isIndependentPage(pageId)) return { styles }
    if (this.logicTree?.hasAppPageScope(pageId)) return { styles }
    const appStyle = this.options.manifest.app?.style
    const appStylePath = appStyle?.outputPath
    const appCssRaw = appStylePath ? this.options.loadStyle?.(appStylePath) : undefined
    const appCss = appCssRaw && this.options.resolveAssetUrl
      ? mapCssAssetUrls(appCssRaw, this.options.resolveAssetUrl)
      : appCssRaw
    return {
      styles,
      ...(appCss && appCss.trim().length > 0 ? { fallbackAppStyles: [appCss] } : {}),
    }
  }
}
