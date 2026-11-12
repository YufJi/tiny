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
