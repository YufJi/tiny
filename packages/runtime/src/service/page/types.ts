export type { MiniProgramComponentOptions } from '../../component/options'

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
