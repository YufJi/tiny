import type { Diagnostic as CompilerDiagnostic } from '@tiny/compiler-next'

export type RuntimeDiagnosticSeverity = 'info' | 'warning' | 'error' | 'state'
export type RuntimeDiagnosticSource = 'compiler' | 'transport' | 'service' | 'render' | 'host'

export type RuntimeDiagnostic = {
  severity: RuntimeDiagnosticSeverity
  code: string
  message: string
  timestamp: number
  source: RuntimeDiagnosticSource
  pageId?: string
  details?: unknown
}

export type RuntimeStateDetails = {
  pageStack: string[]
  currentPage?: string
  transport: 'connected' | 'closed'
}

let diagnosticIdCounter = 0

export function createRuntimeDiagnostic(
  severity: RuntimeDiagnosticSeverity,
  code: string,
  message: string,
  source: RuntimeDiagnosticSource,
  pageId?: string,
  details?: unknown,
): RuntimeDiagnostic {
  diagnosticIdCounter = (diagnosticIdCounter + 1) % Number.MAX_SAFE_INTEGER
  return {
    severity,
    code,
    message,
    timestamp: Date.now(),
    source,
    ...(pageId ? { pageId } : {}),
    ...(details === undefined ? {} : { details }),
  }
}

export function createRuntimeStateDiagnostic(
  source: RuntimeDiagnosticSource,
  state: RuntimeStateDetails,
  pageId?: string,
): RuntimeDiagnostic {
  return createRuntimeDiagnostic('state', 'RUNTIME_STATE', 'Runtime state changed.', source, pageId, state)
}

export function normalizeTransportDiagnostic(
  payload: unknown,
  source: RuntimeDiagnosticSource,
  pageId?: string,
): RuntimeDiagnostic {
  const value = payload as { severity?: string; code?: string; message?: string; details?: unknown } | undefined
  const severity = value?.severity === 'warning' || value?.severity === 'info' || value?.severity === 'state'
    ? value.severity
    : 'error'
  return createRuntimeDiagnostic(
    severity,
    value?.code ?? 'TRANSPORT_DIAGNOSTIC',
    value?.message ?? 'Transport emitted a diagnostic.',
    source,
    pageId,
    value?.details,
  )
}

export function normalizeCompilerDiagnostics(diagnostics: CompilerDiagnostic[] = []): RuntimeDiagnostic[] {
  return diagnostics.map((diagnostic) => createRuntimeDiagnostic(
    diagnostic.severity === 'error' ? 'error' : diagnostic.severity === 'warning' ? 'warning' : 'info',
    diagnostic.code,
    diagnostic.message,
    'compiler',
    undefined,
    { file: diagnostic.file, location: diagnostic.location, original: diagnostic.details },
  ))
}
