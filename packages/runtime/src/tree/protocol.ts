/**
 * Cross-thread tree protocol shared by the service logic tree and the render
 * tree. Node ids are allocated by the service and mirrored by the render host;
 * they are never derived from DOM nodes.
 */

import { TINY_ENGINE_NAMING } from '@tiny/manifest'

/** Bridge domains/methods used by the split-tree protocol. */
export const TREE_PROTOCOL = Object.freeze({
  domain: 'tree',
  templateEvent: 'templateEvent',
  flow: 'flow',
  patch: 'patch',
  ack: 'ack',
  event: 'event',
  ready: 'ready',
  inspectTree: 'inspectTree',
  measure: 'measure',
  animate: 'animate',
  clearAnimate: 'clearAnimate',
  hostAction: 'hostAction',
  hostRequest: 'hostRequest',
  wxsEffect: 'wxsEffect',
  wxsBinding: 'wxsBinding',
  customEvent: 'customEvent',
} as const)

/**
 * Render-thread acknowledgement of an applied batch.
 *
 * A `flow`/`patch` message may carry opaque `ack` tokens. The render
 * thread echoes them once the batch is reflected in its tree, which is what
 * makes a `setData` completion "after render" instead of "after the service
 * data update".
 */
export type RenderAckMessage = {
  pageId?: string
  tokens: string[]
}

/**
 * A custom component event (`this.triggerEvent`) forwarded to the render
 * tree so WXS handlers execute where WeChat runs them. JS listeners already
 * ran in the logic tree; the render side only dispatches marked events.
 */
export type CustomEventMessage = {
  pageId?: string
  /** Shared id of the component that called `triggerEvent`. */
  componentId: string
  name: string
  detail?: unknown
  options?: { bubbles?: boolean; composed?: boolean }
}

/**
 * Stable key for a WXS event binding. The service registers it, the render
 * tree consumes it; both sides must derive the same key.
 */
export function wxsBindingKey(viewId: string, event: string): string {
  return `${viewId}\u0000${event}`
}

export type WxsBindingMessage = {
  viewId: string
  event: string
  moduleId?: string
  exportPath?: string[]
  catch?: boolean
  capture?: boolean
  mutated?: boolean
}

export type WxsRenderEffect =
  | {
      kind: 'callMethod'
      viewId: string
      method: string
      args: unknown[]
    }
  | {
      kind: 'triggerEvent'
      viewId: string
      name: string
      detail?: unknown
      options?: Record<string, unknown>
    }

// Control domains are shared by the service runtime and the render thread;
// re-exported here so the public `tree` barrel keeps one entry.
export { CANVAS_CONTROL, PAGE_CONTROL, QUERY_CONTROL, RUNTIME_CONTROL } from '../protocol-controls'

export type RenderNodeId = string

/** Root page node tag emitted by the service logic tree. */
export const RENDER_PAGE_TAG = TINY_ENGINE_NAMING.pageTag
/** Text node tag shared by patches and render hosts. */
export const RENDER_TEXT_TAG = TINY_ENGINE_NAMING.textNodeTag
/** Transparent grouping nodes; render hosts expand their children. */
export const RENDER_FRAGMENT_TAG = TINY_ENGINE_NAMING.fragmentTag

export type RenderText = {
  type: 'text'
  /** Render-local id (components keep the shared id). */
  id?: RenderNodeId
  text: string
}

export type RenderElement = {
  type: 'element'
  /** Shared id for components and the page root; render-local for elements. */
  id?: RenderNodeId
  tag: string
  /** Named-slot assignment for this node (from `slot="..."` in WXML). */
  slot?: string
  props?: Record<string, unknown>
  dataset?: Record<string, unknown>
  scopes?: string[]
  scopeChain?: string[]
  externalClasses?: Record<string, string[]>
  events?: Array<{ name: string; capture?: boolean; catch?: boolean; mutated?: boolean }>
  children?: RenderNode[]
  /** Optional reconciliation key for repeated children. */
  key?: string
  /**
   * Set when this node is a custom-component instance rather than a built-in
   * tag. The flag keeps the component boundary in the protocol so the render
   * tree can own a real component node instead of a generic container.
   */
  component?: true
  /** Component path of a `component` node; resolves a `define` flow message. */
  componentPath?: string
  /**
   * Component instances the render thread will create while evaluating this
   * component's template, in document order. Their view ids are shared with the
   * logic tree so per-instance data (lifetimes, observers, parents) can cross
   * the bridge even though the shadow tree itself is built on the render side.
   */
  componentInstances?: Array<{ id: RenderNodeId; path: string }>
}

export type RenderNode = RenderText | RenderElement

/**
 * Stable component identities emitted by the service logic tree.
 *
 * WeChat's service side creates the component tree and emits creation
 * operations; the pageframe consumes the identities when it creates matching
 * render components. Keeping this flat makes order explicit and independent of
 * DOM/slot attachment timing.
 */
export type RenderComponentIdentity = {
  id: RenderNodeId
  path: string
}

/** One pageframe-owned root: the page itself or its independent custom tabBar. */
export type PageFrameMount = {
  pageId: string
  /** Service logic-tree view id of the root (event/WXS identity). */
  rootViewId?: string
  pagePath: string
  data: Record<string, unknown>
  using?: Record<string, string>
  scope?: string
  /** Compiler `componentPlaceholder` map keyed by artifact path. */
  placeholders?: Record<string, string>
  /** Page/component methods a compiled template may route back to the service. */
  methods?: string[]
  /** Service identity tree used for component ids while the pageframe owns WXML. */
  renderHints?: RenderNode
  /** Service-owned component identities in pageframe document order. */
  componentFlow?: RenderComponentIdentity[]
}

