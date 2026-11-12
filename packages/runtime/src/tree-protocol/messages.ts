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
