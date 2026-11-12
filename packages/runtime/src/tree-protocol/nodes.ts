import { TINY_ENGINE_NAMING } from '@tiny/manifest'

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
