import { BridgeConnection } from '@tiny/bridge'
import type { Transport } from '@tiny/bridge'
import type { WxsModuleTable } from '@tiny/wxs-runtime'
import type { TemplateRegistry } from '../../types'
import {
  CANVAS_CONTROL,
  QUERY_CONTROL,
  RUNTIME_CONTROL,
  TREE_PROTOCOL,
  type ComponentDefinitionPayload,
  type ComponentFlow,
  type RenderAnimationRequest,
  type RenderClearAnimationRequest,
  type RenderEventGeometry,
  type RenderHostAction,
  type RenderIntersectionEntry,
  type RenderIntersectionRequest,
  type RenderNode,
  type RenderPatch,
  type RenderTemplateEvent,
  type WxsRenderEffect,
  type WxsBindingMessage,
} from '../protocol'

export type TreeEventPayload = {
  id: string
  name: string
  pageId?: string
  detail?: unknown
  native?: Record<string, unknown>
  touches?: unknown[]
  changedTouches?: unknown[]
  /** Geometry of the innermost node the host resolved for this event. */
  target?: RenderEventGeometry
  /** Geometry of the node that owns the binding being dispatched. */
  currentTarget?: RenderEventGeometry
}

export type TreeRenderer = {
  mount: (root: RenderNode) => void
  applyPatches: (patches: RenderPatch[]) => void
  /**
   * Component definitions collected from `define` flow messages. Called before
   * the first `mount`, so the render tree can register a real component per
   * path instead of a generic container.
   */
  setComponentDefinitions?: (definitions: Record<string, ComponentDefinitionPayload>) => void
  /**
   * Compiled template groups for the render-time evaluation. Installing them
   * turns `define` payloads into real shadow trees (Phase 2b).
   */
  setTemplates?: (templates: TemplateRegistry) => void
  /** Page style scope, installed before mount (`~class` resolves against it). */
  setPageScope?: (scopeName: string) => void
  /** Page-level `usingComponents`, installed before the first mount. */
  setPageUsing?: (using: Record<string, string>) => void
  /** Public built-in behavior scheme from the service compatibility config. */
  setBehaviorScheme?: (scheme: string) => void
  setEventSink?: (sink: (event: TreeEventPayload) => void) => void
  /** Forwarded template handlers (render-evaluated component shadow trees). */
  setTemplateEventSink?: (sink: (event: RenderTemplateEvent) => void) => void
  setWxsEffectSink?: (sink: (effect: WxsRenderEffect) => void) => void
  setPageData?: (data: Record<string, unknown>) => void
  setComponentData?: (data: Record<string, Record<string, unknown>>) => void
  setWxsBinding?: (binding: WxsBindingMessage) => void
  /** Built-in components ask the host to act (e.g. `<navigator>` routing). */
  setHostActionSink?: (sink: (action: RenderHostAction) => void) => void
  /** Built-in components ask the host for a value (e.g. `<picker>`). */
  setHostRequestSink?: (sink: (method: string, payload: unknown) => Promise<unknown>) => void
  applyStyles?: (styles: string[]) => void
  setPagePath?: (pagePath: string) => void
  measureCanvas?: (selector: string, canvasId: string) => {
    width: number
    height: number
    canvasId: string
    hasCanvas: boolean
  }
  setDiagnosticSink?: (sink: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void) => void
  inspectTree?: () => unknown
  setWxsModules?: (table: WxsModuleTable) => void
  measure?: (ids: string[]) => Record<string, unknown>
  /** Geometry of elements addressed by component-scoped locators. */
  measureLocators?: (locators: string[]) => Record<string, unknown>
  query?: (selector: string, all: boolean, scopeId?: string) => unknown[]
  observeIntersection?: (
    request: RenderIntersectionRequest,
    emit: (entries: RenderIntersectionEntry[]) => void,
  ) => (() => void) | undefined
  /** `this.animate`: play normalized keyframes on the resolved render nodes. */
  playAnimation?: (request: RenderAnimationRequest) => void
  /** `this.clearAnimate`: cancel playback and drop the animated properties. */
  clearAnimation?: (request: RenderClearAnimationRequest) => void
  dispose?: () => void
}

