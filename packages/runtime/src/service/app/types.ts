export type MiniProgramAppOptions = {
  globalData?: Record<string, unknown>
  onLaunch?: (...args: unknown[]) => void
  onShow?: (...args: unknown[]) => void
  onHide?: (...args: unknown[]) => void
  onError?: (message: string) => void
  onPageNotFound?: (info: {
    path: string
    query: Record<string, string>
    isEntryPage: boolean
  }) => void
  onUnhandledRejection?: (info: {
    reason: unknown
    promise?: unknown
  }) => void
  onThemeChange?: (info: { theme: 'light' | 'dark' }) => void
  [key: string]: unknown
}
