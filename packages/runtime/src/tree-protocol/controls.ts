/**
 * Shared control domains used by both thread entries and hosts.
 *
 * These live outside `tree-protocol/protocol.ts` so the service runtime can register
 * bootstrap/page controls without importing the render-tree contract. Every
 * control method lives here; do not spell domain/method pairs at call sites.
 */
export const RUNTIME_CONTROL = Object.freeze({
  domain: 'runtime',
  bootstrap: 'bootstrap',
  inspectTree: 'inspectTree',
  measure: 'measure',
  resize: 'resize',
  themeChange: 'themeChange',
} as const)

export const PAGE_CONTROL = Object.freeze({
  domain: 'page',
  ready: 'ready',
  navigateTo: 'navigateTo',
  navigateBack: 'navigateBack',
  redirectTo: 'redirectTo',
  reLaunch: 'reLaunch',
  switchTab: 'switchTab',
  show: 'show',
  hide: 'hide',
  unload: 'unload',
  pullDownRefresh: 'pullDownRefresh',
  share: 'share',
  saveExitState: 'saveExitState',
  snapshotState: 'snapshotState',
  restoreState: 'restoreState',
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

/**
 * Commands addressed to a component instance in the render tree (ADR-0023).
 * Context APIs (`createMapContext`, …) send these; the render side resolves the
 * instance, applies a per-tag method whitelist and returns a status object.
 */
export const COMPONENT_CONTROL = Object.freeze({
  domain: 'component',
  invoke: 'invoke',
} as const)

export type ComponentCommandRequest = {
  /** Shared component id, preferred over `selector`. */
  componentId?: string
  /** Page-scoped selector fallback (`#map`), first match wins. */
  selector?: string
  method: string
  args?: unknown
}

export type ComponentCommandResult =
  | { status: 'ok'; value?: unknown }
  | { status: 'not-found' }
  | { status: 'unsupported-method'; method: string }
  | { status: 'invalid-args'; detail: string }
  | { status: 'error'; message: string }
