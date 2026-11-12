import type { BridgeConnection } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { WxsModuleTable, WxsRuntime } from '@tiny/wxs-runtime'
import type { MiniProgramComponentSchema } from '../../component/schema'
import { cloneJsonSafe } from '../../shared/data'
import type { StyleLoader, TemplateRegistry } from '../../shared/template'
import {
  TREE_PROTOCOL,
  wxsBindingKey,
} from '../../tree-protocol/protocol'
import { LogicTreeAdapter } from '../logic-tree/adapter'
import type { LogicFrameworkContext } from '../logic-tree/glass/adapter'
import { attachRenderInbound, type RenderWxsEffect } from './inbound'
import type { ServiceRenderPage, ServiceRenderPort } from './port'
import {
  RenderProjection,
  type RenderProjectionOptions,
  type ServicePageComponent,
} from './projection'
import { createRenderRpc } from './rpc'
import { RenderUpdateScheduler } from './scheduler'
import { WxsBindingStore } from './wxs-bindings'
import {
  dispatchWxsEffect,
  installWxsEventHost,
  type WxsEventHostOptions,
} from './wxs-host'

export type { ServiceRenderPage, ServiceRenderPort } from './port'
export type { ServicePageComponent } from './projection'

/** Page-scoped framework hooks forwarded to the logic tree. */
export type ServiceLogicFrameworkContext = LogicFrameworkContext

export type ServiceRenderBridgeOptions = RenderProjectionOptions & {
  connection: BridgeConnection
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  getPage: (pageId: string) => ServiceRenderPage | undefined
  /** `this.router` / `this.pageRouter` / opener-channel hooks for the logic tree. */
  frameworkContext?: ServiceLogicFrameworkContext
  onLogicTreeCreated?: (tree: unknown) => void
  /** Report an error raised by page/component logic (the app `onError` hook). */
  onError: (message: string) => void
  /** Page-scoped WXS runtime shared with generated service templates. */
  wxsRuntime?: WxsRuntime
}

/**
 * Service-render bridge, the façade of the service-side render layer.
 *
 * The bridge owns the logic-tree lifecycle and transport wiring. Payload
 * projection lives in `projection.ts`; batching and `setData` completions live
 * in `scheduler.ts`; WXS state, inbound events and render RPCs have their own
 * modules. The page stack and API modules talk to this class only through
 * {@link ServiceRenderPort}.
 */
export class ServiceRenderBridge implements ServiceRenderPort {
  private readonly options: ServiceRenderBridgeOptions
  private readonly connection: BridgeConnection
  private readonly projection: RenderProjection
  private readonly scheduler = new RenderUpdateScheduler()
  private readonly bindings = new WxsBindingStore()
  private readonly mountedPages = new Set<string>()
  private logicTree: LogicTreeAdapter | null = null
  private wxsModules?: WxsModuleTable
  private wxsHostOptions?: WxsEventHostOptions
  private readonly pendingTabBarReady = new Map<
    string,
    Array<(tabBar: unknown) => void>
  >()

  constructor(options: ServiceRenderBridgeOptions) {
    this.options = options
    this.connection = options.connection
    this.projection = new RenderProjection(options, () => this.logicTree)
    attachRenderInbound(this.connection, {
      getLogicTree: () => this.logicTree,
      isMounted: (pageId) => this.mountedPages.has(pageId),
      sendFlow: (pageId) => this.sendTreeFlow(pageId),
      reportError: (message) => this.options.onError(message),
      dispatchWxsEffect: (pageId, effect) => this.dispatchWxsEffect(pageId, effect),
      acknowledgeRenders: (tokens) => this.acknowledgeRenders(tokens),
    })
  }

