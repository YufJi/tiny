import { DIAGNOSTIC_CODES, type Diagnostic as CompilerDiagnostic } from '@tiny/manifest'

export { DIAGNOSTIC_CODES }

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

export type RuntimePageState = {
  pageId: string
  path: string
  visible: boolean
  /** Live but outside the current page stack, e.g. a cached tab page. */
  cached?: boolean
}

export type RuntimeTabBarItemState = {
  index: number
  pagePath: string
  text: string
  iconPath?: string
  selectedIconPath?: string
  badge?: string
  redDot: boolean
}

export type RuntimeTabBarState = {
  /** Native tab bar is drawn on this page; false on non-tab pages/background. */
  visible: boolean
  custom: boolean
  position: 'bottom' | 'top'
  color: string
  selectedColor: string
  backgroundColor: string
  borderStyle: 'black' | 'white'
  selectedIndex: number
  items: RuntimeTabBarItemState[]
}

export type RuntimeStateDetails = {
  pageStack: string[]
  currentPage?: string
  pages?: RuntimePageState[]
  appVisible?: boolean
  tabBar?: RuntimeTabBarState
  maxPageStack?: number
  transport: 'connected' | 'closed'
}

export type RuntimePageLifecyclePhase =
  | 'onLoad'
  | 'onShow'
  | 'onReady'
  | 'onHide'
  | 'onUnload'
  | 'onPageScroll'
  | 'onReachBottom'
  | 'onResize'
  | 'onTabItemTap'
  | 'onPullDownRefresh'
  | 'onShareAppMessage'
  | 'onShareTimeline'
  | 'onAddToFavorites'
  | 'onSaveExitState'

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
  return createRuntimeDiagnostic('state', DIAGNOSTIC_CODES.RUNTIME_STATE, 'Runtime state changed.', source, pageId, state)
}

export function normalizeTransportDiagnostic(
  payload: unknown,
  source: RuntimeDiagnosticSource,
  pageId?: string,
  level?: 'log' | 'warn' | 'error' | 'state',
): RuntimeDiagnostic {
  const value = payload as { severity?: string; code?: string; message?: string; details?: unknown } | undefined
  const fallback: RuntimeDiagnostic['severity'] = level === 'warn'
    ? 'warning'
    : level === 'log'
      ? 'info'
      : level === 'state'
        ? 'state'
        : 'error'
  const severity = value?.severity === 'warning'
    || value?.severity === 'info'
    || value?.severity === 'state'
    || value?.severity === 'error'
    ? value.severity
    : fallback
  return createRuntimeDiagnostic(
    severity,
    value?.code ?? DIAGNOSTIC_CODES.TRANSPORT_DIAGNOSTIC,
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
