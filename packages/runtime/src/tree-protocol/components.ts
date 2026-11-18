import type { RenderComponentIdentity, RenderNode, RenderNodeId } from './nodes'

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
  /**
   * Component instances grouped by owner (page root and component hosts).
   *
   * The mount payload for the data-only protocol: the pageframe needs each
   * owner's ordered instance list to bind ids, but not the element tree.
   */
  componentOwners?: ComponentOwnerInstances[]
}

/** One owner's ordered component instance list, sent at mount. */
export type ComponentOwnerInstances = {
  /** Page root id or a component host's shared id. */
  id: string
  instances: RenderComponentIdentity[]
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

/** One component instance the render pageframe created for an owner. */
export type ComponentInstanceRef = {
  id: RenderNodeId
  path: string
  /** Raw `change:prop` bindings, see `RenderComponentIdentity.wxsProps`. */
  wxsProps?: string
}

/**
 * Incremental component-identity flow for one owner.
 *
 * The owner is the page root or a component host: every owner binds its own
 * component descendants positionally (the render side consumes the list in
 * document order, the same way WeChat's view thread consumes
 * `FLOW_CREATE_NODE`). Updates therefore only carry what changed for a given
 * owner instead of the whole page's element tree.
 */
export type ComponentOwnerDelta = {
  /** Owner id: the page root id or a component's shared id. */
  id: string
  /** New instances, addressed by their index in the owner's next list. */
  add?: Array<ComponentInstanceRef & { index: number }>
  /** Destroyed instance ids (their own owner lists disappear with them). */
  remove?: RenderNodeId[]
  /**
   * Full id order when surviving instances changed relative order (for
   * example a keyed `wx:for` rotation). `add`/`remove` still apply first.
   */
  order?: RenderNodeId[]
}

/**
 * Service-to-render component flow delta.
 *
 * `define` carries definitions the render thread has not seen for this page;
 * `owners` carries the per-owner instance changes. A data-only update has no
 * delta at all, which is the normal steady state.
 */
export type ComponentFlowDelta = {
  define?: ComponentDefinitionPayload[]
  owners?: ComponentOwnerDelta[]
}

/**
 * Payload of a `tree.patch` message.
 *
 * This is the data-only update envelope: page/component data plus component
 * identity changes. A normal batch carries no element tree; the deprecated
 * `renderHints`/`componentFlow` fields exist only for the
 * `renderHints: 'always'` compatibility mode.
 */
export type TreePatchPayload = {
  pageId: string
  pageData?: Record<string, unknown>
  pageDataPatches?: Array<Record<string, unknown>>
  componentData?: Record<string, Record<string, unknown>>
  componentFlowDelta?: ComponentFlowDelta
  tabFrame?: PageFrameMount
  ack?: string[]
  /** Deprecated: full service snapshot, only in `renderHints: 'always'` mode. */
  renderHints?: RenderNode
  /** Deprecated: full identity list, only in `renderHints: 'always'` mode. */
  componentFlow?: RenderComponentIdentity[]
}
