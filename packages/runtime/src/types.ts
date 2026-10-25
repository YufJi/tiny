import type { Manifest } from '@tiny/manifest'
import type { AssetUrlResolver } from './assets'

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

/**
 * Host-owned render thread slots.
 *
 * A browser host can give every page its own iframe so hidden pages keep their
 * DOM and scroll position, like real WebViews. The runtime host asks the
 * connector for one transport per page and never shares a render connection
 * between pages.
 */
export type RenderThreadConnector = {
  /** Boot a render thread document and return the host side of its transport. */
  connect(pageId: string): Promise<import('@tiny/bridge').Transport>
  /** Make this page the visible render thread (hide the other page views). */
  activate?(pageId: string): void
  /** Tear down the render thread document for an unloaded page. */
  disconnect(pageId: string): void | Promise<void>
  /** Reflect app foreground/background on the whole render frame stack. */
  setAppVisible?(visible: boolean): void
}

export type HostApiParams = Record<string, unknown>
export type HostApiHandler = (
  params: HostApiParams,
  context: { pageId?: string },
) => unknown | Promise<unknown>

export type HostApiHandlers = Record<string, HostApiHandler>

export type StyleLoader = (path: string) => string

export type BackendFactory = () => unknown

/** Context the runtime passes to a host-provided built-in component factory. */
export type BuiltinComponentFactoryContext = {
  /** Behavior id prefix derived from `manifest.naming` (e.g. `wx-`). */
  prefix?: string
  onDiagnostic?: (diagnostic: {
    severity: 'warning' | 'error'
    code: string
    message: string
    details?: unknown
  }) => void
  /** Resolve a mini-program asset path for the component instance that owns it. */
  resolveAssetUrl?: (src: string, component: unknown) => string
}

export type BuiltinComponentFactory = (
  space: import('glass-easel').ComponentSpace,
  context: BuiltinComponentFactoryContext,
) => BuiltinComponentDefinitions

export type BuiltinComponentDefinitions = Record<string, import('glass-easel').GeneralComponentDefinition>

/**
 * Host-provided implementations of the mini-program built-in tags.
 *
 * The runtime core does not own UI: a host supplies the tags its backend can
 * render. `@tiny/host-web-components` is the DOM/browser implementation used by
 * `tests/host` and `apps/devtool`; a native host can provide its own factory or
 * omit this option entirely.
 */
export type BuiltinComponents = {
  create: BuiltinComponentFactory
  /**
   * Stylesheet registered into the global scope before app styles, e.g. the
   * base layout CSS for real `tiny-*` host nodes on the web.
   */
  baseStyles?: { path: string; content: string }
}

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
  /** Host-specific APIs (device geometry, performance, etc.) merged into the API host. */
  apiExtensions?: Record<string, (...args: unknown[]) => unknown>
  /** Host canvas implementation for legacy canvas APIs/selector nodes. */
  canvas?: ServiceCanvasAdapter
}

export type RenderThreadOptions = {
  transport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  artifacts: RenderArtifacts
  backend: unknown
  /** Host-provided implementations of the mini-program built-in tags. */
  builtinComponents?: BuiltinComponents
  initialPath: string
  initialData?: Record<string, unknown>
  loadStyle?: StyleLoader
  /** Host hook mapping app-root asset paths to loadable URLs (images, CSS urls). */
  resolveAssetUrl?: AssetUrlResolver
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
  /**
   * Single render thread transport. Mutually exclusive with `renderConnector`.
   * Kept for in-memory tests and hosts that render one page at a time.
   */
  renderTransport?: import('@tiny/bridge').Transport
  /**
   * Per-page render thread connector. When set, the host creates one render
   * connection for every page in the stack and routes messages by page ID.
   */
  renderConnector?: RenderThreadConnector
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
