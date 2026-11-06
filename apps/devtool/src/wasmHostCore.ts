import init, { WasmHostCore } from '@tiny/host-core-wasm'
import type { WasmHostCoreFactory } from '@tiny/host-web'

let factory: Promise<WasmHostCoreFactory> | null = null

/**
 * Load the Rust HostCore wasm module once and expose the small factory the
 * browser adapter expects. The generated bindings and wasm binary are a normal
 * workspace dependency (`@tiny/host-core-wasm`).
 */
export function createWasmHostCoreFactory(): Promise<WasmHostCoreFactory> {
  if (!factory) {
    factory = (async () => {
      await init()
      return async (configJson) => {
        const core = new WasmHostCore(configJson)
        return {
          start: (now) => core.start(now),
          handle_event: (event, now) => core.handle_event(event, now),
        }
      }
    })()
  }
  return factory
}
