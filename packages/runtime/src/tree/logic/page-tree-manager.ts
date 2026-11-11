import { cloneDataValue } from '../../data'
import type { RenderNode } from '../protocol'
import type { LogicBackendElement } from './backend'

type ComponentDataSnapshot = Record<string, Record<string, unknown>>

/**
 * Per-page state owned by the service logic tree.
 *
 * This mirrors WeChat's per-page `treeManager`: the page root, the last render
 * projection, and the component-data baseline are scoped to one page instance
 * instead of being entries in adapter-wide maps.
 */
export class PageTreeManager {
  readonly pageId: string
  readonly path: string
  readonly root: LogicBackendElement
  private tabBarRoot?: LogicBackendElement
  private lastRenderTree?: RenderNode
  private lastTabBarRenderTree?: RenderNode
  private componentDataSnapshot: ComponentDataSnapshot = {}

  constructor(pageId: string, path: string, root: LogicBackendElement) {
    this.pageId = pageId
    this.path = path
    this.root = root
  }

  /** Record the snapshot that was just sent to the page render thread. */
  recordRenderTree(snapshot: RenderNode): void {
    this.lastRenderTree = snapshot
  }

  setTabBarRoot(root: LogicBackendElement): void {
    this.tabBarRoot = root
  }

  getTabBarRoot(): LogicBackendElement | undefined {
    return this.tabBarRoot
  }

  recordTabBarRenderTree(snapshot: RenderNode): void {
    this.lastTabBarRenderTree = snapshot
  }

  /**
   * Replace the render snapshot and return the previous one for diffing.
   */
  advanceRenderTree(snapshot: RenderNode): RenderNode | undefined {
    const previous = this.lastRenderTree
    this.lastRenderTree = snapshot
    return previous
  }

  advanceTabBarRenderTree(snapshot: RenderNode): RenderNode | undefined {
    const previous = this.lastTabBarRenderTree
    this.lastTabBarRenderTree = snapshot
    return previous
  }

  /** Seed the component-data baseline carried by the initial page flow. */
  seedComponentData(data: ComponentDataSnapshot): void {
    this.componentDataSnapshot = cloneDataValue(data)
  }

  /**
   * Diff component data against the last render batch and advance the baseline.
   * The snapshot is cloned by value because glass mutates component data in
   * place while applying `setData`.
   */
  updateComponentData(current: ComponentDataSnapshot): ComponentDataSnapshot {
    const previous = this.componentDataSnapshot
    const patch: ComponentDataSnapshot = {}
    for (const [id, data] of Object.entries(current)) {
      if (!sameComponentData(previous[id], data)) patch[id] = data
    }
    this.componentDataSnapshot = cloneDataValue(current)
    return patch
  }

  /** Drop page-scoped references when the logic page is unloaded. */
  clear(): void {
    this.lastRenderTree = undefined
    this.lastTabBarRenderTree = undefined
    this.tabBarRoot = undefined
    this.componentDataSnapshot = {}
  }
}

function sameComponentData(
  previous: Record<string, unknown> | undefined,
  next: Record<string, unknown>,
): boolean {
  if (!previous) return false
  try {
    return JSON.stringify(previous) === JSON.stringify(next)
  } catch {
    return false
  }
}
