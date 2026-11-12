import type { PreloadRuleArtifact } from '@tiny/manifest'
import type { RuntimeManifest } from '../../shared/manifest'
import { findPageArtifact, normalizeRoutePath, resolveRoutePath } from '../page/route'
import { shouldPreloadRule } from './preload'

export type SubpackageLoaderOptions = {
  manifest: RuntimeManifest
  loadSubPackage?: (root: string) => Promise<unknown>
  preloadNetwork?: 'wifi' | 'other'
  /** Rebuild render-facing definitions after a chunk registers new components. */
  refreshComponentDefinitions: () => void
  getCurrentPath: () => string
  getTabBarPagePath: (index: number) => string | undefined
}

/**
 * Lazy subpackage and preload orchestration for the service thread.
 *
 * The loader owns only package bookkeeping. Page navigation and render schema
 * projection stay with their respective owners.
 */
export class SubpackageLoader {
  private readonly loaded = new Set<string>()
  private readonly pending = new Map<string, Promise<void>>()
  private readonly subPackageByPage = new Map<string, string>()
  private readonly preloadRulesByPage: Map<string, PreloadRuleArtifact>

  constructor(private readonly options: SubpackageLoaderOptions) {
    for (const pkg of options.manifest.subPackages ?? []) {
      for (const page of pkg.pages) this.subPackageByPage.set(page, pkg.root)
    }
    this.preloadRulesByPage = new Map(
      (options.manifest.preloadRules ?? []).map((rule) => [rule.page, rule]),
    )
  }

  ensureRoot(root: string): Promise<void> {
    if (this.loaded.has(root)) return Promise.resolve()
    const pending = this.pending.get(root)
    if (pending) return pending
    const pkg = this.options.manifest.subPackages?.find((item) => item.root === root)
    if (!pkg?.service) {
      this.loaded.add(root)
      return Promise.resolve()
    }
    if (!this.options.loadSubPackage) {
      return Promise.reject(new Error(
        `subpackage "${root}" has a service chunk but the host provides no loadSubPackage hook`,
      ))
    }
    const task = Promise.resolve(this.options.loadSubPackage(root)).then(() => {
      this.loaded.add(root)
      this.options.refreshComponentDefinitions()
    }).finally(() => {
      this.pending.delete(root)
    })
    this.pending.set(root, task)
    return task
  }

  async ensurePath(path: string | undefined): Promise<void> {
    if (!path) return
    const root = this.subPackageByPage.get(path)
    if (!root) return
    await this.ensureRoot(root)
  }

  /** Root of the independent package owning `path`, if any. */
  independentRootFor(path: string | undefined): string | undefined {
    if (!path) return undefined
    const root = this.subPackageByPage.get(path)
    if (!root) return undefined
    const pkg = this.options.manifest.subPackages?.find((item) => item.root === root)
    return pkg?.independent === true ? root : undefined
  }

  async ensureRoute(url?: string, index?: number): Promise<void> {
    let path = ''
    if (typeof url === 'string' && url.length > 0) {
      const raw = url.split('?')[0] ?? ''
      path = raw.startsWith('/')
        ? normalizeRoutePath(raw)
        : resolveRoutePath(this.options.getCurrentPath(), raw)
    } else if (typeof index === 'number' && Number.isInteger(index)) {
      path = this.options.getTabBarPagePath(index) ?? ''
    }
    const currentIndependent = this.independentRootFor(this.options.getCurrentPath())
    if (currentIndependent && this.independentRootFor(path) !== currentIndependent) {
      throw new Error(
        `independent package "${currentIndependent}" cannot navigate to "${path}"`,
      )
    }
    await this.ensurePath(path)
  }

  /** Best-effort `preloadRule` warm-up; never delays the page. */
  preloadForPage(path: string | undefined): void {
    if (!path) return
    const rule = this.preloadRulesByPage.get(path)
    if (!rule || !shouldPreloadRule(rule, this.options.preloadNetwork)) return
    for (const root of rule.packages) {
      void this.ensureRoot(root).catch(() => {})
    }
  }

  /**
   * Async components mount as placeholders first; the package chunk is fetched
   * afterwards and glass-easel replaces the placeholder once the definition is
   * registered.
   */
  loadAsyncComponentsForPage(path: string | undefined): void {
    if (!path) return
    const artifact = findPageArtifact(this.options.manifest, path)
    for (const root of artifact?.asyncSubPackages ?? []) {
      void this.ensureRoot(root).catch(() => {})
    }
  }
}
