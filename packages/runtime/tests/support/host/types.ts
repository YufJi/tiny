import type { Transport } from '@tiny/bridge'
import type { HostApiHandlers } from '@tiny/api'
import type { RuntimeDiagnostic } from '../../../src/diagnostics'
import type { RuntimeManifest } from '../../../src/types'

/**
 * Host-owned render thread slots.
 *
 * The in-memory test host opens one render connection per page and routes
 * messages by page ID; production hosts implement the same seam.
 */
export type RenderThreadConnector = {
  connect(pageId: string): Promise<Transport>
  activate?(pageId: string): void
  disconnect(pageId: string): void | Promise<void>
  setAppVisible?(visible: boolean): void
}

/**
 * Options for the in-memory test host (not a runtime contract).
 *
 * The test host owns system/storage facts and their API handlers, mirroring a
 * production host entry.
 */
export type RuntimeHostOptions = {
  serviceTransport: Transport
  renderConnector: RenderThreadConnector
  manifest: RuntimeManifest
  initialPath: string
  initialExitState?: unknown
  initialData?: Record<string, unknown>
  serviceCapabilities?: Record<string, unknown>
  renderCapabilities?: Record<string, unknown>
  systemInfo?: Partial<import('@tiny/api').SystemInfo>
  storage?: import('@tiny/api').StorageValues
  apiHandlers?: HostApiHandlers
  maxPageStack?: number
  onDiagnostic?: (diagnostic: RuntimeDiagnostic) => void
}
