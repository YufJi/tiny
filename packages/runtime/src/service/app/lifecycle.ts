import type { GlobalEventSink } from '../api/types'
import type { MiniProgramAppOptions } from './types'

/**
 * App registration and lifecycle hooks.
 *
 * Registration is side-effect free. The boot path calls `launchApp` after
 * artifacts are evaluated and before the first page, then forwards host
 * foreground/background and error facts here.
 */
export class AppLifecycle {
  private app: MiniProgramAppOptions | null = null
  private launched = false
  private eventSink: GlobalEventSink | undefined

  setEventSink(events: GlobalEventSink | undefined): void {
    this.eventSink = events
  }

  registerApp(options: MiniProgramAppOptions): MiniProgramAppOptions {
    if (this.app) throw new Error('App has already been registered')
    this.app = options
    return options
  }

  isLaunched(): boolean {
    return this.launched
  }

  /** Run App.onLaunch once, after registration and before the first page. */
  launchApp(options?: unknown): void {
    if (this.launched) return
    this.launched = true
    try {
      this.app?.onLaunch?.(options)
    } catch (error) {
      this.reportError(error instanceof Error ? error.message : String(error))
    }
  }

  hideApp(): void {
    if (!this.launched) return
    try {
      this.app?.onHide?.()
    } catch {
      // Host lifecycle notifications must not break the service thread.
    }
  }

  showApp(options?: unknown): void {
    if (!this.launched) return
    try {
      this.app?.onShow?.(options)
    } catch {
      // Host lifecycle notifications must not break the service thread.
    }
  }

  reportError(message: string): void {
    try {
      this.app?.onError?.(message)
    } catch {
      // An onError callback must not break the error-reporting path.
    }
    this.eventSink?.emit('error', { message })
  }

  reportPageNotFound(info: {
    path: string
    query: Record<string, string>
    isEntryPage: boolean
  }): void {
    try {
      this.app?.onPageNotFound?.(info)
    } catch {
      // Navigation still fails with a precise diagnostic after the callback.
    }
    this.eventSink?.emit('pageNotFound', info)
  }

  reportUnhandledRejection(reason: unknown, promise?: unknown): void {
    const info = { reason, ...(promise !== undefined ? { promise } : {}) }
    try {
      this.app?.onUnhandledRejection?.(info)
    } catch {
      // Keep the service thread alive when an app hook itself rejects.
    }
    this.eventSink?.emit('unhandledRejection', info)
  }

  reportThemeChange(theme: 'light' | 'dark'): void {
    try {
      this.app?.onThemeChange?.({ theme })
    } catch {
      // Theme listeners must not break the host notification path.
    }
    this.eventSink?.emit('themeChange', { theme })
  }

  getApp(): MiniProgramAppOptions | null {
    return this.app
  }
}
