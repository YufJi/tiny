import type { BridgeConnection } from '@tiny/bridge'
import { DIAGNOSTIC_CODES } from '@tiny/manifest'
import type { Manifest } from '@tiny/manifest'
import type { WxsModuleTable } from '@tiny/wxs-runtime'
import type { NormalizedComponentDefinition } from '../../component'
import { buildComponentSchemas } from './component-schema'
import type {
  MiniProgramComponentSchema,
  StyleLoader,
  TemplateRegistry,
} from '../../types'
import { cloneJsonSafe } from '../../data'
import { LogicTreeAdapter, type LogicFrameworkContext } from '../../tree/logic'
import { buildComponentFlow } from '../../tree/flow'
import {
  TREE_PROTOCOL,
  wxsBindingKey,
  type ComponentDefinitionPayload,
  type RenderNode,
} from '../../tree/protocol'
import { dispatchWxsEffect, installWxsEventHost, type WxsEventHostOptions } from './wxs-host'
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
  /** Compatibility behavior scheme carried by every initial flow. */
  behaviorScheme: string
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  loadStyle?: StyleLoader
  getPage: (pageId: string) => ServiceRenderPage | undefined
  /** `this.router` / `this.pageRouter` / opener-channel hooks for the logic tree. */
  frameworkContext?: ServiceLogicFrameworkContext
  onLogicTreeCreated?: (tree: unknown) => void
  /** Report an error raised by page/component logic (the app `onError` hook). */
  onError: (message: string) => void
}

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
  private logicTree: LogicTreeAdapter | null = null
  private componentSchemas: MiniProgramComponentSchema[] = []
  private definitionPayloads: Map<string, ComponentDefinitionPayload> | null = null
  private wxsModules?: WxsModuleTable
  private wxsHostOptions?: WxsEventHostOptions
  private updateScheduled = false

  constructor(options: ServiceRenderBridgeOptions) {
    this.options = options
    this.connection = options.connection
    attachRenderInbound(this.connection, {
      getLogicTree: () => this.logicTree,
      isMounted: (pageId) => this.mountedPages.has(pageId),
      sendSnapshot: (pageId) => this.sendTreeSnapshot(pageId),
      reportError: (message) => this.options.onError(message),
      dispatchWxsEffect: (pageId, effect) => this.dispatchWxsEffect(pageId, effect),
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
    )
    const templates = await this.options.loadTemplates()
    this.wxsModules = templates.wxsModules
    this.logicTree = new LogicTreeAdapter({
      manifest: this.options.manifest,
      templates,
      ...(this.options.loadStyle ? { loadStyle: this.options.loadStyle } : {}),
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
      onDiagnostic: (diagnostic) => this.connection.sendDiagnostic('warn', diagnostic),
      onError: (pageId, message, details) => {
        this.options.onError(message)
        this.connection.sendDiagnostic('error', {
          code: DIAGNOSTIC_CODES.EVENT_HANDLER_ERROR,
          message,
          details,
        }, pageId)
      },
      ...createRenderRpc(this.connection),
    })
    this.logicTree.registerComponentSchemas(this.componentSchemas)
    this.installWxsHost()
    this.options.onLogicTreeCreated?.(this.logicTree)
    return this.componentSchemas
  }

  /** Serializable schemas for component-as-page artifacts, for bootstrap. */
  pageComponents(): ServicePageComponent[] {
    const result: ServicePageComponent[] = []
    for (const page of this.options.manifest.pages) {
      if (page.bodyType !== 'component') continue
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
  }

  unmountPage(pageId: string): void {
    this.mountedPages.delete(pageId)
    this.pendingPages.delete(pageId)
    this.bindings.clear(pageId)
    this.logicTree?.unmountPage(pageId)
  }

  syncPageData(pageId: string, patch: Record<string, unknown>): void {
    if (!this.logicTree || !this.mountedPages.has(pageId)) return
    try {
      this.logicTree.applyPageData(pageId, patch)
      this.scheduleTreeUpdate(pageId)
    } catch (error) {
      this.connection.sendDiagnostic('warn', {
        code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
        message: error instanceof Error ? error.message : String(error),
      }, pageId)
    }
  }

  triggerPageLifetime(pageId: string, phase: 'show' | 'hide'): void {
    this.logicTree?.triggerPageLifetime(pageId, phase)
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

  private renderDefinitions(): Map<string, ComponentDefinitionPayload> {
    this.definitionPayloads ??= buildComponentDefinitions(
      this.componentSchemas,
      this.options.componentDefinitions,
      this.options.manifest.styles,
    )
    return this.definitionPayloads
  }

  private treeFlow(root: RenderNode): ReturnType<typeof buildComponentFlow> {
    return buildComponentFlow(root, this.renderDefinitions())
  }

  private sendTreeSnapshot(pageId: string): void {
    if (!this.logicTree) return
    const root = this.logicTree.snapshotRenderTree(pageId)
    if (!root) return
    const page = this.options.getPage(pageId)
    this.connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.flow,
      {
        pageId,
        pagePath: this.logicTree.pagePathFor(pageId),
        ...(this.logicTree.pageScopeName(pageId)
          ? { pageScope: this.logicTree.pageScopeName(pageId) }
          : {}),
        ...(Object.keys(this.logicTree.pageUsingComponents(pageId)).length > 0
          ? { pageUsing: this.logicTree.pageUsingComponents(pageId) }
          : {}),
        behaviorScheme: this.options.behaviorScheme,
        messages: cloneJsonSafe(this.treeFlow(root)),
        ...(this.wxsModules ? { wxsModules: cloneJsonSafe(this.wxsModules) } : {}),
        ...(page?.data ? { pageData: cloneJsonSafe(page.data) } : {}),
        componentData: cloneJsonSafe(this.logicTree.snapshotComponentData(pageId)),
        ...this.treeStyles(pageId),
      },
      { pageId },
    )
    this.flushWxsBindings(pageId)
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
          const { patches } = this.logicTree.updateRenderTree(id)
          // Component data is a per-instance patch; a data-only update must
          // still cross the bridge even when the structure did not change.
          const componentData = this.logicTree.updateComponentData(id)
          const hasComponentData = Object.keys(componentData).length > 0
          if (patches.length > 0 || hasComponentData) {
            const page = this.options.getPage(id)
            this.connection.sendEvent(
              TREE_PROTOCOL.domain, TREE_PROTOCOL.patch,
              {
                pageId: id,
                patches: cloneJsonSafe(patches),
                ...(page?.data ? { pageData: cloneJsonSafe(page.data) } : {}),
                ...(hasComponentData ? { componentData: cloneJsonSafe(componentData) } : {}),
              },
              { pageId: id },
            )
          }
          this.flushWxsBindings(id)
        } catch (error) {
          this.connection.sendDiagnostic('warn', {
            code: DIAGNOSTIC_CODES.LOGIC_TREE_ERROR,
            message: error instanceof Error ? error.message : String(error),
          }, id)
        }
      }
    })
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

  private treeStyles(pageId: string): { styles: string[]; fallbackAppStyles?: string[] } {
    const styles = this.logicTree?.styleTexts(pageId) ?? []
    if (this.logicTree?.hasAppPageScope(pageId)) return { styles }
    const appStylePath = this.options.manifest.app?.style?.outputPath
    const appCss = appStylePath ? this.options.loadStyle?.(appStylePath) : undefined
    return {
      styles,
      ...(appCss && appCss.trim().length > 0 ? { fallbackAppStyles: [appCss] } : {}),
    }
  }
}
