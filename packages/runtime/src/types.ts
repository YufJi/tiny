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

export type StyleLoader = (path: string) => string

export type BackendFactory = () => unknown

export type BootstrapPayload = {
  manifest: RuntimeManifest
  initialPath: string
  initialData?: Record<string, unknown>
}

export type ServiceThreadOptions = {
  transport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  initialPath: string
  capabilities?: Record<string, unknown>
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
}
