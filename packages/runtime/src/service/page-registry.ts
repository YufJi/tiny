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
  private launched = false
  private eventSink: GlobalEventSink | undefined
  private readonly pagePaths: string[]
  private readonly componentPaths: string[]
  private readonly componentConfigurations: Map<string, Record<string, unknown>>
  /**
   * Runtime page kind. `Page()` always means a page; `Component()` means a
   * component page when its path is declared in `app.json.pages`, and a normal
   * component otherwise. No compiler-side source analysis is involved.
   */
  private readonly pageKinds = new Map<string, 'page' | 'component'>()
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
    // Registration is side-effect free. The runtime calls `launchApp` after
    // artifacts are evaluated and before the first page starts, so onLaunch is
    // already ordered relative to page lifecycle and app visibility.
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

  /**
   * Register a page definition.
   *
   * `path` comes from the compiler-injected registration hint and is the
   * authoritative identity; it makes registration independent of evaluation
   * order, which is required once subpackage/component chunks load on demand.
   * Scripts without a hint fall back to the declared `app.json` order.
   */
  registerPage(
    options: MiniProgramPageOptions,
    path?: string,
  ): MiniProgramPageOptions {
    if (path !== undefined) {
      if (!this.pagePaths.includes(path)) {
        throw new Error(`Page "${path}" was registered but is not declared in app.json`)
      }
      const existing = this.pages.get(path)
      if (existing) return existing
      this.pages.set(path, options)
      this.pageKinds.set(path, 'page')
      return options
    }
    const nextPath = this.nextPagePath()
    if (!nextPath) throw new Error('More Page definitions were registered than declared pages')
    this.pages.set(nextPath, options)
    this.pageKinds.set(nextPath, 'page')
    return options
  }

  registerComponent(
    options: MiniProgramComponentOptions,
    path?: string,
  ): MiniProgramComponentOptions {
    if (path !== undefined) {
      const existing = this.components.get(path)
      if (existing) return existing
      this.recordComponentPath(path)
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
    const declaredPath = this.nextComponentPath() ?? `component:${this.components.size}`
    this.recordComponentPath(declaredPath)
    this.components.set(declaredPath, options)
    this.normalizedComponents.set(
      declaredPath,
      normalizeComponentDefinition(
        options,
        declaredPath,
        this.compatibility,
        this.componentConfigurations.get(declaredPath),
      ),
    )
    return options
  }

  /** Whether a declared page was registered through `Component()`. */
  isComponentPage(path: string): boolean {
    return this.pageKinds.get(path) === 'component'
  }

  private recordComponentPath(path: string): void {
    // A `Component()` registration for a declared page path is a
    // Component-as-page. A normal component path is not a page at all, so it
    // deliberately stays out of `pageKinds`.
    if (this.pagePaths.includes(path) && !this.pages.has(path)) {
      this.pageKinds.set(path, 'component')
    }
  }

  /** Skip page paths already registered through a hint. */
  private nextPagePath(): string | undefined {
    while (this.pageCursor < this.pagePaths.length) {
      const candidate = this.pagePaths[this.pageCursor++]!
      if (!this.pages.has(candidate)) return candidate
    }
    return undefined
  }

  /** Skip component paths already registered through a hint. */
  private nextComponentPath(): string | undefined {
    while (this.componentCursor < this.componentPaths.length) {
      const candidate = this.componentPaths[this.componentCursor++]!
      if (!this.components.has(candidate)) return candidate
    }
    return undefined
  }
}
