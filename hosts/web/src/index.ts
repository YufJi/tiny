/**
 * Web host entry.
 *
 * This package is the platform glue for web/WebView hosts: browser iframes and
 * message ports, the DOM render tree, canvas handoff, and the wasm HostCore
 * adapter. Host API implementations are supplied by the application, not this
 * package.
 */
export {
  WasmBrowserHost,
  type WasmHostCoreFactory,
  type WasmHostCoreLike,
  type WasmHostOptions,
} from './wasm-host'
export {
  bootServiceEntry,
  type ServiceEntryOptions,
} from './service-entry'
export {
  bootRenderEntry,
  type RenderEntryOptions,
} from './render-entry'
export { installPageLifecycleBridge } from './page-lifecycle'
export {
  createGlassRenderEntry,
  installBuiltinStyles,
  type GlassRenderEntry,
  type GlassRenderEntryOptions,
} from './render/entry'
export {
  createGlassRenderTree,
  type GlassRenderEvent,
  type GlassRenderTree,
  type GlassRenderTreeOptions,
} from './render/tree'
