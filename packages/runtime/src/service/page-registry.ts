import {
  normalizeComponentDefinition,
  type NormalizedComponentDefinition,
} from '../component'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type RuntimeCompatibilityConfig,
} from '@tiny/manifest'
import type {
  GlobalEventSink,
  MiniProgramAppOptions,
  MiniProgramComponentOptions,
  MiniProgramPageOptions,
} from './types'

export class MiniProgramPageRegistry {
  readonly pages = new Map<string, MiniProgramPageOptions>()
  readonly components = new Map<string, MiniProgramComponentOptions>()
  readonly normalizedComponents = new Map<string, NormalizedComponentDefinition>()
  /** Runtime-facing input compatibility (API global, behavior scheme, …). */
  readonly compatibility: RuntimeCompatibilityConfig
  private app: MiniProgramAppOptions | null = null
  private eventSink: GlobalEventSink | undefined
  private readonly pagePaths: string[]
  private readonly componentPaths: string[]
  private readonly componentConfigurations: Map<string, Record<string, unknown>>
  private pageCursor = 0
  private componentCursor = 0

  constructor(
    pagePaths: string[],
    componentPaths: string[] = [],
    compatibility: RuntimeCompatibilityConfig = WECHAT_RUNTIME_COMPATIBILITY,
    componentConfigurations: Map<string, Record<string, unknown>> = new Map(),
  ) {
    this.pagePaths = pagePaths
    this.componentPaths = componentPaths
    this.compatibility = compatibility
    this.componentConfigurations = componentConfigurations
  }

  setEventSink(events: GlobalEventSink | undefined): void {
    this.eventSink = events
  }

  registerApp(options: MiniProgramAppOptions): MiniProgramAppOptions {
    if (this.app) throw new Error('App has already been registered')
    this.app = options
    options.onLaunch?.()
    options.onShow?.()
    return options
  }

  hideApp(): void {
    try {
      this.app?.onHide?.()
    } catch {
      // Host lifecycle notifications must not break the service thread.
    }
  }

  showApp(): void {
    try {
      this.app?.onShow?.()
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

  registerPage(options: MiniProgramPageOptions): MiniProgramPageOptions {
    const path = this.pagePaths[this.pageCursor++]
    if (!path) throw new Error('More Page definitions were registered than declared pages')
    this.pages.set(path, options)
    return options
  }

  registerComponent(options: MiniProgramComponentOptions): MiniProgramComponentOptions {
    const path = this.componentPaths[this.componentCursor++] ?? `component:${this.components.size}`
    this.components.set(path, options)
    this.normalizedComponents.set(
      path,
      normalizeComponentDefinition(
        options,
        path,
        this.compatibility,
        this.componentConfigurations.get(path),
      ),
    )
    return options
  }
}
