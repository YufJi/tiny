import { WasmBrowserHost } from '@tiny/host-web'
import type { WasmHostCoreFactory, WasmHostOptions } from '@tiny/host-web'
import type { RuntimeDiagnostic } from '@tiny/runtime'
import type { StorageValues } from '@tiny/api'

/**
 * Playwright-facing host.
 *
 * `WasmBrowserHost` reports state and diagnostics through callbacks and keeps
 * no history; this harness owns the two collections the acceptance scripts
 * read from `window.__tinyRuntime.host`. Keeping them here means the host
 * package stays platform glue, and a real browser host can decide its own
 * retention policy.
 */
export type TestBrowserHostOptions = WasmHostOptions & {
  /** Storage owned by the concrete host; exposed for acceptance assertions. */
  storage?: StorageValues
}

export class TestBrowserHost extends WasmBrowserHost {
  /** Diagnostic history, including the `RUNTIME_STATE` snapshots from `onState`. */
  readonly diagnostics: RuntimeDiagnostic[]
  /** The storage object the host mutates, exposed for assertions. */
  readonly apiRegistry: { storage: StorageValues }

  constructor(options: TestBrowserHostOptions, factory: WasmHostCoreFactory) {
    const diagnostics: RuntimeDiagnostic[] = []
    const { storage = {}, ...hostOptions } = options
    super({
      ...hostOptions,
      onState: (state) => {
        // RUNTIME_STATE arrives as DiagnosticUpdate UI state, not as a
        // diagnostic action; tests filter it by its diagnostic code.
        if (state && typeof state === 'object' && typeof (state as RuntimeDiagnostic).code === 'string') {
          diagnostics.push(state as RuntimeDiagnostic)
        }
        options.onState?.(state)
      },
      onDiagnostic: (diagnostic) => {
        diagnostics.push(diagnostic)
        options.onDiagnostic?.(diagnostic)
      },
    }, factory)
    this.diagnostics = diagnostics
    this.apiRegistry = { storage }
  }
}
