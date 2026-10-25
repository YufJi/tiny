import type { BridgeConnection } from '@tiny/bridge'
import type { ServiceThreadOptions, StorageSnapshot, SystemInfoSnapshot, ServiceCanvasAdapter } from '../types'
import type { ComponentTree } from '../component-tree'
import type { RelationManager } from '../relation-manager'
import type { NormalizedComponentDefinition } from '../component-definition'
import type { MiniProgramPageRegistry } from './page-registry'
import type { MiniProgramComponentInstance } from './component-instance'
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
  [key: string]: unknown
}


export type ComponentRuntimeContext = {
  pageId: string
  tree: ComponentTree
  relations: RelationManager
  getInstance: (componentId: string) => MiniProgramComponentInstance | undefined
  onDiagnostic: (code: string, message: string, details?: unknown) => void
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
  /** API global name used in diagnostics, e.g. `tiny`. */
  apiName: string
  getSystemInfoSnapshot: () => SystemInfoSnapshot
  getStorageSnapshot: () => StorageSnapshot
  setStorageSnapshot: (key: string, value: unknown) => void
  apiNames: Set<string>
  getCurrentPagePath?: () => string | undefined
  canvas?: ServiceCanvasAdapter
  tabBar?: TabBarApi
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
  componentInstances: Map<string, MiniProgramComponentInstance>
  componentTree: ComponentTree
  relationManager: RelationManager
}
