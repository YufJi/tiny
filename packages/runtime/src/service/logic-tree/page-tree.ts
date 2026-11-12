import { cloneDataValue } from '../../shared/data'
import type { MiniProgramComponentSchema } from '../../component/schema'
import type { RenderNode } from '../../tree-protocol/protocol'
import type { LogicBackendElement } from './backend'

type ComponentDataSnapshot = Record<string, Record<string, unknown>>

/**
 * Page-scoped component definition view.
 *
 * glass-easel still owns one shared ComponentSpace, but each page tracks the
 * schemas and placeholders that are visible to its tree. This is the service
 * analogue of WeChat's per-page `compManager`.
 */
export class PageComponentManager {
  private readonly schemas = new Map<string, MiniProgramComponentSchema>()
  private readonly placeholders = new Map<string, string>()

  register(schemas: MiniProgramComponentSchema[]): void {
    for (const schema of schemas) {
      this.schemas.set(schema.path, schema)
      for (const [tag, target] of Object.entries(schema.placeholders ?? {})) {
        this.placeholders.set(tag, target)
      }
    }
  }

  replace(schemas: MiniProgramComponentSchema[]): void {
    this.clear()
    this.register(schemas)
  }

  get(path: string): MiniProgramComponentSchema | undefined {
    return this.schemas.get(path)
  }

  has(path: string): boolean {
    return this.schemas.has(path)
  }

  get size(): number {
    return this.schemas.size
  }

  paths(): string[] {
    return [...this.schemas.keys()]
  }

  placeholderFor(tag: string): string | undefined {
    return this.placeholders.get(tag)
  }

  clear(): void {
    this.schemas.clear()
    this.placeholders.clear()
  }
}

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
  readonly components = new PageComponentManager()
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
      if (sameComponentData(previous[id], data)) continue
      const componentPatch = diffComponentData(previous[id], data)
      if (componentPatch) patch[id] = componentPatch
    }
    this.componentDataSnapshot = cloneDataValue(current)
    return patch
  }

  /** Drop page-scoped references when the logic page is unloaded. */
  clear(): void {
    this.lastRenderTree = undefined
    this.lastTabBarRenderTree = undefined
    this.tabBarRoot = undefined
    this.components.clear()
    this.componentDataSnapshot = {}
  }
}

function sameComponentData(
  previous: Record<string, unknown> | undefined,
  next: Record<string, unknown>,
): boolean {
  if (!previous) return false
  try {
    return sameValue(previous, next)
  } catch {
    return false
  }
}

function diffComponentData(
  previous: Record<string, unknown> | undefined,
  next: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!previous) return next
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(next)) {
    if (sameValue(previous[key], value)) continue
    patch[key] = value
  }
  return Object.keys(patch).length > 0 ? patch : undefined
}

function sameValue(left: unknown, right: unknown): boolean {
  try {
    return JSON.stringify(left) === JSON.stringify(right)
  } catch {
    return false
  }
}
