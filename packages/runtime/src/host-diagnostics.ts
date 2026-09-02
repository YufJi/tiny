import type { BridgeConnection } from '@tiny/bridge'
import type { RuntimeDiagnostic } from './diagnostics'
import { normalizeCompilerDiagnostics, normalizeTransportDiagnostic } from './diagnostics'
import type { RuntimeHostOptions } from './types'

export type HostDiagnosticStore = {
  diagnostics: RuntimeDiagnostic[]
  record(diagnostic: RuntimeDiagnostic): void
}

export function createHostDiagnosticStore(options: RuntimeHostOptions): HostDiagnosticStore {
  const diagnostics: RuntimeDiagnostic[] = [
    ...normalizeCompilerDiagnostics(options.manifest.diagnostics),
  ]
  return {
    diagnostics,
    record(diagnostic) {
      diagnostics.push(diagnostic)
      options.onDiagnostic?.(diagnostic)
    },
  }
}

export function registerHostDiagnosticHandlers(
  connection: BridgeConnection,
  source: 'service' | 'render',
  store: HostDiagnosticStore,
): void {
  for (const level of ['log', 'warn', 'error', 'state'] as const) {
    connection.onEvent('diagnostic', `diagnostic.${level}`, (message) => {
      store.record(normalizeTransportDiagnostic(message.payload, source, message.pageId))
    })
  }
}