/**
 * Serialized component definition shipped to the render tree.
 *
 * Mirrors the WeChat view-thread registration payload: the render side needs
 * the public property table, the behavior ids (as strings, resolved against
 * its own registry) and the component options. It must never carry functions,
 * methods or lifetimes — those stay in the service. Templates are resolved by
 * component path in the render side's template registry.
 */
export type ComponentDefinitionPayload = {
  path: string
  properties?: Record<string, unknown>
  /** Property defaults the render template starts from. */
  data?: Record<string, unknown>
  /** Behavior ids declared by the component, in declaration order. */
  behaviors?: string[]
  /**
   * User method names. The render thread installs forwarding stubs so a
   * template handler (`bindtap="onTap"`) reaches the service, which owns the
   * only real method table.
   */
  methods?: string[]
  externalClasses?: string[]
  /** `usingComponents` resolved to artifact paths (tag -> component path). */
  using?: Record<string, string>
  /**
   * Compiler-assigned style scope name. Both threads register the same name so
   * render-created nodes carry exactly the classes the CSS was compiled for.
   */
  styleScope?: string
  generics?: Record<string, { default?: string } | true>
  options?: Record<string, unknown>
}

export type RenderRect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export type RenderIntersectionRequest = {
  observerId: string
  viewIds: RenderNodeId[]
  rootViewId?: RenderNodeId
  thresholds?: number[]
  rootMargin?: { left?: number; right?: number; top?: number; bottom?: number }
}

export type RenderIntersectionEntry = {
  viewId: RenderNodeId
  boundingClientRect: RenderRect
  intersectionRect: RenderRect
  relativeRect: RenderRect
  intersectionRatio: number
  time: number
}

/**
 * Layout geometry of the node that produced (or is handling) an event.
 * WeChat exposes it as `event.target.offsetLeft` / `event.currentTarget.offsetTop`
 * and drag/gesture libraries read it synchronously inside the handler.
 */
/**
 * Event forwarded from a template-declared handler inside a component whose
 * shadow tree was evaluated by the render thread. The service owns the method
 * table, so the render side only reports who fired and what the payload was.
 */
export type RenderTemplateEvent = {
  /** Service node id of the owning component instance. */
  componentId: string
  /** Method name the template bound (`bindtap="onTap"` -> `onTap`). */
  handler: string
  /** DOM event type (`tap`, `touchstart`, ...). */
  name: string
  detail?: unknown
  touches?: unknown[]
  changedTouches?: unknown[]
  id?: string
  dataset?: Record<string, unknown>
  currentTarget?: RenderEventGeometry
  /** Render identity of the innermost event target. */
  targetId?: string
  target?: RenderEventGeometry
}

export type RenderEventGeometry = {
  viewId: RenderNodeId
  offsetLeft: number
  offsetTop: number
  offsetWidth: number
  offsetHeight: number
}

/**
 * One-shot animation command (`this.animate`). Frames are already normalized by
 * `tree/animation` into Web Animations-compatible keyframes, so hosts map them
 * onto their own timing engine without re-deriving mini-program sugar.
 */
export type RenderAnimationRequest = {
  viewIds: RenderNodeId[]
  keyframes: Array<Record<string, unknown>>
  duration: number
  delay?: number
  easing?: string
  iterations?: number
  fill?: 'none' | 'forwards' | 'backwards' | 'both'
  /**
   * Selector fallback for targets that only exist in the render tree (inside
   * an evaluated component shadow tree): resolved within `scopeId`.
   */
  selector?: string
  scopeId?: RenderNodeId
  /** Scroll-driven timing (`scrollSource` + offsets). */
  scroll?: {
    sourceViewId: RenderNodeId
    startOffset: number
    endOffset: number
    timeRange?: number
  }
}

/**
 * Render-initiated host command. Built-in components such as `<navigator>` own
 * behaviour the page never binds (a tap navigates), so the render tree asks the
 * host to run the equivalent host API instead of synthesising a page event.
 */
export type RenderHostAction =
  | { action: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'; url: string }
  | { action: 'navigateBack'; delta?: number }
  | { action: 'exit' }

export type RenderClearAnimationRequest = {
  viewIds: RenderNodeId[]
  properties?: string[]
  selector?: string
  scopeId?: RenderNodeId
}

/**
 * Patch target: a shared node id for components and the page root, or a
 * component-scoped locator (`owner#index.path`) for elements and text.
 */
export type RenderTarget = string

export type RenderPatch =
  | { type: 'text'; target: RenderTarget; text: string }
  | { type: 'replace'; target: RenderTarget; node: RenderNode }
  | { type: 'props'; target: RenderTarget; props: Record<string, unknown>; removed?: string[] }
  | { type: 'insert'; parent: RenderTarget; index: number; node: RenderNode }
  | { type: 'remove'; parent: RenderTarget; index: number; count: number }
  | { type: 'reorder'; parent: RenderTarget; moves: Array<{ from: number; to: number }> }
  | {
    type: 'component-instances'
    target: RenderTarget
    instances: Array<{ id: RenderNodeId; path: string }>
  }
  | { type: 'extra'; target: RenderTarget; data: Record<string, unknown> }

/**
 * Render-side component flow. Virtual patches describe template output;
 * component flow keeps the render component tree aligned with the service
 * component tree.
 */
export type ComponentFlow =
  | {
    type: 'define'
    path: string
    /** Host-independent component metadata (properties/options/template id). */
    definition: ComponentDefinitionPayload
  }
  /**
   * The service render snapshot, carried as a nested tree: elements no longer
   * need shared ids in the flow, and the render tree assigns its own local ids.
   */
  | { type: 'tree'; root: RenderNode }
  | { type: 'ready' }
