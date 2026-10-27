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
  /** Abstract-node declarations from `componentGenerics` (JSON). */
  generics?: Record<string, { default?: string } | true>
  /** Regex source applied to data field names in the render thread. */
  pureDataPattern?: string
  externalClasses?: string[]
  formField?: boolean
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
    /** Whether styleIsolation was set explicitly by component JS/JSON. */
    explicitStyleIsolation?: boolean
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

/** One DOM node resolved by a component/page selector query. */
export type QueryNodeSnapshot = {
  /** Logic-layer node identity, present for service-side query results. */
  viewId?: string
  id: string
  dataset: Record<string, unknown>
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
  scrollLeft: number
  scrollTop: number
}

export type QuerySelectorRequest = {
  pageId?: string
  componentId?: string
  selector: string
  all?: boolean
}

/** Intersection entry projected from the render thread. */
export type QueryIntersectionEntry = {
  id: string
  dataset: Record<string, unknown>
  boundingClientRect: QueryNodeSnapshot
  intersectionRect: QueryNodeSnapshot
  relativeRect: QueryNodeSnapshot
  intersectionRatio: number
  time: number
}

export type CanvasMeasurement = {
  width: number
  height: number
  canvasId?: string
  /** Whether the host found a canvas backing the selector. */
  hasCanvas?: boolean
}

/** Options a host uses when acquiring a selector-query canvas node. */
export type CanvasNodeOptions = {
  /** Selector used by `createSelectorQuery`, for hosts that hand off a node. */
  selector?: string
  /** Page that owns the selector query. */
  pageId?: string
  /**
   * Resolve a mini-program image path (for example `./car.png`) to a loadable
   * URL for `canvas.createImage()`.
   */
  resolveAssetUrl?: (src: string) => string | undefined
}

/** A synchronous Canvas 2D/WebGL handle owned by the host. */
export type CanvasNodeHandle = {
  width: number
  height: number
  getContext: (type: string, options?: unknown) => unknown
  createImage?: () => unknown
  toDataURL?: (type?: string, quality?: number) => string
}

/** Request passed to a host when selector-query needs a canvas node. */
export type CanvasNodeRequest = CanvasNodeOptions & {
  canvasId: string
  width: number
  height: number
}

/** Request passed to a host when the legacy `createCanvasContext` API runs. */
export type LegacyCanvasRequest = {
  pageId?: string
}

/** Browser/host canvas hooks injected into the service thread. */
export type ServiceCanvasAdapter = {
  /** Legacy CanvasContext over the same host-owned canvas surface. */
  createLegacyCanvasContext: (
    canvasId: string,
    request?: LegacyCanvasRequest,
  ) => unknown | null
  /**
   * Acquire the host canvas handle for a selector query. Acquisition may be
   * asynchronous, but the returned handle must expose synchronous Canvas APIs.
   */
  acquireCanvasNode?: (
    request: CanvasNodeRequest,
  ) => Promise<CanvasNodeHandle | null> | CanvasNodeHandle | null
  /** Release every node owned by a page (or one canvas of that page). */
  releaseCanvasNode?: (request: {
    pageId?: string
    canvasId?: string
  }) => void
}

export type RenderIntersectionRequest = {
  /** Opaque backend root element of the component or page. */
  root: unknown
  selector: string
  all: boolean
  thresholds?: number[]
  relativeTo?: {
    type?: 'viewport' | 'selector'
    selector?: string
    margins?: { left?: number; right?: number; top?: number; bottom?: number }
  }
}

export type RenderIntersectionHandle = {
  /** Start observing resolved targets. */
  start: () => void
  disconnect: () => void
}

/**
 * Host-provided render-thread DOM capabilities. The runtime core stays free of
 * `Element`, `IntersectionObserver` and other browser globals; a browser host
 * implements these against real DOM nodes, while other hosts may omit them.
 */
export type RenderQueryAdapter = {
  query: (root: unknown, selector: string, all: boolean) => QueryNodeSnapshot[]
  createIntersectionObserver: (
    request: RenderIntersectionRequest,
    onEntries: (entries: QueryIntersectionEntry[]) => void,
  ) => RenderIntersectionHandle
}

/** Browser/host canvas hooks injected into the render thread. */
export type RenderCanvasAdapter = {
  measure: (selector?: string, canvasId?: string) => CanvasMeasurement
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
  /** Register or reuse a render style scope shared with stylesheet registration. */
  registerStyleScope?: (name: string) => number
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
export type BuiltinStyleSheet = {
  path: string
  content: string
  /** Internal style scope. Omit for globally applicable host/base styles. */
  scope?: string
}

export type BuiltinComponents = {
  create: BuiltinComponentFactory
  /** Stylesheets registered before app/page/component styles. */
  styles?: BuiltinStyleSheet[]
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
  /** Host hook mapping app-root asset paths to loadable URLs (canvas images, …). */
  resolveAssetUrl?: AssetUrlResolver
  /** Maximum pages in the runtime page stack. Defaults to 10. */
  maxPageStack?: number
  /** 'service' runs the logic tree in this thread and projects a view. */
  logicLayer?: 'render' | 'service'
  /** Templates for the service-side logic tree. */
  loadTemplates?: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Test/host hook fired when the service logic tree is created. */
  onLogicTreeCreated?: (tree: unknown) => void
  /** Stylesheet text for logic-tree style scoping. */
  loadStyle?: StyleLoader
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
  /** Host canvas implementation for measuring selector-query surfaces. */
  canvas?: RenderCanvasAdapter
  /** Host DOM query and intersection-observer implementation. */
  query?: RenderQueryAdapter
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
  /** Maximum pages in the runtime page stack. Defaults to 10. */
  maxPageStack?: number
  onDiagnostic?: (diagnostic: import('./diagnostics').RuntimeDiagnostic) => void
}
