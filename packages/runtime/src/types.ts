import type { Manifest } from '@tiny/compiler-next'

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
}

export type SystemInfoSnapshot = {
  pixelRatio: number
  windowWidth: number
  windowHeight: number
  language?: string
  platform?: string
  SDKVersion?: string
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
}
