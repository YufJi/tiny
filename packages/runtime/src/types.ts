import type { Manifest } from '@tiny/manifest'

export type RuntimeManifest = Manifest

export type TemplateGroupList = Record<string, unknown>

export type TemplateRegistry = {
  groupList: TemplateGroupList
  content: (path: string, name?: string) => unknown
}

export type RenderArtifacts = {
  templates: TemplateRegistry
}

export type MiniProgramPropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'any'

export type MiniProgramPropertyDefinition = {
  type?: MiniProgramPropertyType
  optionalTypes?: MiniProgramPropertyType[]
  value?: unknown
}

export type MiniProgramComponentSchema = {
  componentId: string
  path: string
  data: Record<string, unknown>
  properties: Record<string, MiniProgramPropertyDefinition>
  using: Record<string, string>
  externalClasses?: string[]
  observers?: Array<{ key: string; paths: string[] }>
  relations?: Array<{
    key: string
    type: 'parent' | 'child' | 'ancestor' | 'descendant'
    target: string
  }>
  options?: {
    multipleSlots?: boolean
    virtualHost?: boolean
    styleIsolation?: 'isolated' | 'apply-shared' | 'shared'
    addGlobalClass?: boolean
  }
}

export type SystemInfoSnapshot = {
  pixelRatio: number
  windowWidth: number
  windowHeight: number
  language?: string
  platform?: string
  SDKVersion?: string
}

export type CanvasFrame = {
  canvasId: string
  dataUrl: string
  width: number
  height: number
}

export type CanvasMeasurement = {
  width: number
  height: number
  canvasId?: string
}

/** Browser/host canvas hooks injected into the service thread. */
export type ServiceCanvasAdapter = {
  createLegacyCanvasContext: (
    canvasId: string,
    send: (frame: CanvasFrame) => void,
  ) => unknown | null
  createCanvasNode: (
    width: number,
    height: number,
    canvasId: string,
    send: (frame: CanvasFrame) => void,
  ) => unknown | null
}

/** Browser/host canvas hooks injected into the render thread. */
export type RenderCanvasAdapter = {
  measure: (selector?: string) => CanvasMeasurement
  paint: (frame: { canvasId?: string; dataUrl?: string }) => void
}

export type StorageSnapshot = Record<string, unknown>

export type HostApiParams = Record<string, unknown>
export type HostApiHandler = (
  params: HostApiParams,
  context: { pageId?: string },
) => unknown | Promise<unknown>

export type HostApiHandlers = Record<string, HostApiHandler>

export type StyleLoader = (path: string) => string

export type BackendFactory = () => unknown

export type BootstrapPayload = {
  manifest: RuntimeManifest
  initialPath: string
  initialData?: Record<string, unknown>
  componentSchemas?: MiniProgramComponentSchema[]
}

export type ServiceThreadOptions = {
  transport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  initialPath: string
  capabilities?: Record<string, unknown>
  loadArtifacts?: () => Promise<unknown>
  /** Host-specific `wx` APIs (device geometry, performance, etc.). */
  apiExtensions?: Record<string, (...args: unknown[]) => unknown>
  /** Host canvas implementation for legacy canvas APIs/selector nodes. */
  canvas?: ServiceCanvasAdapter
}

export type RenderThreadOptions = {
  transport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  artifacts: RenderArtifacts
  backend: unknown
  initialPath: string
  initialData?: Record<string, unknown>
  loadStyle?: StyleLoader
  capabilities?: Record<string, unknown>
  /** Host canvas implementation for measuring and painting canvas frames. */
  canvas?: RenderCanvasAdapter
  onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
  /** Host hook that inserts the root component into the backend tree. */
  mountComponent?: (component: unknown) => void
  /** Host hook that removes the root component from the backend tree. */
  unmountComponent?: (component: unknown) => void
}

export type RuntimeHostOptions = {
  serviceTransport: import('@tiny/bridge').Transport
  renderTransport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  initialPath: string
  initialData?: Record<string, unknown>
  serviceCapabilities?: Record<string, unknown>
  renderCapabilities?: Record<string, unknown>
  systemInfo?: Partial<SystemInfoSnapshot>
  storage?: StorageSnapshot
  apiHandlers?: HostApiHandlers
  onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
}
