import type { BridgeConnection } from '@tiny/bridge'
import type {
  RuntimeManifest,
  ServiceCanvasAdapter,
  StorageSnapshot,
  StyleLoader,
  SystemInfoSnapshot,
  TemplateRegistry,
} from '../types'
import type { AssetUrlResolver } from '../assets'
import type { ComponentTree } from './component-tree'
import type { MiniProgramComponentOptions } from '../component/options'
import type { MiniProgramPageRegistry } from './page-registry'
import type { MiniProgramPageInstance } from './page-instance'

export type { MiniProgramComponentOptions } from '../component/options'

export type MiniProgramPageOptions = {
  data?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  onLoad?: (...args: unknown[]) => void
  onShow?: (...args: unknown[]) => void
  onReady?: (...args: unknown[]) => void
  onHide?: (...args: unknown[]) => void
  onUnload?: (...args: unknown[]) => void
  onPageScroll?: (event: { scrollTop: number; scrollLeft: number }) => void
  onReachBottom?: (...args: unknown[]) => void
  onResize?: (event: { size: { windowWidth: number; windowHeight: number } }) => void
  onTabItemTap?: (event: { index: number; pagePath: string; text: string }) => void
  onPullDownRefresh?: (...args: unknown[]) => void
  onShareAppMessage?: (...args: unknown[]) => unknown
  onShareTimeline?: (...args: unknown[]) => unknown
  onAddToFavorites?: (...args: unknown[]) => unknown
  onSaveExitState?: (...args: unknown[]) => unknown
  [key: string]: unknown
}

export type MiniProgramAppOptions = {
  globalData?: Record<string, unknown>
  onLaunch?: (...args: unknown[]) => void
  onShow?: (...args: unknown[]) => void
  onHide?: (...args: unknown[]) => void
  onError?: (message: string) => void
  onPageNotFound?: (info: { path: string; query: Record<string, string>; isEntryPage: boolean }) => void
  onUnhandledRejection?: (info: { reason: unknown; promise?: unknown }) => void
  onThemeChange?: (info: { theme: 'light' | 'dark' }) => void
  [key: string]: unknown
}


export type MiniProgramApiHost = Record<string, (...args: unknown[]) => unknown>

/**
 * Build the mini-program API table for one service thread.
 *
 * The kernel owns the global namespace, the unsupported-API fallback and the
 * capability context below; it does not own the API set. Hosts pass the
 * standard WeChat-compatible factory (`@tiny/api`) plus their own device
 * facts, so growing the API surface never touches the kernel.
 */
export type ServiceApiFactory = (context: ServiceApiContext) => MiniProgramApiHost

export type TabBarApi = {
  setStyle(params: Record<string, unknown>): void
  setItem(params: Record<string, unknown>): void
  setBadge(params: Record<string, unknown>): void
  removeBadge(params: Record<string, unknown>): void
  showRedDot(params: Record<string, unknown>): void
  hideRedDot(params: Record<string, unknown>): void
  setVisible(visible: boolean): void
}

/**
 * Kernel capabilities handed to an injected API factory.
 *
 * This is a public contract: `@tiny/api` implements `wx.*` against it
 * without importing runtime internals. Keep it additive — a field removed or
 * reshaped here breaks every host-provided API set.
 */
export type ServiceApiContext = {
  connection: BridgeConnection
  /** API global name used in diagnostics. */
  apiName: string
  /** API namespaces accepted by canIUse, including aliases. */
  apiNamespaces: string[]
  getSystemInfoSnapshot: () => SystemInfoSnapshot
  getStorageSnapshot: () => StorageSnapshot
  setStorageSnapshot: (key: string, value: unknown) => void
  /** Filled by the kernel with the names the injected factory returned. */
  apiNames: Set<string>
  getCurrentPagePath?: () => string | undefined
  /** Active page instance, for `wx.*` entries that scope to the current page. */
  getActivePage?: () => unknown
  canvas?: ServiceCanvasAdapter
  /** Host hook mapping app-root asset paths to loadable URLs (canvas images, …). */
  resolveAssetUrl?: AssetUrlResolver
  tabBar?: TabBarApi
  /** Runtime-owned set so a host theme notification can reach `wx.onThemeChange`. */
  themeListeners?: Set<(value: unknown) => void>
  pageId?: string
}

/**
 * Boot contract for one service thread.
 *
 * This lives in the service layer (not the package-wide `types.ts`) because it
 * owns the service entry: the host supplies artifacts, API factory, canvas and
 * asset hooks, and the kernel assembles the page/render runtimes.
 */
export type ServiceThreadOptions = {
  transport: import('@tiny/bridge').Transport
  manifest: RuntimeManifest
  initialPath: string
  capabilities?: Record<string, unknown>
  loadArtifacts?: () => Promise<unknown>
  /**
   * Mini-program API table factory. Required: the service thread installs
   * exactly what this returns and reports every other `wx.*` name as
   * unsupported. Hosts compose the standard set (`@tiny/api`) with
   * their own device facts.
   */
  apiHost: ServiceApiFactory
  /** Host canvas implementation for legacy canvas APIs/selector nodes. */
  canvas?: ServiceCanvasAdapter
  /** Host hook mapping app-root asset paths to loadable URLs (canvas images, …). */
  resolveAssetUrl?: AssetUrlResolver
  /** Maximum pages in the runtime page stack. Defaults to 10. */
  maxPageStack?: number
  /** Templates for the service-side logic tree. */
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Test/host hook fired when the service logic tree is created. */
  onLogicTreeCreated?: (tree: unknown) => void
  /** Stylesheet text for logic-tree style scoping. */
  loadStyle?: StyleLoader
}

export type ServiceThreadRuntime = {
  connection: BridgeConnection
  registry: MiniProgramPageRegistry
  manifest: ServiceThreadOptions['manifest']
  initialPath: string
  activePage: MiniProgramPageInstance | null
  pageStack: MiniProgramPageInstance[]
  pageInstances: Map<string, MiniProgramPageInstance>
  componentTree: ComponentTree
  /** Report a rejected promise that escaped page/component code. */
  notifyUnhandledRejection(reason: unknown, promise?: unknown): void
}
