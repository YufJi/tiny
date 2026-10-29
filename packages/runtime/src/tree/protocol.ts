/**
 * Cross-thread tree protocol shared by the service logic tree and the render
 * tree. Node ids are allocated by the service and mirrored by the render host;
 * they are never derived from DOM nodes.
 */

import { TINY_ENGINE_NAMING } from '@tiny/manifest'

/** Bridge domains/methods used by the split-tree protocol. */
export const TREE_PROTOCOL = Object.freeze({
  domain: 'tree',
  flow: 'flow',
  snapshot: 'snapshot',
  patch: 'patch',
  event: 'event',
  ready: 'ready',
  inspectTree: 'inspectTree',
  measure: 'measure',
  animate: 'animate',
  clearAnimate: 'clearAnimate',
  hostAction: 'hostAction',
  wxsEffect: 'wxsEffect',
  wxsBinding: 'wxsBinding',
} as const)

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

export const RUNTIME_CONTROL = Object.freeze({
  domain: 'runtime',
  bootstrap: 'bootstrap',
  inspectTree: 'inspectTree',
  measure: 'measure',
  resize: 'resize',
} as const)

export const QUERY_CONTROL = Object.freeze({
  domain: 'query',
  select: 'select',
  intersection: 'intersection',
} as const)

export const CANVAS_CONTROL = Object.freeze({
  domain: 'canvas',
  measure: 'measure',
} as const)

export type RenderNodeId = string

/** Root page node tag emitted by the service logic tree. */
export const RENDER_PAGE_TAG = TINY_ENGINE_NAMING.pageTag
/** Text node tag shared by patches and render hosts. */
export const RENDER_TEXT_TAG = TINY_ENGINE_NAMING.textNodeTag
/** Transparent grouping nodes; render hosts expand their children. */
export const RENDER_FRAGMENT_TAG = TINY_ENGINE_NAMING.fragmentTag

export type RenderText = {
  type: 'text'
  id: RenderNodeId
  text: string
}

export type RenderElement = {
  type: 'element'
  id: RenderNodeId
  tag: string
  props?: Record<string, unknown>
  dataset?: Record<string, unknown>
  scopes?: string[]
  scopeChain?: string[]
  externalClasses?: Record<string, string[]>
  events?: Array<{ name: string; capture?: boolean; catch?: boolean; mutated?: boolean }>
  children?: RenderNode[]
  /** Optional reconciliation key for repeated children. */
  key?: string
}

export type RenderNode = RenderText | RenderElement

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
}

export type RenderPatch =
  | { type: 'text'; id: RenderNodeId; text: string }
  | { type: 'replace'; id: RenderNodeId; node: RenderNode }
  | { type: 'props'; id: RenderNodeId; props: Record<string, unknown>; removed?: string[] }
  | { type: 'insert'; parentId: RenderNodeId; index: number; node: RenderNode }
  | { type: 'remove'; parentId: RenderNodeId; index: number; count: number }
  | { type: 'reorder'; parentId: RenderNodeId; moves: Array<{ from: number; to: number }> }
  | { type: 'extra'; id: RenderNodeId; data: Record<string, unknown> }

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
    definition: Record<string, unknown>
  }
  | {
    type: 'create-node'
    id: RenderNodeId
    tag: string
    path?: string
    parentId?: RenderNodeId
    index?: number
    text?: string
    props?: Record<string, unknown>
    dataset?: Record<string, unknown>
    scopes?: string[]
    scopeChain?: string[]
    externalClasses?: Record<string, string[]>
    events?: Array<{ name: string; capture?: boolean; catch?: boolean; mutated?: boolean }>
    key?: string
  }
  | { type: 'props'; id: RenderNodeId; props: Record<string, unknown> }
  | { type: 'data'; id: RenderNodeId; patch: Record<string, unknown> }
  | { type: 'children'; id: RenderNodeId; removes?: number[]; inserts?: RenderNodeId[] }
  | { type: 'group'; depth: number }
  | { type: 'group-end' }
  | { type: 'ready' }