export type TreeThreadOptions = {
  transport: Transport
  renderer: TreeRenderer
  initialPageId?: string
  /** Already-loaded template groups; installed before any flow is handled. */
  templates?: TemplateRegistry
  /**
   * Lazy template groups. Flows are parked until this resolves, so a component
   * can never be created without the template it will evaluate.
   */
  loadTemplates?: () => Promise<TemplateRegistry> | TemplateRegistry
}

export type TreeThreadRuntime = {
  connection: BridgeConnection
}

/** Render-side thread for the WeChat-style split-tree protocol. */
export function bootTreeThread(options: TreeThreadOptions): TreeThreadRuntime {
  const connection = new BridgeConnection({
    localRole: 'render',
    peerRole: 'host',
    transport: options.transport,
    capabilities: { role: 'render', mode: 'tree' },
  })
  let currentPageId = options.initialPageId

  /**
   * Template groups are evaluated by this thread too. When the host cannot
   * provide them synchronously, flows are parked until they are installed so a
   * component is never created without its template.
   */
  let templatesReady = true
  const pendingFlows: Array<{ payload?: unknown; pageId?: string }> = []
  if (options.templates) {
    options.renderer.setTemplates?.(options.templates)
  } else if (options.loadTemplates) {
    templatesReady = false
    void Promise.resolve()
      .then(() => options.loadTemplates!())
      .then((templates) => options.renderer.setTemplates?.(templates))
      .catch(() => undefined)
      .then(() => {
        templatesReady = true
        for (const message of pendingFlows.splice(0)) handleFlow(message)
      })
  }

  options.renderer.setDiagnosticSink?.((diagnostic) => {
    connection.sendDiagnostic(
      diagnostic.severity === 'error' ? 'error' : 'warn',
      diagnostic,
    )
  })

  options.renderer.setHostActionSink?.((action) => {
    connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.hostAction,
      action,
      currentPageId ? { pageId: currentPageId } : {},
    )
  })

  options.renderer.setHostRequestSink?.((method, payload) => (
    connection.call(
      TREE_PROTOCOL.domain,
      TREE_PROTOCOL.hostRequest,
      { method, payload },
      { ...(currentPageId ? { pageId: currentPageId } : {}), timeoutMs: 0 },
    )
  ))

  options.renderer.setEventSink?.((event) => {
    connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.event,
      { ...event, pageId: event.pageId ?? currentPageId },
      currentPageId ? { pageId: currentPageId } : {},
    )
  })

  options.renderer.setTemplateEventSink?.((event) => {
    connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.templateEvent,
      { ...event, pageId: currentPageId },
      currentPageId ? { pageId: currentPageId } : {},
    )
  })

  options.renderer.setWxsEffectSink?.((effect) => {
    connection.sendEvent(
      TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsEffect,
      { ...effect, pageId: currentPageId },
      currentPageId ? { pageId: currentPageId } : {},
    )
  })

  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.bootstrap, (message) => {
    const payload = (message.payload ?? {}) as {
      initialPath?: string
      pageId?: string
    }
    currentPageId = payload.pageId ?? message.pageId ?? currentPageId
    return {
      status: 'ready',
      currentPath: payload.initialPath ?? '',
      pageId: currentPageId,
      components: [],
    }
  })

  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.snapshot, (message) => {
    const payload = (message.payload ?? {}) as {
      root?: RenderNode
      pageId?: string
      pagePath?: string
      styles?: string[]
      fallbackAppStyles?: string[]
    }
    currentPageId = payload.pageId ?? message.pageId ?? currentPageId
    options.renderer.setPagePath?.(payload.pagePath ?? '')
    if (payload.root) options.renderer.mount(payload.root)
    const styles = [...(payload.styles ?? []), ...(payload.fallbackAppStyles ?? [])]
    if (styles.length > 0) options.renderer.applyStyles?.(styles)
  })
  const handleFlow = (message: { payload?: unknown; pageId?: string }): void => {
    const payload = (message.payload ?? {}) as {
      pageId?: string
      pagePath?: string
      messages?: ComponentFlow[]
      styles?: string[]
      fallbackAppStyles?: string[]
      wxsModules?: WxsModuleTable
      pageData?: Record<string, unknown>
      componentData?: Record<string, Record<string, unknown>>
      pageScope?: string
      pageUsing?: Record<string, string>
      behaviorScheme?: string
    }
    currentPageId = payload.pageId ?? message.pageId ?? currentPageId
    options.renderer.setPagePath?.(payload.pagePath ?? '')
    if (payload.pageScope) options.renderer.setPageScope?.(payload.pageScope)
    if (payload.pageUsing) options.renderer.setPageUsing?.(payload.pageUsing)
    if (payload.behaviorScheme) options.renderer.setBehaviorScheme?.(payload.behaviorScheme)
    if (payload.wxsModules) options.renderer.setWxsModules?.(payload.wxsModules)
    if (payload.pageData) options.renderer.setPageData?.(payload.pageData)
    if (payload.componentData) options.renderer.setComponentData?.(payload.componentData)
    const definitions: Record<string, ComponentDefinitionPayload> = {}
    let tree: RenderNode | undefined
    for (const entry of payload.messages ?? []) {
      if (entry.type === 'define') {
        definitions[entry.path] = entry.definition
        continue
      }
      if (entry.type === 'tree') {
        tree = entry.root
        continue
      }
      if (entry.type === 'ready' && tree) {
        if (Object.keys(definitions).length > 0) {
          options.renderer.setComponentDefinitions?.(definitions)
        }
        options.renderer.mount(tree)
        tree = undefined
      }
    }
    const styles = [...(payload.styles ?? []), ...(payload.fallbackAppStyles ?? [])]
    if (styles.length > 0) options.renderer.applyStyles?.(styles)
  }
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.flow, (message) => {
    if (!templatesReady) {
      pendingFlows.push(message)
      return
    }
    handleFlow(message)
  })
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.wxsBinding, (message) => {
    const payload = (message.payload ?? {}) as Partial<WxsBindingMessage>
    if (!payload.viewId || !payload.event) return
    options.renderer.setWxsBinding?.({
      viewId: payload.viewId,
      event: payload.event,
      ...(payload.moduleId ? { moduleId: payload.moduleId } : {}),
      ...(payload.exportPath ? { exportPath: payload.exportPath } : {}),
      ...(payload.catch ? { catch: true } : {}),
      ...(payload.capture ? { capture: true } : {}),
      ...(payload.mutated ? { mutated: true } : {}),
    })
  })
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.patch, (message) => {
    const payload = (message.payload ?? {}) as {
      patches?: RenderPatch[]
      pageData?: Record<string, unknown>
      componentData?: Record<string, Record<string, unknown>>
    }
    if (payload.pageData) options.renderer.setPageData?.(payload.pageData)
    if (payload.componentData) options.renderer.setComponentData?.(payload.componentData)
    options.renderer.applyPatches(payload.patches ?? [])
  })
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.animate, (message) => {
    const payload = (message.payload ?? {}) as Partial<RenderAnimationRequest>
    if (!Array.isArray(payload.viewIds) || payload.viewIds.length === 0) return
    if (!Array.isArray(payload.keyframes) || payload.keyframes.length === 0) return
    options.renderer.playAnimation?.({
      viewIds: payload.viewIds,
      keyframes: payload.keyframes,
      duration: Number(payload.duration) || 0,
      ...(payload.delay !== undefined ? { delay: payload.delay } : {}),
      ...(payload.easing !== undefined ? { easing: payload.easing } : {}),
      ...(payload.iterations !== undefined ? { iterations: payload.iterations } : {}),
      ...(payload.fill !== undefined ? { fill: payload.fill } : {}),
      ...(payload.scroll !== undefined ? { scroll: payload.scroll } : {}),
      ...(payload.selector !== undefined ? { selector: payload.selector } : {}),
      ...(payload.scopeId !== undefined ? { scopeId: payload.scopeId } : {}),
    })
  })
  connection.onEvent(TREE_PROTOCOL.domain, TREE_PROTOCOL.clearAnimate, (message) => {
    const payload = (message.payload ?? {}) as Partial<RenderClearAnimationRequest>
    if (!Array.isArray(payload.viewIds) || payload.viewIds.length === 0) return
    options.renderer.clearAnimation?.({
      viewIds: payload.viewIds,
      ...(Array.isArray(payload.properties) ? { properties: payload.properties } : {}),
      ...(payload.selector !== undefined ? { selector: payload.selector } : {}),
      ...(payload.scopeId !== undefined ? { scopeId: payload.scopeId } : {}),
    })
  })
  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.inspectTree, () => options.renderer.inspectTree?.() ?? null)
  connection.onControl(RUNTIME_CONTROL.domain, RUNTIME_CONTROL.measure, (message) => {
    const payload = (message.payload ?? {}) as { ids?: string[] }
    return options.renderer.measure?.(payload.ids ?? []) ?? {}
  })
  connection.onControl(QUERY_CONTROL.domain, QUERY_CONTROL.select, (message) => {
    const payload = (message.payload ?? {}) as { selector?: string; all?: boolean; scopeId?: string }
    return {
      nodes: options.renderer.query?.(
        String(payload.selector ?? ''),
        payload.all === true,
        payload.scopeId ? String(payload.scopeId) : undefined,
      ) ?? [],
    }
  })
  const intersectionObservers = new Map<string, () => void>()
  connection.onControl(QUERY_CONTROL.domain, QUERY_CONTROL.intersection, (message) => {
    const payload = (message.payload ?? {}) as {
      action?: 'observe' | 'unobserve' | 'disconnect'
      observerId?: string
    } & RenderIntersectionRequest
    const observerId = payload.observerId
    if (!observerId) return { status: 'missing-observer' }
    if (payload.action === 'unobserve' || payload.action === 'disconnect') {
      intersectionObservers.get(observerId)?.()
      intersectionObservers.delete(observerId)
      return { status: 'unobserved' }
    }
    if (payload.action !== 'observe') return { status: 'missing-action' }
    const cleanup = options.renderer.observeIntersection?.(payload, (entries) => {
      connection.sendEvent(
        QUERY_CONTROL.domain,
        QUERY_CONTROL.intersection,
        { observerId, entries },
        currentPageId ? { pageId: currentPageId } : {},
      )
    })
    if (!cleanup) return { status: 'unsupported-intersection' }
    intersectionObservers.get(observerId)?.()
    intersectionObservers.set(observerId, cleanup)
    return { status: 'observing' }
  })
  connection.onControl(TREE_PROTOCOL.domain, TREE_PROTOCOL.inspectTree, () => options.renderer.inspectTree?.() ?? null)
  connection.onControl(CANVAS_CONTROL.domain, CANVAS_CONTROL.measure, (message) => {
    const payload = (message.payload ?? {}) as { selector?: string; canvasId?: string }
    return options.renderer.measureCanvas?.(
      String(payload.selector ?? ''),
      String(payload.canvasId ?? ''),
    ) ?? { width: 0, height: 0, canvasId: '', hasCanvas: false }
  })

  connection.onControl(TREE_PROTOCOL.domain, TREE_PROTOCOL.measure, (message) => {
    const payload = (message.payload ?? {}) as { ids?: string[]; locators?: string[] }
    return {
      ...(options.renderer.measure?.(payload.ids ?? []) ?? {}),
      ...(options.renderer.measureLocators?.(payload.locators ?? []) ?? {}),
    }
  })

  return { connection }
}
