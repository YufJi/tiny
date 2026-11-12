import type { ComponentDefinitionPayload } from './components'
import type { RenderNode, RenderNodeId } from './nodes'

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
