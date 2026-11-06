import type { BridgeConnection } from '@tiny/bridge'
import type {
  RuntimeManifest,
  StyleLoader,
  TemplateRegistry,
} from '../types'
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
 * Boot contract for one service thread.
 *
 * The host entry creates the connection, composes the API table (it owns the
 * API context) and passes both in; the runtime only installs the table and
 * publishes the accessors the host needs for late binding. Host capabilities
 * such as canvas, asset URLs and the synchronous channel never enter this
 * contract.
 */
export type ServiceThreadOptions = {
  connection: BridgeConnection
  manifest: RuntimeManifest
  initialPath: string
  /** Already-composed `wx` table; the runtime installs it verbatim. */
  apiHost: MiniProgramApiHost
  loadArtifacts?: () => Promise<unknown>
  /** Maximum pages in the runtime page stack. Defaults to 10. */
  maxPageStack?: number
  /** Templates for the service-side logic tree. */
  loadTemplates: () => Promise<TemplateRegistry> | TemplateRegistry
  /** Test/host hook fired when the service logic tree is created. */
  onLogicTreeCreated?: (tree: unknown) => void
  /** Stylesheet text for logic-tree style scoping. */
  loadStyle?: StyleLoader
  /**
   * Set shared with the host-composed API table: `runtime.themeChange`
   * notifications reach `wx.onThemeChange` listeners without the runtime
   * knowing the API module.
   */
  themeListeners?: Set<(value: unknown) => void>
  /**
   * A page was destroyed. The host releases per-page resources here (canvas
   * nodes, …); the runtime does not own canvas semantics.
   */
  onPageRelease?: (pageId: string) => void
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
  /** Runtime tabBar actions, late-bound into the host-composed API context. */
  tabBar: TabBarApi
  /** Late-bound `wx.navigateTo` EventChannel hand-off. */
  setNextPageEventChannel(channel: unknown): () => void
  /** Report a rejected promise that escaped page/component code. */
  notifyUnhandledRejection(reason: unknown, promise?: unknown): void
}
