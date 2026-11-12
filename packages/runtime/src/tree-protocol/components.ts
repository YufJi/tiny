import type { RenderComponentIdentity, RenderNode } from './nodes'

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
