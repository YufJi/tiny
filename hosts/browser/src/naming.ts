import { TINY_ENGINE_NAMING } from '@tiny/runtime'

/** Names used by the browser host's runtime protocol and DOM chrome. */
export const BROWSER_RUNTIME_NAMES = Object.freeze({
  runtimePort: `${TINY_ENGINE_NAMING.prefix}runtime-port`,
  runtimePortReady: `${TINY_ENGINE_NAMING.prefix}runtime-port-ready`,
  serviceFrameClass: `${TINY_ENGINE_NAMING.prefix}runtime-service-frame`,
  renderFrameClass: `${TINY_ENGINE_NAMING.prefix}runtime-render-frame`,
  renderFrameNamePrefix: `${TINY_ENGINE_NAMING.prefix}render-`,
  canvasRequest: `${TINY_ENGINE_NAMING.prefix}canvas-request`,
  canvasError: `${TINY_ENGINE_NAMING.prefix}canvas-error`,
  canvasHandoff: `${TINY_ENGINE_NAMING.prefix}canvas-handoff`,
  canvasHostTag: `${TINY_ENGINE_NAMING.hostTagPrefix}canvas`,
  canvasOffscreenAttribute: `data-${TINY_ENGINE_NAMING.namespace}-canvas-offscreen`,
  apiOverlayId: `${TINY_ENGINE_NAMING.prefix}api-overlay`,
  apiOverlayStyleId: `${TINY_ENGINE_NAMING.prefix}api-overlay-style`,
} as const)
