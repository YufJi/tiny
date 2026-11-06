/**
 * Shared control domains used by both thread entries and hosts.
 *
 * These live outside `tree/protocol` so the service runtime can register
 * bootstrap/resize controls without importing the render-tree contract.
 */
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