  /**
   * Build the definition table and logic tree after artifacts and host state
   * are available. Returns the component schemas the bootstrap reply carries.
   */
  async start(): Promise<MiniProgramComponentSchema[]> {
    const schemas = this.projection.initialize()
    const templates = await this.options.loadTemplates()
    this.wxsModules = templates.wxsModules
    this.logicTree = new LogicTreeAdapter({
      manifest: this.options.manifest,
      templates,
      ...(this.options.loadStyle ? { loadStyle: this.options.loadStyle } : {}),
      ...(this.options.resolveAssetUrl
        ? { resolveAssetUrl: this.options.resolveAssetUrl }
        : {}),
      ...(this.options.resolveProtocolRelativeUrl
        ? { resolveProtocolRelativeUrl: this.options.resolveProtocolRelativeUrl }
        : {}),
      ...(this.options.isComponentPage
        ? { isComponentPage: this.options.isComponentPage }
        : {}),
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
    this.logicTree.registerComponentSchemas(schemas)
    this.installWxsHost()
    this.options.onLogicTreeCreated?.(this.logicTree)
    return schemas
  }

  /**
   * Rebuild the render-facing schema/definition table after a lazy package
   * registered new components. Returns the newly added schemas.
   */
  refreshComponentDefinitions(): MiniProgramComponentSchema[] {
    return this.projection.refresh()
  }

  /** Serializable schemas for component-as-page artifacts, for bootstrap. */
  pageComponents(): ServicePageComponent[] {
    return this.projection.pageComponents()
  }

  mountPage(page: ServiceRenderPage): void {
    if (!this.logicTree || this.mountedPages.has(page.pageId)) return
    this.logicTree.mountPage(page.path, page.data, page.pageId)
    this.mountedPages.add(page.pageId)
    this.sendTreeFlow(page.pageId)
    // The first snapshot carries the full map; later updates only send changes.
    this.logicTree.seedComponentData(page.pageId)
    this.flushTabBarReady(page.pageId)
  }

  unmountPage(pageId: string): void {
    this.mountedPages.delete(pageId)
    this.scheduler.dropPage(pageId)
    this.bindings.clear(pageId)
    this.pendingTabBarReady.delete(pageId)
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
    this.scheduler.queueCompletion(pageId, callback)
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
      this.scheduler.recordPageData(pageId, patch)
      this.logicTree.applyPageData(pageId, patch)
      this.scheduleTreeUpdate(pageId)
    } catch (error) {
      this.scheduler.dropLastPageData(pageId)
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

  private sendTreeFlow(pageId: string): void {
    const page = this.options.getPage(pageId)
    const ack = this.scheduler.takeCompletionBatch(pageId)
    const payload = this.projection.buildFlow(
      pageId,
      ack,
      this.wxsModules,
      page?.data,
    )
    if (!payload) return
    this.connection.sendEvent(
      TREE_PROTOCOL.domain,
      TREE_PROTOCOL.flow,
      payload,
      { pageId },
    )
    this.scheduler.clearPageData(pageId)
    this.flushWxsBindings(pageId)
  }

  private scheduleTreeUpdate(pageId: string): void {
    if (!this.logicTree || !this.mountedPages.has(pageId)) return
    this.scheduler.schedule(pageId, (id) => this.flushPage(id))
  }

  private flushPage(pageId: string): void {
    if (!this.logicTree || !this.mountedPages.has(pageId)) return
    try {
      const { patches, snapshot } = this.logicTree.updateRenderTree(pageId)
      const tabBar = this.logicTree.updateTabBarTree(pageId)
      // Component data is a per-instance patch; a data-only update must still
      // cross the bridge even when the structure did not change.
      const componentData = this.logicTree.updateComponentData(pageId)
      const hasComponentData = Object.keys(componentData).length > 0
      const tabDataChanged = Boolean(
        tabBar.snapshot?.id && Object.hasOwn(componentData, tabBar.snapshot.id),
      )
      const tabFrame = tabBar.snapshot && (tabBar.patches.length > 0 || tabDataChanged)
        ? this.projection.tabBarFrame(pageId, tabBar.snapshot) ?? undefined
        : undefined
      const pageDataPatches = this.scheduler.pageDataPatches(pageId)
      const hasPageDataPatches = Boolean(pageDataPatches && pageDataPatches.length > 0)
      if (
        patches.length > 0
        || hasComponentData
        || tabBar.patches.length > 0
        || Boolean(tabFrame)
        || hasPageDataPatches
      ) {
        const page = this.options.getPage(pageId)
        const ack = this.scheduler.takeCompletionBatch(pageId)
        const structural = patches.some((patch) => (
          patch.type === 'insert'
          || patch.type === 'remove'
          || patch.type === 'replace'
          || patch.type === 'reorder'
          || patch.type === 'component-instances'
        ))
        const payload = this.projection.buildPatch(
          pageId,
          snapshot,
          structural,
          componentData,
          tabFrame,
          page?.data,
          pageDataPatches,
          ack,
        )
        this.connection.sendEvent(
          TREE_PROTOCOL.domain,
          TREE_PROTOCOL.patch,
          payload,
          { pageId },
        )
        this.scheduler.clearPageData(pageId)
      } else {
        // Nothing observable changed, so there is no batch to acknowledge.
        this.scheduler.flushCompletions(pageId, (id, callback) => (
          this.runCompletion(id, callback)
        ))
      }
      this.flushWxsBindings(pageId)
      this.flushTabBarReady(pageId)
    } catch (error) {
      this.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
        message: error instanceof Error ? error.message : String(error),
      }, pageId)
      // The update failed before it crossed the bridge; still run the
      // completions once instead of leaving them pending forever.
      this.scheduler.flushCompletions(pageId, (id, callback) => (
        this.runCompletion(id, callback)
      ))
    }
  }

  /** The render thread reflected one or more batches. */
  private acknowledgeRenders(tokens: string[]): void {
    this.scheduler.acknowledgeRenders(tokens, (pageId, callback) => (
      this.runCompletion(pageId, callback)
    ))
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
}
