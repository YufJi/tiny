import type { BridgeConnection } from '@tiny/bridge'
import type { ServiceThreadOptions, StorageSnapshot, SystemInfoSnapshot, ServiceCanvasAdapter } from '../types'
import type { AssetUrlResolver } from '../assets'
import type { ComponentTree } from '../component'
import type { MiniProgramPageRegistry } from './page-registry'
import type { MiniProgramPageInstance } from './page-instance'

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

export type MiniProgramComponentOptions = {
  data?: Record<string, unknown>
  properties?: Record<string, unknown>
  methods?: Record<string, (...args: unknown[]) => unknown>
  lifetimes?: Record<string, (...args: unknown[]) => void>
  pageLifetimes?: Record<string, (...args: unknown[]) => void>
  behaviors?: Array<MiniProgramComponentOptions | string>
  observers?: Record<string, unknown> | Array<unknown>
  relations?: Record<string, unknown>
  externalClasses?: string[]
  options?: Record<string, unknown>
  export?: (...args: unknown[]) => unknown
  definitionFilter?: (...args: unknown[]) => unknown
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

export type ServiceApiContext = {
  connection: BridgeConnection
  /** API global name used in diagnostics. */
  apiName: string
  /** API namespaces accepted by canIUse, including aliases. */
  apiNamespaces: string[]
  getSystemInfoSnapshot: () => SystemInfoSnapshot
  getStorageSnapshot: () => StorageSnapshot
  setStorageSnapshot: (key: string, value: unknown) => void
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
