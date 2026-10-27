/**
 * Cross-thread tree protocol shared by the service logic tree and the render
 * tree. Node ids are allocated by the service and mirrored by the render host;
 * they are never derived from DOM nodes.
 */

export type RenderNodeId = string

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
  events?: Array<{ name: string; capture?: boolean }>
  children?: RenderNode[]
  /** Optional reconciliation key for repeated children. */
  key?: string
}

export type RenderNode = RenderText | RenderElement

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
    events?: Array<{ name: string; capture?: boolean }>
    key?: string
  }
  | { type: 'props'; id: RenderNodeId; props: Record<string, unknown> }
  | { type: 'data'; id: RenderNodeId; patch: Record<string, unknown> }
  | { type: 'children'; id: RenderNodeId; removes?: number[]; inserts?: RenderNodeId[] }
  | { type: 'group'; depth: number }
  | { type: 'group-end' }
  | { type: 'ready' }

export type ComponentFlowBatch = {
  pageId: string
  messages: ComponentFlow[]
}

export type RenderPatchBatch = {
  pageId: string
  patches: RenderPatch[]
}
