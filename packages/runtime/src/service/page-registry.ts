import {
  normalizeComponentDefinition,
  type NormalizedComponentDefinition,
} from '../component-definition'
import {
  WECHAT_RUNTIME_COMPATIBILITY,
  type RuntimeCompatibilityConfig,
} from '@tiny/manifest'
import type {
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
  private readonly pagePaths: string[]
  private readonly componentPaths: string[]
  private pageCursor = 0
  private componentCursor = 0

  constructor(
    pagePaths: string[],
    componentPaths: string[] = [],
    compatibility: RuntimeCompatibilityConfig = WECHAT_RUNTIME_COMPATIBILITY,
  ) {
    this.pagePaths = pagePaths
    this.componentPaths = componentPaths
    this.compatibility = compatibility
  }

  registerApp(options: MiniProgramAppOptions): MiniProgramAppOptions {
    if (this.app) throw new Error('App has already been registered')
    this.app = options
    options.onLaunch?.()
    options.onShow?.()
    return options
  }

  hideApp(): void {
    this.app?.onHide?.()
  }

  showApp(): void {
    this.app?.onShow?.()
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
    this.normalizedComponents.set(path, normalizeComponentDefinition(options, path, this.compatibility))
    return options
  }
}
