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
  createMediaHandlers,
  createTempFileRegistry,
  loadImageElement,
  pickFiles,
  type MediaHandlerOptions,
  type PickFilesOptions,
  type TempFile,
  type TempFileRegistry,
  type TempFileUrlFactory,
} from './media-files'
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
export { HOST_CORE_API_KEYS } from './api-capabilities'
export {
  createWorkerHandlers,
  WORKER_BOOTSTRAP,
  wrapWorkerSource,
  type WorkerHandlerOptions,
} from './workers'
export {
  createSensorHandlers,
  type GlobalEventEmitter,
  type SensorHandlerOptions,
} from './sensors'
export {
  createFileSystemHandlers,
  FILE_SYSTEM_USER_ROOT,
  type FileSystemHandlerOptions,
} from './file-system'
export {
  createPersistentStorage,
  type PersistentStorage,
  type StorageBackend,
} from './storage-area'
export {
  createNetworkHandlers,
  type NetworkHandlerOptions,
} from './network-tasks'
export {
  createRenderHostEventBus,
  listenForRenderHostEvents,
  type RenderHostEventBus,
} from './render/host-events'
