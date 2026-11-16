export type SimulatorRect = {
  x: number
  y: number
  width: number
  height: number
}

export type SimulatorRuntimeStatus =
  | 'idle'
  | 'connecting'
  | 'running'
  | 'terminated'
  | 'error'

export type SimulatorNavigationState = {
  title?: string
  backgroundColor?: string
  textStyle?: 'white' | 'black'
  loading?: boolean
  custom?: boolean
}

export type SimulatorTabBarState = {
  visible: boolean
  position?: 'bottom' | 'top'
  borderStyle?: 'black' | 'white'
  backgroundColor?: string
  color?: string
  selectedColor?: string
  selectedIndex?: number
  items: Array<{
    index: number
    pagePath: string
    text?: string
    iconPath?: string
    selectedIconPath?: string
    badge?: string
    redDot?: boolean
  }>
}

export type SimulatorPageState = {
  pageId: string
  path: string
  visible: boolean
}

export type SimulatorRuntimeState = {
  status: SimulatorRuntimeStatus
  currentPage?: string
  pageStack: string[]
  pages: SimulatorPageState[]
  navigation?: SimulatorNavigationState
  tabBar?: SimulatorTabBarState
  refreshing?: boolean
  shareMenuVisible?: boolean
  error?: string
}

export type SimulatorSurfaceLayout = {
  screen: SimulatorRect
  content: SimulatorRect
  scale: number
  devicePixelRatio: number
}

/**
 * Host adapter contract for rendering mini-program pages.
 *
 * The Web devtool mounts iframes into the surface element. A desktop host can
 * implement the same contract by positioning `WebContentsView` instances from
 * `updateSurfaceLayout`.
 */
export interface SimulatorRuntimePort {
  ensurePage(pageId: string, url: string): Promise<void>
  updateSurfaceLayout(layout: SimulatorSurfaceLayout): void | Promise<void>
  focusPage(pageId: string): void | Promise<void>
  sendHostEvent(name: string, payload?: unknown, pageId?: string): boolean
  emitGlobalEvent(name: string, payload?: unknown): void
  destroyPage(pageId: string): void | Promise<void>
  dispose(): void | Promise<void>
}
